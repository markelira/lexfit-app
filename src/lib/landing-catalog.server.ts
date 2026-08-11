import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { programVisual, assignProgramHues } from "@/lib/programs";
import type { Program, ProgramSession, Video, Challenge } from "@/lib/types";
import {
  EMPTY_CATALOG,
  type LandingCatalog,
  type LandingProgram,
  type LandingWorkout,
  type LandingSession,
  type LandingChallenge,
} from "@/lib/landing-catalog";

// Server-only reader for the public landing payload. Kept apart from the type
// module so a client component can import the types without pulling the Admin
// SDK (and therefore `fs`/`child_process`) into the browser bundle.

/** The program whose journey §6 animates. */
const ENTRY_SLUG = "foundation";

const isPublished = (s: unknown) => s === undefined || s === "published";

/** Sort by workout code, numeric-aware so F2 and F10 can never invert. */
const byCode = (a: string, b: string) =>
  a.localeCompare(b, "hu", { numeric: true, sensitivity: "base" });

/**
 * Read the published catalog. Never throws: a Firestore outage or an unconfigured
 * service account must render the marketing page with fallback copy, not a 500.
 */
export async function loadLandingCatalog(): Promise<LandingCatalog> {
  try {
    return await read();
  } catch (e) {
    console.error("[landing-catalog]", e);
    return EMPTY_CATALOG;
  }
}

async function read(): Promise<LandingCatalog> {
  const [progSnap, vidSnap, chSnap, typeSnap, settingsSnap] = await Promise.all([
    adminDb.collection("programs").where("status", "==", "published").get(),
    adminDb.collection("videos").where("status", "==", "published").get(),
    adminDb.collection("challenges").where("status", "==", "published").get(),
    adminDb.collection("filters").doc("type").get(),
    adminDb.collection("settings").doc("challenges").get(),
  ]);

  const programs = progSnap.docs
    .map((d) => ({ ...(d.data() as Program), slug: d.id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title, "hu"));

  // Same hue assignment the app uses, so a program looks identical in both places.
  const hues = assignProgramHues(programs.map((p) => p.slug));

  // Playlists - one subcollection read per program, in parallel.
  const playlists = await Promise.all(
    programs.map(async (p) => {
      const snap = await adminDb.collection("programs").doc(p.slug).collection("sessions").get();
      const sessions = snap.docs
        .map((d) => ({ ...(d.data() as ProgramSession), id: d.id }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return { slug: p.slug, sessions };
    }),
  );

  const videos = new Map(
    vidSnap.docs
      .map((d) => ({ ...(d.data() as Video), code: d.id }))
      .filter((v) => isPublished(v.status) && v.kind === "workout")
      .map((v) => [v.code, v] as const),
  );

  // video code → program slug, first program in catalog order wins (same rule as
  // lib/program-index.ts, so badges agree between the landing and the app).
  // `phase` is likewise NOT stored on the video - it is resolved from the session
  // that references it, exactly like lib/library.ts does for the app.
  const programOfVideo: Record<string, string> = {};
  const phaseOfVideo: Record<string, number> = {};
  for (const { slug, sessions } of playlists) {
    for (const s of sessions) {
      if (!programOfVideo[s.videoCode]) programOfVideo[s.videoCode] = slug;
      if (phaseOfVideo[s.videoCode] === undefined && typeof s.phaseIdx === "number") {
        phaseOfVideo[s.videoCode] = s.phaseIdx;
      }
    }
  }

  const bySlug = new Map(programs.map((p) => [p.slug, p] as const));
  const countOf = (slug: string) =>
    playlists.find((p) => p.slug === slug)?.sessions.length ?? bySlug.get(slug)?.totalSessions ?? 0;

  const landingPrograms: LandingProgram[] = programs.map((p) => ({
    slug: p.slug,
    title: p.title,
    hu: p.hu || p.title,
    category: p.category ?? "Program",
    synopsis: p.synopsis ?? "",
    level: p.level ?? "",
    defaultMins: p.defaultMins ?? null,
    equipment: p.equipment ?? null,
    sessionCount: countOf(p.slug),
    hue: hues[p.slug] ?? programVisual(p.slug).hue,
  }));

  const toWorkout = (v: Video): LandingWorkout => {
    const slug = programOfVideo[v.code] ?? null;
    return {
      code: v.code,
      title: v.title,
      theme: v.theme,
      mins: v.mins,
      level: v.level,
      format: v.format,
      types: v.types ?? [],
      focus: v.focus ?? [],
      subtitle: v.subtitle ?? null,
      muxDuration: v.muxDuration ?? null,
      phase: phaseOfVideo[v.code] ?? null,
      blocks: v.blocks ?? [],
      program: slug,
      programName: slug ? (bySlug.get(slug)?.hu ?? bySlug.get(slug)?.title ?? null) : null,
      programHue: slug ? (hues[slug] ?? null) : null,
    };
  };

  // The entry program's playlist, joined to its videos.
  const entryProgram = bySlug.get(ENTRY_SLUG) ?? programs[0];
  const entryList = entryProgram
    ? (playlists.find((p) => p.slug === entryProgram.slug)?.sessions ?? [])
    : [];

  // Ordered BY CODE (F001 → F002 → F003 …), not by the playlist's `order` field.
  // The two happen to agree today, but the code is the stable, human-legible
  // sequence: reordering the playlist in /admin or inserting a workout must not
  // shuffle how the program reads on the marketing page.
  const entryVideos = entryList
    .map((s) => videos.get(s.videoCode))
    .filter((v): v is Video => !!v)
    .sort((a, b) => byCode(a.code, b.code));

  // §5's row and §6's journey walk the SAME list in the SAME order.
  const workouts = entryVideos.map(toWorkout);

  let entry: LandingCatalog["entry"] = null;
  if (entryProgram) {
    const phaseOfSession = new Map(entryList.map((s) => [s.videoCode, s.phaseIdx ?? null]));
    // `order` is re-indexed to the displayed position so the "N." label and the
    // card's progress ring match what the visitor is actually looking at.
    const sessions: LandingSession[] = entryVideos.map((v, i) => ({
      code: v.code, title: v.title, theme: v.theme, mins: v.mins,
      order: i, phaseIdx: phaseOfSession.get(v.code) ?? null,
    }));
    entry = {
      slug: entryProgram.slug,
      title: entryProgram.hu ?? entryProgram.title,
      synopsis: entryProgram.synopsis ?? "",
      sessionCount: countOf(entryProgram.slug),
      phases: (entryProgram.phases ?? []).map((p) => ({ idx: p.idx, icon: p.icon, name: p.name, desc: p.desc })),
      sessions,
    };
  }

  // The landing renders the app's real ChallengeCard, so the whole doc goes across -
  // but explicitly field by field, NOT by spreading `d.data()`. A spread would carry
  // `createdAt`/`updatedAt` Timestamps into a client component and break serialization
  // the moment the admin writes them.
  // Every published challenge, newest first - NOT a top-N slice. The archive is the
  // section's whole point ("eddig ezeket találtuk ki"), so a silent cap would make a
  // growing library look like a fixed set of eight. The rail scrolls; length is fine.
  const challenges: LandingChallenge[] = chSnap.docs
    .map((d) => ({ ...(d.data() as Challenge), slug: d.id }))
    .sort((a, b) => String(b.sortDate ?? "").localeCompare(String(a.sortDate ?? "")))
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      series: c.series ?? "",
      monthLabel: c.monthLabel ?? "",
      sortDate: c.sortDate ?? "",
      synopsis: c.synopsis ?? "",
      bodyPart: c.bodyPart,
      equipment: c.equipment ?? null,
      durationDays: c.durationDays,
      perDayMinsLabel: c.perDayMinsLabel ?? null,
      participantCount: c.participantCount ?? null,
      fbPostUrl: c.fbPostUrl ?? null,
      featured: c.featured ?? false,
      featuredLabel: c.featuredLabel ?? null,
      cover: c.cover ?? null,
      totalDays: c.totalDays ?? c.durationDays ?? 0,
      access: c.access ?? "members",
      status: c.status,
      order: c.order ?? 0,
    }));

  const typeOptions = typeSnap.exists
    ? ((typeSnap.data() as { options?: string[] }).options ?? [])
    : [];
  const fbGroupUrl = settingsSnap.exists
    ? ((settingsSnap.data() as { fbGroupUrl?: string }).fbGroupUrl ?? null)
    : null;

  return {
    programs: landingPrograms,
    workouts,
    entry,
    challenges,
    typeOptions,
    fbGroupUrl,
    counts: { programs: landingPrograms.length, workouts: videos.size },
  };
}

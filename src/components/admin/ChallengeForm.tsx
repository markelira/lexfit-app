"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminJson } from "@/lib/admin-fetch";
import type { Challenge } from "@/lib/types";

interface Draft {
  slug: string;
  title: string;
  series: string;
  monthLabel: string;
  sortDate: string;
  bodyPart: string;
  equipment: string;
  perDayMinsLabel: string;
  synopsis: string;
  participantCount: string;
  fbPostUrl: string;
  featured: boolean;
  featuredLabel: string;
  cover: string;
  access: string;
  status: string;
  order: string;
}

const CONTENT_STATUS = [
  { v: "draft", label: "Vázlat" },
  { v: "published", label: "Publikált" },
  { v: "soon", label: "Hamarosan" },
  { v: "archived", label: "Archivált" },
];

export function ChallengeForm({
  initial,
  bodyParts,
  create,
}: {
  initial: Challenge | null;
  bodyParts: string[];
  create: boolean;
}) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => ({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    series: initial?.series ?? "Szavazz Magadra",
    monthLabel: initial?.monthLabel ?? "",
    sortDate: initial?.sortDate ?? "",
    bodyPart: initial?.bodyPart ?? bodyParts[0] ?? "",
    equipment: initial?.equipment ?? "eszköz nélkül",
    perDayMinsLabel: initial?.perDayMinsLabel ?? "",
    synopsis: initial?.synopsis ?? "",
    participantCount: initial?.participantCount != null ? String(initial.participantCount) : "",
    fbPostUrl: initial?.fbPostUrl ?? "",
    featured: initial?.featured ?? false,
    featuredLabel: initial?.featuredLabel ?? "",
    cover: initial?.cover ?? "",
    access: initial?.access ?? "members",
    status: initial?.status ?? "draft",
    order: initial?.order != null ? String(initial.order) : "0",
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  const validSlug = /^[a-z0-9-]{2,}$/.test(d.slug.trim());

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  async function save() {
    if (create && !validSlug) {
      setErr("Érvényes slug kell (kisbetű, szám, kötőjel — pl. 7-napos-has-kihivas).");
      return;
    }
    if (!d.title.trim()) {
      setErr("A cím kötelező.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const slug = create ? d.slug.trim() : (initial as Challenge).slug;
      if (create) {
        const existing = await getDoc(doc(db, "challenges", slug));
        if (existing.exists()) {
          setErr(`A(z) "${slug}" kihívás már létezik.`);
          setSaving(false);
          return;
        }
      }
      await adminJson(`/api/admin/challenges/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: JSON.stringify({
          create,
          title: d.title,
          series: d.series,
          monthLabel: d.monthLabel,
          sortDate: d.sortDate,
          bodyPart: d.bodyPart,
          equipment: d.equipment,
          perDayMinsLabel: d.perDayMinsLabel,
          synopsis: d.synopsis,
          participantCount: d.participantCount,
          fbPostUrl: d.fbPostUrl,
          featured: d.featured,
          featuredLabel: d.featuredLabel,
          cover: d.cover,
          access: d.access,
          status: d.status,
          order: d.order,
        }),
      });
      setSaved(true);
      if (create) router.push(`/admin/challenges/${encodeURIComponent(slug)}`);
      else router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Mentési hiba.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-form">
        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">
              Slug {create && <span className="req">*</span>}
            </label>
            <input type="text" value={d.slug} disabled={!create} onChange={(e) => set("slug", e.target.value)} placeholder="7-napos-has-kihivas" />
            <span className="adm-fhint">{create ? "A kihívás azonosítója az URL-ben — rögzül létrehozás után." : "Rögzített azonosító."}</span>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Sorozat (eyebrow)</label>
            <input type="text" value={d.series} onChange={(e) => set("series", e.target.value)} placeholder="Szavazz Magadra" />
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">
            Cím <span className="req">*</span>
          </label>
          <input type="text" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="7 napos has-kihívás" />
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Hónap (címke)</label>
            <input type="text" value={d.monthLabel} onChange={(e) => set("monthLabel", e.target.value)} placeholder="2024. november" />
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Rendezési dátum</label>
            <input type="text" value={d.sortDate} onChange={(e) => set("sortDate", e.target.value)} placeholder="2024-11" />
            <span className="adm-fhint">Rendezhető formátum (ÉÉÉÉ-HH) — az archívum ez szerint rendez, legújabb elöl.</span>
          </div>
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Testrész</label>
            <select value={d.bodyPart} onChange={(e) => set("bodyPart", e.target.value)}>
              {bodyParts.length === 0 && <option value="">—</option>}
              {bodyParts.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Napi hossz (címke)</label>
            <input type="text" value={d.perDayMinsLabel} onChange={(e) => set("perDayMinsLabel", e.target.value)} placeholder="napi 10–14 perc" />
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Leírás</label>
          <textarea rows={3} value={d.synopsis} onChange={(e) => set("synopsis", e.target.value)} placeholder="Hét nap, napi 10–14 perc. A csoport ezt szavazta meg…" />
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Eszköz</label>
            <input type="text" value={d.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder="eszköz nélkül" />
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Résztvevők száma</label>
            <input type="number" min={0} value={d.participantCount} onChange={(e) => set("participantCount", e.target.value)} placeholder="312" />
            <span className="adm-fhint">„…-en csinálták végig a csoporttal” — múltbeli tény, nem élő szám.</span>
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Facebook-poszt URL</label>
          <input type="text" value={d.fbPostUrl} onChange={(e) => set("fbPostUrl", e.target.value)} placeholder="https://facebook.com/…" />
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Kiemelt</label>
            <button type="button" className={`adm-check${d.featured ? " on" : ""}`} onClick={() => set("featured", !d.featured)} style={{ alignSelf: "flex-start" }}>
              {d.featured ? "Kiemelt ✓" : "Nem kiemelt"}
            </button>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Kiemelés címke</label>
            <input type="text" value={d.featuredLabel} onChange={(e) => set("featuredLabel", e.target.value)} placeholder="A CSOPORT VÁLASZTÁSA" />
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Borító (URL)</label>
          <input type="text" value={d.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://… (opcionális)" />
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Hozzáférés</label>
            <select value={d.access} onChange={(e) => set("access", e.target.value)}>
              <option value="members">Előfizetőknek</option>
              <option value="free">Ingyenes</option>
            </select>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Állapot</label>
            <select value={d.status} onChange={(e) => set("status", e.target.value)}>
              {CONTENT_STATUS.map((s) => (
                <option key={s.v} value={s.v}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Sorrend</label>
          <input type="number" value={d.order} onChange={(e) => set("order", e.target.value)} />
          <span className="adm-fhint">Azonos hónapon belüli rendezéshez (kisebb = előrébb).</span>
        </div>

        <div className="adm-savebar">
          <button className="adm-btn primary" onClick={save} disabled={saving}>
            {saving ? "Mentés…" : create ? "Létrehozás" : "Mentés"}
          </button>
          {saved && <span className="status saved">Mentve ✓</span>}
          {err && <span className="status error">{err}</span>}
        </div>
      </div>
    </div>
  );
}

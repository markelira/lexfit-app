"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/lib/useIsMobile";
import { SetGroup } from "@/components/profile/SetGroup";
import { SetRow } from "@/components/profile/SetRow";
import { DayPills } from "@/components/profile/DayPills";
import { EditorModal } from "@/components/profile/EditorModal";
import { formatHuf } from "@/lib/pricing/display";
import type { ProfileData, Prefs } from "@/lib/profile";
import { useProfile } from "../useProfile";
import { useLivePrefs } from "../useLivePrefs";
import { SECTIONS, type SectionRow } from "./sections";
import { PrefsEditor } from "./PrefsEditor";
import { IdentityEditor } from "./IdentityEditor";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { downloadMyData } from "@/lib/account";
import "../profile.css";

const PREFS_EDITORS = new Set(["days", "length", "equipment", "reminderTime"]);
const IDENTITY_EDITORS = new Set(["name", "email", "password", "photo"]);

const fullDate = (ms: number | null) =>
  ms == null ? "" : new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(new Date(ms));

function SettingsInner() {
  const params = useSearchParams();
  const { data, state, reload } = useProfile();
  const rawSection = params.get("section");
  const activeKey = rawSection ?? "account";

  if (state === "loading") {
    return (
      <div className="pf-set" aria-busy="true">
        <Link href="/app/profile" className="pf-back"><LxIcon d={lxPaths.chevronLeft} size={14} /> Profil</Link>
        <h1 className="pf-set-ttl">Beállítások</h1>
        <div className="pf-set-grid">
          <nav className="pf-subnav">
            {Array.from({ length: 6 }).map((_, i) => <div className="pf-skel line" key={i} style={{ height: 20, margin: "12px 8px" }} />)}
          </nav>
          <div className="pf-set-body">
            <div className="pf-group" style={{ marginTop: 24 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="pf-row" key={i}><span className="tx"><span className="pf-skel line w40" style={{ height: 13 }} /></span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (state === "error" || !data) {
    return <div className="pf-set"><h1 className="pf-set-ttl">Beállítások</h1><div className="pf-fallback"><p>Nem tudtuk betölteni a beállításokat.</p><button type="button" className="lxbtn m primary" onClick={reload}>Újra</button></div></div>;
  }
  return <SettingsContent profile={data} activeKey={activeKey} rawSection={rawSection} reload={reload} />;
}

function SettingsContent({ profile: p, activeKey, rawSection, reload }: { profile: ProfileData; activeKey: string; rawSection: string | null; reload: () => void }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user, signOutUser, refreshUser } = useAuth();
  const onSaved = async () => { await refreshUser(); reload(); };
  const { prefs, write, error, dismissError } = useLivePrefs(user?.uid, p.prefs);
  const eff: Prefs = prefs ?? p.prefs;
  const active = SECTIONS.find((s) => s.key === activeKey) ?? SECTIONS[0];
  const [editor, setEditor] = useState<SectionRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Section change moves focus to the section heading (P9.2) - but not on first mount.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    headingRef.current?.focus();
  }, [activeKey]);

  const doExport = async () => {
    setActionMsg(null);
    try { await downloadMyData(); }
    catch (e) {
      setActionMsg((e as Error).message === "rate_limited"
        ? "Ma már túl sok letöltés történt. Próbáld holnap."
        : "Nem sikerült letölteni. Próbáld újra.");
    }
  };

  // ── prefs writers (optimistic; nested maps deep-merge in Firestore) ──
  const setToggle = (key: string, v: boolean) => {
    switch (key) {
      case "restStreak": return write((x) => ({ ...x, plan: { ...x.plan, restDayKeepsStreak: v } }), { plan: { restDayKeepsStreak: v } });
      case "workoutReminder": return write((x) => ({ ...x, reminders: { ...x.reminders, workout: { ...x.reminders.workout, enabled: v } } }), { reminders: { workout: { enabled: v } } });
      case "streakRisk": return write((x) => ({ ...x, reminders: { ...x.reminders, streakRisk: v } }), { reminders: { streakRisk: v } });
      case "community": return write((x) => ({ ...x, reminders: { ...x.reminders, community: v } }), { reminders: { community: v } });
      case "newContent": return write((x) => ({ ...x, reminders: { ...x.reminders, newContent: v } }), { reminders: { newContent: v } });
      case "nameVisible": return write((x) => ({ ...x, privacy: { ...x.privacy, nameVisible: v } }), { privacy: { nameVisible: v } });
      case "streakVisible": return write((x) => ({ ...x, privacy: { ...x.privacy, streakVisible: v } }), { privacy: { streakVisible: v } });
      case "quietDefault": return write((x) => ({ ...x, playback: { ...x.playback, quietDefault: v } }), { playback: { quietDefault: v } });
      case "captions": return write((x) => ({ ...x, playback: { ...x.playback, captions: v } }), { playback: { captions: v } });
      case "autoNext": return write((x) => ({ ...x, playback: { ...x.playback, autoNext: v } }), { playback: { autoNext: v } });
    }
  };
  const setReminderDays = (wd: number[]) =>
    write((x) => ({ ...x, reminders: { ...x.reminders, workout: { ...x.reminders.workout, weekdays: wd } } }), { reminders: { workout: { weekdays: wd } } });
  const writeTime = (t: string) =>
    write((x) => ({ ...x, reminders: { ...x.reminders, workout: { ...x.reminders.workout, time: t } } }), { reminders: { workout: { time: t } } });
  const writePlan = (days: number, weekdays: number[]) =>
    write((x) => ({ ...x, plan: { ...x.plan, daysPerWeek: days, weekdays } }), { plan: { daysPerWeek: days, weekdays } });
  const writeLength = (v: string) => write((x) => ({ ...x, plan: { ...x.plan, sessionLength: v } }), { plan: { sessionLength: v } });
  const writeEquipment = (v: string[]) => write((x) => ({ ...x, plan: { ...x.plan, equipment: v } }), { plan: { equipment: v } });

  const toggleVal = (key: string): boolean => {
    switch (key) {
      case "restStreak": return eff.plan.restDayKeepsStreak;
      case "workoutReminder": return eff.reminders.workout.enabled;
      case "streakRisk": return eff.reminders.streakRisk;
      case "community": return eff.reminders.community;
      case "newContent": return eff.reminders.newContent;
      case "nameVisible": return eff.privacy.nameVisible;
      case "streakVisible": return eff.privacy.streakVisible;
      case "quietDefault": return eff.playback.quietDefault;
      case "captions": return eff.playback.captions;
      case "autoNext": return eff.playback.autoNext;
      default: return false;
    }
  };

  const valueFor = (key: string): string | undefined => {
    switch (key) {
      case "name": return p.identity.name;
      case "email": return p.identity.email ?? "-";
      case "photo": return p.identity.photoURL ? "Beállítva" : "Nincs";
      case "password": return p.identity.provider === "google.com" ? "Google-fiók" : "Módosítás";
      case "days": return `${eff.plan.daysPerWeek} nap`;
      case "length": return eff.plan.sessionLength;
      case "equipment": return eff.plan.equipment.join(" · ") || "Nincs";
      case "reminderTime": return eff.reminders.workout.time;
      case "photosPrivate": return "Privát";
      default: return undefined;
    }
  };

  const logout = async () => { await signOutUser(); router.push("/login"); };
  const onRow = (row: SectionRow) => {
    if (row.key === "export") { void doExport(); return; }
    if (row.key === "delete") { setDeleteOpen(true); return; }
    if (row.kind === "chevron") setEditor(row);
    else if (row.kind === "nav" && row.href) {
      if (row.href.startsWith("mailto:")) window.location.href = row.href;
      else router.push(row.href);
    }
    else if (row.kind === "action" && row.key === "logout") void logout();
  };

  // E-mail and Jelszó are editable ONLY for email/password accounts. Federated
  // (Google/Facebook/Apple) accounts manage both with their provider - those rows
  // become read-only notes, no editor.
  const isPassword = p.identity.provider === "password";
  const PROVIDER_NAME: Record<string, string> = { "google.com": "Google", "facebook.com": "Facebook", "apple.com": "Apple" };
  const providerName = PROVIDER_NAME[p.identity.provider ?? ""] ?? "Közösségi";

  // Mobile (P8.3): no sub-nav. The six sections are a list that drills into its own
  // screen; back goes list → Profil. Desktop keeps the sub-nav + body layout.
  const inSection = !isMobile || !!rawSection;
  if (!inSection) {
    return (
      <div className="pf-set">
        <Link href="/app/profile" className="pf-back"><LxIcon d={lxPaths.chevronLeft} size={14} /> Profil</Link>
        <h1 className="pf-set-ttl">Beállítások</h1>
        <div className="pf-group pf-mobsec">
          {SECTIONS.map((s) => (
            <button key={s.key} type="button" className="pf-row tap"
              onClick={() => router.push(`/app/profile/settings?section=${s.key}`)}>
              <span className="ic"><LxIcon d={lxPaths[s.icon] ?? lxPaths.user} size={17} /></span>
              <span className="tx"><span className="lb">{s.label}</span></span>
              <LxIcon className="cv" d={lxPaths.chevronRight} size={16} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const backHref = isMobile ? "/app/profile/settings" : "/app/profile";
  const backLabel = isMobile ? "Beállítások" : "Profil";

  return (
    <div className="pf-set">
      <Link href={backHref} className="pf-back">
        <LxIcon d={lxPaths.chevronLeft} size={14} /> {backLabel}
      </Link>
      <h1 className="pf-set-ttl">{isMobile ? active.label : "Beállítások"}</h1>

      {error && (
        <div className="pf-save-err" role="alert">
          <span>Nem sikerült mentenünk. Próbáld újra.</span>
          <button type="button" onClick={dismissError}>Bezár</button>
        </div>
      )}
      {actionMsg && (
        <div className="pf-save-err" role="alert">
          <span>{actionMsg}</span>
          <button type="button" onClick={() => setActionMsg(null)}>Bezár</button>
        </div>
      )}

      <div className={`pf-set-grid${isMobile ? " mobile" : ""}`}>
        {!isMobile && (
          <nav className="pf-subnav" aria-label="Beállítások szakaszok">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`pf-subnav-item${s.key === active.key ? " on" : ""}`}
                aria-current={s.key === active.key ? "page" : undefined}
                onClick={() => router.push(`/app/profile/settings?section=${s.key}`)}
              >
                <LxIcon d={lxPaths[s.icon] ?? lxPaths.user} size={16} /> {s.label}
              </button>
            ))}
          </nav>
        )}

        <div className="pf-set-body">
          {!isMobile && <h2 className="pf-set-h2" ref={headingRef} tabIndex={-1}>{active.label}</h2>}

          {active.key === "subscription" && (
            <SubscriptionPanel sub={p.subscription} onManage={() => router.push("/app/membership")} />
          )}

          {active.groups.map((g, gi) => (
            <SetGroup key={gi} label={g.label}>
              {g.rows.map((row) => {
                if ((row.key === "password" || row.key === "email") && !isPassword) {
                  const what = row.key === "password" ? "a jelszót" : "az e-mail címet";
                  return (
                    <SetRow key={row.key} icon={row.icon} label={row.label}
                      value={row.key === "email" ? (p.identity.email ?? "-") : `${providerName}-fiók`}
                      desc={`${providerName}-fiókkal léptél be - ${what} ott tudod módosítani.`}
                      control="none" />
                  );
                }
                if (row.kind === "pills") {
                  return (
                    <div className="pf-row pf-row-pills" key={row.key}>
                      <span className="ic"><LxIcon d={lxPaths[row.icon ?? "calendarCheck"]} size={17} /></span>
                      <span className="tx"><span className="lb">{row.label}</span></span>
                      <DayPills value={eff.reminders.workout.weekdays} onChange={setReminderDays} ariaLabel="Mely napokon" />
                    </div>
                  );
                }
                return (
                  <SetRow
                    key={row.key}
                    icon={row.icon}
                    label={row.label}
                    desc={row.desc}
                    danger={row.danger}
                    value={row.kind === "value" || row.kind === "chevron" ? valueFor(row.key) : undefined}
                    control={row.kind === "toggle" ? "toggle" : row.kind === "chevron" ? "chevron" : "none"}
                    checked={row.kind === "toggle" ? toggleVal(row.key) : undefined}
                    onToggle={(v) => setToggle(row.key, v)}
                    onClick={row.kind === "toggle" || row.kind === "value" ? undefined : () => onRow(row)}
                  />
                );
              })}
            </SetGroup>
          ))}
        </div>
      </div>

      {editor && PREFS_EDITORS.has(editor.key) && (
        <PrefsEditor
          editorKey={editor.key}
          prefs={eff}
          onClose={() => setEditor(null)}
          writeTime={writeTime}
          writePlan={writePlan}
          writeLength={writeLength}
          writeEquipment={writeEquipment}
        />
      )}
      {editor && IDENTITY_EDITORS.has(editor.key) && (
        <IdentityEditor
          editorKey={editor.key}
          provider={p.identity.provider}
          onClose={() => setEditor(null)}
          onSaved={onSaved}
        />
      )}
      {editor && !PREFS_EDITORS.has(editor.key) && !IDENTITY_EDITORS.has(editor.key) && (
        <EditorModal open title={editor.label} dirty={false} onClose={() => setEditor(null)} onSave={() => setEditor(null)}>
          <p className="pf-editor-note">
            {valueFor(editor.key) ? <>Jelenlegi érték: <b>{valueFor(editor.key)}</b>. </> : null}
            Ez a funkció hamarosan elérhető.
          </p>
        </EditorModal>
      )}
      {deleteOpen && (
        <DeleteAccountModal provider={p.identity.provider} onClose={() => setDeleteOpen(false)} />
      )}
    </div>
  );
}

function SubscriptionPanel({
  sub, onManage,
}: {
  sub: ProfileData["subscription"];
  onManage: () => void;
}) {
  if (!sub || sub.status === "EXPIRED") {
    return (
      <div className="pf-subpanel empty">
        <div className="l1">Nincs aktív előfizetés</div>
        <div className="pf-subpanel-cta">
          <a className="lxbtn m primary" href="/subscribe">Előfizetek</a>
        </div>
      </div>
    );
  }
  const price = sub.priceHuf != null ? formatHuf(sub.priceHuf) : "";
  const line2 =
    sub.status === "ACTIVE" ? `Aktív · megújul ${fullDate(sub.renewalAt)}${price ? ` · ${price}` : ""}`
    : sub.status === "PAUSED" ? `Szüneteltetve · ${fullDate(sub.accessUntil)}-ig`
    : sub.status === "CANCELED" ? `Lemondva · a hozzáférésed ${fullDate(sub.accessUntil)}-ig aktív`
    : sub.status === "PAST_DUE" ? "Fizetési gond - frissítsd a kártyát"
    : `${sub.status}${price ? ` · ${price}` : ""}`;
  return (
    <div className="pf-subpanel">
      <div className="l1">LEXFIT - {sub.planLabel}</div>
      <div className="l2">{line2}</div>
      <div className="pf-subpanel-cta">
        <button type="button" className="lxbtn s secondary" onClick={onManage}>Csomag váltása</button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="pf-set"><h1 className="pf-set-ttl">Beállítások</h1></div>}>
      <SettingsInner />
    </Suspense>
  );
}

// The single declarative source for Beállítások: every section, group, and row's
// copy, icon and control type. Keeping copy here (verbatim Hungarian, 30 §30.7) is
// what makes the P4 read-wiring and P5 write-wiring mechanical and the strings
// auditable. Values/handlers are resolved by key in the page, not stored here.

export type RowKind =
  | "chevron"  // opens an editor
  | "toggle"   // boolean pref
  | "value"    // read-only value on the right, no control
  | "action"   // clickable row, no chevron (e.g. Kijelentkezés)
  | "pills"    // inline weekday multi-select (Mely napokon)
  | "nav";     // navigates elsewhere (e.g. /app/szm, /app/membership)

export interface SectionRow {
  key: string;
  label: string;
  desc?: string;
  icon?: string;
  kind: RowKind;
  danger?: boolean;
  href?: string;      // for kind: "nav"
}

export interface SectionGroup { label?: string; rows: SectionRow[] }

export interface Section {
  key: string;
  label: string;
  icon: string;
  groups: SectionGroup[];
}

export const SECTIONS: Section[] = [
  {
    key: "account",
    label: "Fiók",
    icon: "user",
    groups: [
      {
        label: "Személyes adatok",
        rows: [
          { key: "name", label: "Név", icon: "user", kind: "chevron" },
          { key: "email", label: "E-mail", icon: "mail", kind: "chevron" },
          { key: "photo", label: "Profilkép", icon: "pencil", kind: "chevron" },
          { key: "password", label: "Jelszó", icon: "shield", kind: "chevron" },
        ],
      },
      {
        label: "Az edzésterved",
        rows: [
          { key: "days", label: "Heti edzésnapok", desc: "Ez határozza meg, mi kerül a kezdőlapra", icon: "calendarCheck", kind: "chevron" },
          { key: "length", label: "Szokásos edzéshossz", icon: "clock", kind: "chevron" },
          { key: "equipment", label: "Van otthon eszközöd?", icon: "dumbbell", kind: "chevron" },
          { key: "restStreak", label: "A pihenőnap megtartja a sorozatot", desc: "A tervezett pihenőnap nem töri meg a lángot", icon: "flame", kind: "toggle" },
        ],
      },
      {
        label: "Fiók",
        rows: [
          { key: "logout", label: "Kijelentkezés", icon: "logOut", kind: "action" },
          { key: "delete", label: "Fiók törlése", desc: "Végleges. Az adataid 30 napon belül törlődnek.", icon: "trash", kind: "chevron", danger: true },
        ],
      },
    ],
  },
  {
    key: "reminders",
    label: "Emlékeztetők",
    icon: "bell",
    groups: [
      {
        label: "Napi emlékeztető",
        rows: [
          { key: "workoutReminder", label: "Emlékeztess az edzésre", desc: "Csak az edzésnapjaidon, egyszer", icon: "bell", kind: "toggle" },
          { key: "reminderTime", label: "Időpont", icon: "clock", kind: "chevron" },
          { key: "reminderDays", label: "Mely napokon", icon: "calendarCheck", kind: "pills" },
        ],
      },
      {
        label: "Egyéb értesítések",
        rows: [
          { key: "streakRisk", label: "Sorozat veszélyben", desc: "Este 8-kor, ha aznap még nem mozogtál", icon: "flame", kind: "toggle" },
          { key: "community", label: "Közösségi válaszok", icon: "users", kind: "toggle" },
          { key: "newContent", label: "Új edzések a tárban", desc: "Legfeljebb hetente egyszer", icon: "grid", kind: "toggle" },
        ],
      },
    ],
  },
  {
    key: "privacy",
    label: "Adatvédelem",
    icon: "shield",
    groups: [
      {
        rows: [
          { key: "nameVisible", label: "A nevem látszik a közösségben", desc: "Kikapcsolva „R.” néven jelensz meg", icon: "user", kind: "toggle" },
          { key: "streakVisible", label: "A sorozatom látszik másoknak", icon: "flame", kind: "toggle" },
          { key: "photosPrivate", label: "Haladásfotók", desc: "Csak te látod. Sosem kerülnek a közösségbe.", icon: "lock", kind: "value" },
          { key: "export", label: "Adataim letöltése", icon: "download", kind: "chevron" },
        ],
      },
    ],
  },
  {
    key: "subscription",
    label: "Előfizetés",
    icon: "creditCard",
    groups: [
      {
        // "Fizetési előzmények" is intentionally not here: there is no invoice-list
        // route or Stripe billing portal yet, and an inert row is worse than none
        // (30 §P7.4). It ships once real invoices are available.
        rows: [
          { key: "cancel", label: "Előfizetés lemondása", desc: "A hozzáférésed a fizetett időszak végéig megmarad", icon: "close", kind: "nav", href: "/app/membership" },
        ],
      },
    ],
  },
  {
    key: "playback",
    label: "Lejátszás",
    icon: "play",
    groups: [
      {
        rows: [
          { key: "quietDefault", label: "Csendes variációk alapból", desc: "Szomszéd-barát, ugrálás nélküli verziók előnyben", icon: "volume2", kind: "toggle" },
          { key: "captions", label: "Feliratok", icon: "captions", kind: "toggle" },
          { key: "autoNext", label: "Automatikus következő edzés", icon: "play", kind: "toggle" },
        ],
      },
    ],
  },
  {
    key: "help",
    label: "Súgó",
    icon: "messageCircle",
    groups: [
      {
        rows: [
          { key: "faq", label: "Gyakori kérdések", icon: "messageCircle", kind: "chevron" },
          { key: "contact", label: "Írj Alexának", icon: "mail", kind: "nav", href: "/app/szm" },
          { key: "legal", label: "Jogi tudnivalók", icon: "shield", kind: "chevron" },
        ],
      },
    ],
  },
];

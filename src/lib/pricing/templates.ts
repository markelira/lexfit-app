// LEXFIT email templates — Alexa's voice (E/1, direct, short, ≤1–2 emoji, no
// marketing jargon, no pressure). Pure: return {subject, text}; the cron/route
// supplies data. Renewal facts (price, period, one-click cancel) are mandatory
// per J1/J6.

import { formatHuf, perWeekHuf } from "./display";
import { PRICES, GRAND_SLAM_WINDOW_HOURS } from "./config";

const cancelLine = "Ha most nem folytatnád, egy kattintással lemondhatod a profilodban.";

/** F3.2 — the kiérdemelt éves offer just unlocked. Status, not sale (J4). */
export function earnedUnlocked(): { subject: string; text: string } {
  const earned = formatHuf(PRICES.annual_earned.amountHuf);
  const perWeek = formatHuf(perWeekHuf(PRICES.annual_earned.amountHuf));
  return {
    subject: "Feloldottad az Alapító Éves árat 💗",
    text: [
      "Megcsináltad — az első heted mind az 5 kihívás-napját kipipáltad.",
      "",
      `Ezzel feloldottad a te árad: ${earned} az első évre (${perWeek}/hét).`,
      `Ez ${GRAND_SLAM_WINDOW_HOURS} órán át elérhető, utána a szokásos éves ár marad.`,
      "Nézd meg az appban.",
      "— Alexa",
    ].join("\n"),
  };
}

/** F3.4 — non-earner annual nudge (days 10–18). Comparison, not discount. */
export function annualNudge(): { subject: string; text: string } {
  const weekStd = formatHuf(PRICES.week_std.amountHuf);
  const annualPerWeek = formatHuf(perWeekHuf(PRICES.annual_std.amountHuf));
  return {
    subject: "Ugyanaz, csak okosabban",
    text: [
      "Szia!",
      "",
      `Hetente ${weekStd}/hét — évesben ${annualPerWeek}/hét. Ugyanaz a hozzáférés,`,
      "csak jóval kevesebbe kerül, ha egyben nézed.",
      "Ha kiszámoltad magadnak, az éves ott vár az appban.",
      "— Alexa",
    ].join("\n"),
  };
}

/** F5.1 — day-0 dunning: the card was declined. `payUrl` = Stripe hosted invoice. */
export function dunningDay0(payUrl: string): { subject: string; text: string } {
  return {
    subject: "Nem ment át a kártyád",
    text: [
      "Szia!",
      "",
      "A mostani terhelés nem sikerült — valószínűleg csak lejárt vagy váltott a kártya.",
      `Frissítsd itt, és minden megy tovább: ${payUrl}`,
      "",
      "A hozzáférésed egyelőre megmarad. — Alexa",
    ].join("\n"),
  };
}

/** F5.1 — day-3 dunning reminder. */
export function dunningDay3(payUrl: string): { subject: string; text: string } {
  return {
    subject: "Emlékeztető: frissítsd a kártyád",
    text: [
      "Szia!",
      "",
      "Még mindig nem sikerült a terhelés. Pár napig megtartjuk a hozzáférésed,",
      `de utána szünetel. Egy perc az egész: ${payUrl}`,
      "— Alexa",
    ].join("\n"),
  };
}

/** F5.2 — sent shortly before a paused subscription auto-resumes. */
export function pauseResumingSoon(): { subject: string; text: string } {
  return {
    subject: "Hamarosan újraindul a tagságod",
    text: [
      "Szia!",
      "",
      "Pár nap múlva letelik a szüneted, és ott folytatod, ahol abbahagytad — a",
      "kifizetett idődből semmi nem veszett el.",
      "Ha még maradnál szüneten, egy kattintással meghosszabbíthatod a profilodban.",
      "",
      "Jó újrakezdést! 💪",
      "— Alexa",
    ].join("\n"),
  };
}

/** F2.2 — weekly day-5 renewal reminder. Two days before the intro week ends. */
export function weeklyDay5Reminder(): { subject: string; text: string } {
  const std = formatHuf(PRICES.week_std.amountHuf);
  return {
    subject: "Két nap múlva indul a rendes heted",
    text: [
      "Szia!",
      "",
      `Két nap múlva lejár az első heted, és onnantól ${std}/hét, automatikusan megújul.`,
      cancelLine,
      "",
      "Ha maradsz: hétfőn új kihívás vár. Ki van benne? 💪",
      "— Alexa",
    ].join("\n"),
  };
}

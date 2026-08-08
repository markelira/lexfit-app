import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { notifyAdmin } from "./events";

// F0.6 — NAV-compliant invoicing via Billingo (v3 REST/JSON). Chosen over
// Számlázz.hu for its modern JSON API. Every displayed price is GROSS HUF with
// VAT: AM Studios Group Kft. is ALANYI ADÓMENTES (confirmed by owner
// 2026-08-08), so invoices carry the AAM code — no VAT content, gross = net.
// If the company ever crosses the AAM threshold and becomes VAT-registered,
// set BILLINGO_VAT_CODE=27% in the environment (no code change needed).
//
// Idempotent per Stripe ref (invoice id / payment-intent id): a marker doc in
// `issuedInvoices/{ref}` guarantees one legal invoice per payment even across
// webhook retries. Failures are recorded (status "failed") for the cron retry.
//
// Without BILLINGO_API_KEY / BILLINGO_BLOCK_ID (local dev) issuance is skipped
// and logged, so nothing breaks before the account is wired.

const API = "https://api.billingo.hu/v3";

export interface InvoiceParty {
  name: string | null;
  email: string | null;
  address: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
}

export interface InvoicePayload {
  party: InvoiceParty;
  amountHuf: number; // gross forints (VAT included)
  description: string;
  fulfillmentDate: string; // YYYY-MM-DD
}

function config() {
  const key = process.env.BILLINGO_API_KEY;
  const blockId = process.env.BILLINGO_BLOCK_ID;
  return key && blockId ? { key, blockId: Number(blockId) } : null;
}

async function billingo(key: string, path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Billingo ${res.status}: ${await res.text().catch(() => "")}`);
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

/** Find a partner by email, or create one. Returns the Billingo partner id. */
async function upsertPartner(key: string, party: InvoiceParty): Promise<number> {
  if (party.email) {
    const q = await fetch(`${API}/partners?query=${encodeURIComponent(party.email)}`, {
      headers: { "X-API-KEY": key, Accept: "application/json" },
    });
    if (q.ok) {
      const data = (await q.json().catch(() => ({}))) as { data?: Array<{ id: number }> };
      if (data.data?.[0]?.id) return data.data[0].id;
    }
  }
  const created = await billingo(key, "/partners", {
    name: party.name ?? party.email ?? "Vevő",
    emails: party.email ? [party.email] : [],
    address: {
      country_code: (party.address?.country ?? "HU").toUpperCase(),
      post_code: party.address?.postalCode ?? "",
      city: party.address?.city ?? "",
      address: [party.address?.line1, party.address?.line2].filter(Boolean).join(", "),
    },
  });
  return created.id as number;
}

/**
 * Issue exactly one invoice for a Stripe payment `ref`. Idempotent. Returns true
 * if issued (or already issued), false if it failed (recorded for retry).
 */
export async function issueInvoice(ref: string, payload: InvoicePayload): Promise<boolean> {
  const markerRef = adminDb.collection("issuedInvoices").doc(ref);

  // Claim the ref atomically so retries/concurrent deliveries don't double-issue.
  const claimed = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(markerRef);
    if (snap.exists && snap.data()?.status === "issued") return false;
    tx.set(markerRef, { status: "pending", ref, at: Date.now(), payload }, { merge: true });
    return true;
  });
  if (!claimed) return true; // already issued

  const cfg = config();
  if (!cfg) {
    if (process.env.NODE_ENV === "production") {
      // A legally required NAV invoice was NOT issued. Record it as "failed"
      // (the payload is already on the marker) so the daily cron re-issues it
      // automatically once the Billingo env is fixed — and be loud about it.
      console.error(`[invoice] FAILED — BILLINGO_API_KEY/BLOCK_ID not configured ref=${ref} ${payload.amountHuf} Ft`);
      await markerRef.set({ status: "failed", error: "no_billingo_config", at: Date.now() }, { merge: true });
      await notifyAdmin("invoice_failed", { ref, amountHuf: payload.amountHuf, error: "no_billingo_config" });
    } else {
      console.log(`[invoice] skipped (no BILLINGO_API_KEY/BLOCK_ID) ref=${ref} ${payload.amountHuf} Ft`);
      await markerRef.set({ status: "skipped_no_config" }, { merge: true });
    }
    return false;
  }

  try {
    const partnerId = await upsertPartner(cfg.key, payload.party);
    const doc = await billingo(cfg.key, "/documents", {
      partner_id: partnerId,
      block_id: cfg.blockId,
      type: "invoice",
      fulfillment_date: payload.fulfillmentDate,
      due_date: payload.fulfillmentDate,
      payment_method: "bankcard",
      language: "hu",
      currency: "HUF",
      conversion_rate: 1,
      electronic: true,
      paid: true,
      items: [
        {
          name: payload.description,
          unit_price: payload.amountHuf,
          unit_price_type: "gross",
          quantity: 1,
          unit: "db",
          vat: process.env.BILLINGO_VAT_CODE ?? "AAM", // alanyi adómentes

        },
      ],
    });
    // Best-effort: email the invoice to the buyer.
    await billingo(cfg.key, `/documents/${doc.id}/send`, {}).catch(() => {});
    await markerRef.set({ status: "issued", billingoId: doc.id, at: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await markerRef.set({ status: "failed", error, at: Date.now() }, { merge: true });
    await notifyAdmin("invoice_failed", { ref, amountHuf: payload.amountHuf, error });
    console.error(`[invoice] failed ref=${ref}:`, error);
    return false;
  }
}

/** Cron: retry invoices that previously failed. */
export async function retryFailedInvoices(limit = 25): Promise<number> {
  const snap = await adminDb
    .collection("issuedInvoices")
    .where("status", "==", "failed")
    .limit(limit)
    .get();
  let ok = 0;
  for (const d of snap.docs) {
    const data = d.data() as { payload?: InvoicePayload };
    if (!data.payload) continue;
    // Reset to pending so issueInvoice re-attempts (its claim tx allows retry
    // because status !== "issued").
    await d.ref.set({ status: "pending" }, { merge: true });
    if (await issueInvoice(d.id, data.payload)) ok++;
  }
  return ok;
}

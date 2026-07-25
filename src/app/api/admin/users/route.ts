import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface MemberRow {
  uid: string;
  displayName: string | null;
  email: string | null;
  createdAt: string | null;
  subscriptionStatus: string;
  streak: number;
  doneCount: number;
  lastCompletedDate: string | null;
}

/** Admin-only: list all members with subscription status + basic engagement. */
export async function GET(req: Request) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [usersSnap, subsSnap, progSnap] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collectionGroup("subscription").get(),
    adminDb.collectionGroup("progress").get(),
  ]);

  const subByUid: Record<string, FirebaseFirestore.DocumentData> = {};
  subsSnap.forEach((d) => {
    const uid = d.ref.parent.parent?.id;
    if (uid) subByUid[uid] = d.data();
  });
  const progByUid: Record<string, FirebaseFirestore.DocumentData> = {};
  progSnap.forEach((d) => {
    const uid = d.ref.parent.parent?.id;
    if (uid) progByUid[uid] = d.data();
  });

  const users: MemberRow[] = usersSnap.docs.map((d) => {
    const u = d.data();
    const sub = subByUid[d.id];
    const prog = progByUid[d.id];
    const created = u.createdAt as { toDate?: () => Date } | undefined;
    return {
      uid: d.id,
      displayName: u.displayName ?? null,
      email: u.email ?? null,
      createdAt: created?.toDate ? created.toDate().toISOString() : null,
      subscriptionStatus: (sub?.status as string) ?? "none",
      streak: (prog?.streak as number) ?? 0,
      doneCount: (prog?.doneCount as number) ?? 0,
      lastCompletedDate: (prog?.lastCompletedDate as string) ?? null,
    };
  });

  users.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ users });
}

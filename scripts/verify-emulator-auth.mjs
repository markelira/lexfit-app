// Verify the emulator auth+rules+reads chain (run under emulators:exec).
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: "lexfit-app",
  authDomain: "lexfit-app.firebaseapp.com",
});
const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

// 1) Unauthenticated read should be DENIED by the rules.
try {
  await getDoc(doc(db, "programs", "foundation"));
  console.log("❌ UNAUTH read succeeded (rules not enforced)");
} catch {
  console.log("✅ UNAUTH read denied by rules");
}

// 2) Authenticated read should SUCCEED.
await createUserWithEmailAndPassword(auth, `verify${Date.now()}@test.local`, "test1234");
const p = await getDoc(doc(db, "programs", "foundation"));
const v = await getDocs(collection(db, "videos"));
console.log(`✅ AUTH read: program exists=${p.exists()} · videos=${v.size}`);
process.exit(0);

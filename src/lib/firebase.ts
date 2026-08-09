// Firebase Web SDK (client). Safe for the browser — uses NEXT_PUBLIC_* config.
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Reuse the app across hot reloads / route segments instead of re-initializing.
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase App Check (reCAPTCHA v3) — attests requests come from the real app,
// protecting Firestore/Storage/Auth from abuse. Browser-only, and skipped under
// the emulator (which doesn't enforce App Check). Inert until the site key env
// is set, so it never breaks local/preview runs that lack it. Initialized right
// after the app so tokens attach to subsequent Firebase requests.
// NOTE: keep every service UNENFORCED in the Firebase console until this ships
// and tokens show up in App Check monitoring — enforcing first would reject
// every client request.
declare global {
  // eslint-disable-next-line no-var
  var __LEXFIT_APPCHECK__: boolean | undefined;
  // reCAPTCHA App Check debug token opt-in for local non-emulator runs.
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}
const appCheckSiteKey = process.env.NEXT_PUBLIC_APPCHECK_RECAPTCHA_SITE_KEY;
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_EMULATORS !== "true" &&
  appCheckSiteKey &&
  !globalThis.__LEXFIT_APPCHECK__
) {
  globalThis.__LEXFIT_APPCHECK__ = true;
  // Local (non-emulator) dev: print a debug token to register in the console
  // instead of failing reCAPTCHA on localhost. Never triggers on Vercel
  // (NODE_ENV=production there).
  if (process.env.NODE_ENV !== "production") globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Dev only: point Auth + Firestore + Storage at the Local Emulator so all
// content/mock data stays on your machine and production stays empty. Auth MUST
// be emulated too — the Firestore emulator only trusts tokens from the Auth
// emulator, so with real auth its security rules would deny every read.
// Enabled by NEXT_PUBLIC_USE_EMULATORS=true. Sign-in uses the emulator's
// (fake) Google flow.
declare global {
  // eslint-disable-next-line no-var
  var __LEXFIT_EMU__: boolean | undefined;
}
if (
  process.env.NEXT_PUBLIC_USE_EMULATORS === "true" &&
  typeof window !== "undefined" &&
  !globalThis.__LEXFIT_EMU__
) {
  globalThis.__LEXFIT_EMU__ = true;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

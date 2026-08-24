// Firebase Web SDK (client). Safe for the browser - uses NEXT_PUBLIC_* config.
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
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

// Firebase App Check (reCAPTCHA v3) - attests requests come from the real app,
// protecting Firestore/Storage/Auth from abuse. Browser-only, and skipped under
// the emulator (which doesn't enforce App Check). Inert until the site key env
// is set, so it never breaks local/preview runs that lack it.
//
// Called from AuthProvider's mount effect - NOT at module scope. The SDK
// synchronously appends its widget container (div#fire_app_check_[DEFAULT])
// into <body> and later renders into it by id; doing that at module-eval time
// raced React hydration, and when hydration recovery re-rendered <body> the div
// vanished or duplicated ("reCAPTCHA has already been rendered in this element"
// / "placeholder element must be an element or id", plus the hydration failures
// on / - all one bug, seen live 2026-08-12 in Meta in-app browsers). Effects
// only run after hydration commits, so the div now lands in a settled body.
// Every client Firestore read is gated on the user from that same provider, so
// App Check still initializes ahead of authed traffic.
// NOTE: keep every service UNENFORCED in the Firebase console until 403s stop
// and tokens show up in App Check monitoring - enforcing first would reject
// every client request.
// ENFORCEMENT ORDER CAVEAT: getAuth() below runs at module eval and may
// refresh a persisted session's token BEFORE this post-hydration init - that
// first Auth request is un-attested by design. Enforce Firestore/Storage
// first; before enforcing App Check for AUTH, re-test cold-load sign-in and
// /auth/action (password reset / email verify) explicitly.
declare global {
  // eslint-disable-next-line no-var
  var __LEXFIT_APPCHECK__: boolean | undefined;
  // reCAPTCHA App Check debug token opt-in for local non-emulator runs.
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}
const appCheckSiteKey = process.env.NEXT_PUBLIC_APPCHECK_RECAPTCHA_SITE_KEY;
export function initAppCheck() {
  if (
    typeof window === "undefined" ||
    process.env.NEXT_PUBLIC_USE_EMULATORS === "true" ||
    !appCheckSiteKey ||
    globalThis.__LEXFIT_APPCHECK__
  ) {
    return;
  }
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

// Auth persistence: localStorage FIRST, IndexedDB only as a migration source.
// This is getAuth()'s own hierarchy with the first two entries swapped (and its
// popup/redirect resolver kept, which initializeAuth does NOT default to -
// without it signInWithPopup throws auth/argument-error).
//
// Why: getAuth() picks indexedDBLocalPersistence, and that layer runs a 800ms
// poll loop whose promise nobody catches. On iOS Safari the browser can drop an
// open IDB connection under it at any time (7-day ITP eviction, storage
// pressure, "clear website data", webview teardown), and every tick then
// rejects with "UnknownError: Database deleted by request of the user" /
// "IDBDatabase: The database connection is closing" - unhandled, once per tick.
// Worse than the Sentry noise: with a dead IDB, the persistence write inside
// sign-in rejects, so a /register submit fails for that user (both live
// sightings were /register on iOS - Sentry 2026-08-12 and 2026-08-24).
// localStorage is synchronous, cannot be yanked mid-transaction, and is already
// where every RegisterForm/AuthScreen session ends up (both call
// setPersistence(browserLocalPersistence) before signing in - now a no-op).
// indexedDBLocalPersistence stays in the list so PersistenceUserManager.create
// still finds and migrates sessions written by the old hierarchy; it is never
// selected while localStorage is available, so nothing polls it.
//
// getAuth() covers the two cases this hierarchy can't serve:
//   - SSR: `firebase/auth` resolves to its NODE build on the server, where the
//     browser persistence/resolver exports don't exist. Passing those undefineds
//     to initializeAuth logs "INTERNAL ASSERTION FAILED: Expected a class
//     definition" on every render (seen in dev before this guard).
//   - This module re-evaluating (dev hot reload) against an app that already has
//     an auth instance - same reason `app` above reuses getApps()[0].
function initAuth(): Auth {
  if (typeof window === "undefined") return getAuth(app);
  try {
    return initializeAuth(app, {
      popupRedirectResolver: browserPopupRedirectResolver,
      persistence: [browserLocalPersistence, indexedDBLocalPersistence, browserSessionPersistence],
    });
  } catch {
    return getAuth(app);
  }
}
export const auth: Auth = initAuth();
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Dev only: point Auth + Firestore + Storage at the Local Emulator so all
// content/mock data stays on your machine and production stays empty. Auth MUST
// be emulated too - the Firestore emulator only trusts tokens from the Auth
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

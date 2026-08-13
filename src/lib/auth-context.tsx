"use client";

import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import * as Sentry from "@sentry/nextjs";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, initAppCheck } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  /** Re-read the current user after a profile edit (updateProfile mutates in place,
   *  and onAuthStateChanged doesn't fire) so the top bar reflects it without reload. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
// Apple returns name/email only on the FIRST authorization - request both scopes
// so we capture them while we can. Apple's default response locale follows the
// user's device; the popup UI is Apple-hosted.
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

/** Rendered as AuthProvider's FIRST child: mount effects flush in depth-first
 *  tree order, so this leaf's effect runs before any page/child effect that
 *  might call Firebase (e.g. /auth/action's verifyPasswordResetCode on mount).
 *  A parent-level effect would run AFTER every child effect - too late. Still
 *  post-hydration on purpose: App Check injects its reCAPTCHA container into
 *  <body>, which must not race React hydration (see initAppCheck's comment). */
function AppCheckInit() {
  useEffect(() => {
    initAppCheck();
  }, []);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, forceTick] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // uid only - never email/name (privacy posture matches the replay
      // masking: LEXFIT handles body-image-sensitive content).
      Sentry.setUser(u ? { id: u.uid } : null);
    });
  }, []);

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signInWithApple() {
    await signInWithPopup(auth, appleProvider);
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(email: string, password: string) {
    // The verification email (P5.4: informational, never an access gate) is now
    // our branded one, sent server-side by /api/auth/post-register - the
    // register flows call it right after ensureUserDoc creates the user doc.
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function signOutUser() {
    await signOut(auth);
  }

  async function refreshUser() {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    // updateProfile mutated the User in place; keep the real reference (so getIdToken
    // etc. stay intact) and force a re-render so consumers re-read displayName/photoURL.
    setUser(auth.currentUser);
    forceTick((t) => t + 1);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, signOutUser, refreshUser }}
    >
      <AppCheckInit />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

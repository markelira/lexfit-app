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
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

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
// Apple returns name/email only on the FIRST authorization — request both scopes
// so we capture them while we can. Apple's default response locale follows the
// user's device; the popup UI is Apple-hosted.
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, forceTick] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
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
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

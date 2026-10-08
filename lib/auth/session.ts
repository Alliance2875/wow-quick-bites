"use client";

import { createStore } from "@/lib/create-store";

// MOCK session kept in localStorage until the backend auth API exists.
// Replace signIn/signUp/signOut with real API calls; components only use this module.

export type User = {
  name: string;
  email: string;
  phone?: string;
  /** Permanent client code shown at checkout ("WQB001A") */
  clientCode: string;
};

const store = createStore<User | null>("wqb-session", null);

export const useSession = store.useValue;

const MOCK_CLIENT_CODE = "WQB001A";

const nameFromEmail = (email: string) => {
  const local = email.split("@")[0] || "Guest";
  return local.charAt(0).toUpperCase() + local.slice(1);
};

export const signIn = (email: string) =>
  store.set({ name: nameFromEmail(email), email, clientCode: MOCK_CLIENT_CODE });

export const signUp = (user: Omit<User, "clientCode">) => store.set({ ...user, clientCode: MOCK_CLIENT_CODE });

export const signOut = () => store.set(null);

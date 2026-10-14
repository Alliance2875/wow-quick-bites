"use client";

import { createStore } from "@/lib/create-store";
import type { Role } from "./roles";

// Public profile of the signed-in person, kept in localStorage so the static storefront
// (header, cart, checkout) can show the name and client code without a server round trip.
// It is a display copy only: access to the client area and the staff portal is decided on the
// server from the signed HttpOnly session cookie (lib/auth/token.ts, proxy.ts, lib/auth/dal.ts).
// Written by the sign-in/sign-up forms after the Server Action succeeds, cleared on sign-out.

export type User = {
  name: string;
  email: string;
  phone?: string;
  /** Permanent client code shown at checkout ("WQB001A"); empty for staff */
  clientCode: string;
  role: Role;
};

const store = createStore<User | null>("wqb-session", null);

export const useSession = store.useValue;

export const rememberSession = (user: User) => store.set(user);

export const forgetSession = () => store.set(null);

/** Updates the display copy (profile edits, phone typed at checkout). */
export const updateSession = (patch: Partial<Pick<User, "name" | "phone">>) =>
  store.set((user) => (user ? { ...user, ...patch } : user));

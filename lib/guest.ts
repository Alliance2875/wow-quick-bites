"use client";

import { createStore } from "@/lib/create-store";

// "Continue without signing in" at checkout: the guest only gives a name and a phone number.
// Remembered in this browser so a returning guest does not type them again; never an account.

export type Guest = { name: string; phone: string };

const store = createStore<Guest | null>("wqb-guest", null);

export const useGuest = store.useValue;

export const rememberGuest = (guest: Guest) => store.set(guest);

export const forgetGuest = () => store.set(null);

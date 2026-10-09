"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal localStorage-backed store for client state (cart, mock session).
 * The server snapshot is the fallback, so SSR and the first client render match (no hydration error);
 * the saved value appears right after hydration. Stays in sync across browser tabs.
 */
export function createStore<T>(storageKey: string, fallback: T) {
  let value: T | undefined;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (value === undefined) {
      try {
        const raw = localStorage.getItem(storageKey);
        value = raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        value = fallback;
      }
    }
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(read()) : next;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // storage full or blocked: keep the in-memory value
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      value = undefined;
      listener();
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, read, () => fallback);

  return { useValue, set, get: read };
}

const noopSubscribe = () => () => {};

/** false during SSR and hydration, true afterwards: lets pages that depend on stored data skip the "empty" flash. */
export const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

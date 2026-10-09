"use client";

import { createStore } from "@/lib/create-store";

// Cart kept in localStorage (guests keep their cart until they sign in, as in the design).
// When the backend cart API exists, only this file changes.

export type CartLine = {
  /** Same item + same options + same note = same line */
  id: string;
  itemId: string;
  quantity: number;
  /** Selected option choice ids (extras, "leave out"…) */
  choices: string[];
  note?: string;
};

const store = createStore<CartLine[]>("wqb-cart", []);

export const useCart = store.useValue;

export const useCartCount = () => useCart().reduce((sum, line) => sum + line.quantity, 0);

const lineId = (itemId: string, choices: string[], note = "") =>
  [itemId, [...choices].sort().join("+"), note.trim()].join("|");

export function addToCart(item: { itemId: string; quantity: number; choices?: string[]; note?: string }) {
  const choices = item.choices ?? [];
  const id = lineId(item.itemId, choices, item.note);
  store.set((lines) => {
    const existing = lines.find((line) => line.id === id);
    if (existing) {
      return lines.map((line) => (line.id === id ? { ...line, quantity: line.quantity + item.quantity } : line));
    }
    return [...lines, { id, itemId: item.itemId, quantity: item.quantity, choices, note: item.note?.trim() || undefined }];
  });
}

export const setQuantity = (id: string, quantity: number) =>
  store.set((lines) =>
    quantity < 1
      ? lines.filter((line) => line.id !== id)
      : lines.map((line) => (line.id === id ? { ...line, quantity } : line)),
  );

export const removeFromCart = (id: string) => store.set((lines) => lines.filter((line) => line.id !== id));

export const clearCart = () => store.set([]);

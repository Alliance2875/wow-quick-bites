"use client";

import type { FulfilmentId, PaymentMethodId } from "@/data/checkout";
import type { CartLine } from "@/lib/cart/cart";
import { summarize } from "@/lib/cart/pricing";
import { createStore } from "@/lib/create-store";

// MOCK order placement: keeps the last order in localStorage for the confirmation page.
// Replace placeOrder() with a POST to the orders API.

export type Order = {
  id: string;
  placedAt: string;
  clientName: string;
  clientCode: string;
  phone: string;
  email?: string;
  fulfilment: FulfilmentId;
  address?: string;
  payment: PaymentMethodId;
  notes?: string;
  lines: CartLine[];
  subtotal: number;
  fees: number;
  total: number;
  paymentStatus: "pending" | "paid";
};

const store = createStore<Order | null>("wqb-last-order", null);

export const useLastOrder = store.useValue;

export function placeOrder(details: Omit<Order, "id" | "placedAt" | "subtotal" | "fees" | "total" | "paymentStatus">) {
  const { subtotal, fees, total } = summarize(details.lines);
  const order: Order = {
    ...details,
    id: `ORD-${1000 + Math.floor(Math.random() * 9000)}`,
    placedAt: new Date().toISOString(),
    subtotal,
    fees,
    total,
    paymentStatus: "pending",
  };
  store.set(order);
  return order;
}

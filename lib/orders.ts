"use client";

import type { FulfilmentId, PaymentMethodId } from "@/data/checkout";
import { staff } from "@/data/staff";
import type { CartLine } from "@/lib/cart/cart";
import { summarize } from "@/lib/cart/pricing";
import { createStore } from "@/lib/create-store";
import { addPlacedOrder } from "@/lib/portal/store";

// MOCK order placement: keeps the last order in localStorage for the confirmation page and adds
// it to the register queue of this browser. Replace placeOrder() with a POST to the orders API.

export type Order = {
  id: string;
  placedAt: string;
  clientName: string;
  /** Empty for guests */
  clientCode: string;
  /** Placed without an account: only name and phone are known */
  guest?: boolean;
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
    // Above the sample orders' range (ORD-1xxx), so a demo order never takes an existing ID
    id: `ORD-${2000 + Math.floor(Math.random() * 8000)}`,
    placedAt: new Date().toISOString(),
    subtotal,
    fees,
    total,
    paymentStatus: "pending",
  };
  store.set(order);
  addPlacedOrder({
    id: order.id,
    clientCode: order.clientCode,
    guest: order.guest,
    contact: { name: order.clientName, phone: order.phone },
    managerId: registerManager(),
    fulfilment: order.fulfilment,
    payment: order.payment,
    paymentStatus: "pending",
    lines: order.lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
  });
  return order;
}

/** New orders go to the first active, on-duty manager of the pickup register (backend: assignment rules). */
const registerManager = () =>
  staff.find((m) => m.role === "manager" && m.status === "active" && m.duty === "on" && m.assignment === "pickup-register")?.id ??
  "rwasibo";

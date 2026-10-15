"use client";

import type { FulfilmentId, PaymentMethodId } from "@/data/checkout";
import type { CartLine } from "@/lib/cart/cart";
import { createStore } from "@/lib/create-store";
import { ordersApi } from "@/lib/redux/api/ordersApi";
import { setLastOrder } from "@/lib/redux/slices/orderSlice";
import { store as reduxStore } from "@/lib/redux/store";

export type Order = {
  id: string;
  placedAt: string;
  clientName: string;
  clientCode: string;
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
  paymentStatus: "pending" | "paid" | "not-charged";
};

const store = createStore<Order | null>("wqb-last-order", null);

export const useLastOrder = store.useValue;

export async function placeOrder(
  details: Omit<Order, "id" | "placedAt" | "subtotal" | "fees" | "total" | "paymentStatus">,
): Promise<Order> {
  const response = await reduxStore
    .dispatch(
      ordersApi.endpoints.createOrder.initiate({
        fulfilment: details.fulfilment,
        payment: details.payment,
        address: details.address || "",
        notes: details.notes || "",
        contact: { name: details.clientName, phone: details.phone },
        lines: details.lines.map((line) => ({
          itemId: line.itemId,
          quantity: line.quantity,
          choices: line.choices,
          note: line.note,
        })),
      }),
    )
    .unwrap();
  const saved = response.order;
  const order: Order = {
    ...details,
    id: saved.id,
    placedAt: saved.placedAt,
    clientName: saved.clientName || details.clientName,
    clientCode: saved.clientCode || details.clientCode,
    guest: saved.guest,
    phone: saved.contact?.phone || details.phone,
    email: saved.contactEmail || details.email,
    fulfilment: saved.fulfilment,
    address: saved.address || details.address,
    payment: saved.payment,
    notes: saved.notes || details.notes,
    subtotal: saved.subtotal,
    fees: saved.fees ?? 0,
    total: saved.total,
    paymentStatus: saved.paymentStatus,
  };

  store.set(order);
  reduxStore.dispatch(setLastOrder(order));
  return order;
}

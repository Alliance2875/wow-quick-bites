"use client";

import { useMemo } from "react";
import { notifications as sampleNotifications } from "@/data/notifications";
import { orders as sampleOrders } from "@/data/orders";
import type { ClientNotification, OrderStage, PortalOrder } from "@/data/types";
import { createStore } from "@/lib/create-store";
import { portalNow } from "./clock";

// MOCK portal state until the backend exists: the sample data in data/ plus the changes made in
// this browser (stage changes and notification read flags), kept in localStorage.
// Replace each action with its API call (PATCH /orders/:id); views stay the same.

type OrderChange = { stage: OrderStage; history: PortalOrder["history"]; paymentStatus: PortalOrder["paymentStatus"] };

/** Generated when a manager moves an order forward (the sample ones come with their own text). */
export type PortalNotification = Omit<ClientNotification, "title" | "text"> &
  Partial<Pick<ClientNotification, "title" | "text">> & { managerId?: string };

type State = {
  /** Orders placed on the storefront in this browser (accounts and guests) */
  placed?: PortalOrder[];
  orders: Record<string, OrderChange>;
  events: PortalNotification[];
  readNotifications: string[];
};

const empty: State = { orders: {}, events: [], readNotifications: [] };

const store = createStore<State>("wqb-portal", empty);

/** Time of a change made in the demo: just after the sample clock, one minute per change. */
const demoTime = (state: State) =>
  new Date(portalNow() + (Object.keys(state.orders).length + (state.placed?.length ?? 0) + 1) * 60_000).toISOString();

// ───────── Orders ─────────

export function useOrders(): PortalOrder[] {
  const { orders, placed } = store.useValue();
  return useMemo(
    () => [...(placed ?? []), ...sampleOrders].map((order) => ({ ...order, ...orders[order.id] })),
    [orders, placed],
  );
}

/** Checkout → register queue (POST /orders with the backend). Placed on the portal clock. */
export function addPlacedOrder(order: Omit<PortalOrder, "placedAt" | "history" | "stage">) {
  store.set((state) => {
    const at = demoTime(state);
    return { ...state, placed: [{ ...order, placedAt: at, stage: "new", history: { new: at } }, ...(state.placed ?? [])] };
  });
}

export function moveOrder(order: PortalOrder, stage: OrderStage) {
  store.set((state) => {
    const at = demoTime(state);
    const paymentStatus = stage === "completed" ? "paid" : stage === "cancelled" ? "not-charged" : order.paymentStatus;
    const notification: PortalNotification = {
      id: `live-${order.id}-${stage}`,
      clientCode: order.clientCode,
      orderId: order.id,
      stage,
      at,
      read: false,
      managerId: order.managerId,
    };
    return {
      ...state,
      orders: { ...state.orders, [order.id]: { stage, paymentStatus, history: { ...order.history, [stage]: at } } },
      events: [notification, ...state.events.filter((event) => event.id !== notification.id)],
    };
  });
}

// ───────── Client notifications ─────────

export function useNotifications(clientCode: string | undefined): PortalNotification[] {
  const { events, readNotifications } = store.useValue();
  return useMemo(
    () =>
      [...events, ...sampleNotifications]
        .filter((notification) => notification.clientCode === clientCode)
        .map((notification) => ({ ...notification, read: notification.read || readNotifications.includes(notification.id) }))
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    [events, readNotifications, clientCode],
  );
}

export function markNotificationsRead(ids: string[]) {
  store.set((state) => ({ ...state, readNotifications: [...new Set([...state.readNotifications, ...ids])] }));
}

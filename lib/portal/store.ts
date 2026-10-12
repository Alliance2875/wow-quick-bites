"use client";

import { useMemo } from "react";
import { messages as sampleMessages } from "@/data/messages";
import { notifications as sampleNotifications } from "@/data/notifications";
import { orders as sampleOrders } from "@/data/orders";
import type { ChatMessage, ClientNotification, OrderStage, PortalOrder } from "@/data/types";
import { createStore } from "@/lib/create-store";
import { portalNow } from "./clock";

// MOCK portal state until the backend exists: the sample data in data/ plus the changes made in
// this browser (stage changes, sent messages, read flags), kept in localStorage.
// Replace each action with its API call (PATCH /orders/:id, POST /messages…); views stay the same.

type OrderChange = { stage: OrderStage; history: PortalOrder["history"]; paymentStatus: PortalOrder["paymentStatus"] };

/** Generated when a manager moves an order forward (the sample ones come with their own text). */
export type PortalNotification = Omit<ClientNotification, "title" | "text"> &
  Partial<Pick<ClientNotification, "title" | "text">> & { managerId?: string };

type State = {
  orders: Record<string, OrderChange>;
  sent: ChatMessage[];
  /** message id → read by the client / by the manager */
  readMessages: Record<string, { client?: boolean; manager?: boolean }>;
  events: PortalNotification[];
  readNotifications: string[];
};

const empty: State = { orders: {}, sent: [], readMessages: {}, events: [], readNotifications: [] };

const store = createStore<State>("wqb-portal", empty);

/** Time of a change made in the demo: just after the sample clock, one minute per change. */
const demoTime = (state: State) =>
  new Date(portalNow() + (Object.keys(state.orders).length + state.sent.length + 1) * 60_000).toISOString();

// ───────── Orders ─────────

export function useOrders(): PortalOrder[] {
  const { orders } = store.useValue();
  return useMemo(() => sampleOrders.map((order) => ({ ...order, ...orders[order.id] })), [orders]);
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

// ───────── Messages ─────────

export function useMessages(): ChatMessage[] {
  const { sent, readMessages } = store.useValue();
  return useMemo(
    () =>
      [...sampleMessages, ...sent].map((message) => ({
        ...message,
        readByClient: message.readByClient || Boolean(readMessages[message.id]?.client),
        readByManager: message.readByManager || Boolean(readMessages[message.id]?.manager),
      })),
    [sent, readMessages],
  );
}

export function sendMessage(message: Omit<ChatMessage, "id" | "sentAt" | "readByClient" | "readByManager" | "text"> & { text: string }) {
  store.set((state) => ({
    ...state,
    sent: [
      ...state.sent,
      {
        ...message,
        id: `sent-${state.sent.length + 1}-${message.clientCode}`,
        text: { en: message.text, fr: message.text },
        sentAt: demoTime(state),
        readByClient: message.from === "client",
        readByManager: message.from === "manager",
      },
    ],
  }));
}

/** Marks a conversation as read on one side (client opening the chat, manager opening the thread). */
export function markConversationRead(clientCode: string, side: "client" | "manager", all: ChatMessage[]) {
  const unread = all.filter(
    (message) => message.clientCode === clientCode && (side === "client" ? !message.readByClient : !message.readByManager),
  );
  if (!unread.length) return;
  store.set((state) => ({
    ...state,
    readMessages: {
      ...state.readMessages,
      ...Object.fromEntries(unread.map((message) => [message.id, { ...state.readMessages[message.id], [side]: true }])),
    },
  }));
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

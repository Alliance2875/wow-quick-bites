import { business } from "@/data/business";
import { getClient } from "@/data/clients";
import { getMenuItem } from "@/data/menu";
import type { OrderStage, PortalOrder } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import { daysAgo } from "./clock";

// Pure order helpers (no React): usable by server pages and client views alike.

/** The happy path of a register order; "cancelled" can happen before "preparing". */
export const stageFlow = ["new", "accepted", "preparing", "ready", "completed"] as const satisfies OrderStage[];

/** Next register action for each stage (New → Accept, Accepted → Start preparing…). */
export const nextStage: Partial<Record<OrderStage, OrderStage>> = {
  new: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "completed",
};

export const isActiveOrder = (order: PortalOrder) => order.stage !== "completed" && order.stage !== "cancelled";

export function orderLines(order: PortalOrder) {
  return order.lines.flatMap((line) => {
    const item = getMenuItem(line.itemId);
    return item ? [{ ...line, item, unit: item.price, total: item.price * line.quantity }] : [];
  });
}

export const orderTotal = (order: PortalOrder) => orderLines(order).reduce((sum, line) => sum + line.total, 0);

export const itemCount = (order: PortalOrder) => order.lines.reduce((sum, line) => sum + line.quantity, 0);

/** "WOW Toasted Burger + Fresh Mint Mojito" */
export const itemsSummary = (order: PortalOrder, lang: Locale) =>
  orderLines(order)
    .map((line) => (line.quantity > 1 ? `${line.quantity} × ` : "") + localize(line.item.name, lang))
    .join(" + ");

/** Groups the orders of one customer: the client code, or the phone number of a guest. */
export const customerKey = (order: PortalOrder) => (order.guest ? `guest:${order.contact?.phone ?? order.id}` : order.clientCode);

/** Name shown to staff: the one given at checkout, else the client account's name. */
export const customerName = (order: PortalOrder) => order.contact?.name ?? getClient(order.clientCode)?.name ?? "";

/** Phone the manager can call about the order. */
export const customerPhone = (order: PortalOrder) => order.contact?.phone ?? getClient(order.clientCode)?.phone;

export const newestFirst = (a: PortalOrder, b: PortalOrder) => Date.parse(b.placedAt) - Date.parse(a.placedAt);

/** Orders shown in the register queue: the last few days (business.queueWindowDays). */
export const inQueueWindow = (order: PortalOrder) => daysAgo(order.placedAt) < business.queueWindowDays;

export function countByStage(orders: PortalOrder[]) {
  const counts: Record<OrderStage, number> = { new: 0, accepted: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };
  orders.forEach((order) => counts[order.stage]++);
  return counts;
}

/** Index of the current stage in the client tracker (Accepted → Preparing → Ready → Completed). */
export const clientTrackerSteps = ["accepted", "preparing", "ready", "completed"] as const satisfies OrderStage[];

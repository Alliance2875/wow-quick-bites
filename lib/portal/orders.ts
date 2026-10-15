import type { MenuItem } from "@/data/types";
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
  return order.lines.map((line) => {
    const name = line.name ?? { en: line.itemId, fr: line.itemId };
    const item: MenuItem = {
      id: line.itemId,
      name,
      description: { en: "", fr: "" },
      price: line.unitPrice ?? 0,
      image: "/logo.png",
      group: "food",
      categories: [],
      tags: [],
    };
    return {
      ...line,
      item,
      unit: line.unitPrice ?? 0,
      total: line.total ?? (line.unitPrice ?? 0) * line.quantity,
    };
  });
}

export const orderTotal = (order: PortalOrder) =>
  order.total ?? orderLines(order).reduce((sum, line) => sum + line.total, 0);

export const itemCount = (order: PortalOrder) => order.lines.reduce((sum, line) => sum + line.quantity, 0);

/** "WOW Toasted Burger + Fresh Mint Mojito" */
export const itemsSummary = (order: PortalOrder, lang: Locale) =>
  orderLines(order)
    .map((line) => (line.quantity > 1 ? `${line.quantity} × ` : "") + localize(line.item.name, lang))
    .join(" + ");

/** Groups the orders of one customer: the client code, or the phone number of a guest. */
export const customerKey = (order: PortalOrder) => (order.guest ? `guest:${order.contact?.phone ?? order.id}` : order.clientCode);

/** Name shown to staff: the one given at checkout, else the client account's name. */
export const customerName = (order: PortalOrder) => order.contact?.name ?? order.clientName ?? "";

/** Phone the manager can call about the order. */
export const customerPhone = (order: PortalOrder) => order.contact?.phone;

export const newestFirst = (a: PortalOrder, b: PortalOrder) => Date.parse(b.placedAt) - Date.parse(a.placedAt);

/** Orders shown in the register queue according to the business settings. */
export const inQueueWindow = (order: PortalOrder, days: number) => daysAgo(order.placedAt) < days;

export function countByStage(orders: PortalOrder[]) {
  const counts: Record<OrderStage, number> = { new: 0, accepted: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };
  orders.forEach((order) => counts[order.stage]++);
  return counts;
}

/** Index of the current stage in the client tracker (Accepted → Preparing → Ready → Completed). */
export const clientTrackerSteps = ["accepted", "preparing", "ready", "completed"] as const satisfies OrderStage[];

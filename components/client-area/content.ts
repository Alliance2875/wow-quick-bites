import { getStaff } from "@/data/staff";
import type { OrderStage, PortalOrder } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fill, formatPrice } from "@/lib/format";
import { itemsSummary, orderTotal } from "@/lib/portal/orders";
import type { PortalNotification } from "@/lib/portal/store";

/** Display name of the manager in charge ("Eric"), or a generic word when unknown. */
export const managerName = (order: PortalOrder | undefined, fallback: string) =>
  (order && getStaff(order.managerId)?.name) ?? fallback;

/** Title and text of an order update: sample updates carry their own, live ones use templates. */
export function notificationContent(
  notification: PortalNotification,
  order: PortalOrder | undefined,
  lang: Locale,
  dict: Dictionary["clientArea"]["notifications"]["templates"],
) {
  if (notification.title && notification.text) {
    return { title: localize(notification.title, lang), text: localize(notification.text, lang) };
  }
  const template = dict[notification.stage];
  const values = {
    id: notification.orderId,
    manager: managerName(order, "WOW Quick Bites"),
    items: order ? itemsSummary(order, lang) : notification.orderId,
    total: order ? formatPrice(orderTotal(order)) : "",
  };
  return { title: fill(template.title, values), text: fill(template.text, values) };
}

export const stageIcon: Record<OrderStage, "receipt" | "check" | "cookingPot" | "shoppingBag" | "circleCheck" | "x"> = {
  new: "receipt",
  accepted: "check",
  preparing: "cookingPot",
  ready: "shoppingBag",
  completed: "circleCheck",
  cancelled: "x",
};

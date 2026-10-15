"use client";

import { ActionButton, ActionLink } from "@/components/portal/ui/Action";
import type { PortalOrder } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fill } from "@/lib/format";
import { nextStage } from "@/lib/portal/orders";
import { moveOrder } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";

export type StaffViewer = { id: string; role: "manager" | "superadmin"; name: string };

/** A manager acts on their own orders; the superadmin on every order. */
export const canAct = (viewer: StaffViewer, order: PortalOrder) => viewer.role === "superadmin" || order.managerId === viewer.id;

/** Next register step for an order: Accept → Start preparing → Mark ready → Complete pickup. */
export default function RegisterAction({
  order,
  viewer,
  lang,
  dict,
  onDone,
  block,
  hideDetail = false,
  size = "md",
}: {
  order: PortalOrder;
  viewer: StaffViewer;
  lang: Locale;
  dict: Pick<Dictionary, "portal" | "staff">;
  onDone?: (message: string) => void;
  block?: boolean;
  hideDetail?: boolean;
  size?: "sm" | "md";
}) {
  const t = dict.staff.actions;
  const next = nextStage[order.stage];
  const detail = localePath(lang, routes.adminOrder(order.id));

  if (!next || !canAct(viewer, order)) {
    if (hideDetail) return null;
    return (
      <ActionLink href={detail} block={block} size={size}>
        {order.stage === "completed" ? t.completedView : t.view}
      </ActionLink>
    );
  }

  return (
    <ActionButton
      variant={order.stage === "ready" ? "secondary" : "primary"}
      block={block}
      size={size}
      onClick={() => {
        moveOrder(order, next);
        onDone?.(fill(dict.staff.queue.moved, { id: order.id, stage: dict.portal.stages[next] }));
      }}
    >
      {t[order.stage as "new" | "accepted" | "preparing" | "ready"]}
    </ActionButton>
  );
}

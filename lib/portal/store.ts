"use client";

import type { ClientNotification, OrderStage, PortalOrder } from "@/data/types";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/config";
import { ordersApi } from "@/lib/redux/api/ordersApi";
import { store as reduxStore } from "@/lib/redux/store";
import {
  useGetMyNotificationsQuery,
  useGetMyOrdersQuery,
  useGetStaffOrdersQuery,
} from "@/lib/redux/api/ordersApi";

export type PortalNotification = ClientNotification & { managerId?: string };

const getClientToken = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${ACCESS_TOKEN_COOKIE})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : localStorage.getItem("wqb_token");
};

const getClientRole = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem("wqb_user");
    return user ? JSON.parse(user).role ?? null : null;
  } catch {
    return null;
  }
};

export function useOrders(): PortalOrder[] {
  const token = typeof window !== "undefined" ? getClientToken() : null;
  const role = typeof window !== "undefined" ? getClientRole() : null;
  const isStaff = role === "manager" || role === "superadmin";
  const isClient = role === "client";

  const { data: staffOrders } = useGetStaffOrdersQuery(undefined, {
    skip: !token || !isStaff,
    pollingInterval: 10_000,
  });
  const { data: myOrders } = useGetMyOrdersQuery(undefined, {
    skip: !token || !isClient,
    pollingInterval: 10_000,
  });

  return (isStaff ? staffOrders : isClient ? myOrders : []) ?? [];
}

export async function moveOrder(order: PortalOrder, stage: OrderStage) {
  await reduxStore
    .dispatch(ordersApi.endpoints.transitionOrder.initiate({ orderId: order.id, to: stage }))
    .unwrap();
}

export function useNotifications(clientCode: string | undefined): PortalNotification[] {
  const token = typeof window !== "undefined" ? getClientToken() : null;
  const { data: notifications = [] } = useGetMyNotificationsQuery(undefined, {
    skip: !token || !clientCode,
    pollingInterval: 10_000,
  });
  return notifications.filter((notification) => notification.clientCode === clientCode);
}

export async function markNotificationsRead(ids: string[]) {
  if (ids.length === 0) return;
  await reduxStore
    .dispatch(ordersApi.endpoints.markNotificationsRead.initiate({ ids }))
    .unwrap();
}

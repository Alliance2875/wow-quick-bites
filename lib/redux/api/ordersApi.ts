import type { ClientNotification, OrderStage, PortalOrder } from "@/data/types";
import { apiSlice } from "./apiSlice";

export type ApiOrder = PortalOrder & {
  clientName: string;
  managerName: string | null;
  contactEmail?: string | null;
  address?: string | null;
  subtotal: number;
  fees?: number;
  total: number;
};

export type ApiOrderEnvelope = { order: ApiOrder };

export type PlaceOrderRequest = {
  fulfilment: "pickup" | "delivery";
  address?: string | null;
  payment: "pay-on-pickup" | "mtn-momo" | "airtel-money";
  contact?: {
    name: string;
    phone: string;
  };
  notes?: string | null;
  lines: Array<{
    itemId: string;
    quantity: number;
    choices?: string[];
    note?: string;
  }>;
};

export type StaffOrderFilter = {
  stage?: string;
  q?: string;
  since?: string;
  managerId?: string;
  guest?: boolean;
};

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<ApiOrderEnvelope, PlaceOrderRequest>({
      query: (body) => ({
        url: "/orders/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "StaffOrders", "MeOrders", "AdminOverview"],
    }),
    getOrder: builder.query<ApiOrder, string>({
      query: (orderId) => `/orders/${orderId}/`,
      providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
    }),
    getMyOrders: builder.query<ApiOrder[], { q?: string; status?: "active" | "cancelled" | "completed" } | void>({
      query: (params) => ({
        url: "/me/orders/",
        params: params || undefined,
      }),
      providesTags: ["MeOrders"],
    }),
    getMyOrder: builder.query<ApiOrder, string>({
      query: (orderId) => `/me/orders/${orderId}/`,
      providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
    }),
    getStaffOrders: builder.query<ApiOrder[], StaffOrderFilter | void>({
      query: (params) => ({
        url: "/orders/",
        params: params || undefined,
      }),
      providesTags: ["StaffOrders"],
    }),
    transitionOrder: builder.mutation<
      { order: PortalOrder },
      { orderId: string; to: OrderStage }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/transition/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffOrders", "Orders", "MeOrders", "AdminOverview", "Notifications"],
    }),
    assignOrder: builder.mutation<{ order: PortalOrder }, { orderId: string; managerId: string }>({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/assign/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffOrders"],
    }),
    updateOrderPayment: builder.mutation<
      { order: PortalOrder },
      { orderId: string; paymentStatus: string }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/payment/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffOrders", "Orders", "MeOrders"],
    }),
    getMyNotifications: builder.query<ClientNotification[], { unread?: boolean } | void>({
      query: (params) => ({
        url: "/me/notifications/",
        params: params || undefined,
      }),
      providesTags: ["Notifications"],
    }),
    markNotificationsRead: builder.mutation<void, { ids?: string[]; all?: boolean }>({
      query: (body) => ({
        url: "/me/notifications/read/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderQuery,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useGetStaffOrdersQuery,
  useTransitionOrderMutation,
  useAssignOrderMutation,
  useUpdateOrderPaymentMutation,
  useGetMyNotificationsQuery,
  useMarkNotificationsReadMutation,
} = ordersApi;

import type { AuditEvent, Campaign, MenuItem, StaffMember } from "@/data/types";
import type { BusinessInfo } from "./businessApi";
import { apiSlice } from "./apiSlice";

export type AdminOverview = {
  orders: number;
  ordersToday: number;
  active: Record<string, number>;
  activeOrders: number;
  pendingPayments: number;
  completedValue: number;
  completedCount: number;
  managers: {
    active: number;
    total: number;
    onDuty: number;
    offDuty: number;
    suspended: number;
  };
};

export type AdminMenuItem = MenuItem & {
  available: boolean;
  state: "published" | "draft";
  draft?: Partial<MenuItem> | null;
  updatedAt?: string;
  deleted?: boolean;
};

export type AuditPage = {
  items: AuditEvent[];
  nextCursor?: string | null;
};

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<AdminOverview, void>({
      query: () => "/admin/overview/",
      providesTags: ["AdminOverview"],
    }),

    // Menu Management
    getAdminMenuItems: builder.query<AdminMenuItem[], void>({
      query: () => "/admin/menu/items/",
      providesTags: ["AdminMenuItems"],
    }),
    getAdminMenuItem: builder.query<AdminMenuItem, string>({
      query: (slug) => `/admin/menu/items/${slug}/`,
      providesTags: (result, error, slug) => [{ type: "AdminMenuItems", id: slug }],
    }),
    createAdminMenuItem: builder.mutation<AdminMenuItem, Partial<AdminMenuItem>>({
      query: (body) => ({
        url: "/admin/menu/items/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminMenuItems", "Menu", "Items", "AdminAudit"],
    }),
    updateAdminMenuItem: builder.mutation<
      AdminMenuItem,
      { slug: string; data: Partial<AdminMenuItem> }
    >({
      query: ({ slug, data }) => ({
        url: `/admin/menu/items/${slug}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminMenuItems", "Menu", "Items", "AdminAudit"],
    }),
    publishAdminMenuItem: builder.mutation<AdminMenuItem, string>({
      query: (slug) => ({
        url: `/admin/menu/items/${slug}/publish/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminMenuItems", "Menu", "Items", "AdminAudit"],
    }),
    draftAdminMenuItem: builder.mutation<AdminMenuItem, string>({
      query: (slug) => ({
        url: `/admin/menu/items/${slug}/draft/`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminMenuItems", "Menu", "Items", "AdminAudit"],
    }),
    restoreAdminMenuItem: builder.mutation<AdminMenuItem, string>({
      query: (slug) => ({
        url: `/admin/menu/items/${slug}/restore/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminMenuItems", "Menu", "Items", "AdminAudit"],
    }),
    deleteAdminMenuItem: builder.mutation<{ success: boolean }, string>({
      query: (slug) => ({
        url: `/admin/menu/items/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminMenuItems", "Menu", "Items", "AdminAudit"],
    }),

    // Campaigns Management
    getAdminCampaigns: builder.query<Campaign[], void>({
      query: () => "/admin/campaigns/",
      providesTags: ["AdminCampaigns"],
    }),
    getAdminCampaign: builder.query<Campaign, string>({
      query: (slug) => `/admin/campaigns/${slug}/`,
      providesTags: (result, error, slug) => [{ type: "AdminCampaigns", id: slug }],
    }),
    createAdminCampaign: builder.mutation<Campaign, Partial<Campaign>>({
      query: (body) => ({
        url: "/admin/campaigns/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminCampaigns", "Promotions", "AdminAudit"],
    }),
    updateAdminCampaign: builder.mutation<Campaign, { slug: string; data: Partial<Campaign> }>({
      query: ({ slug, data }) => ({
        url: `/admin/campaigns/${slug}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminCampaigns", "Promotions", "AdminAudit"],
    }),
    publishAdminCampaign: builder.mutation<Campaign, string>({
      query: (slug) => ({
        url: `/admin/campaigns/${slug}/publish/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminCampaigns", "Promotions", "AdminAudit"],
    }),
    pauseAdminCampaign: builder.mutation<Campaign, string>({
      query: (slug) => ({
        url: `/admin/campaigns/${slug}/pause/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminCampaigns", "Promotions", "AdminAudit"],
    }),
    resumeAdminCampaign: builder.mutation<Campaign, string>({
      query: (slug) => ({
        url: `/admin/campaigns/${slug}/resume/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminCampaigns", "Promotions", "AdminAudit"],
    }),
    cancelScheduleAdminCampaign: builder.mutation<Campaign, string>({
      query: (slug) => ({
        url: `/admin/campaigns/${slug}/cancel-schedule/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminCampaigns", "Promotions", "AdminAudit"],
    }),
    deleteAdminCampaign: builder.mutation<void, string>({
      query: (slug) => ({
        url: `/admin/campaigns/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminCampaigns", "Promotions", "AdminAudit"],
    }),

    // Staff & Managers Management
    getAdminManagers: builder.query<StaffMember[], void>({
      query: () => "/admin/managers/",
      providesTags: ["AdminManagers"],
    }),
    getAdminManager: builder.query<StaffMember, string>({
      query: (staffId) => `/admin/managers/${staffId}/`,
      providesTags: (result, error, staffId) => [{ type: "AdminManagers", id: staffId }],
    }),
    inviteManager: builder.mutation<
      StaffMember,
      { name: string; email: string; assignment?: string; duty?: string }
    >({
      query: (body) => ({
        url: "/admin/invitations/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminManagers", "AdminAudit"],
    }),
    updateManager: builder.mutation<
      StaffMember,
      { staffId: string; patch: Partial<StaffMember> }
    >({
      query: ({ staffId, patch }) => ({
        url: `/admin/managers/${staffId}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["AdminManagers", "AdminAudit"],
    }),
    grantManager: builder.mutation<
      StaffMember,
      { staffId: string; scopes: string[]; startsAt?: string; expiresAt?: string }
    >({
      query: ({ staffId, ...body }) => ({
        url: `/admin/managers/${staffId}/grant/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminManagers", "AdminAudit"],
    }),
    revokeManagerGrant: builder.mutation<void, string>({
      query: (staffId) => ({
        url: `/admin/managers/${staffId}/grant/`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminManagers", "AdminAudit"],
    }),
    resendManagerInvitation: builder.mutation<void, string>({
      query: (staffId) => ({
        url: `/admin/managers/${staffId}/resend-invitation/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminManagers", "AdminAudit"],
    }),
    suspendManager: builder.mutation<StaffMember, string>({
      query: (staffId) => ({
        url: `/admin/managers/${staffId}/suspend/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminManagers", "AdminAudit"],
    }),
    reactivateManager: builder.mutation<StaffMember, string>({
      query: (staffId) => ({
        url: `/admin/managers/${staffId}/reactivate/`,
        method: "POST",
      }),
      invalidatesTags: ["AdminManagers", "AdminAudit"],
    }),

    // Audit Trail
    getAdminAudit: builder.query<
      AuditPage,
      { cursor?: string; limit?: number; scope?: string } | void
    >({
      query: (params) => ({
        url: "/admin/audit/",
        params: params || undefined,
      }),
      providesTags: ["AdminAudit"],
    }),

    // Business settings
    getAdminBusiness: builder.query<BusinessInfo, void>({
      query: () => "/admin/business/",
      providesTags: ["Business"],
    }),
    updateAdminBusiness: builder.mutation<BusinessInfo, Partial<BusinessInfo>>({
      query: (body) => ({
        url: "/admin/business/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Business", "AdminAudit"],
    }),
    replaceAdminBusiness: builder.mutation<BusinessInfo, BusinessInfo>({
      query: (body) => ({
        url: "/admin/business/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Business", "AdminAudit"],
    }),

    // Image Upload
    uploadImage: builder.mutation<{ imageId: string; url: string }, FormData>({
      query: (formData) => ({
        url: "/admin/uploads/",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetAdminMenuItemsQuery,
  useGetAdminMenuItemQuery,
  useCreateAdminMenuItemMutation,
  useUpdateAdminMenuItemMutation,
  usePublishAdminMenuItemMutation,
  useDraftAdminMenuItemMutation,
  useRestoreAdminMenuItemMutation,
  useDeleteAdminMenuItemMutation,
  useGetAdminCampaignsQuery,
  useGetAdminCampaignQuery,
  useCreateAdminCampaignMutation,
  useUpdateAdminCampaignMutation,
  usePublishAdminCampaignMutation,
  usePauseAdminCampaignMutation,
  useResumeAdminCampaignMutation,
  useCancelScheduleAdminCampaignMutation,
  useDeleteAdminCampaignMutation,
  useGetAdminManagersQuery,
  useGetAdminManagerQuery,
  useInviteManagerMutation,
  useUpdateManagerMutation,
  useGrantManagerMutation,
  useRevokeManagerGrantMutation,
  useResendManagerInvitationMutation,
  useSuspendManagerMutation,
  useReactivateManagerMutation,
  useGetAdminAuditQuery,
  useGetAdminBusinessQuery,
  useUpdateAdminBusinessMutation,
  useReplaceAdminBusinessMutation,
  useUploadImageMutation,
} = adminApi;

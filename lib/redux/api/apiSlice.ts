import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/api/config";
import type { RootState } from "@/lib/redux/store";
import { logOut, setAccessToken } from "@/lib/redux/slices/authSlice";

const getClientCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    let token = state?.auth?.accessToken;

    if (!token && typeof window !== "undefined") {
      token = getClientCookie("wqb_access_token") || localStorage.getItem("wqb_token");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    let refresh = state?.auth?.refreshToken;
    if (!refresh && typeof window !== "undefined") {
      refresh = localStorage.getItem("wqb_refresh");
    }

    if (refresh) {
      // Try to get a new token
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh/",
          method: "POST",
          body: { refresh },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const data = refreshResult.data as { access: string; refresh?: string };
        api.dispatch(setAccessToken(data.access));
        if (data.refresh && typeof window !== "undefined") {
          try {
            localStorage.setItem("wqb_refresh", data.refresh);
          } catch {
            // ignore
          }
        }
        // Retry initial query
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logOut());
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Menu",
    "Categories",
    "DrinkSections",
    "OptionGroups",
    "Tags",
    "Items",
    "Item",
    "Promotions",
    "Business",
    "Orders",
    "Order",
    "MeOrders",
    "Notifications",
    "StaffOrders",
    "AdminOverview",
    "AdminMenuItems",
    "AdminCampaigns",
    "AdminManagers",
    "AdminAudit",
    "CurrentUser",
  ],
  endpoints: () => ({}),
});

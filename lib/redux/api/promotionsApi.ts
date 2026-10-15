import type { Promotion } from "@/data/types";
import { apiSlice } from "./apiSlice";

export const promotionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<Promotion[], { placement?: "home-hero" | "home-offers" } | void>({
      query: (params) => ({
        url: "/promotions/",
        params: params || undefined,
      }),
      providesTags: ["Promotions"],
    }),
  }),
});

export const { useGetPromotionsQuery } = promotionsApi;

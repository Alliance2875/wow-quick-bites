import type { Localized } from "@/i18n/config";
import { apiSlice } from "./apiSlice";

export type BusinessInfo = {
  name: Localized;
  owner?: string;
  location?: Localized | null;
  hours?: Localized | null;
  email?: string;
  phone?: string;
  socials?: { label: string; href: string }[];
  fees: {
    service: number;
    delivery: number;
  };
  queueWindowDays?: number;
};

export const businessApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBusiness: builder.query<BusinessInfo, void>({
      query: () => "/business/",
      providesTags: ["Business"],
    }),
  }),
});

export const { useGetBusinessQuery } = businessApi;

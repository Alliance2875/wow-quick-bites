import type { Category, DrinkSection, MenuItem, OptionGroup } from "@/data/types";
import type { Localized } from "@/i18n/config";
import { apiSlice } from "./apiSlice";

export type MenuBundle = {
  categories: Category[];
  drinkSections: DrinkSection[];
  items: MenuItem[];
  optionGroups: OptionGroup[];
  tags: Record<string, Localized>;
};

export const menuApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMenuBundle: builder.query<MenuBundle, void>({
      query: () => "/menu/",
      providesTags: ["Menu"],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => "/menu/categories/",
      providesTags: ["Categories"],
    }),
    getMenuItems: builder.query<
      MenuItem[],
      { category?: string; group?: "food" | "drinks"; include_unavailable?: boolean } | void
    >({
      query: (params) => ({
        url: "/menu/items/",
        params: params || undefined,
      }),
      providesTags: ["Items"],
    }),
    getMenuItemBySlug: builder.query<MenuItem, string>({
      query: (slug) => `/menu/items/${slug}/`,
      providesTags: (result, error, slug) => [{ type: "Item", id: slug }],
    }),
    getDrinkSections: builder.query<DrinkSection[], void>({
      query: () => "/menu/drink-sections/",
      providesTags: ["DrinkSections"],
    }),
    getOptionGroups: builder.query<OptionGroup[], void>({
      query: () => "/menu/option-groups/",
      transformResponse: (response: OptionGroup[] | Record<string, OptionGroup>) =>
        Array.isArray(response)
          ? response
          : Object.entries(response).map(([id, group]) => ({ ...group, id: group.id || id })),
      providesTags: ["OptionGroups"],
    }),
    getTags: builder.query<Record<string, Localized>, void>({
      query: () => "/menu/tags/",
      providesTags: ["Tags"],
    }),
  }),
});

export const {
  useGetMenuBundleQuery,
  useGetCategoriesQuery,
  useGetMenuItemsQuery,
  useGetMenuItemBySlugQuery,
  useGetDrinkSectionsQuery,
  useGetOptionGroupsQuery,
  useGetTagsQuery,
} = menuApi;

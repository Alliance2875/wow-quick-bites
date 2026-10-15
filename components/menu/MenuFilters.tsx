"use client";

import Icon from "@/components/shared/ui/Icon";
import type { CategoryId } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/format";
import { useGetCategoriesQuery } from "@/lib/redux/api/menuApi";

export const menuTabs = ["all", "food", "drinks"] as const;
export type MenuTab = (typeof menuTabs)[number];

/** Tabs (All / Food / Drinks) + centred heading + search, then the category chips. */
export default function MenuFilters({
  lang,
  dict,
  tab,
  onTabChange,
  category,
  onCategoryChange,
  query,
  onQueryChange,
}: {
  lang: Locale;
  dict: Dictionary["menu"];
  tab: MenuTab;
  onTabChange: (tab: MenuTab) => void;
  category: CategoryId | null;
  onCategoryChange: (category: CategoryId | null) => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const { data: categories = [] } = useGetCategoriesQuery();

  return (
    <>
      <div className="mt-10 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="flex gap-2.5">
          {menuTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange(t)}
              aria-pressed={tab === t}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition",
                tab === t ? "bg-primary text-primary-foreground" : "bg-tag text-tag-foreground hover:brightness-110",
              )}
            >
              {dict.tabs[t]}
            </button>
          ))}
        </div>

        <h2 className="order-first text-center text-xl text-accent md:order-none">{dict.headings[tab]}</h2>

        <label className="flex h-10 w-full items-center gap-2 rounded-full bg-card px-4 light:border light:border-border md:w-72 md:justify-self-end">
          <Icon name="search" className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={dict.searchPlaceholder}
            aria-label={dict.searchLabel}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div role="group" aria-label={dict.filtersLabel} className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCategoryChange(category === c.id ? null : c.id)}
            aria-pressed={category === c.id}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              category === c.id
                ? "border-primary bg-primary font-bold text-primary-foreground"
                : "border-tag text-muted-foreground hover:border-primary hover:text-accent light:border-border",
            )}
          >
            {localize(c.name, lang)}
          </button>
        ))}
      </div>
    </>
  );
}

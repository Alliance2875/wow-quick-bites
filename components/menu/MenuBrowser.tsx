"use client";

import { useMemo, useState } from "react";
import DishCard from "@/components/shared/product/DishCard";
import { drinkSections, menuItems } from "@/data/menu";
import { tags } from "@/data/tags";
import type { CategoryId, MenuItem } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import MenuFilters, { type MenuTab } from "./MenuFilters";

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

/** Lower case without accents: "Crème" and "creme" match. */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function matches(item: MenuItem, lang: Locale, query: string) {
  const text = [
    localize(item.name, lang),
    localize(item.description, lang),
    ...item.tags.map((tag) => localize(tags[tag], lang)),
  ];
  return normalize(text.join(" ")).includes(query);
}

export default function MenuBrowser({
  lang,
  dict,
  common,
  initialCategory,
}: {
  lang: Locale;
  dict: Dictionary["menu"];
  common: Dictionary["common"];
  initialCategory: CategoryId | null;
}) {
  const [tab, setTab] = useState<MenuTab>("all");
  const [category, setCategory] = useState<CategoryId | null>(initialCategory);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = normalize(query.trim());
    return menuItems.filter((item) => {
      if (tab !== "all" && item.group !== tab) return false;
      if (category && !item.categories.includes(category)) return false;
      return !q || matches(item, lang, q);
    });
  }, [tab, category, query, lang]);

  const card = (item: MenuItem) => <DishCard key={item.id} item={item} lang={lang} dict={common} />;

  return (
    <>
      <MenuFilters
        lang={lang}
        dict={dict}
        tab={tab}
        onTabChange={setTab}
        category={category}
        onCategoryChange={setCategory}
        query={query}
        onQueryChange={setQuery}
      />

      {items.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">{dict.empty}</p>
      ) : tab === "drinks" ? (
        <div className="mt-12 space-y-12">
          {drinkSections.map((section) => {
            const sectionItems = items.filter((item) => item.section === section.id);
            if (!sectionItems.length) return null;
            const name = localize(section.name, lang);
            return (
              <section key={section.id} aria-label={name}>
                {/* Dark: yellow title + divider line. Light: larger dark title, no line (as designed) */}
                <div className="flex items-center gap-3">
                  <h3 className="text-xl text-accent light:text-2xl light:text-foreground">{name}</h3>
                  {section.note && (
                    <span className="text-sm text-muted-foreground">{localize(section.note, lang)}</span>
                  )}
                  <div className="h-px flex-1 bg-tag light:hidden" />
                </div>
                <div className={`mt-5 ${GRID}`}>{sectionItems.map(card)}</div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className={`mt-9 ${GRID}`}>{items.map(card)}</div>
      )}
    </>
  );
}

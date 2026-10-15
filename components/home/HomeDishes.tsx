"use client";

import DishCard from "@/components/shared/product/DishCard";
import type { MenuItem } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useGetMenuBundleQuery } from "@/lib/redux/api/menuApi";

export function PopularDishes({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["common"];
}) {
  const { data: menuBundle } = useGetMenuBundleQuery();
  const items: MenuItem[] = (menuBundle?.items ?? []).filter((item) => item.available).slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <DishCard key={item.id} item={item} lang={lang} dict={dict} />
      ))}
    </div>
  );
}

export function NewDishes({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["common"];
}) {
  const { data: menuBundle } = useGetMenuBundleQuery();
  const items: MenuItem[] = (menuBundle?.items ?? []).filter((item) => item.isNew);

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <DishCard key={item.id} item={item} lang={lang} dict={dict} />
      ))}
    </div>
  );
}

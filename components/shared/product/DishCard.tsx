"use client";

import Image from "next/image";
import Link from "next/link";
import NewBadge from "@/components/shared/ui/NewBadge";
import Tag from "@/components/shared/ui/Tag";
import { tagLabel } from "@/data/tags";
import type { MenuItem } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format";
import { localePath, routes } from "@/lib/routes";
import { useGetTagsQuery } from "@/lib/redux/api/menuApi";
import OrderButton from "./OrderButton";

/** Menu item card used on the home page and the menu page. */
export default function DishCard({
  item,
  lang,
  dict,
  imageSizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
}: {
  item: MenuItem;
  lang: Locale;
  dict: Dictionary["common"];
  imageSizes?: string;
}) {
  const { data: tags = {} } = useGetTagsQuery();
  const name = localize(item.name, lang);
  const labels = dict.dish;
  const href = localePath(lang, routes.product(item.id));

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card transition hover:-translate-y-1 hover:shadow-glow light:border light:border-border">
      <Link href={href} className="relative block aspect-[6/5] overflow-hidden" tabIndex={-1}>
        <Image
          src={item.image}
          alt={name}
          fill
          sizes={imageSizes}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {item.isNew && <NewBadge label={labels.isNew} className="absolute left-3 top-3" />}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-bold leading-snug">
          <Link href={href} className="hover:underline">
            {name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{localize(item.description, lang)}</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Tag key={tag}>{tagLabel(tag, lang, tags)}</Tag>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <span className="font-bold text-accent">{formatPrice(item.price)}</span>
          <OrderButton item={item} lang={lang} label={labels.orderNow} dict={dict.options} />
        </div>
      </div>
    </article>
  );
}

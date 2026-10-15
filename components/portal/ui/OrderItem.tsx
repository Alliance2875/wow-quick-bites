"use client";

import Image from "next/image";
import { tagLabel } from "@/data/tags";
import type { MenuItem } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import { cn, formatPrice } from "@/lib/format";
import { formatAmount } from "@/lib/portal/format";
import { useGetTagsQuery } from "@/lib/redux/api/menuApi";

/** "Beef · Cheese · Toasted bun" (cart line) or the item's tags. */
export const itemMeta = (
  item: MenuItem,
  lang: Locale,
  separator = " · ",
  labels: Record<string, { en: string; fr: string }> = {},
) =>
  item.cartMeta ? localize(item.cartMeta, lang) : item.tags.map((tag) => tagLabel(tag, lang, labels)).join(separator);

export function ItemThumb({ item, lang, size = "md" }: { item: MenuItem; lang: Locale; size?: "sm" | "md" }) {
  return (
    <Image
      src={item.image}
      alt={localize(item.name, lang)}
      width={144}
      height={128}
      sizes={size === "md" ? "72px" : "56px"}
      unoptimized={item.image.startsWith("http")}
      className={cn("shrink-0 rounded-md object-cover", size === "md" ? "h-16 w-[4.5rem]" : "h-12 w-14")}
    />
  );
}

/** Receipt line: photo, name, details, "1 × RWF 6,000" and the line total on the right. */
export default function OrderItem({
  item,
  quantity,
  lang,
  size = "md",
}: {
  item: MenuItem;
  quantity: number;
  lang: Locale;
  size?: "sm" | "md";
}) {
  const { data: tags = {} } = useGetTagsQuery();
  return (
    <div className="flex items-center gap-3.5">
      <ItemThumb item={item} lang={lang} size={size} />
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] font-bold leading-snug">{localize(item.name, lang)}</p>
        <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted-foreground">{itemMeta(item, lang, " · ", tags)}</p>
        <p className="mt-1 text-xs">
          {quantity} × {formatPrice(item.price)}
        </p>
      </div>
      <p className="shrink-0 text-[0.8125rem] tabular-nums">{formatAmount(item.price * quantity)}</p>
    </div>
  );
}

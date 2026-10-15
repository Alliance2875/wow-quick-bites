"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import Icon from "@/components/shared/ui/Icon";
import type { Promotion } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn, fill } from "@/lib/format";
import { useGetPromotionsQuery } from "@/lib/redux/api/promotionsApi";
import { localePath } from "@/lib/routes";

/** Sticky "ADVERTISEMENT" column next to Popular Dishes: 3 promotions stacked like a ticket. */
export default function AdPanel({
  lang,
  brand,
  dict,
}: {
  lang: Locale;
  brand: string;
  dict: Dictionary["home"]["ad"];
}) {
  const { data: promotions = [] } = useGetPromotionsQuery({ placement: "home-offers" });

  return (
    <aside
      aria-label={dict.title}
      className="overflow-hidden rounded-2xl border-2 border-primary bg-background lg:sticky lg:top-24 lg:self-start"
    >
      <div className="px-4 pb-2 pt-3">
        <p className="text-lg font-extrabold text-primary light:text-foreground">{dict.title}</p>
        <p className="mt-1 flex justify-between text-[0.5625rem] font-bold uppercase">
          <span>{brand}</span>
          <span className="text-primary light:text-foreground">
            {fill(dict.promotions, { count: promotions.length })}
          </span>
        </p>
      </div>
      {promotions.map((promo, i) => (
        <Fragment key={promo.id}>
          {i > 0 && <div className="mx-4 border-t-2 border-dashed border-primary/70" />}
          <PromoBlock promo={promo} lang={lang} />
        </Fragment>
      ))}
      <p className="bg-primary py-1.5 text-center text-[0.5625rem] font-bold uppercase text-primary-foreground">
        {brand}
      </p>
    </aside>
  );
}

function PromoBlock({ promo, lang }: { promo: Promotion; lang: Locale }) {
  const yellow = promo.tone === "yellow";
  const highlight = promo.highlight;
  const onPlain = !yellow && "text-primary light:text-foreground";

  return (
    <div className={cn("p-4", yellow && "bg-primary text-primary-foreground")}>
      <p className={cn("text-[0.5625rem] font-bold uppercase", onPlain)}>{localize(promo.kicker, lang)}</p>
      <div className="mt-3 flex items-start justify-between gap-3">
        {highlight ? (
          <div className="leading-none">
            {highlight.labelFirst && <p className="text-xs font-bold">{localize(highlight.label, lang)}</p>}
            <p className={cn("mt-1 text-4xl font-extrabold", onPlain)}>{localize(highlight.value, lang)}</p>
            {!highlight.labelFirst && <p className="mt-1 text-sm font-bold">{localize(highlight.label, lang)}</p>}
          </div>
        ) : (
          <p className="text-xl font-extrabold leading-tight">{localize(promo.title, lang)}</p>
        )}
        <Image
          src={promo.image}
          alt=""
          width={72}
          height={64}
          className="h-16 w-[4.5rem] shrink-0 rounded object-cover"
        />
      </div>
      {highlight && <p className="mt-4 font-extrabold">{localize(promo.title, lang)}</p>}
      <p className={cn("mt-2 text-xs", yellow ? "opacity-90" : "text-muted-foreground")}>
        {localize(promo.text, lang)}
      </p>
      <Link
        href={localePath(lang, promo.href)}
        className={cn(
          "mt-4 flex items-center justify-between px-3 py-2 text-xs font-bold transition hover:brightness-110",
          yellow ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
        )}
      >
        {localize(promo.cta, lang)}
        <Icon name="arrowUpRight" className="h-4 w-4" />
      </Link>
    </div>
  );
}

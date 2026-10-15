import Image from "next/image";
import { ButtonLink } from "@/components/shared/ui/Button";
import Icon from "@/components/shared/ui/Icon";
import type { MenuItem } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format";
import { localePath, routes } from "@/lib/routes";

/** "ADD SOMETHING REFRESHING" suggestion under the product. */
export default function PairsWithCard({
  item,
  lang,
  dict,
}: {
  item: MenuItem;
  lang: Locale;
  dict: Dictionary["product"];
}) {
  return (
    <aside className="mt-10 flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center">
      <Image
        src={item.image}
        alt={localize(item.name, lang)}
        width={120}
        height={120}
        unoptimized={item.image.startsWith("http")}
        className="h-28 w-28 shrink-0 rounded-xl object-cover"
      />
      <div className="flex-1">
        <p className="text-[0.6875rem] font-bold uppercase text-accent">{dict.pairsWithKicker}</p>
        <p className="mt-1 text-xl font-bold">{localize(item.name, lang)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{localize(item.description, lang)}</p>
      </div>
      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
        <span className="text-xl font-bold text-accent">{formatPrice(item.price)}</span>
        <ButtonLink href={localePath(lang, routes.product(item.id))} variant="outline" size="sm">
          {dict.viewDrink} <Icon name="arrowRight" className="h-4 w-4" />
        </ButtonLink>
      </div>
    </aside>
  );
}

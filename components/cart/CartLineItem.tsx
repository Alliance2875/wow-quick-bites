"use client";

import Image from "next/image";
import Link from "next/link";
import { useLineDetails } from "@/components/shared/order/line-details";
import Icon from "@/components/shared/ui/Icon";
import QuantityStepper from "@/components/shared/ui/QuantityStepper";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { removeFromCart, setQuantity, type CartLine } from "@/lib/cart/cart";
import { fill, formatPrice } from "@/lib/format";
import { localePath, routes } from "@/lib/routes";

export default function CartLineItem({
  line,
  lang,
  dict,
  stepperLabels,
}: {
  line: CartLine;
  lang: Locale;
  dict: Dictionary["cart"];
  stepperLabels: { decrease: string; increase: string };
}) {
  const { name, image, meta, note, unit } = useLineDetails(line, lang);

  return (
    <li className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap">
      <Image src={image} alt="" width={140} height={134} className="h-28 w-28 shrink-0 rounded-xl object-cover sm:h-[8.375rem] sm:w-[8.75rem]" />
      <div className="min-w-0 flex-1">
        <Link href={localePath(lang, routes.product(line.itemId))} className="font-bold hover:underline">
          {name}
        </Link>
        {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
        {note && <p className="mt-1 text-xs italic text-muted-foreground">“{note}”</p>}
        <p className="mt-1 text-sm text-accent">{fill(dict.each, { price: formatPrice(unit) })}</p>
        <div className="mt-3 flex items-center gap-4">
          <QuantityStepper
            value={line.quantity}
            onChange={(quantity) => setQuantity(line.id, quantity)}
            labels={stepperLabels}
          />
          <button
            type="button"
            onClick={() => removeFromCart(line.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger"
          >
            <Icon name="trash" className="h-4 w-4" /> {dict.remove}
          </button>
        </div>
      </div>
      <span className="ml-auto text-lg font-bold">{formatPrice(unit * line.quantity)}</span>
    </li>
  );
}

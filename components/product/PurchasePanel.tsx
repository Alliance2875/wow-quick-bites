"use client";

import Link from "next/link";
import { useState } from "react";
import OptionGroupFields from "@/components/shared/product/OptionGroupFields";
import { Button } from "@/components/shared/ui/Button";
import Icon from "@/components/shared/ui/Icon";
import QuantityStepper from "@/components/shared/ui/QuantityStepper";
import { getOptionGroups } from "@/data/product-options";
import type { MenuItem } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { addToCart } from "@/lib/cart/cart";
import { unitPrice } from "@/lib/cart/pricing";
import { fill, formatPrice } from "@/lib/format";

/** Quantity, options, notes and the "Add to cart · RWF x" button of the product page. */
export default function PurchasePanel({
  item,
  itemLabel,
  lang,
  dict,
  options,
  cartHref,
}: {
  item: MenuItem;
  /** Short noun for the notes placeholder ("burger") */
  itemLabel: string;
  lang: Locale;
  dict: Dictionary["product"];
  options: Dictionary["common"]["options"];
  cartHref: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [choices, setChoices] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const total = unitPrice(item.id, choices) * quantity;

  const toggle = (id: string) =>
    setChoices((current) => (current.includes(id) ? current.filter((c) => c !== id) : [...current, id]));

  const submit = () => {
    addToCart({ itemId: item.id, quantity, choices, note });
    setAdded(true);
    setQuantity(1);
    setNote("");
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold">{dict.quantity}</span>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          labels={{ decrease: options.decrease, increase: options.increase }}
        />
      </div>

      {getOptionGroups(item.optionGroups).map((group) => (
        <OptionGroupFields
          key={group.id}
          group={group}
          lang={lang}
          selected={choices}
          onToggle={toggle}
          optionalLabel={options.optional}
        />
      ))}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">{dict.notesLabel}</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={fill(dict.notesPlaceholder, { item: itemLabel })}
          rows={3}
          className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </label>

      <Button block size="lg" onClick={submit}>
        {fill(dict.addToCart, { price: formatPrice(total) })}
      </Button>

      {added ? (
        <p role="status" className="flex items-center gap-2 text-sm font-semibold text-accent">
          <Icon name="check" className="h-4 w-4" />
          {dict.added} ·{" "}
          <Link href={cartHref} className="underline underline-offset-4">
            {dict.viewCart}
          </Link>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{dict.helper}</p>
      )}
    </div>
  );
}

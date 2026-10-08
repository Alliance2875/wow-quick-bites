"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shared/ui/Button";
import Icon from "@/components/shared/ui/Icon";
import QuantityStepper from "@/components/shared/ui/QuantityStepper";
import { getOptionGroups } from "@/data/product-options";
import type { MenuItem } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { addToCart } from "@/lib/cart/cart";
import { unitPrice } from "@/lib/cart/pricing";
import { formatPrice } from "@/lib/format";
import OptionGroupFields from "./OptionGroupFields";

/** Customise-and-add modal (design: "Chips & Marinated Chicken Leg" over the home page). */
export default function OptionsModal({
  item,
  lang,
  dict,
  onClose,
}: {
  item: MenuItem;
  lang: Locale;
  dict: Dictionary["common"]["options"];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // showModal() gives the backdrop, focus trap and Esc handling for free
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const name = localize(item.name, lang);
  const total = unitPrice(item.id, choices) * quantity;

  const toggle = (id: string) =>
    setChoices((current) => (current.includes(id) ? current.filter((c) => c !== id) : [...current, id]));

  const submit = () => {
    addToCart({ itemId: item.id, quantity, choices, note });
    onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-label={name}
      onClose={onClose}
      // Click on the backdrop (the <dialog> itself, outside the panel) closes it; Esc is native
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-auto max-h-[88vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-card p-0 text-foreground backdrop:bg-overlay"
    >
      <div className="max-h-[88vh] overflow-y-auto">
        <div className="relative h-56 sm:h-64">
          <Image src={item.image} alt="" fill sizes="576px" className="object-cover" />
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.close}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur hover:text-accent"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6 sm:p-7">
          <div>
            <h2 className="text-xl">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{localize(item.description, lang)}</p>
          </div>

          {getOptionGroups(item.optionGroups).map((group) => (
            <OptionGroupFields
              key={group.id}
              group={group}
              lang={lang}
              selected={choices}
              onToggle={toggle}
              optionalLabel={dict.optional}
            />
          ))}

          <label className="block">
            <span className="mb-2 block font-bold">{dict.specialInstructions}</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={dict.specialPlaceholder}
              rows={2}
              className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xl font-bold">
              {dict.total} {formatPrice(total)}
            </p>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              variant="filled"
              labels={{ decrease: dict.decrease, increase: dict.increase }}
            />
          </div>

          <Button block size="lg" onClick={submit}>
            {dict.addToCart}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

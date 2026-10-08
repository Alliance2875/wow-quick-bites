"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/shared/ui/Button";
import type { MenuItem } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localePath, routes } from "@/lib/routes";
import OptionsModal from "./OptionsModal";

/**
 * "Order Now" on a dish card.
 * Items with customisation groups open the options modal; the others go to their product page.
 */
export default function OrderButton({
  item,
  lang,
  label,
  dict,
}: {
  item: MenuItem;
  lang: Locale;
  label: string;
  dict: Dictionary["common"]["options"];
}) {
  // Mounted only while open, so every opening starts from a clean selection
  const [open, setOpen] = useState(false);

  if (!item.optionGroups?.length) {
    return (
      <ButtonLink href={localePath(lang, routes.product(item.id))} size="sm">
        {label}
      </ButtonLink>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && <OptionsModal item={item} lang={lang} dict={dict} onClose={() => setOpen(false)} />}
    </>
  );
}

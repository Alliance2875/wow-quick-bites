import { getMenuItem } from "@/data/menu";
import { findChoice } from "@/data/product-options";
import { tags } from "@/data/tags";
import { localize, type Locale } from "@/i18n/config";
import type { CartLine } from "@/lib/cart/cart";
import { unitPrice } from "@/lib/cart/pricing";

/** Everything needed to display a cart/order line, in the current language. */
export function lineDetails(line: CartLine, lang: Locale) {
  const item = getMenuItem(line.itemId);
  const base = item?.cartMeta
    ? localize(item.cartMeta, lang)
    : (item?.tags ?? []).map((tag) => localize(tags[tag], lang)).join(" · ");
  const options = line.choices.map((id) => findChoice(id)).flatMap((c) => (c ? [localize(c.name, lang)] : []));

  return {
    item,
    name: item ? localize(item.name, lang) : line.itemId,
    image: item?.image ?? "/logo.png",
    meta: [base, ...options].filter(Boolean).join(" · "),
    note: line.note,
    unit: unitPrice(line.itemId, line.choices),
  };
}

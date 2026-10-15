import { useGetMenuBundleQuery } from "@/lib/redux/api/menuApi";
import { localize, type Locale } from "@/i18n/config";
import type { CartLine } from "@/lib/cart/cart";
import { unitPrice } from "@/lib/cart/pricing";

/** Everything needed to display a cart/order line, in the current language. */
export function useLineDetails(line: CartLine, lang: Locale) {
  const { data: catalogue } = useGetMenuBundleQuery();
  const item = catalogue?.items.find((entry) => entry.id === line.itemId);
  const optionGroups = catalogue?.optionGroups ?? [];
  const base = item?.cartMeta
    ? localize(item.cartMeta, lang)
    : (item?.tags ?? [])
        .map((tag) => localize(catalogue?.tags[tag] ?? { en: tag, fr: tag }, lang))
        .join(" · ");
  const options = line.choices.flatMap((id) => {
    const choice = optionGroups.flatMap((group) => group.choices).find((entry) => entry.id === id);
    return choice ? [localize(choice.name, lang)] : [];
  });

  return {
    item,
    name: item ? localize(item.name, lang) : line.itemId,
    image: item?.image ?? "/logo.png",
    meta: [base, ...options].filter(Boolean).join(" · "),
    note: line.note,
    unit: unitPrice(line.itemId, line.choices, catalogue?.items, optionGroups),
  };
}

import type { MenuItem, OptionGroup } from "@/data/types";
import type { CartLine } from "./cart";

export const unitPrice = (
  itemId: string,
  choiceIds: string[] = [],
  items: MenuItem[] = [],
  optionGroups: OptionGroup[] = [],
) => {
  const base = items.find((item) => item.id === itemId)?.price ?? 0;
  const choicePrice = optionGroups
    .flatMap((group) => group.choices)
    .filter((choice) => choiceIds.includes(choice.id))
    .reduce((sum, choice) => sum + choice.price, 0);
  return base + choicePrice;
};

export const lineTotal = (
  line: CartLine,
  items: MenuItem[] = [],
  optionGroups: OptionGroup[] = [],
) => unitPrice(line.itemId, line.choices, items, optionGroups) * line.quantity;

export function summarize(
  lines: CartLine[],
  items: MenuItem[] = [],
  optionGroups: OptionGroup[] = [],
  fees = 0,
) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line, items, optionGroups), 0);
  const appliedFees = lines.length ? fees : 0;
  return { count, subtotal, fees: appliedFees, total: subtotal + appliedFees };
}

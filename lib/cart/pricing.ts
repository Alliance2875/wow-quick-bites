import { ADDITIONAL_FEES } from "@/data/checkout";
import { getMenuItem } from "@/data/menu";
import { findChoice } from "@/data/product-options";
import type { CartLine } from "./cart";

// Pure functions (no React): usable in client components, server code and tests.

export const unitPrice = (itemId: string, choiceIds: string[] = []) => {
  const base = getMenuItem(itemId)?.price ?? 0;
  return choiceIds.reduce((sum, id) => sum + (findChoice(id)?.price ?? 0), base);
};

export const lineTotal = (line: CartLine) => unitPrice(line.itemId, line.choices) * line.quantity;

export function summarize(lines: CartLine[]) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const fees = lines.length ? ADDITIONAL_FEES : 0;
  return { count, subtotal, fees, total: subtotal + fees };
}

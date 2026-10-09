import type { Dictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format";

/** Subtotal / Additional fees / Total block (cart, checkout sidebar, receipt). */
export default function SummaryRows({
  subtotal,
  fees,
  total,
  dict,
}: {
  subtotal: number;
  fees: number;
  total: number;
  dict: Dictionary["cart"]["summary"];
}) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{dict.subtotal}</dt>
        <dd className="font-bold">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{dict.fees}</dt>
        <dd className="font-bold">{formatPrice(fees)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <dt className="font-bold">{dict.total}</dt>
        <dd className="text-2xl font-extrabold">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

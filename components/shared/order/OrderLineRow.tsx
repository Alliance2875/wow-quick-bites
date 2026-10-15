import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { CartLine } from "@/lib/cart/cart";
import { formatPrice } from "@/lib/format";
import { useLineDetails } from "./line-details";

/** Compact read-only line: thumbnail, name, meta, "1 × RWF 6,000", total (checkout sidebar, receipt). */
export default function OrderLineRow({ line, lang }: { line: CartLine; lang: Locale }) {
  const { name, image, meta, unit } = useLineDetails(line, lang);

  return (
    <li className="flex items-center gap-3 py-3">
      <Image src={image} alt="" width={72} height={68} className="h-[4.25rem] w-[4.5rem] shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{name}</p>
        {meta && <p className="truncate text-xs text-muted-foreground">{meta}</p>}
        <p className="mt-1 text-xs">
          {line.quantity} × {formatPrice(unit)}
        </p>
      </div>
      <span className="font-bold">{(unit * line.quantity).toLocaleString("en-US")}</span>
    </li>
  );
}

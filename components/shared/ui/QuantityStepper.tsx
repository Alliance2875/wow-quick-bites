"use client";

import { cn } from "@/lib/format";
import Icon from "./Icon";

/**
 * – qty + control.
 * outline = bordered pill (product page, cart); filled = round filled buttons (customise modal).
 */
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  labels,
  variant = "outline",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  labels: { decrease: string; increase: string };
  variant?: "outline" | "filled";
}) {
  const button = cn(
    "grid place-items-center rounded-full transition hover:text-accent disabled:opacity-40",
    variant === "filled" ? "h-9 w-9 bg-background light:bg-input" : "h-8 w-8",
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        variant === "outline" && "rounded-full border border-border px-1 py-0.5",
      )}
    >
      <button
        type="button"
        aria-label={labels.decrease}
        className={button}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="min-w-5 text-center text-sm font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label={labels.increase}
        className={button}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}

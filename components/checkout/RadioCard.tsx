"use client";

import { cn } from "@/lib/format";

/** Selectable card used for fulfilment and payment choices. */
export default function RadioCard({
  name,
  value,
  checked,
  onChange,
  children,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 text-sm transition",
        checked ? "border-primary bg-soft font-semibold" : "border-border bg-input hover:border-primary/60",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 accent-[var(--accent)]"
      />
      {children}
    </label>
  );
}

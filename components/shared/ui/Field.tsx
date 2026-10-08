import type { ComponentProps } from "react";
import { cn } from "@/lib/format";

const control =
  "w-full rounded-xl border border-border bg-input px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

/** Label + input. Extra props go to the <input>. */
export function TextField({
  label,
  className,
  trailing,
  ...props
}: ComponentProps<"input"> & { label: string; trailing?: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <span className="relative block">
        <input className={cn(control, "h-12", trailing ? "pr-11" : undefined)} {...props} />
        {trailing && <span className="absolute inset-y-0 right-3 flex items-center">{trailing}</span>}
      </span>
    </label>
  );
}

/** Label + textarea. Extra props go to the <textarea>. */
export function TextAreaField({
  label,
  className,
  ...props
}: ComponentProps<"textarea"> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <textarea className={cn(control, "min-h-24 resize-y py-3")} {...props} />
    </label>
  );
}

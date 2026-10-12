import type { ComponentProps } from "react";
import Icon from "@/components/shared/ui/Icon";
import { cn } from "@/lib/format";

// Form controls of the admin designs: dark field on the panel, small muted label above.

const control =
  "w-full rounded-md border border-border bg-field px-3 text-[0.8125rem] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-60";

export function FieldLabel({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Input({ label, className, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <FieldLabel label={label} className={className}>
      <input className={cn(control, "h-10")} {...props} />
    </FieldLabel>
  );
}

export function TextArea({ label, className, ...props }: ComponentProps<"textarea"> & { label: string }) {
  return (
    <FieldLabel label={label} className={className}>
      <textarea className={cn(control, "min-h-20 resize-y py-2.5 leading-relaxed")} {...props} />
    </FieldLabel>
  );
}

export function Select({
  label,
  className,
  options,
  ...props
}: ComponentProps<"select"> & { label: string; options: { value: string; label: string }[] }) {
  return (
    <FieldLabel label={label} className={className}>
      <span className="relative block">
        <select className={cn(control, "h-10 cursor-pointer appearance-none pr-9")} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </FieldLabel>
  );
}

/** Search box with the magnifier ("Search client code, name or order ID"). */
export function SearchInput({ label, className, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="sr-only">{label}</span>
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input type="search" placeholder={label} className={cn(control, "h-10 bg-panel pl-9")} {...props} />
    </label>
  );
}

/** "All · 4" filter chips. Rendered as buttons (client state) or links (URL state). */
export function chipClasses(active: boolean, size: "sm" | "md" = "md") {
  return cn(
    "inline-flex items-center whitespace-nowrap rounded-md border font-medium transition",
    size === "sm" ? "h-7 px-2.5 text-[0.6875rem]" : "h-9 px-4 text-[0.8125rem]",
    active
      ? size === "sm"
        ? "border-transparent bg-soft text-accent"
        : "border-transparent bg-primary font-semibold text-primary-foreground"
      : "border-border bg-panel text-foreground hover:border-primary/60",
  );
}

/** ON/OFF switch with the "ON" label on the right, as in the designs. */
export function Toggle({
  checked,
  onChange,
  label,
  labels,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  labels: { on: string; off: string };
  disabled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-50",
          checked ? "bg-primary" : "bg-panel-muted ring-1 ring-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full transition-all",
            checked ? "left-[1.125rem] bg-primary-foreground" : "left-0.5 bg-muted-foreground",
          )}
        />
      </button>
      <span className={cn("w-12 text-[0.625rem] font-semibold", checked ? "text-accent" : "text-muted-foreground")}>
        {checked ? labels.on : labels.off}
      </span>
    </span>
  );
}

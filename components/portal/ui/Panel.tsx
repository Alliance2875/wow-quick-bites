import { cn } from "@/lib/format";

/** Card of the admin designs: rounded, bordered, optional header with title, subtitle and action. */
export function Panel({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  tone = "default",
  id,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** soft = yellow highlight card ("Preparing now", "Your order is being prepared") */
  tone?: "default" | "soft";
  id?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "min-w-0 scroll-mt-24 overflow-hidden rounded-xl border",
        tone === "soft" ? "border-transparent bg-soft" : "border-border bg-panel light:shadow-[0_1px_2px_rgb(25_26_21/0.04)]",
        className,
      )}
    >
      {title && (
        <header
          className={cn(
            "flex items-start justify-between gap-3 px-5 py-4",
            tone === "default" && children !== undefined && "border-b border-border",
          )}
        >
          <div className="min-w-0">
            <h2 className="text-[0.9375rem] font-semibold leading-snug tracking-normal">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      {children !== undefined && <div className={cn(bodyClassName ?? (tone === "soft" && title ? "px-5 pb-5" : "p-5"))}>{children}</div>}
    </section>
  );
}

/** Small uppercase caption above a group ("STOREFRONT CARD PREVIEW", "BUSINESS"). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/** Label/value rows ("Client  Aline", "Permanent code  WQB001A"). */
export function DetailList({
  rows,
  className,
  labelWidth = "w-32",
}: {
  rows: { label: React.ReactNode; value: React.ReactNode }[];
  className?: string;
  labelWidth?: string;
}) {
  return (
    <dl className={cn("space-y-3 text-[0.8125rem]", className)}>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-3">
          <dt className={cn("shrink-0 text-muted-foreground", labelWidth)}>{row.label}</dt>
          <dd className="min-w-0 break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

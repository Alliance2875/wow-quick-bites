import Icon from "@/components/shared/ui/Icon";
import type { OrderStage } from "@/data/types";
import { cn } from "@/lib/format";

// Order stage styles from the designs: in progress = yellow dot, done = green check,
// cancelled = red, accepted = muted.

const tone: Record<OrderStage, "progress" | "done" | "cancelled" | "muted"> = {
  new: "progress",
  accepted: "muted",
  preparing: "progress",
  ready: "done",
  completed: "done",
  cancelled: "cancelled",
};

const textColor = { progress: "text-accent", done: "text-success", cancelled: "text-critical", muted: "text-muted-foreground" };

function Mark({ kind }: { kind: "progress" | "done" | "cancelled" | "muted" }) {
  if (kind === "progress") return <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />;
  if (kind === "done") return <Icon name="check" className="h-3 w-3 shrink-0" strokeWidth={2.5} />;
  return null;
}

/** "• Preparing" / "✓ Ready" — plain text in tables. */
export function StageText({ stage, label, className }: { stage: OrderStage; label: string; className?: string }) {
  const kind = tone[stage];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-xs", textColor[kind], className)}>
      <Mark kind={kind} />
      {label}
    </span>
  );
}

/** Rounded status pill (client area, order cards). */
export function StagePill({ stage, label, className }: { stage: OrderStage; label: string; className?: string }) {
  const kind = tone[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold",
        kind === "progress" ? "bg-soft" : "bg-panel-muted",
        textColor[kind],
        className,
      )}
    >
      {kind === "cancelled" ? <Icon name="x" className="h-3 w-3" strokeWidth={2.5} /> : <Mark kind={kind} />}
      {label}
    </span>
  );
}

/** Generic pill: "Superadmin · Full control", "Temporary", "Draft", "Scheduled", "Published". */
export function Badge({
  children,
  tone: badgeTone = "accent",
  className,
}: {
  children: React.ReactNode;
  tone?: "accent" | "muted" | "success" | "critical";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold",
        badgeTone === "accent" ? "bg-soft text-accent" : "bg-panel-muted",
        badgeTone === "muted" && "text-muted-foreground",
        badgeTone === "success" && "text-success",
        badgeTone === "critical" && "text-critical",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** "Pending" etc. with the progress dot. */
export function DotText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-accent", className)}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

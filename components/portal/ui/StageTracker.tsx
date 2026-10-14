import Icon from "@/components/shared/ui/Icon";
import { cn } from "@/lib/format";

/**
 * Progress bars of an order: done steps get a ✓, the current one is yellow ("Preparing · Current").
 * Used by the manager order detail (5 steps) and the client tracking (4 steps).
 */
export default function StageTracker({
  steps,
  current,
  currentSuffix,
  label,
  cancelledLabel,
}: {
  steps: { id: string; label: string }[];
  /** Index of the current step; steps.length = all done */
  current: number;
  /** " · Current" */
  currentSuffix: string;
  label: string;
  /** Shown instead of the bars for a cancelled order */
  cancelledLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel px-5 py-5">
      {cancelledLabel ? (
        <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-critical">
          <Icon name="x" className="h-4 w-4" /> {cancelledLabel}
        </p>
      ) : (
        <ol aria-label={label} className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none">
          {steps.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={step.id} aria-current={active ? "step" : undefined} className="min-w-0">
                <div className={cn("h-[3px] rounded-full", done || active ? "bg-primary" : "bg-panel-muted light:bg-border")} />
                <p
                  className={cn(
                    "mt-2.5 flex items-center gap-1 text-xs",
                    active && "text-accent",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {done && <Icon name="check" className="h-3 w-3 shrink-0" strokeWidth={2.5} />}
                  <span>
                    {step.label}
                    {active && currentSuffix}
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

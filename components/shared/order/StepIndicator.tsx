import Icon from "@/components/shared/ui/Icon";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/format";

const steps = ["cart", "checkout", "confirmation"] as const;

/** 1. Your cart — 2. Checkout — 3. Confirmation (done steps get a ✓). */
export default function StepIndicator({
  current,
  dict,
}: {
  current: (typeof steps)[number];
  dict: Dictionary["cart"]["steps"];
}) {
  const currentIndex = steps.indexOf(current);

  return (
    <ol aria-label={dict.label} className="mt-6 grid grid-cols-3 gap-5">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} aria-current={active ? "step" : undefined}>
            <div className={cn("h-[3px] rounded-full", i <= currentIndex ? "bg-primary" : "bg-border")} />
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-xs sm:text-sm",
                active && "font-bold text-accent",
                !done && !active && "text-muted-foreground",
              )}
            >
              {done ? <Icon name="check" className="h-3.5 w-3.5" /> : `${i + 1}.`} {dict[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

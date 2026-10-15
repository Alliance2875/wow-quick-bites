import Icon, { type IconName } from "@/components/shared/ui/Icon";
import { cn } from "@/lib/format";

/** Yellow information box of the designs (bg-soft + accent text). */
export default function Note({
  title,
  children,
  icon,
  className,
  muted = false,
  tone = "accent",
}: {
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: IconName;
  className?: string;
  /** Body text in the normal muted colour (client cards "One code, one conversation") */
  muted?: boolean;
  /** plain = body text in the normal text colour (client status notes) */
  tone?: "accent" | "plain";
}) {
  return (
    <div className={cn("flex gap-3 rounded-lg bg-soft px-4 py-3 text-[0.8125rem] leading-relaxed", className)}>
      {icon && <Icon name={icon} className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-accent" />}
      <div className="min-w-0">
        {title && <p className={cn("font-semibold", muted ? "text-foreground" : "text-accent")}>{title}</p>}
        {children && <div className={cn(muted ? "text-muted-foreground" : tone === "plain" ? "text-foreground" : "text-accent", title ? "mt-1" : undefined)}>{children}</div>}
      </div>
    </div>
  );
}

import { cn } from "@/lib/format";

export default function NewBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-primary px-3 py-1 text-[0.6875rem] font-bold text-primary-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

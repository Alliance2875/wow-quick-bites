import { cn } from "@/lib/format";

// Tables of the admin designs: muted header row, 1px separators, highlighted (selected) row.
// Wide tables scroll horizontally inside their panel on small screens.

export function Table({ children, minWidth = "min-w-[40rem]", className }: { children: React.ReactNode; minWidth?: string; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-[0.8125rem]", minWidth, className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-panel-muted text-xs text-muted-foreground">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("whitespace-nowrap px-5 py-3 font-medium first:pl-5", className)}>
      {children}
    </th>
  );
}

export function Tr({ children, highlight, className }: { children: React.ReactNode; highlight?: boolean; className?: string }) {
  return (
    <tr
      className={cn(
        "border-t border-border transition-colors",
        highlight ? "bg-soft" : "hover:bg-panel-muted/50",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3.5 align-middle", className)}>{children}</td>;
}

/** Small grey line under a table ("Showing all 7 sample orders • 4 active"). */
export function TableFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3.5 text-[0.6875rem] text-muted-foreground">
      {children}
    </div>
  );
}

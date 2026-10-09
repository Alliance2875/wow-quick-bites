import { cn } from "@/lib/format";

/** Page-width wrapper (see the page-container utility in app/globals.css). */
export default function Container({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "main";
}) {
  return <Tag className={cn("page-container", className)}>{children}</Tag>;
}

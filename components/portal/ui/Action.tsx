import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/format";

// Portal buttons: square-cornered (6px) like the admin designs, unlike the storefront's pills.

const variants = {
  primary: "bg-primary font-semibold text-primary-foreground hover:brightness-110",
  secondary: "border border-border bg-panel text-foreground hover:border-primary/60 hover:bg-panel-muted",
  /** Dark filled button on yellow notes ("Manager permissions →", "Message Aline") */
  strong: "bg-panel-muted font-medium text-foreground hover:brightness-125 light:bg-foreground light:text-background",
  danger: "border border-border bg-panel text-critical hover:border-critical/60",
  ghost: "text-foreground hover:bg-panel-muted",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-[0.8125rem]",
  lg: "h-11 px-5 text-sm",
} as const;

export type ActionVariant = keyof typeof variants;

export const actionClasses = ({
  variant = "secondary",
  size = "md",
  block,
  className,
}: { variant?: ActionVariant; size?: keyof typeof sizes; block?: boolean; className?: string } = {}) =>
  cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    block && "w-full",
    className,
  );

type StyleProps = { variant?: ActionVariant; size?: keyof typeof sizes; block?: boolean };

export function ActionButton({ variant, size, block, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={actionClasses({ variant, size, block, className })} {...props} />;
}

export function ActionLink({ variant, size, block, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={actionClasses({ variant, size, block, className })} {...props} />;
}

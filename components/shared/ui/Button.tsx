import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/format";

const variants = {
  primary: "bg-primary text-primary-foreground hover:brightness-110",
  outline:
    "border-2 border-primary text-accent hover:bg-primary hover:text-primary-foreground",
  /** On the yellow header: dark outline */
  onPrimary:
    "border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary",
  secondary: "border border-border bg-card text-foreground hover:border-primary",
  ghost: "text-foreground hover:bg-muted",
} as const;

const sizes = {
  sm: "px-3 py-1 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export const buttonClasses = ({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    block && "w-full",
    className,
  );

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean };

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, block, className })} {...props} />
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClasses({ variant, size, block, className })} {...props} />;
}

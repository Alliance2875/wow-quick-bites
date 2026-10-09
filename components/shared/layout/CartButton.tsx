"use client";

import Link from "next/link";
import Icon from "@/components/shared/ui/Icon";
import { useCartCount } from "@/lib/cart/cart";

export default function CartButton({ href, label }: { href: string; label: string }) {
  const count = useCartCount();

  return (
    <Link
      href={href}
      aria-label={count ? `${label} (${count})` : label}
      className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-primary-foreground/10"
    >
      <Icon name="shoppingCart" className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary-foreground px-1 text-[0.625rem] font-bold text-primary">
          {count}
        </span>
      )}
    </Link>
  );
}

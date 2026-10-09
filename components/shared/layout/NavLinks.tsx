"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

export type NavLink = { label: string; href: string };

/** Header links with the active page underlined. */
export default function NavLinks({ links, className }: { links: NavLink[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={className}>
      {links.map((link) => {
        // "/en" is only active on the home page; "/en/menu" also on "/en/menu/burger"
        const active =
          pathname === link.href || (link.href.split("/").length > 2 && pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap decoration-2 underline-offset-8 hover:underline",
              active && "underline",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

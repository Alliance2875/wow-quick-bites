"use client";

import { usePathname } from "next/navigation";
import { isActivePath, type NavItem } from "./NavMenu";

export type Crumb = Pick<NavItem, "href" | "exact"> & {
  section: string;
  label: string;
  /** Only for pages below href (/account/orders/ORD-1042 → "Order tracking") */
  childrenOnly?: boolean;
};

/** "Superadmin / Overview": section and page of the most specific matching entry. */
export default function Breadcrumbs({ crumbs, label }: { crumbs: Crumb[]; label: string }) {
  const pathname = usePathname();
  const score = (crumb: Crumb) =>
    crumb.childrenOnly
      ? pathname.startsWith(`${crumb.href}/`)
        ? crumb.href.length + 1
        : -1
      : isActivePath(pathname, crumb)
        ? crumb.href.length
        : -1;
  const match = crumbs
    .map((crumb) => ({ crumb, score: score(crumb) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.crumb;
  if (!match) return null;

  return (
    <nav aria-label={label} className="min-w-0 truncate text-[0.8125rem] text-muted-foreground">
      {match.section}
      <span aria-hidden="true" className="mx-2">
        /
      </span>
      <span aria-current="page" className="text-foreground">
        {match.label}
      </span>
    </nav>
  );
}

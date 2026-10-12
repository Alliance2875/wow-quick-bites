"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/shared/ui/Icon";
import { cn } from "@/lib/format";
import { buildConversations, unreadForClient, unreadForManager, visibleTo } from "@/lib/portal/conversations";
import { useMessages, useNotifications, useOrders } from "@/lib/portal/store";

export type NavItem = {
  href: string;
  label: string;
  icon?: IconName;
  /** Only active on this exact path (section roots such as /en/admin) */
  exact?: boolean;
  /** Anchor inside another page (never shown as active) */
  anchor?: boolean;
  /** Live unread counter */
  badge?: "staffMessages" | "clientNotifications" | "clientChat";
};

export type NavSection = { label: string; items: NavItem[] };

export const isActivePath = (pathname: string, item: Pick<NavItem, "href" | "exact" | "anchor">) =>
  !item.anchor && (pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`)));

/** Live counters: they update as soon as a message is read or sent in another view. */
function useBadges(viewer: { id: string; role: string; clientCode?: string }) {
  const messages = useMessages();
  const orders = useOrders();
  const notifications = useNotifications(viewer.clientCode);
  const conversations = viewer.role === "client" ? [] : visibleTo(buildConversations(messages, orders), viewer);
  return {
    staffMessages: conversations.filter((c) => unreadForManager(c) > 0).length,
    clientNotifications: notifications.filter((n) => !n.read).length,
    clientChat: viewer.clientCode ? unreadForClient(messages, viewer.clientCode) : 0,
  };
}

export default function NavMenu({
  sections,
  viewer,
  label,
}: {
  sections: NavSection[];
  viewer: { id: string; role: string; clientCode?: string };
  label: string;
}) {
  const pathname = usePathname();
  const badges = useBadges(viewer);

  return (
    <nav aria-label={label} className="mt-5 space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-0 text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">{section.label}</p>
          <ul className="mt-2 space-y-1">
            {section.items.map((item) => {
              const active = isActivePath(pathname, item);
              const count = item.badge ? badges[item.badge] : 0;
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[2.625rem] items-center gap-2.5 rounded-lg px-3 py-2 text-sm leading-tight transition",
                      active ? "bg-soft font-bold text-accent" : "text-foreground hover:bg-panel-muted",
                    )}
                  >
                    {item.icon && <Icon name={item.icon} className="h-[1.125rem] w-[1.125rem] shrink-0" />}
                    <span className="min-w-0 flex-1">
                      {item.label}
                      {/* Staff design: "Messages · 2" */}
                      {item.badge === "staffMessages" && count > 0 && ` · ${count}`}
                    </span>
                    {item.badge && item.badge !== "staffMessages" && count > 0 && (
                      <span className="text-xs font-semibold text-accent">{count}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

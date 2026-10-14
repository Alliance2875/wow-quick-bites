"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionButton, ActionLink } from "@/components/portal/ui/Action";
import { chipClasses } from "@/components/portal/ui/Controls";
import Note from "@/components/portal/ui/Note";
import PageHeader from "@/components/portal/ui/PageHeader";
import { DetailList, Panel } from "@/components/portal/ui/Panel";
import { StagePill } from "@/components/portal/ui/Status";
import Icon from "@/components/shared/ui/Icon";
import type { PortalOrder } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn, fill, formatPrice } from "@/lib/format";
import { daysAgo } from "@/lib/portal/clock";
import { formatDate, formatTime } from "@/lib/portal/format";
import { isActiveOrder, orderLines, orderTotal } from "@/lib/portal/orders";
import { markNotificationsRead, useNotifications, useOrders, type PortalNotification } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";
import { notificationContent, stageIcon } from "./content";

export default function ClientNotifications({
  lang,
  viewer,
  dict,
}: {
  lang: Locale;
  viewer: { name: string; clientCode: string };
  dict: Pick<Dictionary, "portal" | "clientArea">;
}) {
  const t = dict.clientArea.notifications;
  const p = dict.portal;
  const [unreadOnly, setUnreadOnly] = useState(false);
  const notifications = useNotifications(viewer.clientCode);
  const orders = useOrders().filter((order) => order.clientCode === viewer.clientCode);
  const unread = notifications.filter((n) => !n.read);
  const shown = unreadOnly ? unread : notifications;

  // One card per order, most recent update first
  const groups = [...new Set(shown.map((n) => n.orderId))].map((orderId) => ({
    order: orders.find((o) => o.id === orderId),
    orderId,
    items: shown.filter((n) => n.orderId === orderId),
  }));

  const current = orders.filter(isActiveOrder).sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))[0];
  const previous = orders
    .filter((o) => o.stage === "completed")
    .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))[0];

  const dayLabel = (iso: string) => {
    const days = daysAgo(iso);
    return days === 0 ? p.time.today : days === 1 ? p.time.yesterday : formatDate(iso);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={fill(t.subtitle, { name: viewer.name, code: viewer.clientCode })}
        action={
          <ActionButton onClick={() => markNotificationsRead(unread.map((n) => n.id))} disabled={!unread.length}>
            {t.markAll}
          </ActionButton>
        }
      />

      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)} className={chipClasses(!unreadOnly)}>
          {t.filters.all} · {notifications.length}
        </button>
        <button type="button" aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)} className={chipClasses(unreadOnly)}>
          {t.filters.unread} · {unread.length}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          {groups.length === 0 && (
            <Panel>
              <p className="py-6 text-center text-[0.8125rem] text-muted-foreground">{t.empty}</p>
            </Panel>
          )}
          {groups.map((group) => {
            const active = group.order && isActiveOrder(group.order);
            const first = group.items[group.items.length - 1];
            return (
              <Panel
                key={group.orderId}
                title={fill(active ? t.groupActive : t.groupPrevious, {
                  day: dayLabel(group.order?.placedAt ?? first.at),
                  id: group.orderId,
                })}
                subtitle={
                  group.order &&
                  (active
                    ? fill(t.groupActiveMeta, {
                        stage: p.stages[group.order.stage],
                        fulfilment: p.fulfilment[group.order.fulfilment],
                      })
                    : fill(t.groupDoneMeta, { stage: p.stages[group.order.stage].toLowerCase() }))
                }
                bodyClassName=""
              >
                <ul>
                  {group.items.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      order={group.order}
                      lang={lang}
                      dict={dict}
                      dayLabel={dayLabel}
                    />
                  ))}
                </ul>
              </Panel>
            );
          })}
        </div>

        <div className="min-w-0 space-y-5">
          {current && <OrderSummary order={current} title={t.currentOrder} lang={lang} dict={dict} primary />}
          {previous && <OrderSummary order={previous} title={t.previousOrder} lang={lang} dict={dict} />}
          <Note title={t.noteTitle} muted>
            {t.note}
          </Note>
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  order,
  lang,
  dict,
  dayLabel,
}: {
  notification: PortalNotification;
  order?: PortalOrder;
  lang: Locale;
  dict: Pick<Dictionary, "portal" | "clientArea">;
  dayLabel: (iso: string) => string;
}) {
  const t = dict.clientArea.notifications;
  const content = notificationContent(notification, order, lang, t.templates);
  const href = localePath(lang, routes.accountOrder(notification.orderId));

  return (
    <li className={cn("flex gap-4 border-t border-border px-5 py-5 first:border-t-0", !notification.read && "bg-soft")}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-panel-muted text-accent light:bg-background">
        <Icon name={stageIcon[notification.stage]} className="h-[1.125rem] w-[1.125rem]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[0.6875rem] font-bold text-accent">{notification.orderId}</p>
          <p className={cn("flex items-center gap-1.5 text-[0.6875rem]", notification.read ? "text-muted-foreground" : "text-accent")}>
            {dayLabel(notification.at)} · {formatTime(notification.at)} ·{" "}
            {!notification.read && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
            {notification.read ? t.read : t.unread}
          </p>
        </div>
        <p className="mt-1 text-[0.9375rem] font-bold">{content.title}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{content.text}</p>
        <Link
          href={href}
          onClick={() => !notification.read && markNotificationsRead([notification.id])}
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
        >
          {fill(t.viewDetails, { id: notification.orderId })} <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </li>
  );
}

function OrderSummary({
  order,
  title,
  lang,
  dict,
  primary = false,
}: {
  order: PortalOrder;
  title: string;
  lang: Locale;
  dict: Pick<Dictionary, "portal" | "clientArea">;
  primary?: boolean;
}) {
  const t = dict.clientArea.notifications;
  const p = dict.portal;
  const href = localePath(lang, routes.accountOrder(order.id));

  return (
    <Panel title={title} subtitle={`${order.id} · ${formatDate(order.placedAt)}`}>
      <StagePill stage={order.stage} label={p.stages[order.stage]} />
      <div className="mt-3 space-y-1 text-[0.8125rem]">
        {orderLines(order).map((line) => (
          <p key={line.itemId}>
            {line.quantity} × {localize(line.item.name, lang)}
          </p>
        ))}
      </div>
      <DetailList
        className="mt-4"
        rows={[
          { label: order.paymentStatus === "paid" ? t.totalPaid : p.common.total, value: formatPrice(orderTotal(order)) },
          ...(primary
            ? [{ label: p.common.payment, value: `${p.payment[order.payment]} · ${p.paymentStatus[order.paymentStatus]}` }]
            : []),
        ]}
      />
      <ActionLink href={href} variant={primary ? "primary" : "secondary"} className="mt-4">
        {primary ? fill(t.track, { id: order.id }) : fill(t.viewDetails, { id: order.id })}
        <Icon name="arrowRight" className="h-4 w-4" />
      </ActionLink>
    </Panel>
  );
}

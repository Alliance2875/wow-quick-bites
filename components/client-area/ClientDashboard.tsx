"use client";

import Link from "next/link";
import { ActionLink } from "@/components/portal/ui/Action";
import Note from "@/components/portal/ui/Note";
import OrderItem from "@/components/portal/ui/OrderItem";
import PageHeader from "@/components/portal/ui/PageHeader";
import { DetailList, Panel } from "@/components/portal/ui/Panel";
import StageTracker from "@/components/portal/ui/StageTracker";
import { StagePill } from "@/components/portal/ui/Status";
import Icon, { type IconName } from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fill, formatPrice, plural } from "@/lib/format";
import { daysAgo } from "@/lib/portal/clock";
import { formatDate, formatRelative, formatTime } from "@/lib/portal/format";
import { clientTrackerSteps, isActiveOrder, newestFirst, orderLines, orderTotal } from "@/lib/portal/orders";
import { useNotifications, useOrders } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";
import { notificationContent } from "./content";

type Props = {
  lang: Locale;
  viewer: { name: string; clientCode: string };
  dict: Pick<Dictionary, "portal" | "clientArea">;
};

export default function ClientDashboard({ lang, viewer, dict }: Props) {
  const t = dict.clientArea;
  const p = dict.portal;
  const href = (path: string) => localePath(lang, path);

  const orders = useOrders()
    .filter((order) => order.clientCode === viewer.clientCode)
    .sort(newestFirst);
  const active = orders.find(isActiveOrder);

  const notifications = useNotifications(viewer.clientCode);
  const unread = notifications.filter((n) => !n.read);
  const firstUnread = unread[0];
  const lastRead = notifications.find((n) => n.read);

  const timeLabels = { today: p.time.today.toLowerCase(), yesterday: p.time.yesterday.toLowerCase() };
  const when = (iso: string) =>
    daysAgo(iso) <= 1 ? formatRelative(iso, timeLabels, ` ${p.time.at} `) : `${formatDate(iso)} ${p.time.at} ${formatTime(iso)}`;

  const quickLinks: { icon: IconName; title: string; text: string; href: string }[] = [
    { icon: "utensils", ...t.dashboard.quick.menu, href: href(routes.menu) },
    { icon: "receipt", ...t.dashboard.quick.purchases, href: href(routes.accountOrders) },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title={fill(t.dashboard.title, { name: viewer.name })}
        subtitle={t.dashboard.subtitle}
        action={
          <ActionLink href={href(routes.menu)}>
            {t.dashboard.viewMenu} <Icon name="arrowRight" className="h-4 w-4" />
          </ActionLink>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          {active ? (
            <ActiveOrder order={active} lang={lang} dict={dict} when={when} />
          ) : (
            <Panel title={t.dashboard.noActive.title}>
              <p className="text-[0.8125rem] text-muted-foreground">{t.dashboard.noActive.text}</p>
              <ActionLink href={href(routes.menu)} variant="primary" className="mt-4">
                {t.dashboard.noActive.cta} <Icon name="arrowRight" className="h-4 w-4" />
              </ActionLink>
            </Panel>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-border bg-panel p-5 transition hover:-translate-y-0.5 hover:border-primary/60"
              >
                <Icon name={link.icon} className="h-6 w-6 text-accent" />
                <p className="mt-3 text-[0.8125rem] font-bold">{link.title}</p>
                <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">{link.text}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title={t.dashboard.identity.title}>
            <DetailList
              rows={[
                { label: p.common.client, value: viewer.name },
                { label: p.common.permanentCode, value: viewer.clientCode },
              ]}
            />
            <p className="mt-4 text-[0.6875rem] leading-relaxed text-muted-foreground">{t.dashboard.identity.note}</p>
          </Panel>

          <Panel
            title={t.dashboard.notifications.title}
            subtitle={unread.length ? plural(t.dashboard.notifications.unread, unread.length) : t.dashboard.notifications.allRead}
          >
            {notifications.length === 0 && <p className="text-[0.8125rem] text-muted-foreground">{t.dashboard.notifications.empty}</p>}
            {firstUnread &&
              (() => {
                const order = orders.find((o) => o.id === firstUnread.orderId);
                const content = notificationContent(firstUnread, order, lang, t.notifications.templates);
                return (
                  <Link href={href(routes.accountNotifications)} className="block rounded-lg bg-soft p-3.5 transition hover:brightness-110">
                    <p className="flex items-center gap-1.5 text-[0.6875rem] text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                      {t.dashboard.notifications.unreadTag} · {formatRelative(firstUnread.at, p.time)}
                    </p>
                    <p className="mt-1 text-[0.8125rem] font-bold">
                      {firstUnread.orderId} · {content.title}
                    </p>
                    <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">{content.text}</p>
                  </Link>
                );
              })()}
            {lastRead && (
              <p className="mt-3 text-[0.6875rem] text-muted-foreground">
                {fill(t.dashboard.notifications.readLine, {
                  title: `${lastRead.orderId} ${p.stages[lastRead.stage].toLowerCase()}`,
                  time: formatTime(lastRead.at),
                })}
              </p>
            )}
            <ActionLink href={href(routes.accountNotifications)} className="mt-4">
              {t.dashboard.notifications.viewAll} <Icon name="arrowRight" className="h-4 w-4" />
            </ActionLink>
          </Panel>

        </div>
      </div>
    </div>
  );
}

function ActiveOrder({
  order,
  lang,
  dict,
  when,
}: {
  order: ReturnType<typeof useOrders>[number];
  lang: Locale;
  dict: Props["dict"];
  when: (iso: string) => string;
}) {
  const t = dict.clientArea;
  const p = dict.portal;
  const stage = order.stage as keyof typeof t.headline;
  const currentStep = clientTrackerSteps.indexOf(order.stage as (typeof clientTrackerSteps)[number]);
  const since = order.history[order.stage] ?? order.placedAt;

  return (
    <>
      <Panel
        title={t.dashboard.activeOrder}
        subtitle={fill(t.dashboard.activeOrderMeta, {
          id: order.id,
          when: when(order.placedAt),
          fulfilment: p.fulfilment[order.fulfilment],
        })}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight">{t.headline[stage]}</h2>
          <StagePill stage={order.stage} label={p.stages[order.stage]} />
        </div>
        <div className="mt-4 space-y-3">
          {orderLines(order).map((line) => (
            <OrderItem key={line.itemId} item={line.item} quantity={line.quantity} lang={lang} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
          <div>
            <p className="text-2xl font-bold tabular-nums">{formatPrice(orderTotal(order))}</p>
            <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
              {fill(t.paymentLine[order.paymentStatus], { payment: p.payment[order.payment] })}
            </p>
          </div>
          <ActionLink href={localePath(lang, routes.accountOrder(order.id))} variant="primary" size="lg">
            {fill(t.dashboard.track, { id: order.id })} <Icon name="arrowRight" className="h-4 w-4" />
          </ActionLink>
        </div>
      </Panel>

      <StageTracker
        label={t.steps.label}
        current={currentStep /* -1 while the order is new: nothing reached yet */}
        currentSuffix={t.steps.current}
        steps={clientTrackerSteps.map((id) => ({ id, label: t.steps[id] }))}
      />

      <Note icon="clock" tone="plain">{fill(t.stageNote[stage], { time: formatTime(since) })}</Note>
    </>
  );
}

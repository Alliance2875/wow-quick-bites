"use client";

import Link from "next/link";
import { ActionLink } from "@/components/portal/ui/Action";
import Note from "@/components/portal/ui/Note";
import PageHeader from "@/components/portal/ui/PageHeader";
import { Panel } from "@/components/portal/ui/Panel";
import { StageText } from "@/components/portal/ui/Status";
import { Table, TableFooter, Td, Th, THead, Tr } from "@/components/portal/ui/Table";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn, fill, formatPrice, plural } from "@/lib/format";
import { formatAmount, formatTime } from "@/lib/portal/format";
import { customerName, inQueueWindow, isActiveOrder, newestFirst, orderTotal } from "@/lib/portal/orders";
import { useOrders } from "@/lib/portal/store";
import { useAudit, useManagers } from "@/lib/portal/staff-store";
import { useGetAdminOverviewQuery } from "@/lib/redux/api/adminApi";
import { useGetBusinessQuery } from "@/lib/redux/api/businessApi";
import { localePath, routes } from "@/lib/routes";
import { auditText } from "./audit";

type Dict = Pick<Dictionary, "portal" | "staff">;

export default function AdminOverview({ lang, dict }: { lang: Locale; dict: Dict }) {
  const t = dict.staff.overview;
  const p = dict.portal;
  const href = (path: string) => localePath(lang, path);

  const { data: business } = useGetBusinessQuery();
  const allOrders = useOrders();
  const queueWindowDays = business?.queueWindowDays;
  const orders = (queueWindowDays === undefined
    ? allOrders
    : allOrders.filter((order) => inQueueWindow(order, queueWindowDays))
  ).sort(newestFirst);
  const { data: overview, isError: overviewError } = useGetAdminOverviewQuery();
  const managers = useManagers();
  const activeManagers = managers.filter((m) => m.status === "active");
  const audit = useAudit().slice(0, 4);
  const pending = overview?.pendingPayments ?? 0;

  const stats = overview ? [
    {
      label: t.stats.orders,
      value: overview.orders,
      meta: fill(t.stats.ordersMeta, { today: overview.ordersToday, previous: overview.orders - overview.ordersToday }),
    },
    {
      label: t.stats.active,
      value: overview.activeOrders,
      meta: fill(t.stats.activeMeta, overview.active),
    },
    {
      label: t.stats.value,
      value: formatPrice(overview.completedValue),
      meta: fill(t.stats.valueMeta, { count: overview.completedCount }),
    },
    {
      label: t.stats.managers,
      value: `${overview.managers.active} / ${overview.managers.total}`,
      meta: fill(t.stats.managersMeta, {
        on: overview.managers.onDuty,
        off: overview.managers.offDuty,
        suspended: overview.managers.suspended,
      }),
    },
  ] : [];

  const maxActive = Math.max(1, ...activeManagers.map((m) => orders.filter((o) => o.managerId === m.id && isActiveOrder(o)).length));

  return (
    <div className="space-y-7">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={<ActionLink href={`${href(routes.adminContent)}#business`}>{t.manageBusiness}</ActionLink>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewError && <p role="alert" className="text-sm text-critical">{t.loadError}</p>}
        {(stats.length ? stats : [t.stats.orders, t.stats.active, t.stats.value, t.stats.managers].map((label) => ({ label, value: "—", meta: "" }))).map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-panel p-5">
            <p className="text-[0.8125rem] text-muted-foreground">{stat.label}</p>
            <p className="mt-3 text-[1.75rem] font-bold leading-none tabular-nums">{stat.value}</p>
            <p className="mt-2.5 text-[0.6875rem] leading-snug text-muted-foreground">{stat.meta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-6">
          <Panel
            title={t.recent.title}
            subtitle={t.recent.subtitle}
            action={
              <ActionLink href={href(routes.adminOrders)} size="sm">
                {t.recent.queue}
              </ActionLink>
            }
            bodyClassName=""
          >
            <Table minWidth="min-w-[36rem]">
              <THead>
                <Th>{t.recent.columns.order}</Th>
                <Th>{t.recent.columns.client}</Th>
                <Th>{t.recent.columns.status}</Th>
                <Th>{t.recent.columns.total}</Th>
                <Th>{t.recent.columns.manager}</Th>
              </THead>
              <tbody>
                {orders.slice(0, 6).map((order) => (
                  <Tr key={order.id} highlight={order.stage === "preparing"}>
                    <Td>
                      <Link href={href(routes.adminOrder(order.id))} className="font-semibold hover:underline">
                        {order.id}
                      </Link>
                      <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">{formatTime(order.placedAt)}</p>
                    </Td>
                    <Td>
                      <p className="font-semibold">{order.guest ? customerName(order) : order.clientCode}</p>
                      <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                        {order.guest ? p.common.guestOrder : customerName(order)}
                      </p>
                    </Td>
                    <Td>
                      <StageText stage={order.stage} label={p.stages[order.stage]} />
                    </Td>
                    <Td className="tabular-nums">{formatAmount(orderTotal(order))}</Td>
                    <Td>{order.managerName ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <TableFooter>{plural(t.recent.footer, pending)}</TableFooter>
          </Panel>

          <Panel title={t.activity.title} subtitle={t.activity.subtitle} bodyClassName="">
            <Table minWidth="min-w-[32rem]">
              <THead>
                <Th className="w-20">{t.activity.columns.time}</Th>
                <Th>{t.activity.columns.event}</Th>
                <Th className="w-36">{t.activity.columns.actor}</Th>
              </THead>
              <tbody>
                {audit.map((event) => (
                  <Tr key={event.id}>
                    <Td className="tabular-nums">{formatTime(event.at)}</Td>
                    <Td>{auditText(event, lang)}</Td>
                    <Td>{actorName(event.actorId)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title={t.coverage.title} subtitle={t.coverage.subtitle}>
            <ul className="space-y-5">
              {activeManagers.map((manager) => {
                const active = orders.filter((o) => o.managerId === manager.id && isActiveOrder(o)).length;
                return (
                  <li key={manager.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm">{manager.name}</p>
                      <p className="flex items-center gap-1 text-[0.6875rem] text-success">
                        <Icon name="check" className="h-3 w-3" strokeWidth={2.5} />
                        {manager.duty === "on" ? p.duty.on : p.staffStatus.active}
                      </p>
                    </div>
                    <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">
                      {manager.duty === "on" ? plural(t.coverage.active, active) : t.coverage.backup}
                    </p>
                    <div className="mt-2 h-1 rounded-full bg-panel-muted light:bg-border">
                      <div
                        className={cn("h-full rounded-full bg-primary transition-all", !active && "opacity-0")}
                        style={{ width: `${(active / maxActive) * 70}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            {managers
              .filter((m) => m.status === "suspended")
              .map((m) => (
                <p key={m.id} className="mt-5 text-[0.6875rem] text-muted-foreground">
                  {fill(t.coverage.suspended, { name: m.name })}
                </p>
              ))}
          </Panel>

          <Panel title={t.workspace.title} subtitle={t.workspace.subtitle}>
            <p className="text-sm">{t.workspace.heading}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.workspace.text}</p>
            <Note className="mt-4">{t.workspace.note}</Note>
            <ActionLink href={href(routes.adminManagers)} className="mt-4">
              {t.workspace.cta}
            </ActionLink>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/** "Eric", "Superadmin" for the owner, as in the designs' audit tables. */
export function actorName(actorId: string) {
  return actorId;
}

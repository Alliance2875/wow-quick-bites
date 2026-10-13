"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchInput } from "@/components/portal/ui/Controls";
import Note from "@/components/portal/ui/Note";
import PageHeader from "@/components/portal/ui/PageHeader";
import { Panel } from "@/components/portal/ui/Panel";
import { StageText } from "@/components/portal/ui/Status";
import { Table, TableFooter, Td, Th, THead, Tr } from "@/components/portal/ui/Table";
import { useToast } from "@/components/portal/ui/Toast";
import Icon from "@/components/shared/ui/Icon";
import { getClient } from "@/data/clients";
import { getStaff } from "@/data/staff";
import type { OrderStage, PortalOrder } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn, fill, plural } from "@/lib/format";
import { daysAgo } from "@/lib/portal/clock";
import { formatAmount, formatDate, formatTime } from "@/lib/portal/format";
import { countByStage, inQueueWindow, isActiveOrder, itemCount, itemsSummary, newestFirst, orderTotal } from "@/lib/portal/orders";
import { useOrders } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";
import RegisterAction, { canAct, type StaffViewer } from "./RegisterAction";

const stages: OrderStage[] = ["new", "accepted", "preparing", "ready", "completed", "cancelled"];

/** Orders of the same client next to each other, clients with the latest activity first. */
function groupByClient(orders: PortalOrder[]) {
  const latest = new Map<string, number>();
  orders.forEach((o) => latest.set(o.clientCode, Math.max(latest.get(o.clientCode) ?? 0, Date.parse(o.placedAt))));
  return [...orders].sort(
    (a, b) => latest.get(b.clientCode)! - latest.get(a.clientCode)! || a.clientCode.localeCompare(b.clientCode) || newestFirst(a, b),
  );
}

export default function OrderQueue({
  lang,
  viewer,
  dict,
}: {
  lang: Locale;
  viewer: StaffViewer;
  dict: Pick<Dictionary, "portal" | "staff">;
}) {
  const t = dict.staff.queue;
  const p = dict.portal;
  const { show, toast } = useToast();
  const [stage, setStage] = useState<OrderStage | "all">("all");
  const [mine, setMine] = useState(false);
  const [grouped, setGrouped] = useState(true);
  const [query, setQuery] = useState("");

  const all = useOrders().filter(inQueueWindow);
  const counts = countByStage(all);
  const q = query.trim().toLowerCase();
  const filtered = all
    .filter((o) => stage === "all" || o.stage === stage)
    .filter((o) => !mine || o.managerId === viewer.id)
    .filter(
      (o) =>
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.clientCode.toLowerCase().includes(q) ||
        (getClient(o.clientCode)?.name ?? "").toLowerCase().includes(q),
    );
  const shown = grouped ? groupByClient(filtered) : [...filtered].sort(newestFirst);
  const perClient = (code: string) => shown.filter((o) => o.clientCode === code);

  const placedLabel = (iso: string) => {
    const days = daysAgo(iso);
    return days === 0 ? formatTime(iso) : days === 1 ? p.time.yesterday : formatDate(iso);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={viewer.role === "manager" ? fill(t.subtitle, { name: viewer.name }) : t.subtitleAdmin}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 xl:gap-4">
        {stages.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={stage === id}
            onClick={() => setStage((current) => (current === id ? "all" : id))}
            className={cn(
              "rounded-xl border bg-panel px-4 py-4 text-left transition hover:border-primary/60",
              stage === id ? "border-primary" : "border-border",
            )}
          >
            <span className="block text-xs text-muted-foreground">{p.stages[id]}</span>
            <span className="mt-2 block text-2xl tabular-nums">{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput label={t.search} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-[21rem]" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <label className="relative">
            <span className="sr-only">{t.status}</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as OrderStage | "all")}
              className="h-10 cursor-pointer appearance-none rounded-md border border-border bg-panel pl-4 pr-9 text-[0.8125rem] outline-none focus:border-primary"
            >
              <option value="all">{fill(t.statusOption, { stage: t.allStages })}</option>
              {stages.map((id) => (
                <option key={id} value={id}>
                  {fill(t.statusOption, { stage: p.stages[id] })}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>
          {viewer.role === "manager" && (
            <button
              type="button"
              aria-pressed={mine}
              onClick={() => setMine((v) => !v)}
              className="h-10 rounded-md border border-border bg-panel px-4 text-[0.8125rem] transition hover:border-primary/60"
            >
              {mine ? t.assignments.mine : t.assignments.all}
            </button>
          )}
          <button
            type="button"
            aria-pressed={grouped}
            onClick={() => setGrouped((v) => !v)}
            className={cn(
              "h-10 rounded-md px-4 text-[0.8125rem] font-semibold transition",
              grouped ? "bg-soft text-accent" : "border border-border bg-panel font-normal text-foreground",
            )}
          >
            {t.groupBy}
          </button>
        </div>
      </div>

      <Panel
        title={grouped ? t.grouped : t.byTime}
        subtitle={fill(t.groupedMeta, { orders: shown.length, clients: new Set(shown.map((o) => o.clientCode)).size })}
        action={<span className="text-[0.6875rem] text-muted-foreground">{t.register}</span>}
        bodyClassName=""
      >
        <Table minWidth="min-w-[58rem]">
          <THead>
            <Th>{t.columns.client}</Th>
            <Th>{t.columns.order}</Th>
            <Th>{t.columns.items}</Th>
            <Th>{t.columns.stage}</Th>
            <Th>{t.columns.total}</Th>
            <Th>{t.columns.assigned}</Th>
            <Th className="w-44">{t.columns.next}</Th>
          </THead>
          <tbody>
            {shown.map((order) => {
              const client = getClient(order.clientCode);
              const siblings = perClient(order.clientCode);
              const repeat = siblings.length > 1;
              const isLatest = siblings[0]?.id === order.id || !grouped;
              const actionable = canAct(viewer, order) && isActiveOrder(order);
              return (
                <Tr key={order.id} highlight={actionable && order.stage === "preparing"}>
                  <Td>
                    <p className={cn("font-semibold", repeat && grouped && "text-accent")}>{order.clientCode}</p>
                    <p className="mt-0.5 whitespace-nowrap text-[0.6875rem] text-muted-foreground">
                      {isLatest
                        ? fill(plural(t.clientOrders, all.filter((o) => o.clientCode === order.clientCode).length), {
                            name: client?.name ?? "",
                          })
                        : fill(t.previousPurchase, { name: client?.name ?? "" })}
                    </p>
                  </Td>
                  <Td>
                    <Link href={localePath(lang, routes.adminOrder(order.id))} className="font-semibold hover:underline">
                      {order.id}
                    </Link>
                    <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">{placedLabel(order.placedAt)}</p>
                  </Td>
                  <Td className="min-w-[14rem]">
                    <p>{itemsSummary(order, lang)}</p>
                    {order.lines.length > 1 && (
                      <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                        {fill(t.itemsMeta, {
                          items: plural(p.common.items, itemCount(order)),
                          payment: p.payment[order.payment],
                          status: p.paymentStatus[order.paymentStatus],
                        })}
                      </p>
                    )}
                  </Td>
                  <Td>
                    <StageText stage={order.stage} label={p.stages[order.stage]} />
                  </Td>
                  <Td className="tabular-nums">{formatAmount(orderTotal(order))}</Td>
                  <Td>{getStaff(order.managerId)?.name}</Td>
                  <Td>
                    <RegisterAction order={order} viewer={viewer} lang={lang} dict={dict} onDone={show} block size="sm" />
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        {shown.length === 0 && <p className="px-5 py-10 text-center text-[0.8125rem] text-muted-foreground">{t.empty}</p>}
        <TableFooter>
          <span>{fill(t.footer, { shown: shown.length, total: all.length, active: all.filter(isActiveOrder).length })}</span>
          {viewer.role === "manager" && <span>{t.readOnly}</span>}
        </TableFooter>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Note>{t.flow}</Note>
        <Note>{t.codes}</Note>
      </div>
      {toast}
    </div>
  );
}

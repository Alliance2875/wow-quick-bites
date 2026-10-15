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
import type { OrderStage, PortalOrder } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn, fill, plural } from "@/lib/format";
import { daysAgo } from "@/lib/portal/clock";
import { formatAmount, formatDate, formatTime } from "@/lib/portal/format";
import { useGetBusinessQuery } from "@/lib/redux/api/businessApi";
import {
  countByStage,
  customerKey,
  customerName,
  customerPhone,
  inQueueWindow,
  isActiveOrder,
  itemCount,
  itemsSummary,
  newestFirst,
  orderTotal,
} from "@/lib/portal/orders";
import { useOrders } from "@/lib/portal/store";
import { useAssignOrderMutation } from "@/lib/redux/api/ordersApi";
import { useGetAdminManagersQuery } from "@/lib/redux/api/adminApi";
import { localePath, routes } from "@/lib/routes";
import RegisterAction, { canAct, type StaffViewer } from "./RegisterAction";

const stages: OrderStage[] = ["new", "accepted", "preparing", "ready", "completed", "cancelled"];

type CustomerFilter = "all" | "account" | "guest";

/** Orders of the same customer next to each other (client code, or phone for guests), latest activity first. */
function groupByClient(orders: PortalOrder[]) {
  const latest = new Map<string, number>();
  orders.forEach((o) => latest.set(customerKey(o), Math.max(latest.get(customerKey(o)) ?? 0, Date.parse(o.placedAt))));
  return [...orders].sort(
    (a, b) =>
      latest.get(customerKey(b))! - latest.get(customerKey(a))! ||
      customerKey(a).localeCompare(customerKey(b)) ||
      newestFirst(a, b),
  );
}

export default function OrderQueue({
  lang,
  viewer,
  dict,
  selectedOrderId,
}: {
  lang: Locale;
  viewer: StaffViewer;
  dict: Pick<Dictionary, "portal" | "staff">;
  selectedOrderId?: string;
}) {
  const t = dict.staff.queue;
  const p = dict.portal;
  const { show, toast } = useToast();
  const [assignOrder] = useAssignOrderMutation();
  const [stage, setStage] = useState<OrderStage | "all">("all");
  const [mine, setMine] = useState(false);
  const [grouped, setGrouped] = useState(true);
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerFilter>("all");
  const [activeOrderId, setActiveOrderId] = useState(selectedOrderId);
  const [assignmentError, setAssignmentError] = useState(false);

  const { data: business } = useGetBusinessQuery();
  const orders = useOrders();
  const queueWindowDays = business?.queueWindowDays;
  const all = queueWindowDays === undefined
    ? orders
    : orders.filter((order) => inQueueWindow(order, queueWindowDays));
  const counts = countByStage(all);
  const { data: managers = [], isError: managersError } = useGetAdminManagersQuery(undefined, {
    skip: viewer.role !== "superadmin",
  });
  const assignableManagers = managers.filter(
    (manager) => manager.status === "active" && manager.assignment !== "none",
  );
  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  const filtered = all
    .filter((o) => stage === "all" || o.stage === stage)
    .filter((o) => !mine || o.managerId === viewer.id)
    .filter((o) => customers === "all" || (customers === "guest") === Boolean(o.guest))
    .filter(
      (o) =>
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.clientCode.toLowerCase().includes(q) ||
        customerName(o).toLowerCase().includes(q) ||
        (digits.length > 2 && (customerPhone(o) ?? "").replace(/\D/g, "").includes(digits)),
    );
  const shown = grouped ? groupByClient(filtered) : [...filtered].sort(newestFirst);
  const perClient = (key: string) => shown.filter((o) => customerKey(o) === key);
  const assign = async (orderId: string, managerId: string) => {
    setAssignmentError(false);
    try {
      await assignOrder({ orderId, managerId }).unwrap();
      show(t.assignmentSaved);
    } catch {
      setAssignmentError(true);
    }
  };

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
          <label className="relative">
            <span className="sr-only">{t.customersLabel}</span>
            <select
              value={customers}
              onChange={(e) => setCustomers(e.target.value as CustomerFilter)}
              className="h-10 cursor-pointer appearance-none rounded-md border border-border bg-panel pl-4 pr-9 text-[0.8125rem] outline-none focus:border-primary"
            >
              {(["all", "account", "guest"] as const).map((id) => (
                <option key={id} value={id}>
                  {t.customers[id]}
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
        subtitle={fill(t.groupedMeta, { orders: shown.length, clients: new Set(shown.map(customerKey)).size })}
        action={<span className="text-[0.6875rem] text-muted-foreground">{t.register}</span>}
        bodyClassName=""
      >
        {(assignmentError || managersError) && (
          <p role="alert" className="px-5 pt-4 text-xs text-critical">
            {assignmentError ? t.assignmentError : t.assignmentManagersError}
          </p>
        )}
        <Table minWidth="min-w-[58rem]">
          <THead>
            <Th>{t.columns.client}</Th>
            <Th>{t.columns.order}</Th>
            <Th>{t.columns.items}</Th>
            <Th>{t.columns.stage}</Th>
            <Th>{t.columns.total}</Th>
            <Th>{t.columns.assigned}</Th>
            <Th className="w-52">{t.columns.next}</Th>
          </THead>
          <tbody>
            {shown.map((order) => {
              const key = customerKey(order);
              const name = customerName(order);
              const siblings = perClient(key);
              const repeat = siblings.length > 1;
              const isLatest = siblings[0]?.id === order.id || !grouped;
              const actionable = canAct(viewer, order) && isActiveOrder(order);
              return (
                <Tr
                  key={order.id}
                  highlight={actionable && order.stage === "preparing"}
                  selected={activeOrderId === order.id}
                  className="cursor-pointer"
                  onClick={(event) => {
                    if (event.target instanceof Element && event.target.closest("a, button")) return;
                    setActiveOrderId(order.id);
                  }}
                >
                  <Td>
                    {order.guest ? (
                      <p className="flex items-center gap-2">
                        <span className={cn("font-semibold", repeat && grouped && "text-accent")}>{name}</span>
                        <span className="rounded-full bg-panel-muted px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          {p.common.guest}
                        </span>
                      </p>
                    ) : (
                      <p className={cn("font-semibold", repeat && grouped && "text-accent")}>{order.clientCode}</p>
                    )}
                    <p className="mt-0.5 whitespace-nowrap text-[0.6875rem] text-muted-foreground">
                      {order.guest
                        ? fill(t.guestLine, { phone: customerPhone(order) ?? "" })
                        : isLatest
                          ? fill(plural(t.clientOrders, all.filter((o) => customerKey(o) === key).length), { name })
                          : fill(t.previousPurchase, { name })}
                    </p>
                  </Td>
                  <Td>
                    <Link
                      href={`${localePath(lang, routes.adminOrder(order.id))}?fromQueue=1`}
                      onClick={() => setActiveOrderId(order.id)}
                      className="font-semibold hover:underline"
                    >
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
                  <Td>
                    {viewer.role === "superadmin" ? (
                      <select
                        aria-label={t.columns.assigned}
                        value={order.managerId ?? ""}
                        onChange={(event) => {
                          if (event.target.value) void assign(order.id, event.target.value);
                        }}
                        className="max-w-40 rounded-md border border-border bg-panel px-2 py-1 text-xs"
                        disabled={assignableManagers.length === 0}
                      >
                        <option value="">{order.managerName ?? t.unassigned}</option>
                        {order.managerId && !assignableManagers.some((manager) => manager.id === order.managerId) && (
                          <option value={order.managerId}>{order.managerName ?? order.managerId}</option>
                        )}
                        {assignableManagers.map((manager) => (
                          <option key={manager.id} value={manager.id}>{manager.name}</option>
                        ))}
                      </select>
                    ) : (
                      order.managerName ?? "—"
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <RegisterAction
                        order={order}
                        viewer={viewer}
                        lang={lang}
                        dict={dict}
                        onDone={show}
                        hideDetail
                        size="sm"
                      />
                      <Link
                        href={`${localePath(lang, routes.adminOrder(order.id))}?fromQueue=1`}
                        onClick={() => setActiveOrderId(order.id)}
                        aria-label={dict.staff.actions.view}
                        title={dict.staff.actions.view}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-panel text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <Icon name="eye" className="h-4 w-4" />
                      </Link>
                    </div>
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

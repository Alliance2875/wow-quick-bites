"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton, ActionLink } from "@/components/portal/ui/Action";
import { chipClasses, SearchInput } from "@/components/portal/ui/Controls";
import Note from "@/components/portal/ui/Note";
import { ItemThumb } from "@/components/portal/ui/OrderItem";
import PageHeader from "@/components/portal/ui/PageHeader";
import { Panel } from "@/components/portal/ui/Panel";
import { StagePill } from "@/components/portal/ui/Status";
import Icon from "@/components/shared/ui/Icon";
import type { PortalOrder } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { addToCart } from "@/lib/cart/cart";
import { cn, fill, formatPrice, plural } from "@/lib/format";
import { formatDateTime } from "@/lib/portal/format";
import { isActiveOrder, newestFirst, orderLines, orderTotal } from "@/lib/portal/orders";
import { useOrders } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";

type Filter = "all" | "active" | "completed" | "cancelled";

const matchesFilter = (order: PortalOrder, filter: Filter) =>
  filter === "all" || (filter === "active" ? isActiveOrder(order) : order.stage === filter);

export default function ClientOrders({
  lang,
  viewer,
  dict,
}: {
  lang: Locale;
  viewer: { name: string; clientCode: string };
  dict: Pick<Dictionary, "portal" | "clientArea">;
}) {
  const t = dict.clientArea.orders;
  const p = dict.portal;
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [newest, setNewest] = useState(true);

  const mine = useOrders().filter((order) => order.clientCode === viewer.clientCode);
  const shown = mine
    .filter((order) => matchesFilter(order, filter))
    .filter((order) => order.id.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (newest ? newestFirst(a, b) : newestFirst(b, a)));

  const reorder = (order: PortalOrder) => {
    order.lines.forEach((line) => addToCart({ itemId: line.itemId, quantity: line.quantity }));
    router.push(localePath(lang, routes.cart));
  };

  const filters: Filter[] = ["all", "active", "completed", "cancelled"];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={fill(t.subtitle, { code: viewer.clientCode })}
        action={
          <ActionLink href={localePath(lang, routes.menu)}>
            {t.browse} <Icon name="arrowRight" className="h-4 w-4" />
          </ActionLink>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.title}>
          {filters.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={chipClasses(filter === id)}
            >
              {t.filters[id]} · {mine.filter((order) => matchesFilter(order, id)).length}
            </button>
          ))}
        </div>
        <SearchInput label={t.search} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-64" />
      </div>

      <Panel
        title={fill(t.panelTitle, { code: viewer.clientCode })}
        action={
          <button
            type="button"
            onClick={() => setNewest((value) => !value)}
            className="flex items-center gap-1 text-[0.6875rem] text-muted-foreground hover:text-foreground"
          >
            {newest ? t.newestFirst : t.oldestFirst}
            <Icon name="arrowUp" className={cn("h-3 w-3 transition", newest && "rotate-180")} />
          </button>
        }
        bodyClassName=""
      >
        <div className="hidden grid-cols-[10rem_minmax(0,1fr)_10rem_9.5rem] gap-5 bg-panel-muted px-5 py-3 text-xs text-muted-foreground lg:grid">
          <span>{t.columns.order}</span>
          <span>{t.columns.items}</span>
          <span>{t.columns.total}</span>
          <span>{t.columns.actions}</span>
        </div>

        {shown.length === 0 && <p className="px-5 py-10 text-center text-[0.8125rem] text-muted-foreground">{t.empty}</p>}

        <ul>
          {shown.map((order) => {
            const lines = orderLines(order);
            const payment =
              order.stage === "completed"
                ? t.paymentState.completed
                : order.stage === "cancelled"
                  ? t.paymentState.cancelled
                  : fill(t.paymentState.active, { payment: p.payment[order.payment], status: p.paymentStatus[order.paymentStatus] });
            return (
              <li
                key={order.id}
                className="grid gap-4 border-t border-border px-5 py-5 first:border-t-0 lg:grid-cols-[10rem_minmax(0,1fr)_10rem_9.5rem] lg:items-center lg:gap-5 lg:first:border-t"
              >
                <div>
                  <p className="text-[0.9375rem] font-bold">{order.id}</p>
                  <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">{formatDateTime(order.placedAt)}</p>
                  <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">
                    {viewer.name} · {order.clientCode} · {p.fulfilment[order.fulfilment]}
                  </p>
                </div>

                <div className="flex min-w-0 items-center gap-4">
                  {lines[0] && <ItemThumb item={lines[0].item} lang={lang} />}
                  <div className="min-w-0 text-[0.8125rem]">
                    {lines.map((line) => (
                      <p key={line.itemId}>
                        {line.quantity} × {localize(line.item.name, lang)} · {formatPrice(line.total)}
                      </p>
                    ))}
                    <p className="mt-2 text-[0.6875rem] text-muted-foreground">{payment}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:block">
                  <p className="text-base font-bold tabular-nums">{formatPrice(orderTotal(order))}</p>
                  <StagePill stage={order.stage} label={p.stages[order.stage]} className="lg:mt-2" />
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  {isActiveOrder(order) ? (
                    <ActionLink href={localePath(lang, routes.accountOrder(order.id))} size="lg">
                      {t.track} <Icon name="arrowRight" className="h-4 w-4" />
                    </ActionLink>
                  ) : (
                    <>
                      <ActionLink href={localePath(lang, routes.accountOrder(order.id))} size="lg">
                        {t.details} <Icon name="arrowRight" className="h-4 w-4" />
                      </ActionLink>
                      <ActionButton variant="primary" size="lg" onClick={() => reorder(order)}>
                        {t.reorder}
                      </ActionButton>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap justify-between gap-2 border-t border-border px-5 py-4 text-[0.6875rem] text-muted-foreground">
          <span>{plural(t.footer, shown.length)}</span>
          <span>{t.page}</span>
        </div>
      </Panel>

      <Note icon="info" tone="plain">
        {t.note}
      </Note>
    </div>
  );
}

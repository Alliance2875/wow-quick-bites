"use client";

import { useRouter } from "next/navigation";
import { ActionButton, ActionLink } from "@/components/portal/ui/Action";
import OrderItem from "@/components/portal/ui/OrderItem";
import PageHeader from "@/components/portal/ui/PageHeader";
import { DetailList, Panel } from "@/components/portal/ui/Panel";
import StageTracker from "@/components/portal/ui/StageTracker";
import { Badge, DotText } from "@/components/portal/ui/Status";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { addToCart } from "@/lib/cart/cart";
import { fill, formatPrice, plural } from "@/lib/format";
import { formatDate, formatTime } from "@/lib/portal/format";
import { clientTrackerSteps, isActiveOrder, itemCount, orderLines, orderTotal } from "@/lib/portal/orders";
import { useOrders } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";
import { managerName } from "./content";

export default function ClientOrderView({
  lang,
  orderId,
  viewer,
  dict,
}: {
  lang: Locale;
  orderId: string;
  viewer: { name: string; clientCode: string };
  dict: Pick<Dictionary, "portal" | "clientArea">;
}) {
  const t = dict.clientArea.order;
  const c = dict.clientArea;
  const p = dict.portal;
  const router = useRouter();
  // The server page already checked that this order belongs to the client
  const order = useOrders().find((o) => o.id === orderId)!;
  const manager = managerName(order, "WOW Quick Bites");
  const total = formatPrice(orderTotal(order));

  const at = (stage: keyof typeof order.history) => (order.history[stage] ? formatTime(order.history[stage]) : "—");
  const values = {
    manager,
    total,
    code: viewer.clientCode,
    accepted: at("accepted"),
    preparing: at("preparing"),
    ready: at("ready"),
    completed: at("completed"),
    cancelled: at("cancelled"),
  };
  const status = t.status[order.stage];
  const step = clientTrackerSteps.indexOf(order.stage as (typeof clientTrackerSteps)[number]);

  const reorder = () => {
    order.lines.forEach((line) => addToCart({ itemId: line.itemId, quantity: line.quantity }));
    router.push(localePath(lang, routes.cart));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={fill(t.title, { id: order.id })}
        subtitle={fill(t.subtitle, {
          date: formatDate(order.placedAt),
          time: formatTime(order.placedAt),
          fulfilment: p.fulfilment[order.fulfilment],
          manager,
        })}
        action={
          <ActionLink href={localePath(lang, routes.accountOrders)}>
            <Icon name="arrowLeft" className="h-4 w-4" /> {t.back}
          </ActionLink>
        }
      />

      <StageTracker
        label={c.steps.label}
        current={order.stage === "completed" ? clientTrackerSteps.length : step}
        currentSuffix={c.steps.current}
        steps={clientTrackerSteps.map((id) => ({ id, label: c.steps[id] }))}
        cancelledLabel={order.stage === "cancelled" ? c.steps.cancelled : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <Panel
            tone={isActiveOrder(order) ? "soft" : "default"}
            title={status.title}
            action={<DotText className={isActiveOrder(order) ? undefined : "text-muted-foreground"}>{p.stages[order.stage]}</DotText>}
          >
            <p className="text-[0.8125rem] leading-relaxed">{fill(status.text, values)}</p>
            <p className="mt-3 text-xs text-muted-foreground">{fill(status.hint, values)}</p>
            {!isActiveOrder(order) && (
              <ActionButton variant="primary" className="mt-4" onClick={reorder}>
                {t.reorder}
              </ActionButton>
            )}
          </Panel>

          <Panel
            title={t.receipt.title}
            subtitle={fill(t.receipt.meta, { items: plural(p.common.items, itemCount(order)) })}
          >
            <div className="flex justify-between text-[0.6875rem] text-muted-foreground">
              <span>{t.receipt.columns.item}</span>
              <span>{t.receipt.columns.total}</span>
            </div>
            <div className="mt-3 space-y-3">
              {orderLines(order).map((line) => (
                <OrderItem key={line.itemId} item={line.item} quantity={line.quantity} lang={lang} />
              ))}
            </div>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-[0.8125rem]">
              <div className="flex gap-6">
                <dt className="w-28 text-muted-foreground">{p.common.subtotal}</dt>
                <dd>{total}</dd>
              </div>
              <div className="flex gap-6">
                <dt className="w-28 text-muted-foreground">{p.common.fees}</dt>
                <dd>{formatPrice(0)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-[0.8125rem] font-bold">
                {order.paymentStatus === "paid"
                  ? t.receipt.paid
                  : order.paymentStatus === "not-charged"
                    ? t.receipt.notCharged
                    : t.receipt.dueOnPickup}
              </p>
              <p className="text-2xl font-bold tabular-nums">{total}</p>
            </div>
          </Panel>

        </div>

        <div className="min-w-0 space-y-5">
          <Panel title={t.identity.title}>
            <DetailList
              rows={[
                { label: p.common.client, value: viewer.name },
                { label: p.common.permanentCode, value: viewer.clientCode },
                { label: p.common.orderId, value: order.id },
              ]}
            />
            <p className="mt-4 text-[0.6875rem] leading-relaxed text-muted-foreground">{t.identity.note}</p>
          </Panel>

          <Panel title={t.paymentPanel}>
            <Badge tone={order.paymentStatus === "pending" ? "accent" : order.paymentStatus === "paid" ? "success" : "critical"}>
              {order.paymentStatus === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
              {order.paymentStatus === "pending" ? t.paymentPending : order.paymentStatus === "paid" ? t.paymentDone : t.notCharged}
            </Badge>
            <DetailList
              className="mt-4"
              rows={[
                { label: p.common.fulfilment, value: p.fulfilment[order.fulfilment] },
                { label: p.common.payment, value: p.payment[order.payment] },
                { label: p.common.amountDue, value: order.paymentStatus === "pending" ? total : formatPrice(0) },
                { label: p.common.manager, value: manager },
              ]}
            />
          </Panel>

          <div className="rounded-xl bg-panel-muted p-5">
            <Icon name="shoppingBag" className="h-6 w-6 text-accent" />
            <p className="mt-3 text-[0.8125rem] font-bold">{t.nextStep[order.stage].title}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.nextStep[order.stage].text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

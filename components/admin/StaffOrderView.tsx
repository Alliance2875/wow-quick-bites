"use client";

import { ActionButton, ActionLink } from "@/components/portal/ui/Action";
import Note from "@/components/portal/ui/Note";
import { ItemThumb, itemMeta } from "@/components/portal/ui/OrderItem";
import PageHeader from "@/components/portal/ui/PageHeader";
import { DetailList, Panel } from "@/components/portal/ui/Panel";
import StageTracker from "@/components/portal/ui/StageTracker";
import { DotText } from "@/components/portal/ui/Status";
import { Table, Td, Th, THead, Tr } from "@/components/portal/ui/Table";
import { useToast } from "@/components/portal/ui/Toast";
import Icon from "@/components/shared/ui/Icon";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn, fill, formatPrice, plural } from "@/lib/format";
import { formatAmount, formatDateTime, formatTime } from "@/lib/portal/format";
import { customerName, customerPhone, isActiveOrder, itemCount, orderLines, orderTotal, stageFlow } from "@/lib/portal/orders";
import { moveOrder } from "@/lib/portal/store";
import { useGetOrderQuery } from "@/lib/redux/api/ordersApi";
import { useGetTagsQuery } from "@/lib/redux/api/menuApi";
import { localePath, routes } from "@/lib/routes";
import RegisterAction, { canAct, type StaffViewer } from "./RegisterAction";

export default function StaffOrderView({
  lang,
  orderId,
  viewer,
  dict,
  fromQueue = false,
}: {
  lang: Locale;
  orderId: string;
  viewer: StaffViewer;
  dict: Pick<Dictionary, "portal" | "staff">;
  fromQueue?: boolean;
}) {
  const { data: tags = {} } = useGetTagsQuery();
  const t = dict.staff.order;
  const p = dict.portal;
  const { show, toast } = useToast();
  const { data: order, isLoading, isError } = useGetOrderQuery(orderId);
  if (isLoading) return <div className="min-h-96" aria-busy="true" />;
  if (isError || !order) return <p role="alert" className="py-20 text-center">{t.unavailable}</p>;
  const client = customerName(order) || order.clientCode;
  const phone = customerPhone(order);
  // Guests have no permanent code: "Guest · no account" takes its place in the texts
  const manager = order.managerName ?? "—";
  const total = orderTotal(order);

  const at = (stage: keyof typeof order.history) => (order.history[stage] ? formatTime(order.history[stage]) : "—");
  const values = {
    id: order.id,
    client,
    code: order.guest ? p.common.guestOrder : order.clientCode,
    manager,
    placed: formatTime(order.placedAt),
    accepted: at("accepted"),
    preparing: at("preparing"),
    cancelled: at("cancelled"),
  };
  const panel = t.panel[order.stage];
  const mine = canAct(viewer, order);
  const step = order.stage === "completed" ? stageFlow.length : stageFlow.indexOf(order.stage as (typeof stageFlow)[number]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={fill(t.title, { id: order.id })}
        subtitle={fill(t.subtitle, { client, code: values.code, fulfilment: p.fulfilment[order.fulfilment], manager })}
        action={
          <ActionLink
            href={`${localePath(lang, routes.adminOrders)}${fromQueue ? `?selected=${encodeURIComponent(order.id)}` : ""}`}
          >
            <Icon name="arrowLeft" className="h-4 w-4" /> {t.back}
          </ActionLink>
        }
      />

      <StageTracker
        label={t.steps.label}
        current={step}
        currentSuffix={t.steps.current}
        steps={stageFlow.map((id) => ({ id, label: p.stages[id] }))}
        cancelledLabel={order.stage === "cancelled" ? t.steps.cancelled : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-6">
          <Panel
            title={t.items.title}
            subtitle={fill(t.items.meta, { items: plural(p.common.items, itemCount(order)) })}
            bodyClassName=""
          >
            <Table minWidth="min-w-[34rem]">
              <THead>
                <Th>{t.items.columns.item}</Th>
                <Th className="w-20">{t.items.columns.qty}</Th>
                <Th className="w-28">{t.items.columns.unit}</Th>
                <Th className="w-28">{t.items.columns.total}</Th>
              </THead>
              <tbody>
                {orderLines(order).map((line) => (
                  <Tr key={line.itemId}>
                    <Td className="py-4">
                      <div className="flex items-center gap-3">
                        <ItemThumb item={line.item} lang={lang} />
                        <div>
                          <p>{localize(line.item.name, lang)}</p>
                          <p className="mt-1 text-[0.6875rem] text-muted-foreground">{itemMeta(line.item, lang, " • ", tags)}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>{line.quantity}</Td>
                    <Td className="tabular-nums">{formatAmount(line.unit)}</Td>
                    <Td className="tabular-nums">{formatAmount(line.total)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <div className="flex items-end justify-between gap-4 border-t border-border px-5 py-4">
              <div>
                <p className="text-[0.8125rem]">{t.items.total}</p>
                <p className="mt-1 text-[0.6875rem] text-muted-foreground">{t.items.noFees}</p>
              </div>
              <p className="text-2xl tabular-nums">{formatAmount(total)}</p>
            </div>
          </Panel>

          <Panel
            tone={isActiveOrder(order) ? "soft" : "default"}
            title={fill(panel.title, values)}
            action={
              <DotText className={cn(order.stage === "ready" || order.stage === "completed" ? "text-success" : undefined)}>
                {p.stages[order.stage]}
              </DotText>
            }
          >
            <p className="text-[0.8125rem] leading-relaxed">{fill(panel.text, values)}</p>
            {!mine && isActiveOrder(order) && (
              <p className="mt-2 text-xs text-muted-foreground">{fill(t.readOnly, { manager })}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {isActiveOrder(order) && mine && <RegisterAction order={order} viewer={viewer} lang={lang} dict={dict} onDone={show} />}
              {!isActiveOrder(order) && (
                <ActionLink href={localePath(lang, routes.adminOrders)}>{t.returnToQueue}</ActionLink>
              )}
              {mine && (order.stage === "new" || order.stage === "accepted") && (
                <ActionButton
                  variant="danger"
                  onClick={async () => {
                    try {
                      await moveOrder(order, "cancelled");
                      show(fill(dict.staff.queue.moved, { id: order.id, stage: p.stages.cancelled }));
                    } catch {
                      show(dict.staff.actions.error);
                    }
                  }}
                >
                  {dict.staff.actions.cancel}
                </ActionButton>
              )}
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title={t.identity.title}>
            <DetailList
              labelWidth="w-auto min-w-24"
              rows={[
                { label: p.common.client, value: client },
                order.guest
                  ? { label: p.common.permanentCode, value: p.common.guestOrder }
                  : { label: p.common.permanentCode, value: order.clientCode },
                ...(phone ? [{ label: p.common.phone, value: phone }] : []),
                { label: p.common.orderId, value: order.id },
                { label: p.common.manager, value: manager },
              ]}
            />
            <Note className="mt-4">{t.identity.note}</Note>
          </Panel>

          <Panel
            title={t.payment}
            action={
              <DotText className={order.paymentStatus === "pending" ? undefined : "text-muted-foreground"}>
                {p.paymentStatus[order.paymentStatus]}
              </DotText>
            }
          >
            <DetailList
              labelWidth="w-auto min-w-24"
              rows={[
                { label: p.common.fulfilment, value: p.fulfilment[order.fulfilment] },
                { label: p.common.payment, value: p.payment[order.payment] },
                { label: p.common.paymentStatus, value: p.paymentStatus[order.paymentStatus] },
                { label: p.common.amountDue, value: formatPrice(order.paymentStatus === "pending" ? total : 0) },
                { label: p.common.placed, value: formatDateTime(order.placedAt) },
              ]}
            />
          </Panel>

        </div>
      </div>
      {toast}
    </div>
  );
}

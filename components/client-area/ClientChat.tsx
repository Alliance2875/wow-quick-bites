"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ActionLink } from "@/components/portal/ui/Action";
import { ChatComposer, ChatThread } from "@/components/portal/ui/Chat";
import Note from "@/components/portal/ui/Note";
import OrderItem from "@/components/portal/ui/OrderItem";
import PageHeader from "@/components/portal/ui/PageHeader";
import { DetailList, Panel } from "@/components/portal/ui/Panel";
import { DotText, StagePill } from "@/components/portal/ui/Status";
import Icon from "@/components/shared/ui/Icon";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fill, formatPrice, plural } from "@/lib/format";
import { formatTime } from "@/lib/portal/format";
import { isActiveOrder, itemsSummary, newestFirst, orderLines, orderTotal } from "@/lib/portal/orders";
import { markConversationRead, sendMessage, useMessages, useOrders } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";
import { managerName } from "./content";

export default function ClientChat({
  lang,
  viewer,
  dict,
}: {
  lang: Locale;
  viewer: { name: string; clientCode: string };
  dict: Pick<Dictionary, "portal" | "clientArea">;
}) {
  const t = dict.clientArea.chat;
  const p = dict.portal;
  const all = useMessages();
  const thread = all
    .filter((m) => m.clientCode === viewer.clientCode)
    .sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt));
  const orders = useOrders()
    .filter((o) => o.clientCode === viewer.clientCode)
    .sort(newestFirst);
  const linked = orders.find(isActiveOrder) ?? orders[0];
  const manager = managerName(linked, t.team);
  const last = thread[thread.length - 1];
  const unread = thread.filter((m) => m.from === "manager" && !m.readByClient);

  // Remember where the unread replies started, then mark them read (the divider stays visible)
  const [firstUnreadId] = useState(() => unread[0]?.id);
  const [unreadAtOpen] = useState(() => unread.length);
  useEffect(() => {
    markConversationRead(viewer.clientCode, "client", all);
  }, [all, viewer.clientCode]);

  const send = (text: string) =>
    sendMessage({ clientCode: viewer.clientCode, from: "client", orderId: linked?.id, text });

  const previous = orders.find((o) => o.id !== linked?.id && o.stage === "completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={fill(t.subtitle, { manager, name: viewer.name, code: viewer.clientCode })}
        action={
          linked && (
            <ActionLink href={localePath(lang, routes.accountOrder(linked.id))}>
              {fill(t.track, { id: linked.id })} <Icon name="arrowRight" className="h-4 w-4" />
            </ActionLink>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-4">
          <Panel title={t.list} subtitle={t.listMeta} bodyClassName="p-4">
            <div className="rounded-lg bg-soft p-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[0.9375rem] font-bold">{manager}</p>
                {last && <p className="text-[0.6875rem] text-muted-foreground">{formatTime(last.sentAt)}</p>}
              </div>
              <p className="mt-1 text-[0.6875rem] text-muted-foreground">{t.business}</p>
              {last && <p className="mt-2 line-clamp-2 text-xs">{localize(last.text, lang)}</p>}
              {firstUnreadId && (
                <p className="mt-2">
                  <DotText>{plural(t.unreadReplies, unreadAtOpen)}</DotText>
                </p>
              )}
            </div>
          </Panel>
          <Note title={t.noteTitle} muted>
            {fill(t.note, { code: viewer.clientCode })}
          </Note>
        </div>

        <section className="flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-panel lg:max-h-[calc(100dvh-12rem)]">
          <header className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-sm font-bold text-accent">
              {manager.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[0.9375rem] font-semibold">{fill(t.threadTitle, { manager })}</h2>
              <p className="text-[0.6875rem] text-muted-foreground">
                {fill(t.threadMeta, { name: viewer.name, code: viewer.clientCode })}
              </p>
            </div>
            <Icon name="ellipsis" className="h-5 w-5 text-muted-foreground" />
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {linked && (
              <Link
                href={localePath(lang, routes.accountOrder(linked.id))}
                className="mb-5 flex items-center justify-between gap-3 rounded-md bg-panel-muted px-3 py-2.5 text-xs font-semibold transition hover:brightness-110 light:bg-background"
              >
                <span>
                  {linked.id} · {p.fulfilment[linked.fulfilment]} →
                </span>
                <DotText className="font-normal">{p.stages[linked.stage]}</DotText>
              </Link>
            )}
            <ChatThread
              messages={thread}
              own="client"
              lang={lang}
              empty={t.empty}
              firstUnreadId={firstUnreadId}
              unreadDivider={firstUnreadId ? plural(t.unreadReplies, unreadAtOpen) : undefined}
              dateLabel={(date) => fill(t.conversationDate, { date })}
              authorLine={(m) =>
                m.from === "client"
                  ? fill(t.youLine, { name: viewer.name, code: viewer.clientCode })
                  : fill(t.managerLine, { manager })
              }
              metaLine={(m) => (m.from === "client" ? t.sent : m.id === firstUnreadId ? t.unreadTag : "")}
            />
          </div>

          <ChatComposer
            label={`${fill(t.replyingTo, { manager, code: viewer.clientCode })}${linked ? ` · ${linked.id}` : ""}`}
            placeholder={fill(t.placeholder, { manager })}
            hint={t.attached}
            submit={t.send}
            onSend={send}
          />
        </section>

        <div className="min-w-0 space-y-4 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 xl:col-span-1 xl:block xl:space-y-4">
          <Panel title={t.linkedOrder} subtitle={linked && fill(t.linkedMeta, { id: linked.id })}>
            {linked ? (
              <>
                <StagePill stage={linked.stage} label={p.stages[linked.stage]} />
                <div className="mt-4 space-y-3">
                  {orderLines(linked).map((line) => (
                    <OrderItem key={line.itemId} item={line.item} quantity={line.quantity} lang={lang} size="sm" />
                  ))}
                </div>
                <DetailList
                  className="mt-4"
                  labelWidth="w-24"
                  rows={[
                    { label: p.common.total, value: formatPrice(orderTotal(linked)) },
                    { label: p.common.fulfilment, value: p.fulfilment[linked.fulfilment] },
                    { label: p.common.payment, value: `${p.payment[linked.payment]} · ${p.paymentStatus[linked.paymentStatus]}` },
                  ]}
                />
                <ActionLink href={localePath(lang, routes.accountOrder(linked.id))} className="mt-4">
                  {t.viewOrder} <Icon name="arrowRight" className="h-4 w-4" />
                </ActionLink>
              </>
            ) : (
              <p className="text-[0.8125rem] text-muted-foreground">{t.noOrder}</p>
            )}
          </Panel>

          {orders.length > 0 && (
            <Panel title={t.history} subtitle={`${viewer.name} · ${viewer.clientCode}`}>
              <ul className="space-y-3 text-[0.8125rem]">
                {orders.slice(0, 4).map((order) => (
                  <li key={order.id} className="flex justify-between gap-4">
                    <Link href={localePath(lang, routes.accountOrder(order.id))} className="text-muted-foreground hover:text-foreground">
                      {order.id}
                    </Link>
                    <span>
                      {p.stages[order.stage]} · {formatPrice(orderTotal(order))}
                    </span>
                  </li>
                ))}
              </ul>
              {previous && (
                <p className="mt-4 text-[0.6875rem] leading-relaxed text-muted-foreground">
                  {fill(t.previous, { items: itemsSummary(previous, lang), total: formatPrice(orderTotal(previous)) })}
                </p>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

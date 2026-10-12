"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ActionLink } from "@/components/portal/ui/Action";
import { ChatComposer, ChatThread } from "@/components/portal/ui/Chat";
import { SearchInput } from "@/components/portal/ui/Controls";
import Note from "@/components/portal/ui/Note";
import PageHeader from "@/components/portal/ui/PageHeader";
import { DetailList, Panel } from "@/components/portal/ui/Panel";
import { DotText, StageText } from "@/components/portal/ui/Status";
import { useToast } from "@/components/portal/ui/Toast";
import Icon from "@/components/shared/ui/Icon";
import { getStaff } from "@/data/staff";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn, fill, formatPrice, plural } from "@/lib/format";
import { buildConversations, unreadForManager, visibleTo } from "@/lib/portal/conversations";
import { formatTime } from "@/lib/portal/format";
import { isActiveOrder, itemsSummary, newestFirst, orderLines, orderTotal } from "@/lib/portal/orders";
import { markConversationRead, sendMessage, useMessages, useOrders } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";
import RegisterAction, { type StaffViewer } from "./RegisterAction";

export default function StaffMessages({
  lang,
  viewer,
  initialClient,
  dict,
}: {
  lang: Locale;
  viewer: StaffViewer;
  initialClient?: string;
  dict: Pick<Dictionary, "portal" | "staff">;
}) {
  const t = dict.staff.messages;
  const p = dict.portal;
  const { show, toast } = useToast();
  const messages = useMessages();
  const orders = useOrders();
  const conversations = visibleTo(buildConversations(messages, orders), viewer);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(
    () => conversations.find((c) => c.clientCode === initialClient)?.clientCode ?? conversations[0]?.clientCode,
  );
  const conversation = conversations.find((c) => c.clientCode === selected);
  const unreadTotal = conversations.filter((c) => unreadForManager(c) > 0).length;

  const q = query.trim().toLowerCase();
  const listed = conversations.filter(
    (c) => !q || c.clientName.toLowerCase().includes(q) || c.clientCode.toLowerCase().includes(q),
  );

  // Opening a conversation marks the client's messages as read
  useEffect(() => {
    if (selected) markConversationRead(selected, "manager", messages);
  }, [selected, messages]);

  const select = (code: string) => {
    setSelected(code);
    // Shareable URL without a server round trip
    window.history.replaceState(null, "", `?client=${code}`);
  };

  const replier = getStaff(conversation?.managerId ?? "")?.name ?? viewer.name;
  const clientOrders = conversation ? orders.filter((o) => o.clientCode === conversation.clientCode).sort(newestFirst) : [];
  const linked = clientOrders.find(isActiveOrder) ?? clientOrders[0];
  const previous = clientOrders.find((o) => o.id !== linked?.id && o.stage === "completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={<ActionLink href={localePath(lang, routes.adminOrders)}>{t.queue}</ActionLink>}
      />

      <div className="grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <Panel
            title={t.inbox}
            subtitle={
              viewer.role === "superadmin"
                ? fill(t.inboxMetaAdmin, { unread: unreadTotal })
                : fill(t.inboxMeta, { name: viewer.name, unread: unreadTotal })
            }
            bodyClassName=""
          >
            <div className="p-3">
              <SearchInput label={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {listed.length === 0 && <p className="px-5 pb-6 text-[0.8125rem] text-muted-foreground">{t.noConversations}</p>}
            <ul>
              {listed.map((c) => {
                const unread = unreadForManager(c) > 0 && c.clientCode !== selected;
                const active = c.clientCode === selected;
                return (
                  <li key={c.clientCode}>
                    <button
                      type="button"
                      onClick={() => select(c.clientCode)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "w-full border-t border-border px-4 py-4 text-left transition",
                        active ? "bg-soft" : "hover:bg-panel-muted/60",
                      )}
                    >
                      <span className="flex items-baseline justify-between gap-2 text-xs">
                        <span className={active ? "text-accent" : undefined}>{c.clientCode}</span>
                        <span className="text-[0.6875rem] text-muted-foreground">
                          {formatTime(c.last.sentAt)}
                          {unread && ` • ${t.newTag}`}
                        </span>
                      </span>
                      <span className={cn("mt-1.5 block text-sm", unread && "font-bold")}>{c.clientName}</span>
                      <span className="mt-1.5 block truncate text-[0.6875rem] text-muted-foreground">{localize(c.last.text, lang)}</span>
                      {c.order && (
                        <span className="mt-1.5 block text-[0.625rem] text-muted-foreground">
                          {c.order.id} · {p.stages[c.order.stage]}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-border px-4 py-3.5 text-[0.6875rem] text-muted-foreground">
              {plural(t.footer, conversations.length)}
            </p>
          </Panel>
          <Note>{t.groupNote}</Note>
        </div>

        <section className="flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-panel lg:max-h-[calc(100dvh-12rem)]">
          {conversation ? (
            <>
              <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-[0.9375rem] font-semibold">
                    {conversation.clientName} · {conversation.clientCode}
                  </h2>
                  <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">{fill(t.threadMeta, { manager: replier })}</p>
                </div>
                <Icon name="ellipsis" className="h-5 w-5 text-muted-foreground" />
              </header>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {linked && (
                  <Link
                    href={localePath(lang, routes.adminOrder(linked.id))}
                    className="mb-5 flex items-center justify-between gap-3 rounded-md bg-panel-muted px-3 py-2.5 text-xs font-semibold transition hover:brightness-110 light:bg-background"
                  >
                    <span>
                      {linked.id} · {p.fulfilment[linked.fulfilment]}
                    </span>
                    <StageText stage={linked.stage} label={p.stages[linked.stage]} className="font-normal" />
                  </Link>
                )}
                <ChatThread
                  messages={conversation.messages}
                  own="manager"
                  lang={lang}
                  empty={t.empty}
                  dateLabel={(date) => fill(t.conversationDate, { date })}
                  authorLine={(m) =>
                    m.from === "client"
                      ? fill(t.clientLine, { name: conversation.clientName, code: conversation.clientCode })
                      : fill(t.managerLine, { manager: getStaff(m.authorId ?? "")?.name ?? replier })
                  }
                  metaLine={(m) => (m.from === "manager" ? t.sent : "")}
                />
              </div>
              <ChatComposer
                key={conversation.clientCode}
                label={`${fill(t.replyingTo, { name: conversation.clientName, code: conversation.clientCode })}${linked ? ` · ${linked.id}` : ""}`}
                placeholder={fill(t.placeholder, { name: conversation.clientName })}
                hint={t.attached}
                submit={t.send}
                onSend={(text) =>
                  sendMessage({ clientCode: conversation.clientCode, from: "manager", authorId: viewer.id, orderId: linked?.id, text })
                }
              />
            </>
          ) : (
            <p className="m-auto p-10 text-[0.8125rem] text-muted-foreground">{t.empty}</p>
          )}
        </section>

        {conversation && linked && (
          <div className="min-w-0 space-y-4 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 xl:col-span-1 xl:block xl:space-y-4">
            <Panel
              title={t.associated}
              subtitle={fill(t.associatedMeta, { id: linked.id })}
              action={<DotText>{p.stages[linked.stage]}</DotText>}
            >
              <p className="text-[0.8125rem] font-semibold">
                {conversation.clientName} · {conversation.clientCode}
              </p>
              <ul className="mt-3 space-y-2.5 text-[0.8125rem]">
                {orderLines(linked).map((line) => (
                  <li key={line.itemId}>
                    {line.quantity} × {localize(line.item.name, lang)}
                    <span className="mt-0.5 block text-[0.6875rem] text-muted-foreground">{formatPrice(line.total)}</span>
                  </li>
                ))}
              </ul>
              <DetailList
                className="mt-4"
                labelWidth="w-auto min-w-20"
                rows={[
                  { label: p.common.total, value: formatPrice(orderTotal(linked)) },
                  { label: p.common.fulfilment, value: p.fulfilment[linked.fulfilment] },
                  { label: p.common.payment, value: `${p.payment[linked.payment]} · ${p.paymentStatus[linked.paymentStatus]}` },
                  { label: p.common.manager, value: getStaff(linked.managerId)?.name ?? "—" },
                ]}
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <RegisterAction order={linked} viewer={viewer} lang={lang} dict={dict} onDone={show} block size="sm" />
                <ActionLink href={localePath(lang, routes.adminOrder(linked.id))} size="sm" block>
                  {t.orderDetail}
                </ActionLink>
              </div>
            </Panel>

            <div className="space-y-4">
              <Panel title={t.history} subtitle={fill(t.historyMeta, { code: conversation.clientCode, name: conversation.clientName })}>
                <ul className="space-y-3 text-[0.8125rem]">
                  {clientOrders.map((order) => (
                    <li key={order.id} className="flex items-center justify-between gap-3">
                      <Link href={localePath(lang, routes.adminOrder(order.id))} className="hover:underline">
                        {order.id}
                      </Link>
                      <StageText stage={order.stage} label={p.stages[order.stage]} />
                    </li>
                  ))}
                </ul>
                {previous && (
                  <p className="mt-4 text-[0.6875rem] leading-relaxed text-muted-foreground">
                    {fill(t.previous, { items: itemsSummary(previous, lang), total: formatPrice(orderTotal(previous)) })}
                  </p>
                )}
              </Panel>
              {linked.stage === "preparing" && <Note>{fill(t.readyNote, { id: linked.id })}</Note>}
            </div>
          </div>
        )}
      </div>
      {toast}
    </div>
  );
}

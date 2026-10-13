"use client";

import Link from "next/link";
import OrderLineRow from "@/components/shared/order/OrderLineRow";
import StepIndicator from "@/components/shared/order/StepIndicator";
import SummaryRows from "@/components/shared/order/SummaryRows";
import Breadcrumb from "@/components/shared/ui/Breadcrumb";
import { ButtonLink } from "@/components/shared/ui/Button";
import Icon, { type IconName } from "@/components/shared/ui/Icon";
import { fulfilmentOptions, paymentMethods } from "@/data/checkout";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useHydrated } from "@/lib/create-store";
import { fill, formatPrice, plural } from "@/lib/format";
import { useLastOrder } from "@/lib/orders";
import { localePath, routes } from "@/lib/routes";

type ConfirmationDicts = Pick<Dictionary, "common" | "cart" | "checkout" | "order">;

const card = "rounded-3xl border border-border bg-card p-6 sm:p-7";

function formatDate(iso: string, lang: Locale, template: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" });
  const time = date.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit", hour12: false });
  return fill(template, { day, time });
}

export default function OrderConfirmation({ lang, dict }: { lang: Locale; dict: ConfirmationDicts }) {
  const hydrated = useHydrated();
  const order = useLastOrder();
  const t = dict.order;
  const href = (path: string) => localePath(lang, path);

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (!order) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-3xl">{t.none.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.none.text}</p>
        <ButtonLink href={href(routes.menu)} size="lg" className="mt-6">
          {dict.cart.browseMenu}
        </ButtonLink>
      </div>
    );
  }

  const count = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const items = plural(dict.cart.itemCount, count);
  const fulfilment = localize(fulfilmentOptions.find((f) => f.id === order.fulfilment)!.label, lang);
  const payment = localize(paymentMethods.find((m) => m.id === order.payment)!.label, lang);
  const amount = formatPrice(order.total);

  const nextSteps: { icon: IconName; title: string; text: string }[] = [
    { icon: "receipt", ...t.next.review },
    { icon: "clock", ...t.next.ready },
    { icon: "store", title: t.next.collect.title, text: fill(t.next.collect.text, { id: order.id, amount }) },
  ];

  const identity = [
    [t.identity.client, order.clientName],
    [t.identity.clientCode, order.clientCode],
    [t.identity.orderId, order.id],
  ];

  return (
    <div className="page-container py-10">
      <Breadcrumb
        items={[
          { label: dict.common.nav.home, href: href(routes.home) },
          { label: dict.checkout.breadcrumb },
          { label: t.breadcrumb },
        ]}
      />
      <StepIndicator current="confirmation" dict={dict.cart.steps} />

      <section className="mt-8 flex flex-col gap-5 rounded-3xl bg-soft p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:h-[4.5rem] sm:w-[4.5rem]">
          <Icon name="check" className="h-8 w-8" strokeWidth={3} />
        </span>
        <div>
          <h1 className="text-3xl sm:text-4xl">{fill(t.thanks, { name: order.clientName })}</h1>
          <p className="mt-2 text-lg">
            {fill(t.meta, { id: order.id, date: formatDate(order.placedAt, lang, t.dateFormat), fulfilment })}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t.receiptNote}</p>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="text-xl">{fill(t.receiptTitle, { id: order.id })}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{fill(t.receiptMeta, { items })}</p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {order.lines.map((line) => (
                <OrderLineRow key={line.id} line={line} lang={lang} />
              ))}
            </ul>
            <div className="mt-4">
              <SummaryRows subtotal={order.subtotal} fees={order.fees} total={order.total} dict={dict.cart.summary} />
            </div>
          </section>

          <section className={card}>
            <h2 className="text-xl">{t.next.title}</h2>
            <ol className="mt-5 space-y-5">
              {nextSteps.map((step) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-accent">
                    <Icon name={step.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Link href={href(routes.menu)} className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
            <Icon name="arrowLeft" className="h-4 w-4" /> {t.backToMenu}
          </Link>
        </div>

        <aside className="space-y-5">
          <section className={card}>
            <h2 className="text-xl">{t.identity.title}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {identity.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-bold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">{t.identity.note}</p>
          </section>

          <section className={card}>
            <h2 className="text-xl">{t.payment.title}</h2>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-[0.6875rem] font-bold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {t.payment.pending}
            </span>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                [t.payment.fulfilment, fulfilment],
                [t.payment.method, payment],
                [t.payment.amountDue, amount],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <ButtonLink href={href(routes.orderConfirmation)} block size="lg">
            {fill(t.track, { id: order.id })} <Icon name="arrowRight" className="h-4 w-4" />
          </ButtonLink>
          <div className="flex justify-between text-sm font-semibold text-accent">
            <span>{t.notifications} →</span>
            <span>{t.myOrders} →</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OrderLineRow from "@/components/shared/order/OrderLineRow";
import StepIndicator from "@/components/shared/order/StepIndicator";
import SummaryRows from "@/components/shared/order/SummaryRows";
import Breadcrumb from "@/components/shared/ui/Breadcrumb";
import { Button, ButtonLink } from "@/components/shared/ui/Button";
import { TextAreaField, TextField } from "@/components/shared/ui/Field";
import Icon from "@/components/shared/ui/Icon";
import { fulfilmentOptions, paymentMethods, type FulfilmentId, type PaymentMethodId } from "@/data/checkout";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useGetBusinessQuery } from "@/lib/redux/api/businessApi";
import { useGetMenuBundleQuery } from "@/lib/redux/api/menuApi";
import { updateSession, useSession } from "@/lib/auth/session";
import { rememberGuest, useGuest } from "@/lib/guest";
import { normalizePhone } from "@/lib/phone";
import { clearCart, useCart } from "@/lib/cart/cart";
import { summarize } from "@/lib/cart/pricing";
import { useHydrated } from "@/lib/create-store";
import { fill, formatPrice, plural } from "@/lib/format";
import { placeOrder } from "@/lib/orders";
import { localePath, routes } from "@/lib/routes";
import RadioCard from "./RadioCard";
import SignInGate from "./SignInGate";

const card = "rounded-3xl border border-border bg-card p-6 sm:p-7";

/** Only the dictionary parts this client component needs (keeps the page payload small). */
type CheckoutDicts = Pick<Dictionary, "common" | "cart" | "checkout">;

/** Who places the order: a signed-in client, or a guest (name and phone only, typed at checkout). */
type Customer =
  | { kind: "account"; name: string; email: string; phone?: string; clientCode: string }
  | { kind: "guest"; name?: string; phone?: string };

export default function CheckoutView({ lang, dict }: { lang: Locale; dict: CheckoutDicts }) {
  const hydrated = useHydrated();
  const user = useSession();
  const guest = useGuest();
  const lines = useCart();
  const router = useRouter();
  // Set once the order is placed: avoids flashing "empty cart" while navigating to the confirmation
  const [placed, setPlaced] = useState(false);
  // Signed-out visitors choose: sign in, or continue as a guest on this same page
  const [asGuest, setAsGuest] = useState(false);
  const href = (path: string) => localePath(lang, path);
  const signInHref = `${href(routes.signIn)}?next=${encodeURIComponent(href(routes.checkout))}`;

  if (!hydrated || placed) return <div className="min-h-[60vh]" />;

  if (!user && !asGuest) {
    return <SignInGate href={signInHref} dict={dict.checkout.gate} onGuest={() => setAsGuest(true)} />;
  }

  // A returning guest finds the name and phone of the last order prefilled
  const customer: Customer = user
    ? { kind: "account", name: user.name, email: user.email, phone: user.phone, clientCode: user.clientCode }
    : { kind: "guest", ...guest };

  if (!lines.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg text-muted-foreground">{dict.cart.empty}</p>
        <ButtonLink href={href(routes.menu)} size="lg" className="mt-6">
          {dict.cart.browseMenu}
        </ButtonLink>
      </div>
    );
  }

  return (
    <CheckoutForm
      // Remount if another account signs in, so the contact fields are prefilled again
      key={customer.kind === "account" ? customer.email : "guest"}
      lang={lang}
      dict={dict}
      customer={customer}
      signInHref={signInHref}
      signUpHref={href(routes.signUp)}
      lines={lines}
      onPlaced={() => {
        setPlaced(true);
        clearCart();
        router.push(href(routes.orderConfirmation));
      }}
    />
  );
}

function CheckoutForm({
  lang,
  dict,
  customer,
  signInHref,
  signUpHref,
  lines,
  onPlaced,
}: {
  lang: Locale;
  dict: CheckoutDicts;
  customer: Customer;
  signInHref: string;
  signUpHref: string;
  lines: ReturnType<typeof useCart>;
  onPlaced: () => void;
}) {
  const t = dict.checkout;
  const [fulfilment, setFulfilment] = useState<FulfilmentId>("pickup");
  const [payment, setPayment] = useState<PaymentMethodId>("pay-on-pickup");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: catalogue, isLoading: menuLoading, isError: menuError } = useGetMenuBundleQuery();
  const { data: businessInfo, isLoading: businessLoading, isError: businessError } = useGetBusinessQuery();
  const href = (path: string) => localePath(lang, path);

  if (menuLoading || businessLoading) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (menuError || businessError || !catalogue || !businessInfo) {
    return <p role="alert" className="page-container py-20 text-center">{t.orderFailed}</p>;
  }

  const deliveryFees = fulfilment === "delivery" ? businessInfo.fees.delivery : 0;
  const { count, subtotal, fees, total } = summarize(
    lines,
    catalogue.items,
    catalogue.optionGroups,
    businessInfo.fees.service + deliveryFees,
  );
  const items = plural(dict.cart.itemCount, count);
  const method = paymentMethods.find((m) => m.id === payment)!;
  const fulfilmentLabel = localize(fulfilmentOptions.find((f) => f.id === fulfilment)!.label, lang);
  const dueText =
    payment === "pay-on-pickup"
      ? fill(t.payment.dueOnPickup, { amount: formatPrice(total) })
      : fill(t.payment.dueMobile, { amount: formatPrice(total), method: localize(method.label, lang) });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    if (!value("name") || !value("phone")) {
      setError(t.required);
      return;
    }
    const phone = normalizePhone(value("phone"));
    if (!phone) {
      setError(t.invalidPhone);
      return;
    }
    if (customer.kind === "guest") rememberGuest({ name: value("name"), phone });
    // Accounts created with Google have no phone yet: keep the one typed here for next time
    else if (!customer.phone) updateSession({ phone });
    setSubmitting(true);
    try {
      await placeOrder({
        clientName: value("name"),
        clientCode: customer.kind === "account" ? customer.clientCode : "",
        guest: customer.kind === "guest" || undefined,
        phone,
        email: (customer.kind === "account" && value("email")) || undefined,
        fulfilment,
        address: fulfilment === "delivery" ? value("address") : undefined,
        payment,
        notes: value("notes") || undefined,
        lines,
      });
      onPlaced();
    } catch {
      setError(t.orderFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container py-10">
      <Breadcrumb
        items={[
          { label: dict.common.nav.home, href: href(routes.home) },
          { label: dict.cart.breadcrumb, href: href(routes.cart) },
          { label: t.breadcrumb },
        ]}
      />
      <h1 className="mt-4 text-4xl">{t.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
      <StepIndicator current="checkout" dict={dict.cart.steps} />

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_29.375rem]">
        <div className="space-y-6">
          {customer.kind === "account" ? (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-soft p-6">
              <div>
                <p className="text-[0.6875rem] font-bold uppercase text-muted-foreground">{t.account.kicker}</p>
                <p className="mt-1 text-xl font-bold">
                  {customer.name} · {t.account.role}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[0.6875rem] font-bold uppercase text-muted-foreground">{t.account.codeKicker}</p>
                <p className="text-2xl font-bold text-accent">{customer.clientCode}</p>
                <p className="text-[0.6875rem] text-muted-foreground">{t.account.codeHelp}</p>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-soft p-6">
              <p className="text-[0.6875rem] font-bold uppercase text-muted-foreground">{t.guest.kicker}</p>
              <p className="mt-1 text-xl font-bold">{t.guest.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t.guest.text}</p>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4 text-xs">
                <Link href={signInHref} className="font-semibold text-accent hover:underline">
                  {t.guest.signIn}
                </Link>
                <Link href={signUpHref} className="font-semibold text-accent hover:underline">
                  {t.guest.createAccount}
                </Link>
              </p>
            </section>
          )}

          <section className={card}>
            <h2 className="text-xl">{t.contact.title}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label={t.contact.fullName} name="name" defaultValue={customer.name} autoComplete="name" required />
              <TextField
                label={t.contact.phone}
                name="phone"
                type="tel"
                defaultValue={customer.phone}
                placeholder={t.contact.phonePlaceholder}
                autoComplete="tel"
                required
              />
              {/* Guests: name and phone only */}
              {customer.kind === "account" && (
                <TextField
                  label={t.contact.email}
                  name="email"
                  type="email"
                  defaultValue={customer.email}
                  placeholder={t.contact.emailPlaceholder}
                  autoComplete="email"
                  className="sm:col-span-2"
                />
              )}
            </div>
          </section>

          <section className={card}>
            <h2 className="text-xl">{t.fulfilment.title}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {fulfilmentOptions.map((option) => (
                <RadioCard
                  key={option.id}
                  name="fulfilment"
                  value={option.id}
                  checked={fulfilment === option.id}
                  onChange={(v) => setFulfilment(v as FulfilmentId)}
                >
                  {localize(option.label, lang)}
                </RadioCard>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {fulfilment === "pickup" ? t.fulfilment.pickupHelp : t.fulfilment.deliveryHelp}
            </p>
            {/* Not in the design: the delivery address appears only when Delivery is chosen */}
            {fulfilment === "delivery" && (
              <TextField
                label={t.fulfilment.address}
                name="address"
                placeholder={t.fulfilment.addressPlaceholder}
                autoComplete="street-address"
                required
                className="mt-4"
              />
            )}
          </section>

          <section className={card}>
            <h2 className="text-xl">{t.payment.title}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((option, i) => (
                <RadioCard
                  key={option.id}
                  name="payment"
                  value={option.id}
                  checked={payment === option.id}
                  onChange={(v) => setPayment(v as PaymentMethodId)}
                  className={i === 0 ? "sm:col-span-2" : undefined}
                >
                  {localize(option.label, lang)}
                </RadioCard>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{dueText}</p>
          </section>

          <section className={card}>
            <h2 className="text-xl">{t.notes.title}</h2>
            <TextAreaField label={t.notes.label} name="notes" placeholder={t.notes.placeholder} className="mt-5" />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl">{t.sidebar.title}</h2>
              <Link href={href(routes.cart)} className="text-sm font-semibold text-accent hover:underline">
                {t.sidebar.editCart}
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{fill(t.sidebar.meta, { items })}</p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {lines.map((line) => (
                <OrderLineRow key={line.id} line={line} lang={lang} />
              ))}
            </ul>
            <div className="mt-4">
              <SummaryRows subtotal={subtotal} fees={fees} total={total} dict={dict.cart.summary} />
            </div>
            <div className="mt-5 rounded-xl bg-input p-4">
              <p className="text-sm font-bold">
                {fulfilmentLabel} · {localize(method.summary, lang)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t.sidebar.pendingNote}</p>
            </div>
            {error && (
              <p role="alert" className="mt-4 text-sm font-semibold text-danger">
                {error}
              </p>
            )}
            <Button type="submit" block size="lg" className="mt-5" disabled={submitting}>
              {fill(t.sidebar.placeOrder, { amount: formatPrice(total) })}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">{t.sidebar.helper}</p>
          </section>
          <Link href={href(routes.cart)} className="mt-5 inline-flex items-center gap-1 font-semibold text-accent hover:underline">
            <Icon name="arrowLeft" className="h-4 w-4" /> {t.sidebar.backToCart}
          </Link>
        </aside>
      </form>
    </div>
  );
}

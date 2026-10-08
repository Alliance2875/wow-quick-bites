"use client";

import Link from "next/link";
import StepIndicator from "@/components/shared/order/StepIndicator";
import SummaryRows from "@/components/shared/order/SummaryRows";
import Breadcrumb from "@/components/shared/ui/Breadcrumb";
import { ButtonLink } from "@/components/shared/ui/Button";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useSession } from "@/lib/auth/session";
import { useCart } from "@/lib/cart/cart";
import { useHydrated } from "@/lib/create-store";
import { summarize } from "@/lib/cart/pricing";
import { fill, plural } from "@/lib/format";
import { localePath, routes } from "@/lib/routes";
import CartLineItem from "./CartLineItem";

export default function CartView({
  lang,
  dict,
  common,
}: {
  lang: Locale;
  dict: Dictionary["cart"];
  common: Dictionary["common"];
}) {
  const hydrated = useHydrated();
  const lines = useCart();
  const user = useSession();
  const { count, subtotal, fees, total } = summarize(lines);
  const href = (path: string) => localePath(lang, path);
  const items = plural(dict.itemCount, count);

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl">{dict.title}</h1>
          <ButtonLink href={href(routes.menu)} variant="outline">
            <Icon name="plus" className="h-4 w-4" /> {dict.addMore}
          </ButtonLink>
        </div>
        <div className="py-24 text-center">
          <p className="text-lg text-muted-foreground">{dict.empty}</p>
          <ButtonLink href={href(routes.menu)} size="lg" className="mt-6">
            {dict.browseMenu}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <Breadcrumb items={[{ label: common.nav.home, href: href(routes.home) }, { label: dict.breadcrumb }]} />
      <h1 className="mt-4 text-4xl">{dict.title}</h1>
      <p className="mt-2 text-muted-foreground">{dict.subtitle}</p>
      <StepIndicator current="cart" dict={dict.steps} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_27.375rem]">
        <div>
          <section className="rounded-3xl bg-card p-6 light:border light:border-border sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl">{dict.itemsTitle}</h2>
              <span className="text-sm text-muted-foreground">{items}</span>
            </div>
            <ul className="divide-y divide-border">
              {lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  lang={lang}
                  dict={dict}
                  stepperLabels={{ decrease: common.options.decrease, increase: common.options.increase }}
                />
              ))}
            </ul>
          </section>
          <Link href={href(routes.menu)} className="mt-5 inline-flex items-center gap-1 font-semibold text-accent hover:underline">
            <Icon name="arrowLeft" className="h-4 w-4" /> {dict.continueShopping}
          </Link>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl bg-card p-6 light:border light:border-border sm:p-7">
            <h2 className="text-xl">{dict.summary.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{fill(dict.summary.meta, { items })}</p>
            <div className="mt-4 border-t border-border pt-4">
              <SummaryRows subtotal={subtotal} fees={fees} total={total} dict={dict.summary} />
            </div>
            <ButtonLink href={href(routes.checkout)} block size="lg" className="mt-6">
              {dict.proceed} <Icon name="arrowRight" className="h-4 w-4" />
            </ButtonLink>
            <p className="mt-3 text-xs text-muted-foreground">{dict.proceedHelper}</p>
          </section>

          {user && (
            <section className="rounded-2xl bg-soft p-6">
              <p className="text-sm font-bold">{fill(dict.shoppingAs, { name: user.name })}</p>
              <p className="mt-1 text-xs text-muted-foreground">{fill(dict.clientCode, { code: user.clientCode })}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

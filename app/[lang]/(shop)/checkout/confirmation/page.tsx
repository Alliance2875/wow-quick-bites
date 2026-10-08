import type { Metadata } from "next";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout/confirmation">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.order.breadcrumb };
}

export default async function ConfirmationPage({ params }: PageProps<"/[lang]/checkout/confirmation">) {
  const { lang, dict } = await resolveLang(params);
  return (
    <OrderConfirmation
      lang={lang}
      dict={{ common: dict.common, cart: dict.cart, checkout: dict.checkout, order: dict.order }}
    />
  );
}

import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.checkout.title };
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
  const { lang, dict } = await resolveLang(params);
  return <CheckoutView lang={lang} dict={{ common: dict.common, cart: dict.cart, checkout: dict.checkout }} />;
}

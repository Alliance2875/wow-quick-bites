import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/cart">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.cart.title };
}

export default async function CartPage({ params }: PageProps<"/[lang]/cart">) {
  const { lang, dict } = await resolveLang(params);
  return <CartView lang={lang} dict={dict.cart} common={dict.common} />;
}

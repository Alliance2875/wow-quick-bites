import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientOrderView from "@/components/client-area/ClientOrderView";
import { orders } from "@/data/orders";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { fill } from "@/lib/format";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/account/orders/[id]">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  const { id } = await params;
  return { title: fill(dict.clientArea.meta.order, { id }) };
}

export default async function AccountOrderPage({ params }: PageProps<"/[lang]/account/orders/[id]">) {
  const { lang, dict } = await resolveLang(params);
  const { id } = await params;
  const viewer = await requireViewer(lang, routes.accountOrder(id), { roles: ["client"] });

  // A client only sees their own purchases (same 404 whether the order exists or not)
  const order = orders.find((o) => o.id === id);
  if (!order || order.clientCode !== viewer.clientCode) notFound();

  return (
    <ClientOrderView
      lang={lang}
      orderId={order.id}
      viewer={{ name: viewer.name, clientCode: viewer.clientCode ?? "" }}
      dict={{ portal: dict.portal, clientArea: dict.clientArea }}
    />
  );
}

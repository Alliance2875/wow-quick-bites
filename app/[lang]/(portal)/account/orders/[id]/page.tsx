import type { Metadata } from "next";
import ClientOrderView from "@/components/client-area/ClientOrderView";
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

  return (
    <ClientOrderView
      lang={lang}
      orderId={id}
      viewer={{ name: viewer.name, clientCode: viewer.clientCode ?? "" }}
      dict={{ portal: dict.portal, clientArea: dict.clientArea }}
    />
  );
}

import type { Metadata } from "next";
import ClientOrders from "@/components/client-area/ClientOrders";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/account/orders">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.clientArea.meta.orders };
}

export default async function AccountOrdersPage({ params }: PageProps<"/[lang]/account/orders">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.accountOrders, { roles: ["client"] });

  return (
    <ClientOrders
      lang={lang}
      viewer={{ name: viewer.name, clientCode: viewer.clientCode ?? "" }}
      dict={{ portal: dict.portal, clientArea: dict.clientArea }}
    />
  );
}

import type { Metadata } from "next";
import ClientNotifications from "@/components/client-area/ClientNotifications";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/account/notifications">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.clientArea.meta.notifications };
}

export default async function AccountNotificationsPage({ params }: PageProps<"/[lang]/account/notifications">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.accountNotifications, { roles: ["client"] });

  return (
    <ClientNotifications
      lang={lang}
      viewer={{ name: viewer.name, clientCode: viewer.clientCode ?? "" }}
      dict={{ portal: dict.portal, clientArea: dict.clientArea }}
    />
  );
}

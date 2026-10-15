import type { Metadata } from "next";
import ClientDashboard from "@/components/client-area/ClientDashboard";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/account">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.clientArea.meta.dashboard };
}

export default async function AccountPage({ params }: PageProps<"/[lang]/account">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.account, { roles: ["client"] });

  return (
    <ClientDashboard
      lang={lang}
      viewer={{ name: viewer.name, clientCode: viewer.clientCode ?? "" }}
      dict={{ portal: dict.portal, clientArea: dict.clientArea }}
    />
  );
}

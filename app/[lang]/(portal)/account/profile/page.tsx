import type { Metadata } from "next";
import ClientProfile from "@/components/client-area/ClientProfile";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/account/profile">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.clientArea.meta.profile };
}

export default async function AccountProfilePage({ params }: PageProps<"/[lang]/account/profile">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.accountProfile, { roles: ["client"] });

  return (
    <ClientProfile
      lang={lang}
      viewer={{ name: viewer.name, clientCode: viewer.clientCode ?? "" }}
      dict={{ portal: dict.portal, clientArea: dict.clientArea }}
    />
  );
}

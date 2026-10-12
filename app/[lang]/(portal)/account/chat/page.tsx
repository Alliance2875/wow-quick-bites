import type { Metadata } from "next";
import ClientChat from "@/components/client-area/ClientChat";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/account/chat">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.clientArea.meta.chat };
}

export default async function AccountChatPage({ params }: PageProps<"/[lang]/account/chat">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.accountChat, { roles: ["client"] });

  return (
    <ClientChat
      lang={lang}
      viewer={{ name: viewer.name, clientCode: viewer.clientCode ?? "" }}
      dict={{ portal: dict.portal, clientArea: dict.clientArea }}
    />
  );
}

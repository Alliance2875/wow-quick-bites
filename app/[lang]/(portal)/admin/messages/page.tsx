import type { Metadata } from "next";
import StaffMessages from "@/components/admin/StaffMessages";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/messages">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.staff.meta.messages };
}

export default async function StaffMessagesPage({ params, searchParams }: PageProps<"/[lang]/admin/messages">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.adminMessages, {
    roles: ["manager", "superadmin"],
    anyPermission: ["messages:reply"],
  });
  const { client } = await searchParams;

  return (
    <StaffMessages
      // A new ?client= from a link (order detail → "Message Aline") selects that conversation
      key={typeof client === "string" ? client : "inbox"}
      lang={lang}
      viewer={{ id: viewer.id, role: viewer.role as "manager" | "superadmin", name: viewer.name }}
      initialClient={typeof client === "string" ? client : undefined}
      dict={{ portal: dict.portal, staff: dict.staff }}
    />
  );
}

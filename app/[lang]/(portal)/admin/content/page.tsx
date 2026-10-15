import type { Metadata } from "next";
import ContentWorkspace from "@/components/admin/content/ContentWorkspace";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/content">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.staff.meta.content };
}

export default async function ContentPage({ params }: PageProps<"/[lang]/admin/content">) {
  const { lang, dict } = await resolveLang(params);
  // Managers get here only through an active content grant (menu or ads permission)
  const viewer = await requireViewer(lang, routes.adminContent, {
    roles: ["manager", "superadmin"],
    anyPermission: ["menu:edit", "ads:manage"],
  });

  return <ContentWorkspace lang={lang} viewer={viewer} dict={{ portal: dict.portal, staff: dict.staff }} />;
}

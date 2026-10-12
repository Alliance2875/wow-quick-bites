import type { Metadata } from "next";
import AdminOverview from "@/components/admin/AdminOverview";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.staff.meta.overview };
}

export default async function AdminOverviewPage({ params }: PageProps<"/[lang]/admin">) {
  const { lang, dict } = await resolveLang(params);
  await requireViewer(lang, routes.admin, { roles: ["superadmin"], anyPermission: ["overview:view"] });

  return <AdminOverview lang={lang} dict={{ portal: dict.portal, staff: dict.staff }} />;
}

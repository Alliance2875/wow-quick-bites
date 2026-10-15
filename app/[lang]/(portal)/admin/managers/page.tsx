import type { Metadata } from "next";
import ManagersWorkspace from "@/components/admin/ManagersWorkspace";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/managers">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.staff.meta.managers };
}

export default async function ManagersPage({ params, searchParams }: PageProps<"/[lang]/admin/managers">) {
  const { lang, dict } = await resolveLang(params);
  // Access administration is never delegated: superadmin only
  const viewer = await requireViewer(lang, routes.adminManagers, { roles: ["superadmin"], anyPermission: ["managers:manage"] });
  const { manager } = await searchParams;

  return (
    <ManagersWorkspace
      lang={lang}
      viewerId={viewer.id}
      initialManager={typeof manager === "string" ? manager : undefined}
      dict={{ portal: dict.portal, staff: dict.staff }}
    />
  );
}

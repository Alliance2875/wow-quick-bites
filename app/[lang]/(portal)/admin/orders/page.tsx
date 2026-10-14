import type { Metadata } from "next";
import OrderQueue from "@/components/admin/OrderQueue";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/orders">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.staff.meta.queue };
}

export default async function OrderQueuePage({ params, searchParams }: PageProps<"/[lang]/admin/orders">) {
  const { lang, dict } = await resolveLang(params);
  const { selected } = await searchParams;
  const viewer = await requireViewer(lang, routes.adminOrders, {
    roles: ["manager", "superadmin"],
    anyPermission: ["orders:process"],
  });

  return (
    <OrderQueue
      lang={lang}
      viewer={{ id: viewer.id, role: viewer.role as "manager" | "superadmin", name: viewer.name }}
      dict={{ portal: dict.portal, staff: dict.staff }}
      selectedOrderId={typeof selected === "string" ? selected : undefined}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StaffOrderView from "@/components/admin/StaffOrderView";
import { orders } from "@/data/orders";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { fill } from "@/lib/format";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/orders/[id]">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  const { id } = await params;
  return { title: fill(dict.staff.meta.order, { id }) };
}

export default async function StaffOrderPage({ params }: PageProps<"/[lang]/admin/orders/[id]">) {
  const { lang, dict } = await resolveLang(params);
  const { id } = await params;
  const viewer = await requireViewer(lang, routes.adminOrder(id), {
    roles: ["manager", "superadmin"],
    anyPermission: ["orders:process"],
  });
  if (!orders.some((o) => o.id === id)) notFound();

  return (
    <StaffOrderView
      lang={lang}
      orderId={id}
      viewer={{ id: viewer.id, role: viewer.role as "manager" | "superadmin", name: viewer.name }}
      dict={{ portal: dict.portal, staff: dict.staff }}
    />
  );
}

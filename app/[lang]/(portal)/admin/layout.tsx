import type { Metadata } from "next";
import PortalShell from "@/components/portal/shell/PortalShell";
import { orders } from "@/data/orders";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { isActiveOrder, newestFirst } from "@/lib/portal/orders";
import { localePath, routes } from "@/lib/routes";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Staff portal shell (managers + superadmin). Each page also calls requireViewer() with its own rule.
export default async function AdminLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.adminOrders, { roles: ["manager", "superadmin"] });

  // "Order detail" opens the register's current order (the viewer's own one for a manager)
  const current = [...orders]
    .filter((o) => isActiveOrder(o) && (viewer.role === "superadmin" || o.managerId === viewer.id))
    .sort((a, b) => (a.stage === "preparing" ? -1 : b.stage === "preparing" ? 1 : newestFirst(a, b)))[0];

  return (
    <PortalShell
      lang={lang}
      viewer={viewer}
      dict={dict.portal}
      orderDetailHref={current && localePath(lang, routes.adminOrder(current.id))}
      extraCrumbs={[
        {
          href: localePath(lang, routes.adminOrders),
          section: dict.portal.sections.manager,
          label: dict.portal.nav.orderDetail,
          childrenOnly: true,
        },
        {
          href: localePath(lang, routes.adminContent),
          section: viewer.role === "superadmin" ? dict.portal.sections.superadmin : dict.portal.sections.manager,
          label: dict.portal.nav.menuAds,
        },
      ]}
    >
      {children}
    </PortalShell>
  );
}

import type { Metadata } from "next";
import PortalShell from "@/components/portal/shell/PortalShell";
import { resolveLang } from "@/i18n/get-dictionary";
import { requireViewer } from "@/lib/auth/dal";
import { localePath, routes } from "@/lib/routes";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Client area shell. Each page also calls requireViewer() (layouts are not re-run on navigation).
export default async function AccountLayout({ children, params }: LayoutProps<"/[lang]/account">) {
  const { lang, dict } = await resolveLang(params);
  const viewer = await requireViewer(lang, routes.account, { roles: ["client"] });

  return (
    <PortalShell
      lang={lang}
      viewer={viewer}
      dict={dict.portal}
      common={dict.common}
      extraCrumbs={[
        {
          href: localePath(lang, routes.accountOrders),
          section: dict.portal.roles.client,
          label: dict.clientArea.crumbs.orderTracking,
          childrenOnly: true,
        },
      ]}
    >
      {children}
    </PortalShell>
  );
}

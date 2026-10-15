import Image from "next/image";
import Link from "next/link";
import LanguageToggle from "@/components/shared/layout/LanguageToggle";
import SignOutButton from "@/components/shared/layout/SignOutButton";
import SiteHeader from "@/components/shared/layout/SiteHeader";
import ThemeToggle from "@/components/shared/layout/ThemeToggle";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Viewer } from "@/lib/auth/dal";
import { fill } from "@/lib/format";
import { localePath, routes } from "@/lib/routes";
import Breadcrumbs, { type Crumb } from "./Breadcrumbs";
import NavMenu, { type NavSection } from "./NavMenu";
import ShellFrame from "./ShellFrame";
import ThemeRow from "./ThemeRow";

/** Sidebar sections for each role (labels from the portal dictionary). */
function navigation(lang: Locale, viewer: Viewer, dict: Dictionary["portal"]): NavSection[] {
  const href = (path: string) => localePath(lang, path);
  const nav = dict.nav;

  if (viewer.role === "client") {
    return [
      {
        label: dict.sections.myAccount,
        items: [
          { href: href(routes.account), label: nav.dashboard, icon: "layoutGrid", exact: true },
          { href: href(routes.accountOrders), label: nav.myOrders, icon: "shoppingBag" },
          { href: href(routes.accountNotifications), label: nav.notifications, icon: "bell", badge: "clientNotifications" },
          { href: href(routes.accountProfile), label: nav.profile, icon: "user" },
        ],
      },
    ];
  }

  const managerSection: NavSection = {
    label: dict.sections.manager,
    items: [
      { href: href(routes.adminOrders), label: nav.orderQueue, exact: true },
      // Managers see Menu & Ads only while a content grant is active
      ...(viewer.role === "manager" && viewer.contentGrant ? [{ href: href(routes.adminContent), label: nav.menuAds }] : []),
    ],
  };

  if (viewer.role === "manager") return [managerSection];

  return [
    {
      label: dict.sections.superadmin,
      items: [
        { href: href(routes.admin), label: nav.overview, exact: true },
        { href: href(routes.adminContent), label: nav.menuAds },
        { href: href(routes.adminManagers), label: nav.managers },
        { href: `${href(routes.adminContent)}#business`, label: nav.businessSettings, anchor: true },
        { href: `${href(routes.adminContent)}#audit`, label: nav.auditLog, anchor: true },
      ],
    },
    managerSection,
  ];
}

export default function PortalShell({
  lang,
  viewer,
  dict,
  common,
  extraCrumbs = [],
  children,
}: {
  lang: Locale;
  viewer: Viewer;
  dict: Dictionary["portal"];
  /** Client area: the storefront header (yellow navbar) is shown on top, as in the designs */
  common?: Dictionary["common"];
  /** Pages that are not in the sidebar (client order tracking…) */
  extraCrumbs?: Crumb[];
  children: React.ReactNode;
}) {
  const sections = navigation(lang, viewer, dict);
  const crumbs: Crumb[] = [
    ...sections.flatMap((section) =>
      section.items
        .filter((item) => !item.anchor)
        // Design: "Client / Dashboard", "Superadmin / Overview", "Manager / Order queue"
        .map((item) => ({ ...item, section: viewer.role === "client" ? dict.roles.client : section.label })),
    ),
    ...extraCrumbs,
  ];
  const home = localePath(lang, viewer.role === "client" ? routes.account : viewer.role === "manager" ? routes.adminOrders : routes.admin);
  const themeLabels = { dark: dict.shell.themeDark, light: dict.shell.themeLight };
  const roleLine =
    viewer.role === "superadmin"
      ? dict.roleLine.superadmin
      : viewer.role === "manager" && viewer.assignment
        ? fill(dict.roleLine.manager, { assignment: dict.assignment[viewer.assignment] })
        : viewer.role === "manager"
          ? dict.roles.manager
        : dict.roles.client;

  const siteHeader = viewer.role === "client" && common ? <SiteHeader lang={lang} dict={common} /> : undefined;

  const sidebar = (
    <div className={`flex h-full flex-col overflow-y-auto px-4 pb-5 ${siteHeader ? "pt-14 lg:pt-6" : "pt-6"}`}>
      {/* The storefront header already shows the logo in the client area */}
      {!siteHeader && (
      <Link href={home} className="block w-fit px-2">
        <span className="grid h-16 w-[5.25rem] place-items-center rounded-md bg-primary">
          <Image src="/logo.png" alt="" width={369} height={307} sizes="80px" preload className="h-[3.4rem] w-auto" />
        </span>
        <span className="mt-4 block text-base font-bold leading-tight">WOW Quick Bites</span>
        <span className="mt-1 block text-[0.6875rem] text-muted-foreground">{dict.byline}</span>
      </Link>
      )}

      <p className={`${siteHeader ? "" : "mt-5 "}rounded-lg bg-panel-muted px-3 py-3 text-[0.8125rem] leading-snug`}>{dict.workspace[viewer.role]}</p>

      <NavMenu sections={sections} viewer={{ id: viewer.id, role: viewer.role, clientCode: viewer.clientCode }} label={dict.shell.mainNav} />

      {viewer.role === "client" && viewer.clientCode && (
        <div className="mt-6 rounded-lg bg-soft p-3">
          <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">{dict.shell.clientCode.label}</p>
          <p className="mt-1.5 text-lg font-bold text-accent">{viewer.clientCode}</p>
          <p className="mt-2 text-[0.6875rem] leading-snug text-muted-foreground">{dict.shell.clientCode.text}</p>
        </div>
      )}

      {viewer.role === "manager" && viewer.contentGrant && (
        <div className="mt-6 rounded-lg bg-soft p-4 text-[0.8125rem] text-accent">
          <p className="font-bold">{dict.shell.grant.title}</p>
          <p className="mt-1 leading-snug">{dict.shell.grant.text}</p>
        </div>
      )}

      <div className="mt-auto space-y-4 pt-8">
        <Link
          href={localePath(lang, routes.home)}
          className="flex items-center gap-2 px-2 text-[0.8125rem] text-muted-foreground transition hover:text-foreground"
        >
          <Icon name="externalLink" className="h-4 w-4" />
          {dict.shell.viewStorefront}
        </Link>
        {viewer.role === "client" && <ThemeRow labels={themeLabels} />}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-bold">
              {viewer.name}
              {viewer.role === "client" && ` · ${dict.roles.client}`}
            </p>
            {viewer.role !== "client" && <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">{roleLine}</p>}
          </div>
          {viewer.role !== "client" && (
            <SignOutButton
              lang={lang}
              label={dict.shell.signOut}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-panel-muted hover:text-foreground"
            >
              <Icon name="logOut" className="h-4 w-4" />
            </SignOutButton>
          )}
        </div>
        {viewer.role === "client" && (
          <SignOutButton
            lang={lang}
            className="-mt-2 flex items-center gap-2 text-[0.8125rem] text-muted-foreground transition hover:text-foreground"
          >
            <Icon name="logOut" className="h-4 w-4" />
            {dict.shell.signOut}
          </SignOutButton>
        )}
      </div>
    </div>
  );

  const topbar = (
    <>
      <div className="hidden min-w-0 flex-1 sm:block">
        <Breadcrumbs crumbs={crumbs} label={dict.shell.breadcrumb} />
      </div>
      <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3 lg:flex-1">
        <ThemeToggle labels={themeLabels} variant="portal" />
        <LanguageToggle lang={lang} label={dict.shell.language} variant="portal" />
      </div>
    </>
  );

  return (
    <ShellFrame sidebar={sidebar} topbar={topbar} siteHeader={siteHeader} labels={{ open: dict.shell.openMenu, close: dict.shell.closeMenu }}>
      {children}
    </ShellFrame>
  );
}

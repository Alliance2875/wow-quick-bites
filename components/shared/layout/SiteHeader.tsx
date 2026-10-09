import Icon from "@/components/shared/ui/Icon";
import Logo from "@/components/shared/ui/Logo";
import { ButtonLink } from "@/components/shared/ui/Button";
import { mainNav } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localePath, routes } from "@/lib/routes";
import AccountButton from "./AccountButton";
import CartButton from "./CartButton";
import LanguageToggle from "./LanguageToggle";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary["common"] }) {
  const href = (path: string) => localePath(lang, path);
  const links = mainNav.map((item) => ({ label: dict.nav[item.key], href: href(item.href) }));
  const themeLabels = { dark: dict.header.themeDark, light: dict.header.themeLight };

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="page-container flex h-20 items-center justify-between gap-3">
        <Logo href={href(routes.home)} brand={dict.brand} preload />

        <NavLinks links={links} className="hidden items-center gap-7 text-sm font-semibold lg:flex" />

        <div className="hidden items-center gap-3 xl:flex">
          <ThemeToggle labels={themeLabels} />
          <LanguageToggle lang={lang} label={dict.header.language} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ButtonLink href={href(routes.menu)} variant="onPrimary" className="hidden sm:inline-flex">
            {dict.header.orderNow}
          </ButtonLink>
          <CartButton href={href(routes.cart)} label={dict.header.cart} />
          <AccountButton
            signInHref={href(routes.signIn)}
            labels={{ signIn: dict.header.signIn, signOut: dict.header.signOut }}
          />

          {/* Mobile menu — <details> needs no JS state */}
          <details className="group relative xl:hidden">
            <summary
              aria-label={dict.header.openMenu}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-primary-foreground/10"
            >
              <Icon name="menu" className="h-6 w-6 group-open:hidden" />
              <Icon name="x" className="hidden h-6 w-6 group-open:block" />
            </summary>
            <div className="absolute right-0 top-14 flex w-64 flex-col gap-3 rounded-2xl bg-card p-4 text-foreground shadow-glow">
              <NavLinks links={links} className="flex flex-col gap-3 text-sm font-semibold lg:hidden" />
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3 lg:border-0 lg:pt-0">
                <ThemeToggle labels={themeLabels} />
                <LanguageToggle lang={lang} label={dict.header.language} />
              </div>
              <ButtonLink href={href(routes.menu)} block className="sm:hidden">
                {dict.header.orderNow}
              </ButtonLink>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

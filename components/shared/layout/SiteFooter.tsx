import Link from "next/link";
import Icon from "@/components/shared/ui/Icon";
import Logo from "@/components/shared/ui/Logo";
import { categories } from "@/data/categories";
import { mainNav } from "@/data/navigation";
import { site } from "@/data/site";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localePath, routes } from "@/lib/routes";

export default function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary["common"] }) {
  const href = (path: string) => localePath(lang, path);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-container grid gap-10 py-11 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo href={href(routes.home)} brand={dict.brand} size="lg" />
          <p className="mt-3 text-sm text-muted-foreground">{dict.footer.tagline}</p>
          <p className="mt-6 text-sm font-bold">{dict.footer.followUs}</p>
          <ul className="mt-2 flex gap-3 text-muted-foreground">
            {site.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} aria-label={social.label} className="hover:text-accent">
                  <Icon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <FooterColumn title={dict.footer.quickLinks}>
          {mainNav.map((item) => (
            <FooterLink key={item.key} href={href(item.href)}>
              {dict.nav[item.key]}
            </FooterLink>
          ))}
          <FooterLink href={href(routes.menu)}>{dict.footer.orderNow}</FooterLink>
        </FooterColumn>

        <FooterColumn title={dict.footer.categories}>
          {categories.map((category) => (
            <FooterLink key={category.id} href={`${href(routes.menu)}?category=${category.id}`}>
              {localize(category.name, lang)}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title={dict.footer.owner}>
          <li>{site.owner}</li>
        </FooterColumn>
      </div>
      <div className="border-t border-border">
        <p className="page-container py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {dict.brand}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-bold text-accent">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}

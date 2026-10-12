"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { locales, rememberLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/format";
import { switchLocalePath } from "@/lib/routes";

// One switch: a click anywhere on the pill goes to the other language (same page, same query).
// A plain <a> (full page load) on purpose: switching [lang] remounts the root layout, and a soft
// navigation would lose the theme set on <html>. The pages are static, so the reload is instant.
// Design: current language first and highlighted ("EN / FR" or "FR / EN").
type Props = { lang: Locale; label: string; /** portal = bordered pill on the portal top bar */ variant?: "header" | "portal" };

export default function LanguageToggle(props: Props) {
  // useSearchParams needs a Suspense boundary on statically generated pages
  return (
    <Suspense fallback={<Pill {...props} />}>
      <LanguageLink {...props} />
    </Suspense>
  );
}

function LanguageLink({ lang, label, variant }: Props) {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const other = locales.find((l) => l !== lang) ?? lang;
  const href = switchLocalePath(pathname, other) + (query ? `?${query}` : "");

  return (
    <a href={href} hrefLang={other} aria-label={label} onClick={() => rememberLocale(other)}>
      <Pill lang={lang} label={label} variant={variant} />
    </a>
  );
}

function Pill({ lang, variant = "header" }: Props) {
  const ordered = [lang, ...locales.filter((l) => l !== lang)];
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full p-1 text-xs font-semibold transition",
        variant === "header"
          ? "bg-background hover:ring-2 hover:ring-primary-foreground/30 light:bg-white"
          : "border border-border bg-panel pr-3 hover:border-primary/60",
      )}
    >
      {ordered.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">/</span>}
          <span
            className={
              locale === lang
                ? "grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"
                : "grid h-7 w-7 place-items-center rounded-full text-muted-foreground"
            }
          >
            {locale.toUpperCase()}
          </span>
        </span>
      ))}
    </span>
  );
}

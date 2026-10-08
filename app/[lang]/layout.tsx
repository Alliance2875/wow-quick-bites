import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SiteFooter from "@/components/shared/layout/SiteFooter";
import InlineScript from "@/components/shared/layout/InlineScript";
import SiteHeader from "@/components/shared/layout/SiteHeader";
import { locales } from "@/i18n/config";
import { resolveLang } from "@/i18n/get-dictionary";
import { defaultTheme, themeScript } from "@/lib/theme";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return {
    title: { default: dict.common.brand, template: `%s · ${dict.common.brand}` },
    description: dict.home.hero.text,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang, dict } = await resolveLang(params);

  return (
    <html
      lang={lang}
      data-theme={defaultTheme}
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader lang={lang} dict={dict.common} />
        <main className="flex-1">{children}</main>
        <SiteFooter lang={lang} dict={dict.common} />
      </body>
    </html>
  );
}

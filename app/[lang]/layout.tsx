import type { Metadata } from "next";
import { Inter } from "next/font/google";
import InlineScript from "@/components/shared/layout/InlineScript";
import { locales } from "@/i18n/config";
import { resolveLang } from "@/i18n/get-dictionary";
import { defaultTheme, themeScript } from "@/lib/theme";
import StoreProvider from "@/components/providers/StoreProvider";
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
  const { lang } = await resolveLang(params);

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
      {/* Header/footer come from the (site) layout; the portal has its own sidebar shell */}
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

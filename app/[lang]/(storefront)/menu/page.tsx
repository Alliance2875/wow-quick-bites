import type { Metadata } from "next";
import { Suspense } from "react";
import MenuBrowser from "@/components/menu/MenuBrowser";
import MenuBrowserFromUrl from "@/components/menu/MenuBrowserFromUrl";
import Container from "@/components/shared/ui/Container";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.menu.title };
}

// Static page: the full menu is in the HTML (Suspense fallback), then the client applies ?category=.
export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang, dict } = await resolveLang(params);
  const props = { lang, dict: dict.menu, common: dict.common };

  return (
    <Container className="pb-16 pt-12">
      <h1 className="text-center text-4xl">{dict.menu.title}</h1>
      <Suspense fallback={<MenuBrowser {...props} initialCategory={null} />}>
        <MenuBrowserFromUrl {...props} />
      </Suspense>
    </Container>
  );
}

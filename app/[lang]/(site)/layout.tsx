import SiteFooter from "@/components/shared/layout/SiteFooter";
import SiteHeader from "@/components/shared/layout/SiteHeader";
import { resolveLang } from "@/i18n/get-dictionary";

// Public website (storefront, shop, sign-in…): yellow header + footer.
// The client area and the staff portal live in (portal) with their own sidebar shell.
export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang, dict } = await resolveLang(params);

  return (
    <>
      <SiteHeader lang={lang} dict={dict.common} />
      <main className="flex-1">{children}</main>
      <SiteFooter lang={lang} dict={dict.common} />
    </>
  );
}

import SiteFooter from "@/components/shared/layout/SiteFooter";
import SiteHeader from "@/components/shared/layout/SiteHeader";
import { ButtonLink } from "@/components/shared/ui/Button";
import Container from "@/components/shared/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale } from "@/i18n/config";
import { localePath, routes } from "@/lib/routes";

// not-found receives no params; texts fall back to the default locale.
// It renders under the root layout (outside (site)), so it brings its own header and footer.
export default function NotFound() {
  const dict = getDictionary(defaultLocale);
  return (
    <>
      <SiteHeader lang={defaultLocale} dict={dict.common} />
      <main className="flex-1">
        <Container className="py-24 text-center">
          <h1 className="text-4xl">{dict.common.notFound.title}</h1>
          <p className="mt-3 text-muted-foreground">{dict.common.notFound.text}</p>
          <ButtonLink href={localePath(defaultLocale, routes.home)} className="mt-8">
            {dict.common.notFound.back}
          </ButtonLink>
        </Container>
      </main>
      <SiteFooter lang={defaultLocale} dict={dict.common} />
    </>
  );
}

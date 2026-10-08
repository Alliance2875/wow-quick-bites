import { ButtonLink } from "@/components/shared/ui/Button";
import Container from "@/components/shared/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale } from "@/i18n/config";
import { localePath, routes } from "@/lib/routes";

// not-found receives no params; texts fall back to the default locale.
export default function NotFound() {
  const dict = getDictionary(defaultLocale).common.notFound;
  return (
    <Container className="py-24 text-center">
      <h1 className="text-4xl">{dict.title}</h1>
      <p className="mt-3 text-muted-foreground">{dict.text}</p>
      <ButtonLink href={localePath(defaultLocale, routes.home)} className="mt-8">
        {dict.back}
      </ButtonLink>
    </Container>
  );
}

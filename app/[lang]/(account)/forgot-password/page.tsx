import type { Metadata } from "next";
import Image from "next/image";
import ForgotPasswordFlow from "@/components/account/ForgotPasswordFlow";
import Breadcrumb from "@/components/shared/ui/Breadcrumb";
import Container from "@/components/shared/ui/Container";
import { resolveLang } from "@/i18n/get-dictionary";
import { localePath, routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/forgot-password">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.account.recovery.metaTitle };
}

export default async function ForgotPasswordPage({ params }: PageProps<"/[lang]/forgot-password">) {
  const { lang, dict } = await resolveLang(params);
  const t = dict.account.recovery;
  const signInHref = localePath(lang, routes.signIn);

  return (
    <Container className="py-10 pb-16">
      <Breadcrumb
        items={[
          { label: dict.common.nav.home, href: localePath(lang, routes.home) },
          { label: t.breadcrumbSignIn, href: signInHref },
          { label: t.breadcrumb },
        ]}
      />
      <h1 className="mt-4 text-4xl">{t.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.subtitle}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,43.75rem)_1fr]">
        <div className="relative hidden min-h-[27.5rem] overflow-hidden rounded-3xl bg-black lg:block">
          <Image src="/images/hero-poster.jpg" alt="" fill sizes="700px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-x-9 bottom-9">
            <p className="text-4xl font-extrabold leading-tight text-white">{t.heroTitle}</p>
            <p className="mt-2 text-sm font-bold text-primary">{t.heroTagline}</p>
          </div>
        </div>
        <ForgotPasswordFlow dict={t} fields={dict.account.fields} signInHref={signInHref} />
      </div>
    </Container>
  );
}

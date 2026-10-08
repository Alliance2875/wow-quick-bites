import type { Metadata } from "next";
import { Suspense } from "react";
import SignInForm from "@/components/account/SignInForm";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/sign-in">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.account.signIn.metaTitle };
}

export default async function SignInPage({ params }: PageProps<"/[lang]/sign-in">) {
  const { lang, dict } = await resolveLang(params);
  // Suspense: the form reads ?next= with useSearchParams
  return (
    <Suspense>
      <SignInForm lang={lang} dict={dict.account} />
    </Suspense>
  );
}

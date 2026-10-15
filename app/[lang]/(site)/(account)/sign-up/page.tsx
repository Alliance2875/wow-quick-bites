import type { Metadata } from "next";
import { Suspense } from "react";
import SignUpForm from "@/components/account/SignUpForm";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/sign-up">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.account.signUp.metaTitle };
}

export default async function SignUpPage({ params }: PageProps<"/[lang]/sign-up">) {
  const { lang, dict } = await resolveLang(params);
  return (
    <Suspense>
      <SignUpForm lang={lang} dict={dict.account} />
    </Suspense>
  );
}

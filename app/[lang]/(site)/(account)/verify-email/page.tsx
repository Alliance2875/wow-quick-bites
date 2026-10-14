import type { Metadata } from "next";
import VerifyEmailForm from "@/components/account/VerifyEmailForm";
import { resolveLang } from "@/i18n/get-dictionary";
import { readPending } from "@/lib/auth/flows";

export async function generateMetadata({ params }: PageProps<"/[lang]/verify-email">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.account.verify.metaTitle, robots: { index: false, follow: false } };
}

export default async function VerifyEmailPage({ params }: PageProps<"/[lang]/verify-email">) {
  const { lang, dict } = await resolveLang(params);
  // The pending sign-up (signed HttpOnly cookie) says which email the code was sent to
  const pending = await readPending();

  return <VerifyEmailForm lang={lang} dict={dict.account} email={pending?.email ?? null} devCode={pending?.devCode} />;
}

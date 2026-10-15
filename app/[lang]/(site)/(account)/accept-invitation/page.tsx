import type { Metadata } from "next";
import { Suspense } from "react";
import AcceptInvitationForm from "@/components/account/AcceptInvitationForm";
import { resolveLang } from "@/i18n/get-dictionary";

type InvitationPageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: InvitationPageProps): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.account.invitation.metaTitle, robots: { index: false, follow: false } };
}

export default async function AcceptInvitationPage({ params }: InvitationPageProps) {
  const { lang, dict } = await resolveLang(params);
  return (
    <Suspense>
      <AcceptInvitationForm lang={lang} dict={dict.account} />
    </Suspense>
  );
}

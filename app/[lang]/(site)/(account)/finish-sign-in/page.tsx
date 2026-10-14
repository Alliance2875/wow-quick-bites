import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FinishSignIn from "@/components/account/FinishSignIn";
import { resolveLang } from "@/i18n/get-dictionary";
import { readGoogleProfile } from "@/lib/auth/flows";
import { landingPath } from "@/lib/auth/landing";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";
import { localePath, routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/[lang]/finish-sign-in">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.account.finishSignIn.metaTitle, robots: { index: false, follow: false } };
}

// Reached right after the Google callback (app/api/auth/google/callback).
export default async function FinishSignInPage({ params }: PageProps<"/[lang]/finish-sign-in">) {
  const { lang, dict } = await resolveLang(params);
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  const profile = await readGoogleProfile();
  if (!session || session.role !== "client" || !profile) redirect(localePath(lang, routes.signIn));

  return (
    <FinishSignIn
      label={dict.account.finishSignIn.redirecting}
      user={{ name: session.name, email: profile.email, phone: profile.phone, clientCode: profile.clientCode, role: "client" }}
      redirectTo={landingPath(lang, "client", profile.next)}
    />
  );
}

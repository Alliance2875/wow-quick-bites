import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/i18n/config";
import { googleAccount } from "@/lib/auth/directory";
import { saveGoogleProfile, takeGoogleState } from "@/lib/auth/flows";
import { fetchGoogleProfile, googleConfig } from "@/lib/auth/google";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/token";
import { localePath, routes } from "@/lib/routes";

// Google redirects here after consent. The account is matched (or created) by its verified
// email, the session starts, then /finish-sign-in mirrors the profile for the storefront.

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const saved = await takeGoogleState();
  const lang: Locale = saved && isLocale(saved.lang) ? saved.lang : "en";
  const fail = () => NextResponse.redirect(new URL(`${localePath(lang, routes.signIn)}?error=google`, request.url));

  if (!saved || !params.get("state") || params.get("state") !== saved.state) return fail();

  let profile: { email: string; name: string } | null = null;
  if (params.get("mock") === "1" && !googleConfig() && process.env.NODE_ENV !== "production") {
    // Development without Google credentials: a demo Google account
    profile = { email: "google.demo@gmail.com", name: "Google Demo" };
  } else {
    const code = params.get("code");
    if (!code) return fail();
    profile = await fetchGoogleProfile(request, code, saved.verifier);
  }
  if (!profile) return fail();

  const account = googleAccount(profile);
  if (!account.ok) return fail();

  const response = NextResponse.redirect(new URL(localePath(lang, routes.finishSignIn), request.url));
  response.cookies.set(
    SESSION_COOKIE,
    await signSession(account.session),
    sessionCookieOptions,
  );
  await saveGoogleProfile({
    name: account.session.name,
    email: account.email,
    phone: account.phone,
    clientCode: account.clientCode ?? "",
    lang,
    next: saved.next,
  });
  return response;
}

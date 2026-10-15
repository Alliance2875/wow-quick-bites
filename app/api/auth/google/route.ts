import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/i18n/config";
import { saveGoogleState } from "@/lib/auth/flows";
import { googleConfig, googleRedirectUri } from "@/lib/auth/google";
import { localePath, routes } from "@/lib/routes";

// Starts "Continue with Google" (OAuth 2.0 authorization code + PKCE).
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (.env.example).

const base64url = (buffer: Buffer) => buffer.toString("base64url");

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requested = params.get("lang") ?? "";
  const lang: Locale = isLocale(requested) ? requested : "en";
  const next = params.get("next") ?? "";
  const config = googleConfig();

  if (!config) {
    return NextResponse.redirect(new URL(`${localePath(lang, routes.signIn)}?error=google`, request.url));
  }

  const state = base64url(randomBytes(16));
  const verifier = base64url(randomBytes(32));
  await saveGoogleState({ state, verifier, lang, next });

  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: base64url(createHash("sha256").update(verifier).digest()),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return NextResponse.redirect(google);
}

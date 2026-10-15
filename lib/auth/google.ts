import "server-only";
import type { NextRequest } from "next/server";

// Google OAuth helpers for the Route Handlers in app/api/auth/google/.
// When the backend owns Google sign-in, these handlers only forward to it (docs/API_CONTRACTS.md §2).

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/** Must be listed in the Google Cloud console ("Authorized redirect URIs"). */
export const googleRedirectUri = (request: NextRequest) =>
  process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google/callback`;

/** Exchanges the authorization code, then reads the verified email and name. */
export async function fetchGoogleProfile(request: NextRequest, code: string, verifier: string) {
  const config = googleConfig();
  if (!config) return null;
  try {
    const token = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: googleRedirectUri(request),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      cache: "no-store",
    });
    if (!token.ok) return null;
    const { access_token } = (await token.json()) as { access_token?: string };
    if (!access_token) return null;

    const info = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });
    if (!info.ok) return null;
    const user = (await info.json()) as { email?: string; email_verified?: boolean; name?: string };
    if (!user.email || !user.email_verified) return null;
    return { email: user.email, name: user.name ?? "" };
  } catch {
    return null;
  }
}

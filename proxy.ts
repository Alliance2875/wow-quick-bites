import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";
import { allowedRoles, homeFor } from "@/lib/auth/roles";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";
import { localePath, routes } from "@/lib/routes";

// 1. Every page lives under /en or /fr. A URL without a locale (e.g. "/menu") is redirected to
//    the last language picked (cookie), else the browser language, else English.
// 2. Client area (/account) and staff portal (/admin): optimistic role check from the signed
//    session cookie (no database work here). Pages repeat the check in lib/auth/dal.ts.

function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  const accepted = request.headers.get("accept-language") ?? "";
  for (const part of accepted.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lang = locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  if (!lang) {
    request.nextUrl.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const path = pathname.slice(lang.length + 1) || "/";
  const roles = allowedRoles(path);
  if (!roles) return; // public page

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const signIn = new URL(localePath(lang, routes.signIn), request.url);
    signIn.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(signIn);
  }
  if (!roles.includes(session.role)) {
    return NextResponse.redirect(new URL(localePath(lang, homeFor(session.role)), request.url));
  }

  // Personal pages: never cached by shared caches, never indexed
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (images, videos, favicon…)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};

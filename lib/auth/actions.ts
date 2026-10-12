"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath, routes } from "@/lib/routes";
import { authenticate, register, type AuthResult } from "./directory";
import { allowedRoles, homeFor, type Role } from "./roles";
import type { User } from "./session";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "./token";

// Server Actions: credentials are checked and the session cookie is set on the server only.

export type AuthFormState =
  | { error: "invalid" | "suspended" | "exists" | "missing" | "server" }
  | { user: User; redirectTo: string }
  | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

/** Same-site paths only (no "//evil.com" or "/\evil.com" open redirect). */
const isSafePath = (path: string) => path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");

/**
 * After signing in: back to ?next= when this role may open it, otherwise the role's home.
 * Clients without a ?next= land in their client area; staff always land in the portal.
 */
function landingPath(lang: Locale, role: Role, next: string) {
  if (next && isSafePath(next)) {
    const pathWithoutLocale = next.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
    const roles = allowedRoles(pathWithoutLocale.split("?")[0]);
    if (roles ? roles.includes(role) : role === "client") return next;
  }
  return localePath(lang, homeFor(role));
}

async function startSession(result: Extract<AuthResult, { ok: true }>, form: FormData): Promise<AuthFormState> {
  const lang = isLocale(text(form, "lang")) ? (text(form, "lang") as Locale) : "en";
  try {
    (await cookies()).set(SESSION_COOKIE, await signSession(result.session), sessionCookieOptions);
  } catch {
    return { error: "server" };
  }
  return {
    user: {
      name: result.session.name,
      email: result.email,
      phone: text(form, "phone") || undefined,
      clientCode: result.clientCode ?? "",
      role: result.session.role,
    },
    redirectTo: landingPath(lang, result.session.role, text(form, "next")),
  };
}

export async function signInAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "missing" };
  const result = authenticate(email, password);
  return result.ok ? startSession(result, form) : { error: result.error };
}

export async function signUpAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const name = text(form, "name");
  const email = text(form, "email");
  if (!name || !email || String(form.get("password") ?? "").length < 6) return { error: "missing" };
  const result = register({ name, email });
  return result.ok ? startSession(result, form) : { error: result.error };
}

export async function signOutAction(form: FormData) {
  (await cookies()).delete(SESSION_COOKIE);
  const lang = isLocale(text(form, "lang")) ? (text(form, "lang") as Locale) : "en";
  redirect(localePath(lang, routes.signIn));
}

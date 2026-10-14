"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { normalizePhone } from "@/lib/phone";
import { localePath, routes } from "@/lib/routes";
import { authenticate, isEmailTaken, register, type AuthResult } from "./directory";
import {
  clearGoogleProfile,
  clearPending,
  CODE_TTL_MS,
  MAX_CODE_ATTEMPTS,
  readPending,
  RESEND_DELAY_MS,
  resendCode,
  savePending,
  startPendingSignUp,
} from "./flows";
import { landingPath } from "./landing";
import type { User } from "./session";
import { hashCode, SESSION_COOKIE, sessionCookieOptions, signSession, verifySession } from "./token";

// Server Actions: credentials are checked and the session cookie is set on the server only.

export type AuthError =
  | "invalid"
  | "suspended"
  | "exists"
  | "missing"
  | "server"
  | "phone"
  | "code"
  | "expired"
  | "tooMany"
  | "wait";

export type AuthFormState =
  | { error: AuthError }
  | { user: User; redirectTo: string }
  /** Sign-up: the code was sent, continue on the verify page */
  | { verify: string }
  | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const langOf = (value: string): Locale => (isLocale(value) ? value : "en");

async function startSession(
  result: Extract<AuthResult, { ok: true }>,
  details: { lang: Locale; next: string; phone?: string },
): Promise<AuthFormState> {
  try {
    (await cookies()).set(SESSION_COOKIE, await signSession(result.session), sessionCookieOptions);
  } catch {
    return { error: "server" };
  }
  return {
    user: {
      name: result.session.name,
      email: result.email,
      phone: details.phone,
      clientCode: result.clientCode ?? "",
      role: result.session.role,
    },
    redirectTo: landingPath(details.lang, result.session.role, details.next),
  };
}

export async function signInAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "missing" };
  const result = authenticate(email, password);
  return result.ok ? startSession(result, { lang: langOf(text(form, "lang")), next: text(form, "next") }) : { error: result.error };
}

/** Step 1 of sign-up: checks the details and emails a 6-digit code. The account exists only once verified. */
export async function signUpAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const name = text(form, "name");
  const email = text(form, "email").toLowerCase();
  const lang = langOf(text(form, "lang"));
  if (!name || !email || String(form.get("password") ?? "").length < 6) return { error: "missing" };
  const phone = normalizePhone(text(form, "phone"));
  if (!phone) return { error: "phone" };
  if (isEmailTaken(email)) return { error: "exists" };
  try {
    // The password goes to the backend with POST /auth/sign-up; the mock does not store it
    await startPendingSignUp({ name, email, phone, lang, next: text(form, "next") });
  } catch {
    return { error: "server" };
  }
  return { verify: localePath(lang, routes.verifyEmail) };
}

/** Step 2 of sign-up: the code from the email creates the account and signs in. */
export async function verifyEmailAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const pending = await readPending();
  if (!pending || Date.now() - pending.sentAt > CODE_TTL_MS) return { error: "expired" };
  if (pending.attempts >= MAX_CODE_ATTEMPTS) return { error: "tooMany" };

  const code = text(form, "code").replace(/\D/g, "");
  const expected = Buffer.from(pending.codeHash, "hex");
  const actual = Buffer.from(await hashCode(code, pending.email), "hex");
  if (code.length !== 6 || !timingSafeEqual(actual, expected)) {
    await savePending({ ...pending, attempts: pending.attempts + 1 });
    return { error: pending.attempts + 1 >= MAX_CODE_ATTEMPTS ? "tooMany" : "code" };
  }

  const result = register({ name: pending.name, email: pending.email });
  if (!result.ok) return { error: result.error };
  await clearPending();
  return startSession(result, { lang: langOf(pending.lang), next: pending.next, phone: pending.phone });
}

export type ResendState = { sent: true } | { error: "wait" | "expired" } | undefined;

export async function resendCodeAction(): Promise<ResendState> {
  const pending = await readPending();
  if (!pending) return { error: "expired" };
  if (Date.now() - pending.sentAt < RESEND_DELAY_MS) return { error: "wait" };
  await resendCode(pending);
  return { sent: true };
}

export type ProfileState = { error: "missing" | "phone" | "expired" | "server" } | { saved: { name: string; phone: string } } | undefined;

/** Client profile page: name and phone (the email is the sign-in identity and stays as is). */
export async function updateProfileAction(_: ProfileState, form: FormData): Promise<ProfileState> {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session || session.role !== "client") return { error: "expired" };
  const name = text(form, "name");
  if (!name) return { error: "missing" };
  const phone = normalizePhone(text(form, "phone"));
  if (!phone) return { error: "phone" };

  // Backend: PATCH /me { name, phone }. The session carries the display name.
  try {
    jar.set(SESSION_COOKIE, await signSession({ ...session, name }), sessionCookieOptions);
  } catch {
    return { error: "server" };
  }
  return { saved: { name, phone } };
}

export async function signOutAction(form: FormData) {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  await clearGoogleProfile();
  redirect(localePath(langOf(text(form, "lang")), routes.signIn));
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { normalizePhone } from "@/lib/phone";
import { localePath, routes } from "@/lib/routes";
import { API_BASE_URL, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/api/config";
import type { Role } from "./roles";
import {
  clearGoogleProfile,
  clearPending,
  CODE_TTL_MS,
  readPending,
  RESEND_DELAY_MS,
  savePending,
  startPendingSignUp,
} from "./flows";
import { landingPath } from "./landing";
import type { User } from "./session";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  type SessionPayload,
  verifySession,
} from "./token";

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
  | "wait"
  | "invitation"
  | "invitationExpired"
  | "weakPassword";

export type AuthFormState =
  | { error: AuthError }
  | { user: User; redirectTo: string }
  /** Sign-up: the code was sent, continue on the verify page */
  | { verify: string }
  | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const langOf = (value: string): Locale => (isLocale(value) ? value : "en");

type BackendSession = {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string | null;
  clientCode?: string | null;
};

type BackendAuthResult = {
  access: string;
  refresh: string;
  user: BackendSession;
};

type SessionStart = {
  ok: true;
  session: SessionPayload;
  email: string;
  clientCode?: string;
};

const sessionStart = (user: BackendSession): SessionStart => ({
  ok: true,
  email: user.email,
  clientCode: user.clientCode || undefined,
  session: { sub: user.id || user.clientCode || user.email, role: user.role, name: user.name },
});

async function startSession(
  result: SessionStart,
  details: { lang: Locale; next: string; phone?: string; access?: string; refresh?: string },
): Promise<AuthFormState> {
  try {
    const jar = await cookies();
    jar.set(SESSION_COOKIE, await signSession(result.session), sessionCookieOptions);
    if (details.access) {
      jar.set(ACCESS_TOKEN_COOKIE, details.access, {
        ...sessionCookieOptions,
        httpOnly: false,
      });
    }
    if (details.refresh) {
      jar.set(REFRESH_TOKEN_COOKIE, details.refresh, sessionCookieOptions);
    }
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
  const lang = langOf(text(form, "lang"));
  const next = text(form, "next");
  if (!email || !password) return { error: "missing" };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/sign-in/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as BackendAuthResult;
      return startSession(sessionStart(data.user), {
        lang,
        next,
        phone: data.user.phone || undefined,
        access: data.access,
        refresh: data.refresh,
      });
    }

    const err = await res.json().catch(() => null);
    const code = err?.error?.code;
    if (code === "account_suspended") return { error: "suspended" };
    if (code === "email_not_verified") return { error: "wait" };
    if (res.status === 401 || code === "invalid_credentials") return { error: "invalid" };
    if (res.status === 429) return { error: "tooMany" };
  } catch {
    return { error: "server" };
  }

  return { error: "server" };
}

/** Step 1 of sign-up: checks the details and emails a 6-digit code. The account exists only once verified. */
export async function signUpAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const name = text(form, "name");
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const lang = langOf(text(form, "lang"));
  const next = text(form, "next");
  if (!name || !email || password.length < 6) return { error: "missing" };
  const phone = normalizePhone(text(form, "phone"));
  if (!phone) return { error: "phone" };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/sign-up/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
      cache: "no-store",
    });

    if (res.ok) {
      await startPendingSignUp({ name, email, phone, lang, next });
      return { verify: localePath(lang, routes.verifyEmail) };
    }

    const err = await res.json().catch(() => null);
    const code = err?.error?.code;
    if (res.status === 409 || code === "email_taken") return { error: "exists" };
    if (res.status === 422) return { error: "missing" };
  } catch {
    return { error: "server" };
  }

  return { error: "server" };
}

/** Step 2 of sign-up: the code from the email creates the account and signs in. */
export async function verifyEmailAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const pending = await readPending();
  if (!pending || Date.now() - pending.sentAt > CODE_TTL_MS) return { error: "expired" };

  const code = text(form, "code").replace(/\D/g, "");
  if (code.length !== 6) return { error: "code" };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pending.email, code }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as BackendAuthResult;
      await clearPending();
      return startSession(sessionStart(data.user), {
        lang: langOf(pending.lang),
        next: pending.next,
        phone: data.user.phone || pending.phone,
        access: data.access,
        refresh: data.refresh,
      });
    }

    const err = await res.json().catch(() => null);
    const codeErr = err?.error?.code;
    if (codeErr === "too_many_attempts" || res.status === 429) return { error: "tooMany" };
    if (codeErr === "code_expired" || res.status === 410) return { error: "expired" };
    if (codeErr === "invalid_code" || res.status === 400) return { error: "code" };
    return { error: "server" };
  } catch {
    return { error: "server" };
  }

  return { error: "server" };
}

/** Completes a manager invitation and starts the same signed server session as sign-in. */
export async function acceptInvitationAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const token = text(form, "token");
  const password = String(form.get("password") ?? "");
  const lang = langOf(text(form, "lang"));
  if (!token || !password) return { error: "missing" };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/invitations/accept/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as BackendAuthResult;
      return startSession(sessionStart(data.user), {
        lang,
        next: "",
        phone: data.user.phone || undefined,
        access: data.access,
        refresh: data.refresh,
      });
    }

    const err = await res.json().catch(() => null);
    const code = err?.error?.code;
    if (res.status === 410 || code === "invitation_expired") return { error: "invitationExpired" };
    if (res.status === 422 || code === "password_too_weak") return { error: "weakPassword" };
    if (res.status === 400 || res.status === 404 || code === "invalid_invitation") return { error: "invitation" };
  } catch {
    return { error: "server" };
  }

  return { error: "server" };
}

export type ResendState = { sent: true } | { error: "wait" | "expired" } | undefined;

export async function resendCodeAction(): Promise<ResendState> {
  const pending = await readPending();
  if (!pending) return { error: "expired" };
  if (Date.now() - pending.sentAt < RESEND_DELAY_MS) return { error: "wait" };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email/resend/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pending.email }),
      cache: "no-store",
    });
    if (res.ok) {
      await savePending({ ...pending, sentAt: Date.now() });
      return { sent: true };
    }
    if (res.status === 429) return { error: "wait" };
  } catch {
    return { error: "expired" };
  }

  return { error: "expired" };
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

  // Backend: PATCH /me { name, phone }.
  const token = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return { error: "expired" };
  try {
    const response = await fetch(`${API_BASE_URL}/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
        cache: "no-store",
      });
    if (!response.ok) return { error: response.status === 401 ? "expired" : "server" };
  } catch {
    return { error: "server" };
  }

  try {
    jar.set(SESSION_COOKIE, await signSession({ ...session, name }), sessionCookieOptions);
  } catch {
    return { error: "server" };
  }
  return { saved: { name, phone } };
}

export async function signOutAction(form: FormData) {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refresh) {
    try {
      const access = jar.get(ACCESS_TOKEN_COOKIE)?.value;
      const response = await fetch(`${API_BASE_URL}/auth/sign-out/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: JSON.stringify({ refresh }),
        cache: "no-store",
      });
      if (!response.ok) console.error(`Backend sign-out failed: ${response.status}`);
    } catch {
      console.error("Backend sign-out request failed");
    }
  }

  jar.delete(SESSION_COOKIE);
  jar.delete(ACCESS_TOKEN_COOKIE);
  jar.delete(REFRESH_TOKEN_COOKIE);
  await clearGoogleProfile();
  redirect(localePath(langOf(text(form, "lang")), routes.signIn));
}

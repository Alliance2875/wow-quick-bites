import "server-only";
import { randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { flowCookieOptions, hashCode, signData, verifyData } from "./token";

// State of the multi-step auth flows, kept in short-lived signed HttpOnly cookies (no database).
// With the backend: the pending sign-up and the one-time code live on the server
// (POST /auth/sign-up → POST /auth/verify-email), see docs/API_CONTRACTS.md §2.

// ───────── Sign-up: email verification with a one-time code ─────────

const PENDING_COOKIE = "wqb_pending_signup";
const PENDING_TTL_SECONDS = 15 * 60;
export const CODE_TTL_MS = 10 * 60 * 1000;
export const RESEND_DELAY_MS = 30 * 1000;
export const MAX_CODE_ATTEMPTS = 5;

export type PendingSignUp = {
  name: string;
  email: string;
  phone: string;
  /** HMAC of the 6-digit code (lib/auth/token.ts → hashCode) */
  codeHash: string;
  sentAt: number;
  attempts: number;
  lang: string;
  next: string;
  /** Development only: the code, shown on the verify page because no email is sent yet */
  devCode?: string;
};

const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

/**
 * MOCK email: logs the code in the server console. Replace with the backend's mail sending
 * (the backend generates and stores the code itself).
 */
function sendVerificationEmail(email: string, code: string) {
  if (process.env.NODE_ENV !== "production") console.info(`[auth] verification code for ${email}: ${code}`);
}

export async function startPendingSignUp(input: Omit<PendingSignUp, "codeHash" | "sentAt" | "attempts" | "devCode">) {
  const code = newCode();
  await savePending({
    ...input,
    codeHash: await hashCode(code, input.email),
    sentAt: Date.now(),
    attempts: 0,
    ...(process.env.NODE_ENV !== "production" && { devCode: code }),
  });
  sendVerificationEmail(input.email, code);
}

export async function resendCode(pending: PendingSignUp) {
  const code = newCode();
  await savePending({
    ...pending,
    codeHash: await hashCode(code, pending.email),
    sentAt: Date.now(),
    attempts: 0,
    ...(process.env.NODE_ENV !== "production" && { devCode: code }),
  });
  sendVerificationEmail(pending.email, code);
}

export async function savePending(pending: PendingSignUp) {
  (await cookies()).set(PENDING_COOKIE, await signData("signup", pending, PENDING_TTL_SECONDS), flowCookieOptions(PENDING_TTL_SECONDS));
}

export async function readPending() {
  return verifyData<PendingSignUp>("signup", (await cookies()).get(PENDING_COOKIE)?.value);
}

export async function clearPending() {
  (await cookies()).delete(PENDING_COOKIE);
}

// ───────── Google sign-in ─────────

const STATE_COOKIE = "wqb_google_state";
const STATE_TTL_SECONDS = 10 * 60;
const PROFILE_COOKIE = "wqb_google_profile";
/** Only needed between the callback and /finish-sign-in */
const PROFILE_TTL_SECONDS = 5 * 60;

/** Kept between the redirect to Google and the callback (CSRF state + PKCE verifier). */
export type GoogleState = { state: string; verifier: string; lang: string; next: string };

/** What the client mirror needs after Google sign-in (the session cookie stays minimal). */
export type GoogleProfile = { name: string; email: string; phone?: string; clientCode: string; next: string; lang: string };

export async function saveGoogleState(value: GoogleState) {
  (await cookies()).set(STATE_COOKIE, await signData("google-state", value, STATE_TTL_SECONDS), flowCookieOptions(STATE_TTL_SECONDS));
}

export async function takeGoogleState() {
  const jar = await cookies();
  const value = await verifyData<GoogleState>("google-state", jar.get(STATE_COOKIE)?.value);
  jar.delete(STATE_COOKIE);
  return value;
}

export async function saveGoogleProfile(profile: GoogleProfile) {
  (await cookies()).set(PROFILE_COOKIE, await signData("google-profile", profile, PROFILE_TTL_SECONDS), flowCookieOptions(PROFILE_TTL_SECONDS));
}

export async function readGoogleProfile() {
  return verifyData<GoogleProfile>("google-profile", (await cookies()).get(PROFILE_COOKIE)?.value);
}

export async function clearGoogleProfile() {
  (await cookies()).delete(PROFILE_COOKIE);
}

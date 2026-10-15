import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { clients } from "@/data/clients";
import { staff } from "@/data/staff";
import type { SessionPayload } from "./token";

// MOCK identity provider until the backend auth API exists: replace authenticate(), register(),
// isEmailTaken() and googleAccount() with calls to it — the rest of the auth flow (session
// cookie, proxy, DAL) stays.
//
// Demo accounts (README → "Portal access"):
//   staff   owner@wowquickbites.rw (superadmin), eric@ / nadia@ / kevin@ / chantal@wowquickbites.rw
//           password WowStaff#2026 (Chantal is suspended and cannot sign in)
//   clients aline@example.com … jean@example.com — password WowClient#2026
// Any other email signs in as a new client (the storefront's mock behaviour), never as staff.

const STAFF_PASSWORD = "scrypt$b6a211ca13330aba2f08a2d23112030b$b5536d776ffebd301f8bcd35d3ce79208e522b870abbc972a1ead58f4c47090a";
const CLIENT_PASSWORD = "scrypt$dc09386dde6aa6044ecf9acf99fd23d4$34a766658c01540b43606963bd8fa9741de9564016e02bc85b5f9c8ae5eb2696";

function passwordMatches(password: string, stored: string) {
  const [, salt, hash] = stored.split("$");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

const normalize = (email: string) => email.trim().toLowerCase();

/** Stable mock client code for accounts outside the sample data (WQB100A–WQB999A). */
function mockClientCode(email: string) {
  let hash = 0;
  for (const char of email) hash = (hash * 31 + char.charCodeAt(0)) % 900;
  return `WQB${100 + hash}A`;
}

const nameFromEmail = (email: string) => {
  const local = email.split("@")[0] || "Guest";
  return local.charAt(0).toUpperCase() + local.slice(1);
};

export type AuthResult =
  | { ok: true; session: SessionPayload; email: string; clientCode?: string }
  | { ok: false; error: "invalid" | "suspended" | "exists" };

export function authenticate(rawEmail: string, password: string): AuthResult {
  const email = normalize(rawEmail);

  const member = staff.find((person) => person.email === email);
  if (member) {
    if (!passwordMatches(password, STAFF_PASSWORD)) return { ok: false, error: "invalid" };
    if (member.status === "suspended") return { ok: false, error: "suspended" };
    return { ok: true, email, session: { sub: member.id, role: member.role, name: member.name } };
  }

  const client = clients.find((person) => person.email === email);
  if (client) {
    if (!passwordMatches(password, CLIENT_PASSWORD)) return { ok: false, error: "invalid" };
    return {
      ok: true,
      email,
      clientCode: client.code,
      session: { sub: client.code, role: "client", name: client.name },
    };
  }

  // Unknown email: mock "existing account" (no backend to check it against yet)
  if (password.length < 6) return { ok: false, error: "invalid" };
  const code = mockClientCode(email);
  return { ok: true, email, clientCode: code, session: { sub: code, role: "client", name: nameFromEmail(email) } };
}

export const isEmailTaken = (rawEmail: string) => {
  const email = normalize(rawEmail);
  return staff.some((person) => person.email === email) || clients.some((person) => person.email === email);
};

/** Called once the email is verified (one-time code), never before. */
export function register(input: { name: string; email: string }): AuthResult {
  const email = normalize(input.email);
  if (isEmailTaken(email)) return { ok: false, error: "exists" };
  const code = mockClientCode(email);
  return { ok: true, email, clientCode: code, session: { sub: code, role: "client", name: input.name } };
}

/**
 * Google sign-in (email already verified by Google): the matching client account, or a new one.
 * Staff accounts keep their password sign-in. `phone` is unknown for new accounts: it is asked
 * at checkout (contact section) and can be added on the profile page.
 */
export function googleAccount(profile: { email: string; name: string }): (AuthResult & { ok: true; phone?: string }) | { ok: false; error: "staff" } {
  const email = normalize(profile.email);
  if (staff.some((person) => person.email === email)) return { ok: false, error: "staff" };
  const client = clients.find((person) => person.email === email);
  const code = client?.code ?? mockClientCode(email);
  const name = client?.name ?? (profile.name || nameFromEmail(email));
  return { ok: true, email, clientCode: code, phone: client?.phone, session: { sub: code, role: "client", name } };
}

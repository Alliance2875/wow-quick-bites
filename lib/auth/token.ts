import { jwtVerify, SignJWT } from "jose";
import { isRole, type Role } from "./roles";

// Stateless session: a signed JWT (HS256) stored in an HttpOnly cookie. Read by proxy.ts for
// quick redirects and by the Data Access Layer (lib/auth/dal.ts) before any portal data is shown.
// Server only (proxy, Server Components, Server Actions) — never import it from a client component.

export const SESSION_COOKIE = "wqb_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // one working day

/** Minimum data needed on every request: who, and with which role. No email, phone or password. */
export type SessionPayload = {
  /** Staff id (data/staff.ts) or client code (WQB001A) */
  sub: string;
  role: Role;
  name: string;
};

// Development fallback so `npm run dev` works out of the box. In production SESSION_SECRET is
// required (≥ 32 characters, e.g. `openssl rand -base64 32`), otherwise sessions are refused.
const DEV_SECRET = "wqb-dev-only-secret-change-me-0123456789";

function secretKey() {
  const secret = process.env.SESSION_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : DEV_SECRET);
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or shorter than 32 characters (see .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

/** The session in the cookie, or null when absent, expired, tampered with or malformed. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || !isRole(payload.role) || typeof payload.name !== "string") return null;
    return { sub: payload.sub, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/routes";
import { allowedRoles, homeFor, type Role } from "./roles";

/** Same-site paths only (no "//evil.com" or "/\evil.com" open redirect). */
const isSafePath = (path: string) => path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");

/**
 * After signing in: back to ?next= when this role may open it, otherwise the role's home.
 * Clients without a ?next= land in their client area; staff always land in the portal.
 */
export function landingPath(lang: Locale, role: Role, next: string) {
  if (next && isSafePath(next)) {
    const pathWithoutLocale = next.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
    const roles = allowedRoles(pathWithoutLocale.split("?")[0]);
    if (roles ? roles.includes(role) : role === "client") return next;
  }
  return localePath(lang, homeFor(role));
}

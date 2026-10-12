import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getClient } from "@/data/clients";
import { getStaff } from "@/data/staff";
import type { ContentGrant } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { isActiveWindow } from "@/lib/portal/clock";
import { localePath, routes } from "@/lib/routes";
import { grantScopes, homeFor, rolePermissions, type Permission, type Role } from "./roles";
import { SESSION_COOKIE, verifySession } from "./token";

// Data Access Layer: the authoritative access check. proxy.ts only does fast, optimistic
// redirects; every portal page calls requireViewer() before reading data, so a stale cookie,
// a suspended manager or an expired content grant is caught here.

/** What the portal may know about the signed-in person (a DTO: no email, phone or token). */
export type Viewer = {
  id: string;
  role: Role;
  name: string;
  /** Clients only */
  clientCode?: string;
  permissions: Permission[];
  /** Managers with an active temporary content grant */
  contentGrant?: ContentGrant;
};

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;

  if (session.role === "client") {
    // Sample clients take their name from the client record; mock accounts from the session
    const client = getClient(session.sub);
    return { id: session.sub, role: "client", name: client?.name ?? session.name, clientCode: session.sub, permissions: [] };
  }

  // Staff: the directory decides, not the cookie (role changes and suspensions apply at once)
  const member = getStaff(session.sub);
  if (!member || member.status === "suspended") return null;

  const grant =
    member.role === "manager" && member.contentGrant && isActiveWindow(member.contentGrant.startsAt, member.contentGrant.expiresAt)
      ? member.contentGrant
      : undefined;
  const permissions = new Set<Permission>(rolePermissions[member.role]);
  grant?.scopes.forEach((scope) => grantScopes[scope].forEach((permission) => permissions.add(permission)));

  return { id: member.id, role: member.role, name: member.name, permissions: [...permissions], contentGrant: grant };
});

export const can = (viewer: Viewer, permission: Permission) => viewer.permissions.includes(permission);

/**
 * For portal pages: returns the viewer, or redirects — to sign-in when signed out, to the
 * person's own home when the role or permissions do not allow this page.
 */
export async function requireViewer(
  lang: Locale,
  path: string,
  rule: { roles: readonly Role[]; anyPermission?: readonly Permission[] },
): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`${localePath(lang, routes.signIn)}?next=${encodeURIComponent(localePath(lang, path))}`);
  }
  const allowed =
    rule.roles.includes(viewer.role) && (!rule.anyPermission || rule.anyPermission.some((p) => can(viewer, p)));
  if (!allowed) redirect(localePath(lang, homeFor(viewer.role)));
  return viewer;
}

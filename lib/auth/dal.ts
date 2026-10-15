import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { ContentGrant } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { API_BASE_URL, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/api/config";
import { localePath, routes } from "@/lib/routes";
import { SESSION_COOKIE, sessionCookieOptions, verifySession } from "./token";
import { homeFor, isRole, type Permission, type Role } from "./roles";

export type Viewer = {
  id: string;
  role: Role;
  name: string;
  assignment?: "pickup-register" | "backup" | "none";
  clientCode?: string;
  permissions: Permission[];
  contentGrant?: ContentGrant;
};

type SessionUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string | null;
  clientCode?: string | null;
  permissions: string[];
  contentGrant: ContentGrant | null;
};

type RefreshedTokens = { access: string; refresh?: string };

const knownPermissions: Permission[] = [
  "overview:view",
  "orders:process",
  "menu:edit",
  "labels:edit",
  "ads:manage",
  "content:publish",
  "managers:manage",
  "business:edit",
];

async function fetchCurrentUser(access: string) {
  return fetch(`${API_BASE_URL}/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
}

async function currentUserFromBackend() {
  const jar = await cookies();
  const access = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  const refresh = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  let response = access ? await fetchCurrentUser(access) : null;
  if ((!response || response.status === 401) && refresh) {
    const refreshedResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (refreshedResponse.ok) {
      const refreshed = (await refreshedResponse.json()) as RefreshedTokens;
      jar.set(ACCESS_TOKEN_COOKIE, refreshed.access, { ...sessionCookieOptions, httpOnly: false });
      if (refreshed.refresh) {
        jar.set(REFRESH_TOKEN_COOKIE, refreshed.refresh, sessionCookieOptions);
      }
      response = await fetchCurrentUser(refreshed.access);
    } else if (refreshedResponse.status >= 500) {
      throw new Error(`Backend token refresh failed with HTTP ${refreshedResponse.status}.`);
    }
  }

  if (!response || response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`Backend profile lookup failed with HTTP ${response.status}.`);

  const user = (await response.json()) as SessionUser;
  if (!isRole(user.role) || !user.id || !user.name || !Array.isArray(user.permissions)) {
    throw new Error("Backend returned an invalid signed-in user.");
  }
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    clientCode: user.clientCode ?? undefined,
    permissions: user.permissions.filter((permission): permission is Permission =>
      knownPermissions.includes(permission as Permission),
    ),
    contentGrant: user.contentGrant ?? undefined,
  } satisfies Viewer;
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return currentUserFromBackend();
});

export const can = (viewer: Viewer, permission: Permission) => viewer.permissions.includes(permission);

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
    rule.roles.includes(viewer.role) &&
    (!rule.anyPermission || rule.anyPermission.some((permission) => can(viewer, permission)));
  if (!allowed) redirect(localePath(lang, homeFor(viewer.role)));
  return viewer;
}

import { routes } from "@/lib/routes";

// Role-based access control (RBAC), shared by proxy.ts (optimistic redirects) and the
// Data Access Layer (lib/auth/dal.ts, the real check). No secrets here: safe to import anywhere.

export const roles = ["client", "manager", "superadmin"] as const;
export type Role = (typeof roles)[number];

export const isRole = (value: unknown): value is Role => roles.includes(value as Role);

/**
 * What a signed-in person may do. Managers get orders + chat by default; content rights only come
 * from an explicit, time-limited grant by the superadmin (see data/staff.ts → contentGrant).
 */
export type Permission =
  | "overview:view"
  | "orders:process"
  | "messages:reply"
  | "menu:edit"
  | "labels:edit"
  | "ads:manage"
  | "content:publish"
  | "managers:manage"
  | "business:edit";

export const rolePermissions: Record<Role, readonly Permission[]> = {
  client: [],
  manager: ["orders:process", "messages:reply"],
  superadmin: [
    "overview:view",
    "orders:process",
    "messages:reply",
    "menu:edit",
    "labels:edit",
    "ads:manage",
    "content:publish",
    "managers:manage",
    "business:edit",
  ],
};

/** Scopes a superadmin can delegate to a manager, and the permissions each one unlocks. */
export const grantScopes = {
  food: ["menu:edit"],
  drinks: ["menu:edit"],
  labels: ["labels:edit"],
  ads: ["ads:manage"],
  publish: ["content:publish"],
} as const satisfies Record<string, readonly Permission[]>;

export type GrantScope = keyof typeof grantScopes;

/** Where each role lands after signing in (and when it opens a page it may not see). */
export const homeFor = (role: Role) =>
  role === "client" ? routes.account : role === "manager" ? routes.adminOrders : routes.admin;

/**
 * Who may open which part of the portal (paths without the /en or /fr prefix).
 * The first matching rule wins; finer rules (permissions) are checked again in each page.
 */
const portalRules: { path: string; exact?: boolean; roles: readonly Role[] }[] = [
  { path: routes.admin, exact: true, roles: ["superadmin"] },
  { path: routes.adminManagers, roles: ["superadmin"] },
  { path: routes.admin, roles: ["superadmin", "manager"] },
  { path: routes.account, roles: ["client"] },
];

const matches = (path: string, rule: { path: string; exact?: boolean }) =>
  path === rule.path || (!rule.exact && path.startsWith(`${rule.path}/`));

/** Roles allowed on a path, or null when the path is public. */
export function allowedRoles(path: string): readonly Role[] | null {
  return portalRules.find((rule) => matches(path, rule))?.roles ?? null;
}

import type { Locale } from "@/i18n/config";

/** Every internal path lives here, so a route rename is a one-line change. */
export const routes = {
  home: "/",
  menu: "/menu",
  product: (slug: string) => `/menu/${slug}`,
  about: "/about",
  contact: "/contact",
  cart: "/cart",
  checkout: "/checkout",
  orderConfirmation: "/checkout/confirmation",
  signIn: "/sign-in",
  signUp: "/sign-up",
  acceptInvitation: "/accept-invitation",
  forgotPassword: "/forgot-password",
  /** One-time code sent by email after "Create account" */
  verifyEmail: "/verify-email",
  /** After the Google callback: copies the public profile for the storefront, then continues */
  finishSignIn: "/finish-sign-in",
  /** Route Handler (no locale prefix): starts the Google OAuth flow */
  googleSignIn: "/api/auth/google",

  // Client area (role: client)
  account: "/account",
  accountProfile: "/account/profile",
  accountOrders: "/account/orders",
  accountOrder: (id: string) => `/account/orders/${id}`,
  accountNotifications: "/account/notifications",

  // Staff portal (roles: manager, superadmin — see lib/auth/roles.ts)
  admin: "/admin",
  adminOrders: "/admin/orders",
  adminOrder: (id: string) => `/admin/orders/${id}`,
  adminContent: "/admin/content",
  adminManagers: "/admin/managers",
} as const;

/** Prefixes a path with the locale: localePath("fr", "/menu") → "/fr/menu". */
export const localePath = (lang: Locale, path: string) =>
  path === "/" ? `/${lang}` : `/${lang}${path}`;

/** Swaps the locale segment of the current pathname (used by the EN/FR toggle). */
export const switchLocalePath = (pathname: string, lang: Locale) => {
  const [, , ...rest] = pathname.split("/");
  return localePath(lang, rest.length ? `/${rest.join("/")}` : "/");
};

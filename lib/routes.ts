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
  forgotPassword: "/forgot-password",
} as const;

/** Prefixes a path with the locale: localePath("fr", "/menu") → "/fr/menu". */
export const localePath = (lang: Locale, path: string) =>
  path === "/" ? `/${lang}` : `/${lang}${path}`;

/** Swaps the locale segment of the current pathname (used by the EN/FR toggle). */
export const switchLocalePath = (pathname: string, lang: Locale) => {
  const [, , ...rest] = pathname.split("/");
  return localePath(lang, rest.length ? `/${rest.join("/")}` : "/");
};

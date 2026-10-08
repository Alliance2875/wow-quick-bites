export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie remembering the last language picked with the EN/FR toggle (read by proxy.ts). */
export const LOCALE_COOKIE = "lang";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Content that exists in every language (menu items, promotions…). */
export type Localized<T = string> = Record<Locale, T>;

export const localize = <T,>(value: Localized<T>, lang: Locale): T => value[lang];

/** Remembers the language picked with the EN/FR toggle (client only). */
export function rememberLocale(lang: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

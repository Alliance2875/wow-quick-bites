export const themes = ["dark", "light"] as const;
export type Theme = (typeof themes)[number];

export const THEME_COOKIE = "theme";
/** Light by default; the visitor's choice is kept in a cookie. */
export const defaultTheme: Theme = "light";

/**
 * Runs in <head> before first paint (see app/[lang]/layout.tsx): applies the saved theme,
 * so there is no light/dark flash. Without a saved choice the server default stays.
 */
export const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(dark|light)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`;

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

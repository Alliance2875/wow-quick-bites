import { routes } from "@/lib/routes";
import type { CommonDict } from "@/i18n/dictionaries/en/common";

/** Main navigation (header + footer "Quick Links"). Labels come from the common dictionary. */
export const mainNav: { key: keyof CommonDict["nav"]; href: string }[] = [
  { key: "home", href: routes.home },
  { key: "menu", href: routes.menu },
  { key: "about", href: routes.about },
  { key: "contact", href: routes.contact },
];

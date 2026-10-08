import type { IconName } from "@/components/shared/ui/Icon";
import type { Localized } from "@/i18n/config";

export const contactCards: { icon: IconName; label: Localized; value: Localized; href?: string }[] = [
  {
    icon: "phone",
    label: { en: "Phone", fr: "Téléphone" },
    value: { en: "+250 7XX XXX XXX", fr: "+250 7XX XXX XXX" },
  },
  {
    icon: "mail",
    label: { en: "Email", fr: "Email" },
    value: { en: "hello@wowquickbites.rw", fr: "hello@wowquickbites.rw" },
    href: "mailto:hello@wowquickbites.rw",
  },
  {
    icon: "mapPin",
    label: { en: "Location", fr: "Adresse" },
    value: { en: "Kigali, Rwanda", fr: "Kigali, Rwanda" },
  },
  {
    icon: "clock",
    label: { en: "Hours", fr: "Horaires" },
    value: { en: "Every day, 8:00 – 22:00", fr: "Tous les jours, 8:00 – 22:00" },
  },
];

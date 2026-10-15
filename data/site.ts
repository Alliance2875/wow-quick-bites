import type { IconName } from "@/components/shared/ui/Icon";
import type { Localized } from "@/i18n/config";

/** "Why choose us" bar at the bottom of the home page. */
export const features: { icon: IconName; title: Localized; text: Localized }[] = [
  {
    icon: "truck",
    title: { en: "Fast Delivery", fr: "Livraison rapide" },
    text: { en: "Hot food at your door", fr: "Des plats chauds à votre porte" },
  },
  {
    icon: "shieldCheck",
    title: { en: "Secure Payment", fr: "Paiement sécurisé" },
    text: { en: "MTN MoMo & Airtel Money", fr: "MTN MoMo & Airtel Money" },
  },
  {
    icon: "headphones",
    title: { en: "24/7 Support", fr: "Assistance 24 h/24, 7 j/7" },
    text: { en: "We're here to help", fr: "Nous sommes là pour vous aider" },
  },
  {
    icon: "leaf",
    title: { en: "Fresh Ingredients", fr: "Ingrédients frais" },
    text: { en: "Quality from local farms", fr: "La qualité des fermes locales" },
  },
];

/** Small trust badges under the hero buttons. */
export const heroHighlights: { icon: IconName; label: Localized }[] = [
  { icon: "truck", label: { en: "Fast Delivery", fr: "Livraison rapide" } },
  { icon: "leaf", label: { en: "Fresh Food", fr: "Cuisine fraîche" } },
  { icon: "shieldCheck", label: { en: "Secure Payment", fr: "Paiement sécurisé" } },
];

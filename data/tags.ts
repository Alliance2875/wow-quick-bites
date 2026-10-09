import { localize, type Locale, type Localized } from "@/i18n/config";

/** Small labels shown on dish cards. Note: "cold" and "fresh" are both "Frais" in French (as in the design). */
export const tags = {
  beef: { en: "Beef", fr: "Bœuf" },
  cheese: { en: "Cheese", fr: "Fromage" },
  chicken: { en: "Chicken", fr: "Poulet" },
  chips: { en: "Chips", fr: "Frites" },
  wrap: { en: "Wrap", fr: "Wrap" },
  ham: { en: "Ham", fr: "Jambon" },
  pepperoni: { en: "Pepperoni", fr: "Pepperoni" },
  fresh: { en: "Fresh", fr: "Frais" },
  sweet: { en: "Sweet", fr: "Sucré" },
  cold: { en: "Cold", fr: "Frais" },
  fruit: { en: "Fruit", fr: "Fruit" },
  fruity: { en: "Fruity", fr: "Fruité" },
  tropical: { en: "Tropical", fr: "Tropical" },
  creamy: { en: "Creamy", fr: "Onctueux" },
  classic: { en: "Classic", fr: "Classique" },
  crunchy: { en: "Crunchy", fr: "Croustillant" },
  rich: { en: "Rich", fr: "Intense" },
  healthy: { en: "Healthy", fr: "Sain" },
  hot: { en: "Hot", fr: "Chaud" },
  spiced: { en: "Spiced", fr: "Épicé" },
  aromatic: { en: "Aromatic", fr: "Parfumé" },
} satisfies Record<string, Localized>;

export type TagKey = keyof typeof tags;

export const tagLabel = (tag: TagKey, lang: Locale) => localize(tags[tag], lang);

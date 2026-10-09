import type { OptionGroup } from "./types";

// Customisation groups, referenced by id from MenuItem.optionGroups.
// A menu item with option groups opens the customise modal from its "Order Now" button.

export const optionGroups: Record<string, OptionGroup> = {
  "extra-proteins": {
    id: "extra-proteins",
    name: { en: "Add extra proteins", fr: "Ajouter des protéines" },
    kind: "add",
    required: false,
    choices: [
      { id: "extra-chicken", name: { en: "Extra chicken", fr: "Supplément de poulet" }, price: 1500 },
      { id: "extra-beef", name: { en: "Extra beef", fr: "Supplément de bœuf" }, price: 1000 },
      { id: "fried-egg", name: { en: "Fried egg", fr: "Œuf au plat" }, price: 500 },
      { id: "extra-cheese", name: { en: "Extra cheese", fr: "Supplément de fromage" }, price: 700 },
      { id: "sausage", name: { en: "Sausage", fr: "Saucisse" }, price: 1000 },
    ],
  },
  "leave-out-chicken": {
    id: "leave-out-chicken",
    name: { en: "Leave out", fr: "Retirer" },
    hint: {
      en: "Select anything you don't want in your order",
      fr: "Sélectionnez ce que vous ne souhaitez pas dans votre commande",
    },
    kind: "remove",
    required: false,
    choices: [
      { id: "no-garlic-dip", name: { en: "No garlic dip", fr: "Sans sauce à l’ail" }, price: 0 },
      { id: "no-salt", name: { en: "No salt", fr: "Sans sel" }, price: 0 },
      { id: "no-parsley", name: { en: "No parsley", fr: "Sans persil" }, price: 0 },
    ],
  },
};

export const getOptionGroups = (ids: string[] = []) =>
  ids.map((id) => optionGroups[id]).filter((group): group is OptionGroup => Boolean(group));

/** All choices of the given groups, by id (to price and label cart lines). */
export const findChoice = (choiceId: string) => {
  for (const group of Object.values(optionGroups)) {
    const choice = group.choices.find((c) => c.id === choiceId);
    if (choice) return choice;
  }
  return undefined;
};

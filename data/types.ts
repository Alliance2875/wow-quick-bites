import type { IconName } from "@/components/shared/ui/Icon";
import type { Localized } from "@/i18n/config";
import type { TagKey } from "./tags";

// Shapes of the mock content in data/. They mirror what the backend API should return,
// so swapping a data file for a fetch() later does not touch the components.

export type CategoryId = "burgers" | "pizza" | "desserts" | "drinks" | "chips" | "chicken";

export type Category = {
  id: CategoryId;
  name: Localized;
  icon: IconName;
};

export type MenuGroup = "food" | "drinks";

export type MenuItem = {
  /** Also the URL slug: /menu/[id] */
  id: string;
  name: Localized;
  description: Localized;
  /** Short line under the name in the cart ("Beef · Cheese · Toasted bun") */
  cartMeta?: Localized;
  /** RWF */
  price: number;
  image: string;
  group: MenuGroup;
  /** Drinks page section (see drinkSections in data/menu.ts) */
  section?: DrinkSectionId;
  categories: CategoryId[];
  tags: TagKey[];
  isNew?: boolean;
  /** Customisation groups shown in the product modal / page (see data/product-options.ts) */
  optionGroups?: string[];
  /** Suggested drink shown under the product page ("Add something refreshing") */
  pairsWith?: string;
};

export type DrinkSectionId = "smoothies" | "milkshakes" | "ice-cream" | "mojitos" | "spiced-tea";

export type DrinkSection = {
  id: DrinkSectionId;
  name: Localized;
  note?: Localized;
};

export type OptionChoice = {
  id: string;
  name: Localized;
  /** Extra cost in RWF, 0 when included */
  price: number;
};

export type OptionGroup = {
  id: string;
  name: Localized;
  hint?: Localized;
  /** add = checkbox left + extra price right; remove = label left + checkbox right */
  kind: "add" | "remove";
  required: boolean;
  max?: number;
  choices: OptionChoice[];
};

export type Promotion = {
  id: string;
  kicker: Localized;
  /** Big number/word block: "SAVE RWF / 1,000" (labelFirst) or "FREE / DELIVERY" */
  highlight?: { label: Localized; value: Localized; labelFirst: boolean };
  title: Localized;
  text: Localized;
  cta: Localized;
  image: string;
  href: string;
  /** yellow = filled yellow block, plain = card background */
  tone: "yellow" | "plain";
};

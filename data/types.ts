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

// ───────── Client area + staff portal ─────────

/** Permanent client code: identifies a person across all purchases ("WQB001A"), never an order. */
export type ClientCode = string;

export type Client = {
  code: ClientCode;
  name: string;
  email: string;
  phone?: string;
};

export type StaffRole = "manager" | "superadmin";

/** Content rights a superadmin can delegate to one manager (see lib/auth/roles.ts → grantScopes). */
export type ContentGrant = {
  grantedBy: string;
  scopes: ("food" | "drinks" | "labels" | "ads" | "publish")[];
  /** ISO dates, Kigali time */
  startsAt: string;
  /** No end date = until revoked */
  expiresAt?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  /** Manager register coverage */
  assignment: "pickup-register" | "backup" | "none";
  duty: "on" | "off";
  status: "active" | "suspended";
  contentGrant?: ContentGrant;
};

export type OrderStage = "new" | "accepted" | "preparing" | "ready" | "completed" | "cancelled";

export type PortalOrder = {
  id: string;
  clientCode: ClientCode;
  /** Staff id of the manager in charge */
  managerId: string;
  /** ISO date, Kigali time */
  placedAt: string;
  fulfilment: "pickup" | "delivery";
  payment: "pay-on-pickup" | "mtn-momo" | "airtel-money";
  paymentStatus: "pending" | "paid" | "not-charged";
  stage: OrderStage;
  /** Prices come from the menu (data/menu.ts): order totals are computed, never stored twice */
  lines: { itemId: string; quantity: number }[];
  /** When each stage was reached (ISO dates) */
  history: Partial<Record<OrderStage, string>>;
};

export type ClientNotification = {
  id: string;
  clientCode: ClientCode;
  orderId: string;
  stage: OrderStage;
  title: Localized;
  text: Localized;
  at: string;
  read: boolean;
};

export type AuditEvent = {
  id: string;
  at: string;
  /** Staff id, or "system" */
  actorId: string;
  /** orders = register activity, content = menu/ads, access = people and permissions */
  scope: "orders" | "content" | "access";
  /** Person affected by an access change ("Rwasibo Alexis Junior → Eric") */
  targetId?: string;
  text: Localized;
};

export type Campaign = {
  /** Same id as the promotion it advertises (data/promotions.ts) */
  promotionId: string;
  status: "published" | "draft" | "scheduled";
  tag: "promotion" | "new" | "offer";
  placement: "home-offers" | "home-hero";
  /** Menu category the call-to-action opens, or null for the whole menu */
  ctaCategory: CategoryId | null;
  startsAt?: string;
  endsAt?: string;
  /** Short schedule line under the card ("Weekdays") */
  schedule?: Localized;
};

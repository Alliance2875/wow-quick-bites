import type { Promotion } from "./types";

/** The 3 promotions of the home-page advertisement panel. */
export const promotions: Promotion[] = [
  {
    id: "weekday-combo",
    kicker: { en: "WEEKDAY COMBO", fr: "FORMULE EN SEMAINE" },
    highlight: { label: { en: "SAVE RWF", fr: "ÉCONOMISEZ RWF" }, value: { en: "1,000", fr: "1,000" }, labelFirst: true },
    title: { en: "Burger + Mojito Combo", fr: "Formule burger + mojito" },
    text: {
      en: "Save RWF 1,000 every weekday with Toasted Burger + Fresh Mint Mojito.",
      fr: "Économisez RWF 1,000 chaque jour de semaine avec le burger toasté et le mojito à la menthe fraîche.",
    },
    cta: { en: "Order Now", fr: "Commander" },
    image: "/images/burger.jpg",
    href: "/menu/wow-toasted-burger",
    tone: "yellow",
  },
  {
    id: "new-pizza",
    kicker: { en: "NEW DISH", fr: "NOUVEAU PLAT" },
    title: { en: "Pepperoni Pizza is here", fr: "La pizza au pepperoni est arrivée" },
    text: {
      en: "Stone-baked and loaded with cheese. Try the newest member of the WOW family.",
      fr: "Cuite sur pierre et généreusement garnie de fromage. Découvrez la dernière nouveauté de la famille WOW.",
    },
    cta: { en: "Try Now", fr: "Goûter" },
    image: "/images/pizza.jpg",
    href: "/menu/pepperoni-pizza",
    tone: "plain",
  },
  {
    id: "free-delivery-friday",
    kicker: { en: "FRIDAY OFFER", fr: "OFFRE DU VENDREDI" },
    highlight: { label: { en: "DELIVERY", fr: "LIVRAISON" }, value: { en: "FREE", fr: "GRATUITE" }, labelFirst: false },
    title: { en: "Free Delivery Fridays", fr: "Livraison gratuite le vendredi" },
    text: {
      en: "Every Friday, delivery is on us for orders above RWF 10,000.",
      fr: "Chaque vendredi, nous offrons la livraison pour les commandes de plus de RWF 10,000.",
    },
    cta: { en: "Order Friday", fr: "Commander vendredi" },
    image: "/images/fries.jpg",
    href: "/menu",
    tone: "plain",
  },
];

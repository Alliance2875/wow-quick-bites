import type { CartDict } from "../en/cart";

export const cart: CartDict = {
  breadcrumb: "Panier",
  title: "Votre panier",
  subtitle: "Vérifiez vos articles avant de passer au paiement.",
  steps: {
    label: "Progression de la commande",
    cart: "Votre panier",
    checkout: "Paiement",
    confirmation: "Confirmation",
  },
  addMore: "Ajouter des articles",
  empty: "Votre panier est vide.",
  browseMenu: "Voir le menu",
  itemsTitle: "Articles dans votre panier",
  itemCount: { one: "{count} article", other: "{count} articles" },
  each: "{price} l’unité",
  remove: "Retirer",
  continueShopping: "Continuer mes achats",
  summary: {
    title: "Récapitulatif de la commande",
    meta: "{items} · Prix habituels du menu",
    subtotal: "Sous-total",
    fees: "Frais supplémentaires",
    total: "Total",
  },
  proceed: "Passer au paiement",
  proceedHelper: "Choisissez le retrait ou la livraison et votre mode de paiement à l’étape suivante.",
  shoppingAs: "Achats en tant que {name}",
  clientCode: "Code client permanent : {code}. Un seul code pour tous vos achats.",
};

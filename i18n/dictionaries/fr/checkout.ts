import type { CheckoutDict } from "../en/checkout";

export const checkout: CheckoutDict = {
  breadcrumb: "Paiement",
  title: "Paiement",
  subtitle: "Confirmez vos coordonnées, votre mode de réception et vos préférences de paiement.",
  gate: {
    title: "Connectez-vous pour commander",
    text: "Votre panier est conservé. Connectez-vous ou créez un compte pour passer votre commande.",
    signIn: "Se connecter",
    or: "ou",
    guest: "Continuer sans se connecter",
    guestNote: "Aucun compte nécessaire : seulement votre nom et votre numéro de téléphone.",
  },
  guest: {
    kicker: "COMMANDE INVITÉ",
    role: "Continuer sans compte",
    text: "Indiquez simplement votre nom et votre numéro de téléphone ci-dessous. Le gérant vous appelle à ce numéro si besoin pour votre commande.",
    signIn: "Vous avez un compte ? Connectez-vous",
    createAccount: "Créer un compte pour obtenir un code client permanent",
  },
  account: {
    kicker: "COMPTE CONNECTÉ",
    role: "Client",
    codeKicker: "CODE CLIENT PERMANENT",
    codeHelp: "Un seul code pour tous vos achats.",
  },
  contact: {
    title: "Coordonnées du client",
    fullName: "Nom complet",
    phone: "Numéro de téléphone",
    phonePlaceholder: "07X XXX XXXX",
    email: "Email",
    emailPlaceholder: "Saisissez votre adresse e-mail",
  },
  fulfilment: {
    title: "Comment souhaitez-vous recevoir votre commande ?",
    pickupHelp:
      "Retirez votre commande lorsque le gestionnaire confirme qu’elle est prête. L’heure de retrait n’est pas encore confirmée.",
    deliveryHelp: "Nous livrons à l’adresse ci-dessous dès que le gestionnaire accepte votre commande.",
    address: "Adresse de livraison",
    addressPlaceholder: "District, rue, numéro de maison",
  },
  payment: {
    title: "Paiement",
    dueOnPickup: "{amount} seront à régler au retrait de votre commande.",
    dueMobile: "Vous recevrez une demande de paiement {method} de {amount} sur votre téléphone.",
  },
  notes: {
    title: "Remarques sur la commande",
    label: "Remarques (facultatif)",
    placeholder: "Souhaitez-vous nous préciser quelque chose au sujet de votre commande ?",
  },
  sidebar: {
    title: "Votre commande",
    meta: "{items} · Montants en RWF",
    editCart: "Modifier le panier",
    pendingNote: "Le paiement reste en attente jusqu’à sa confirmation au retrait.",
    placeOrder: "Commander · {amount}",
    helper:
      "Vérifiez vos coordonnées avant de commander. Suivez l’acceptation de votre commande et sa disponibilité dans votre compte.",
    backToCart: "Retour au panier",
  },
  required: "Veuillez indiquer votre nom et votre numéro de téléphone.",
  invalidPhone: "Saisissez un numéro de mobile rwandais valide (07X XXX XXXX).",
};

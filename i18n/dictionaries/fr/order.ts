import type { OrderDict } from "../en/order";

export const order: OrderDict = {
  breadcrumb: "Confirmation de commande",
  thanks: "Merci, {name}. Votre commande a été envoyée.",
  meta: "Commande {id} · Passée le {date} · {fulfilment}",
  dateFormat: "{day} à {time}",
  receiptNote:
    "Reçu d’envoi · Ce reçu correspond au moment de la commande, avant son acceptation par le gestionnaire. Consultez le suivi pour connaître le dernier statut.",
  receiptTitle: "Votre reçu · {id}",
  receiptMeta: "{items} · Prix habituels du menu · Montants en RWF",
  next: {
    title: "Les prochaines étapes",
    review: {
      title: "Le gestionnaire examine votre commande",
      text: "Suivez votre commande pour recevoir les informations sur son acceptation et sa préparation.",
    },
    ready: {
      title: "Attendez l’avis de disponibilité",
      text: "Consultez les notifications lorsque votre commande est indiquée comme prête à retirer.",
    },
    collect: {
      title: "Retirez et payez",
      text: "Présentez {id} au retrait. {amount} sont à régler ; la commande est terminée après confirmation du retrait et du paiement.",
    },
  },
  backToMenu: "Retour au menu",
  identity: {
    title: "Identité du client et de la commande",
    client: "Client",
    clientCode: "Code client permanent",
    orderId: "Identifiant de commande",
    note: "Votre code client vous identifie pour tous vos achats. L’identifiant de commande correspond uniquement à cet achat.",
  },
  payment: {
    title: "Paiement et réception",
    pending: "Paiement en attente",
    fulfilment: "Réception",
    method: "Paiement",
    amountDue: "Montant dû",
  },
  track: "Suivre la commande {id}",
  notifications: "Notifications",
  myOrders: "Mes commandes",
  none: {
    title: "Aucune commande récente",
    text: "Passez une commande depuis le menu pour voir sa confirmation ici.",
  },
};

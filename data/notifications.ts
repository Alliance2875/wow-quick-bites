import type { ClientNotification } from "./types";

// Mock order updates sent to clients — will come from the backend (one per stage change).

export const notifications: ClientNotification[] = [
  {
    id: "n-4",
    clientCode: "WQB001A",
    orderId: "ORD-1042",
    stage: "preparing",
    title: { en: "Your order is being prepared", fr: "Votre commande est en préparation" },
    text: {
      en: "Eric started preparing your WOW Toasted Burger and Fresh Mint Mojito.",
      fr: "Eric a commencé à préparer votre burger toasté WOW et votre mojito à la menthe fraîche.",
    },
    at: "2026-10-06T12:20:00+02:00",
    read: false,
  },
  {
    id: "n-3",
    clientCode: "WQB001A",
    orderId: "ORD-1042",
    stage: "accepted",
    title: { en: "Your order was accepted", fr: "Votre commande a été acceptée" },
    text: {
      en: "Eric accepted your pickup order. Payment is due on pickup.",
      fr: "Eric a accepté votre commande à retirer. Le paiement est à effectuer au retrait.",
    },
    at: "2026-10-06T12:19:00+02:00",
    read: true,
  },
  {
    id: "n-2",
    clientCode: "WQB001A",
    orderId: "ORD-1031",
    stage: "completed",
    title: { en: "Pickup confirmed — order completed", fr: "Retrait confirmé — commande terminée" },
    text: {
      en: "Your Fresh Mint Mojito was collected. RWF 3,000 was paid on pickup.",
      fr: "Votre mojito à la menthe fraîche a été retiré. RWF 3,000 ont été payés au retrait.",
    },
    at: "2026-10-04T14:18:00+02:00",
    read: true,
  },
  {
    id: "n-1",
    clientCode: "WQB001A",
    orderId: "ORD-1031",
    stage: "ready",
    title: { en: "Your order was ready for pickup", fr: "Votre commande était prête à retirer" },
    text: {
      en: "Eric marked your Fresh Mint Mojito ready. This order has since been collected.",
      fr: "Eric a indiqué que votre mojito à la menthe fraîche était prêt. Cette commande a depuis été retirée.",
    },
    at: "2026-10-04T14:10:00+02:00",
    read: true,
  },
];

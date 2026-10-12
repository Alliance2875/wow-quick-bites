import type { ChatMessage } from "./types";

// Mock conversations — will come from the backend. One conversation per client code (not per order);
// each message can point to the order it is about.

export const messages: ChatMessage[] = [
  {
    id: "m-1",
    clientCode: "WQB001A",
    from: "client",
    orderId: "ORD-1042",
    text: {
      en: "Hi, please let me know when my order is ready.",
      fr: "Bonjour, merci de me prévenir lorsque ma commande sera prête.",
    },
    sentAt: "2026-10-06T12:21:00+02:00",
    readByClient: true,
    readByManager: true,
  },
  {
    id: "m-2",
    clientCode: "WQB001A",
    from: "manager",
    authorId: "eric",
    orderId: "ORD-1042",
    text: {
      en: "Of course! Your order is being prepared. I’ll notify you as soon as it’s ready.",
      fr: "Bien sûr ! Votre commande est en préparation. Je vous préviendrai dès qu’elle sera prête.",
    },
    sentAt: "2026-10-06T12:22:00+02:00",
    readByClient: false,
    readByManager: true,
  },
  {
    id: "m-3",
    clientCode: "WQB002A",
    from: "client",
    orderId: "ORD-1040",
    text: { en: "Thanks, I’ll come to pick it up.", fr: "Merci, je viendrai la retirer." },
    sentAt: "2026-10-06T12:17:00+02:00",
    readByClient: true,
    readByManager: false,
  },
  {
    id: "m-4",
    clientCode: "WQB003A",
    from: "client",
    orderId: "ORD-1043",
    text: { en: "Is my order confirmed?", fr: "Ma commande est-elle confirmée ?" },
    sentAt: "2026-10-06T12:27:00+02:00",
    readByClient: true,
    readByManager: false,
  },
];

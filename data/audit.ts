import type { AuditEvent } from "./types";

// Mock audit trail — will come from the backend. Newest first.

export const auditEvents: AuditEvent[] = [
  {
    id: "a-8",
    at: "2026-10-06T12:20:00+02:00",
    actorId: "eric",
    scope: "orders",
    text: { en: "ORD-1042 moved to Preparing · WQB001A", fr: "ORD-1042 passée en préparation · WQB001A" },
  },
  {
    id: "a-7",
    at: "2026-10-06T12:16:00+02:00",
    actorId: "nadia",
    scope: "orders",
    text: { en: "ORD-1041 accepted · WQB004A", fr: "ORD-1041 acceptée · WQB004A" },
  },
  {
    id: "a-6",
    at: "2026-10-06T12:14:00+02:00",
    actorId: "eric",
    scope: "orders",
    text: { en: "ORD-1040 marked Ready · WQB002A", fr: "ORD-1040 marquée comme prête · WQB002A" },
  },
  {
    id: "a-5",
    at: "2026-10-06T11:30:00+02:00",
    actorId: "rwasibo",
    scope: "access",
    targetId: "chantal",
    text: {
      en: "Chantal’s manager access suspended · no assignments",
      fr: "Accès gestionnaire de Chantal suspendu · aucune affectation",
    },
  },
  {
    id: "a-4",
    at: "2026-10-06T09:10:00+02:00",
    actorId: "eric",
    scope: "content",
    text: {
      en: "Mango Smoothie draft updated · NEW enabled",
      fr: "Brouillon du smoothie à la mangue mis à jour · NOUVEAU activé",
    },
  },
  {
    id: "a-3",
    at: "2026-10-06T09:00:00+02:00",
    actorId: "rwasibo",
    scope: "access",
    targetId: "eric",
    text: {
      en: "Temporary content permissions granted: food/drink editing, NEW labels, ads and publishing until 09 Oct, 18:00",
      fr: "Autorisations temporaires de contenu accordées : plats/boissons, étiquettes NOUVEAU, publicités et publication jusqu’au 09 Oct, 18:00",
    },
  },
  {
    id: "a-2",
    at: "2026-10-05T18:00:00+02:00",
    actorId: "rwasibo",
    scope: "access",
    targetId: "eric",
    text: {
      en: "Previous content grant revoked. Orders and chat retained.",
      fr: "Autorisation de contenu précédente révoquée. Commandes et discussions conservées.",
    },
  },
];

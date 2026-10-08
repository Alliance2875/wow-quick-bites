import type { Localized } from "@/i18n/config";

export type FulfilmentId = "pickup" | "delivery";
export type PaymentMethodId = "pay-on-pickup" | "mtn-momo" | "airtel-money";

export const fulfilmentOptions: { id: FulfilmentId; label: Localized }[] = [
  { id: "pickup", label: { en: "Pickup", fr: "Retrait" } },
  { id: "delivery", label: { en: "Delivery", fr: "Livraison" } },
];

export const paymentMethods: { id: PaymentMethodId; label: Localized; summary: Localized }[] = [
  {
    id: "pay-on-pickup",
    label: { en: "Pay on pickup", fr: "Payer au retrait" },
    summary: { en: "Pay on pickup", fr: "Paiement au retrait" },
  },
  { id: "mtn-momo", label: { en: "MTN MoMo", fr: "MTN MoMo" }, summary: { en: "MTN MoMo", fr: "MTN MoMo" } },
  {
    id: "airtel-money",
    label: { en: "Airtel Money", fr: "Airtel Money" },
    summary: { en: "Airtel Money", fr: "Airtel Money" },
  },
];

/** "Additional fees" row of the order summary (RWF 0 in the design). */
export const ADDITIONAL_FEES = 0;

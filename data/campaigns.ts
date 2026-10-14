import type { Campaign } from "./types";

// Homepage campaigns managed in the portal (Menu & Ads). Title, copy and image come from the
// promotion with the same id in data/promotions.ts.

export const campaigns: Campaign[] = [
  {
    promotionId: "weekday-combo",
    status: "published",
    tag: "promotion",
    placement: "home-offers",
    ctaCategory: "burgers",
    startsAt: "2026-10-06T08:00:00+02:00",
    endsAt: "2026-10-09T18:00:00+02:00",
    schedule: { en: "Weekdays", fr: "En semaine" },
  },
  {
    promotionId: "new-pizza",
    status: "draft",
    tag: "new",
    placement: "home-offers",
    ctaCategory: "pizza",
  },
  {
    promotionId: "free-delivery-friday",
    status: "scheduled",
    tag: "offer",
    placement: "home-offers",
    ctaCategory: null,
    startsAt: "2026-10-09T08:00:00+02:00",
  },
];

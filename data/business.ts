import type { Localized } from "@/i18n/config";
import { site } from "./site";

// Business identity shown in the portal (Business & contact settings).

export const business = {
  name: { en: "WOW Quick Bites by Rwasibo", fr: "WOW Quick Bites par Rwasibo" } satisfies Localized,
  owner: site.owner,
  /** Kigali time (UTC+2, no daylight saving): every date in data/ is written with +02:00 */
  timeZone: "Africa/Kigali",
  /**
   * Clock of the sample data. The mock orders, chats and grants are a frozen snapshot of
   * 06 Oct 2026 around 12:30; "today", "yesterday" and grant expiry are computed against it.
   * When the backend is connected, replace with the real time (new Date()).
   */
  sampleNow: "2026-10-06T12:30:00+02:00",
  /** Order queue shows the register's recent activity (today + the previous days) */
  queueWindowDays: 3,
};

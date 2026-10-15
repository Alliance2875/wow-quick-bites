export const portalNow = () => Date.now();

const DAY = 24 * 60 * 60 * 1000;

/** Calendar day in Kigali (UTC+2, no DST) as "YYYY-MM-DD". */
export const kigaliDay = (iso: string | number) =>
  new Date(new Date(iso).getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** 0 = today, 1 = yesterday… (Kigali calendar days, relative to the portal clock). */
export const daysAgo = (iso: string) =>
  Math.round((Date.parse(kigaliDay(portalNow())) - Date.parse(kigaliDay(iso))) / DAY);

export const isActiveWindow = (startsAt?: string, expiresAt?: string) => {
  const now = portalNow();
  return (!startsAt || Date.parse(startsAt) <= now) && (!expiresAt || Date.parse(expiresAt) > now);
};

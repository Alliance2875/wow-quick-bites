import { business } from "@/data/business";
import { daysAgo } from "./clock";

// Dates are shown in Kigali time with the designs' format in both languages: "06 Oct 2026 · 12:18".
// Same output on the server and in the browser (explicit time zone), so no hydration mismatch.

const time = new Intl.DateTimeFormat("en-GB", { timeZone: business.timeZone, hour: "2-digit", minute: "2-digit" });
const parts = new Intl.DateTimeFormat("en-GB", { timeZone: business.timeZone, day: "2-digit", month: "numeric", year: "numeric" });
// Fixed 3-letter months (ICU writes "Sept" in en-GB; the designs use "Sep" in both languages)
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dateParts = (iso: string) => {
  const values = Object.fromEntries(parts.formatToParts(new Date(iso)).map((part) => [part.type, part.value]));
  return { day: values.day, month: months[Number(values.month) - 1], year: values.year };
};

/** "12:18" */
export const formatTime = (iso: string) => time.format(new Date(iso));

/** "06 Oct 2026" */
export const formatDate = (iso: string) => {
  const { day, month, year } = dateParts(iso);
  return `${day} ${month} ${year}`;
};

/** "06 Oct" */
export const formatDayMonth = (iso: string) => {
  const { day, month } = dateParts(iso);
  return `${day} ${month}`;
};

/** "06 Oct 2026 · 12:18" */
export const formatDateTime = (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`;

/** "Today, 12:20" / "Yesterday, 14:05" / "04 Oct 2026, 14:05" — labels from the portal dictionary. */
export function formatRelative(iso: string, labels: { today: string; yesterday: string }, separator = ", ") {
  const days = daysAgo(iso);
  const day = days === 0 ? labels.today : days === 1 ? labels.yesterday : formatDate(iso);
  return `${day}${separator}${formatTime(iso)}`;
}

/** ISO date → value of an <input type="datetime-local"> in Kigali time ("2026-10-06T08:00"). */
export const toKigaliInput = (iso?: string) =>
  iso ? new Date(new Date(iso).getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16) : "";

/** <input type="datetime-local"> value (Kigali time) → ISO date with the +02:00 offset. */
export const fromKigaliInput = (value: string) => (value ? `${value}:00+02:00` : undefined);

/** Amount without currency, as in the tables' "Total (RWF)" columns: 9,000 */
export const formatAmount = (amount: number) => amount.toLocaleString("en-US");

import { localize, type Locale } from "@/i18n/config";
import type { AuditEntry } from "@/lib/portal/staff-store";

/** Audit event text is localized by the API. */
export function auditText(entry: AuditEntry, lang: Locale) {
  return localize(entry.text, lang);
}

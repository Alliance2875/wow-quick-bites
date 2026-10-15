import type { Dictionary } from "@/i18n/get-dictionary";
import { localize, type Locale } from "@/i18n/config";
import { fill } from "@/lib/format";
import type { AuditEntry } from "@/lib/portal/staff-store";

/** Text of an audit entry: sample events carry both languages, live ones use a template. */
export function auditText(entry: AuditEntry, lang: Locale, templates: Dictionary["staff"]["auditTemplates"]) {
  if ("text" in entry) return localize(entry.text, lang);
  const values = Object.fromEntries(
    Object.entries(entry.values).map(([key, value]) => [key, typeof value === "object" ? localize(value, lang) : value]),
  );
  return fill(templates[entry.template], values);
}

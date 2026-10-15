import { localize, type Locale, type Localized } from "@/i18n/config";

export const tagLabel = (tag: string, lang: Locale, labels: Record<string, Localized>) =>
  labels[tag] ? localize(labels[tag], lang) : tag;

import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";
import fr from "./dictionaries/fr";

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export type { Dictionary };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** For pages/layouts: validates the [lang] segment (404 otherwise) and returns both. */
export async function resolveLang(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { lang, dict: getDictionary(lang) };
}

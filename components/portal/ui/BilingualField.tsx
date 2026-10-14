"use client";

import { useId, useState } from "react";
import { locales, type Locale, type Localized } from "@/i18n/config";
import { cn } from "@/lib/format";

const control =
  "w-full rounded-md border border-border bg-field px-3 text-[0.8125rem] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-60";

export type BilingualLabels = { same: string; languages: Record<Locale, string> };

/**
 * One text in English AND French, edited together whatever language the portal is shown in.
 * "Same text in both languages" mirrors the English text into French; untick it to write
 * (or later correct) the French version separately.
 */
export default function BilingualField({
  label,
  value,
  onChange,
  labels,
  multiline = false,
  required,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  labels: BilingualLabels;
  multiline?: boolean;
  required?: boolean;
}) {
  const id = useId();
  const [same, setSame] = useState(() => value.en !== "" && value.en === value.fr);

  const change = (lang: Locale, text: string) =>
    onChange(same ? { en: text, fr: text } : { ...value, [lang]: text });

  return (
    <fieldset className="min-w-0">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <legend className="float-left text-xs text-muted-foreground">{label}</legend>
        <label className="flex cursor-pointer items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
          <input
            type="checkbox"
            checked={same}
            onChange={(e) => {
              setSame(e.target.checked);
              if (e.target.checked) onChange({ en: value.en || value.fr, fr: value.en || value.fr });
            }}
            className="h-3.5 w-3.5 accent-primary"
          />
          {labels.same}
        </label>
      </div>
      <div className="clear-both space-y-2">
        {locales.map((lang) => {
          const mirrored = same && lang === "fr";
          const props = {
            id: `${id}-${lang}`,
            lang,
            value: value[lang],
            required: required && lang === "en",
            disabled: mirrored,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(lang, e.target.value),
            "aria-label": `${label} (${labels.languages[lang]})`,
          };
          return (
            <div key={lang} className="flex items-start gap-2">
              <label
                htmlFor={props.id}
                className={cn(
                  "mt-2.5 w-7 shrink-0 rounded px-1 py-0.5 text-center text-[0.625rem] font-bold",
                  mirrored ? "bg-panel-muted text-muted-foreground" : "bg-soft text-accent",
                )}
              >
                {labels.languages[lang]}
              </label>
              {multiline ? (
                <textarea className={cn(control, "min-h-20 resize-y py-2.5 leading-relaxed")} {...props} />
              ) : (
                <input className={cn(control, "h-10")} {...props} />
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/** EN / FR switch for the storefront previews (independent of the portal language). */
export function PreviewLanguage({
  value,
  onChange,
  label,
  labels,
}: {
  value: Locale;
  onChange: (lang: Locale) => void;
  label: string;
  labels: Record<Locale, string>;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-border bg-panel p-0.5">
      {locales.map((lang) => (
        <button
          key={lang}
          type="button"
          aria-pressed={value === lang}
          onClick={() => onChange(lang)}
          className={cn(
            "h-6 rounded px-2.5 text-[0.6875rem] font-semibold transition",
            value === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {labels[lang]}
        </button>
      ))}
    </div>
  );
}

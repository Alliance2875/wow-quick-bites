"use client";

import type { OptionGroup } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import { cn, formatPrice } from "@/lib/format";

/**
 * Checkbox list for one customisation group.
 * "add" groups: checkbox left, extra price right. "remove" groups: label left, checkbox right.
 */
export default function OptionGroupFields({
  group,
  lang,
  selected,
  onToggle,
  optionalLabel,
}: {
  group: OptionGroup;
  lang: Locale;
  selected: string[];
  onToggle: (choiceId: string) => void;
  optionalLabel: string;
}) {
  const remove = group.kind === "remove";

  return (
    <fieldset>
      <legend className="flex w-full items-center justify-between gap-3">
        <span className="font-bold">{localize(group.name, lang)}</span>
        {!group.required && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[0.6875rem] text-muted-foreground">
            {optionalLabel}
          </span>
        )}
      </legend>
      {group.hint && <p className="mt-1 text-xs text-muted-foreground">{localize(group.hint, lang)}</p>}

      <ul className="mt-3 space-y-1">
        {group.choices.map((choice) => (
          <li key={choice.id}>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg py-2.5",
                remove && "flex-row-reverse justify-between",
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(choice.id)}
                onChange={() => onToggle(choice.id)}
                className="h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span className={cn("flex-1", remove && "flex-none")}>{localize(choice.name, lang)}</span>
              {!remove && choice.price > 0 && (
                <span className="text-sm text-muted-foreground">+ {formatPrice(choice.price)}</span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

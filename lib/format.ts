/** Prices are stored in RWF (integers). The designs show "RWF 6,000" in both languages. */
export const formatPrice = (amount: number) => `RWF ${amount.toLocaleString("en-US")}`;

/** Tiny template helper for dictionary strings: fill("Hi {name}", { name: "Aline" }). */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));

/** Joins class names, skipping falsy values. */
export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/** Picks the singular/plural form and fills {count}: plural({ one: "{count} item", other: "{count} items" }, 2). */
export const plural = (forms: { one: string; other: string }, count: number) =>
  fill(count === 1 ? forms.one : forms.other, { count });

"use client";

import Icon from "@/components/shared/ui/Icon";
import { applyTheme } from "@/lib/theme";

// One switch: a click anywhere on the pill flips the theme.
// The highlighted thumb is styled with the dark:/light: variants (driven by <html data-theme>),
// so the server HTML is already right and no React state is needed.
export default function ThemeToggle({ labels }: { labels: { dark: string; light: string } }) {
  const toggle = () =>
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${labels.dark} / ${labels.light}`}
      title={`${labels.dark} / ${labels.light}`}
      className="flex items-center gap-0.5 rounded-full bg-background p-1 transition hover:ring-2 hover:ring-primary-foreground/30 light:bg-white"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full transition dark:bg-primary dark:text-primary-foreground light:text-muted-foreground">
        <Icon name="moon" className="h-4 w-4" />
      </span>
      <span className="grid h-7 w-7 place-items-center rounded-full transition light:bg-primary light:text-primary-foreground dark:text-muted-foreground">
        <Icon name="sun" className="h-4 w-4" />
      </span>
    </button>
  );
}

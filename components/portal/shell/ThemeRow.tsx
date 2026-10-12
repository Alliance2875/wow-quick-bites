"use client";

import Icon from "@/components/shared/ui/Icon";
import { applyTheme } from "@/lib/theme";

/** Client sidebar row "Dark theme ☾" — label and icon follow <html data-theme> (no React state). */
export default function ThemeRow({ labels }: { labels: { dark: string; light: string } }) {
  const toggle = () =>
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-full items-center justify-between rounded-md border border-border px-2.5 text-[0.8125rem] transition hover:border-primary/60"
    >
      <span className="dark:inline light:hidden">{labels.dark}</span>
      <span className="light:inline dark:hidden">{labels.light}</span>
      <Icon name="moon" className="h-4 w-4 text-accent light:hidden" />
      <Icon name="sun" className="h-4 w-4 text-accent dark:hidden" />
    </button>
  );
}

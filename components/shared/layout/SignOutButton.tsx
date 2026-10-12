"use client";

import type { Locale } from "@/i18n/config";
import { signOutAction } from "@/lib/auth/actions";
import { forgetSession } from "@/lib/auth/session";

/** Ends the session on the server (cookie) and clears the storefront's profile copy. */
export default function SignOutButton({
  lang,
  className,
  children,
  label,
}: {
  lang: Locale;
  className?: string;
  children: React.ReactNode;
  /** Accessible name when the button only shows an icon */
  label?: string;
}) {
  return (
    <form action={signOutAction} onSubmit={forgetSession}>
      <input type="hidden" name="lang" value={lang} />
      <button type="submit" className={className} aria-label={label} title={label}>
        {children}
      </button>
    </form>
  );
}

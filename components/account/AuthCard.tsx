"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";

/** Centred card shared by Sign in and Create account: title, subtitle, Google button, "or", then the form. */
export default function AuthCard({
  title,
  subtitle,
  dict,
  children,
}: {
  title: string;
  subtitle: string;
  dict: Dictionary["account"];
  children: React.ReactNode;
}) {
  const [googleNote, setGoogleNote] = useState(false);

  return (
    <div className="px-4 pb-40 pt-18">
      <div className="mx-auto w-full max-w-[29.25rem] rounded-3xl bg-card p-7 light:border light:border-border sm:p-9">
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>

        {/* Google sign-in needs the backend (OAuth); the button only explains that for now */}
        <button
          type="button"
          onClick={() => setGoogleNote(true)}
          className="mt-6 h-11 w-full rounded-full bg-background text-sm font-semibold transition hover:brightness-125 light:border light:border-border light:bg-input"
        >
          {dict.google}
        </button>
        {googleNote && (
          <p role="status" className="mt-2 text-center text-xs text-muted-foreground">
            {dict.googleSoon}
          </p>
        )}

        <p className="my-5 text-center text-xs text-muted-foreground">{dict.or}</p>

        {children}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/shared/ui/Button";
import { TextField } from "@/components/shared/ui/Field";
import Icon from "@/components/shared/ui/Icon";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/format";
import PasswordField from "./PasswordField";

type Step = "request" | "sent" | "reset" | "success";

/**
 * Password recovery card. The design shows the 4 states side by side as previews;
 * here they replace each other, in order: request → email sent → new password → success.
 * MOCK: no email is sent yet — "I opened the link" stands in for the link in the email.
 */
export default function ForgotPasswordFlow({
  dict,
  fields,
  signInHref,
}: {
  dict: Dictionary["account"]["recovery"];
  fields: Dictionary["account"]["fields"];
  signInHref: string;
}) {
  const [step, setStep] = useState<Step>("request");
  const [error, setError] = useState("");
  const passwordLabels = { show: fields.showPassword, hide: fields.hidePassword };

  const kicker = (text: string) => <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-accent">{text}</p>;

  const resetPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirm")) {
      setError(dict.reset.mismatch);
      return;
    }
    setError("");
    setStep("success");
  };

  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-3xl border border-border p-7",
        step === "success" ? "bg-soft" : "bg-card",
      )}
    >
      {step === "request" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("sent");
          }}
        >
          {kicker(dict.request.kicker)}
          <h2 className="mt-3 text-3xl">{dict.request.title}</h2>
          <p className="mt-3 text-muted-foreground">{dict.request.text}</p>
          <TextField
            label={dict.request.email}
            name="email"
            type="email"
            placeholder={dict.request.emailPlaceholder}
            autoComplete="email"
            required
            className="mt-6"
          />
          <Button type="submit" block size="lg" className="mt-5">
            {dict.request.submit}
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">{dict.request.note}</p>
          <Link href={signInHref} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline">
            <Icon name="arrowLeft" className="h-4 w-4" /> {dict.request.back}
          </Link>
        </form>
      )}

      {step === "sent" && (
        <div>
          {kicker(dict.sent.kicker)}
          <span className="mt-4 grid h-10 w-10 place-items-center rounded-full bg-soft text-accent">
            <Icon name="mail" className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-2xl">{dict.sent.title}</h2>
          <p className="mt-3 text-muted-foreground">{dict.sent.text}</p>
          <p className="mt-3 text-xs text-muted-foreground">{dict.sent.note}</p>
          <Button variant="secondary" block className="mt-5">
            {dict.sent.resend}
          </Button>
          <Button block className="mt-3" onClick={() => setStep("reset")}>
            {dict.sent.openLink}
          </Button>
          <button
            type="button"
            onClick={() => setStep("request")}
            className="mt-4 text-sm font-bold text-accent hover:underline"
          >
            {dict.sent.differentEmail} →
          </button>
        </div>
      )}

      {step === "reset" && (
        <form onSubmit={resetPassword} className="space-y-5">
          {kicker(dict.reset.kicker)}
          <h2 className="text-2xl">{dict.reset.title}</h2>
          <p className="text-muted-foreground">{dict.reset.text}</p>
          <PasswordField
            label={dict.reset.newPassword}
            name="password"
            placeholder={dict.reset.newPlaceholder}
            autoComplete="new-password"
            minLength={6}
            required
            labels={passwordLabels}
          />
          <PasswordField
            label={dict.reset.confirm}
            name="confirm"
            placeholder={dict.reset.confirmPlaceholder}
            autoComplete="new-password"
            required
            labels={passwordLabels}
          />
          {error && (
            <p role="alert" className="text-sm font-semibold text-danger">
              {error}
            </p>
          )}
          <Button type="submit" block size="lg">
            {dict.reset.submit}
          </Button>
        </form>
      )}

      {step === "success" && (
        <div>
          {kicker(dict.success.kicker)}
          <span className="mt-4 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Icon name="check" className="h-5 w-5" strokeWidth={3} />
          </span>
          <h2 className="mt-4 text-2xl">{dict.success.title}</h2>
          <p className="mt-3">{dict.success.text}</p>
          <p className="mt-3 text-sm text-muted-foreground">{dict.success.note}</p>
          <ButtonLink href={signInHref} block size="lg" className="mt-6">
            {dict.success.back} <Icon name="arrowRight" className="h-4 w-4" />
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

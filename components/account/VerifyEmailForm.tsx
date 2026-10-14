"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/shared/ui/Button";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { resendCodeAction, verifyEmailAction, type AuthFormState, type ResendState } from "@/lib/auth/actions";
import { rememberSession } from "@/lib/auth/session";
import { fill } from "@/lib/format";
import { localePath, routes } from "@/lib/routes";
import { AuthShell } from "./AuthCard";
import AuthError from "./AuthError";
import CodeInput from "./CodeInput";

/** Step 2 of "Create account": the 6-digit code sent by email (design "Verify Your Account"). */
export default function VerifyEmailForm({
  lang,
  dict,
  email,
  devCode,
}: {
  lang: Locale;
  dict: Dictionary["account"];
  /** null when there is no pending sign-up (expired or opened directly) */
  email: string | null;
  devCode?: string;
}) {
  const t = dict.verify;
  const router = useRouter();
  const [state, action, pending] = useActionState(async (previous: AuthFormState, form: FormData) => {
    const result = await verifyEmailAction(previous, form);
    if (result && "user" in result) {
      rememberSession(result.user);
      router.replace(result.redirectTo);
      router.refresh();
    }
    return result;
  }, undefined);
  const [resent, resend] = useActionState<ResendState>(async () => {
    const result = await resendCodeAction();
    // The development code shown below changes with each new code
    if (result && "sent" in result) router.refresh();
    return result;
  }, undefined);
  const [resending, startResend] = useTransition();
  const signIn = localePath(lang, routes.signIn);

  if (!email || (state && "error" in state && state.error === "expired")) {
    return (
      <AuthShell className="text-center">
        <h1 className="text-3xl">{t.expiredTitle}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t.expiredText}</p>
        <ButtonLink href={localePath(lang, routes.signUp)} block size="lg" className="mt-8">
          {t.restart}
        </ButtonLink>
        <BackToLogin href={signIn} label={t.back} />
      </AuthShell>
    );
  }

  const done = Boolean(state && "user" in state);

  return (
    <AuthShell className="text-center sm:min-h-[39rem]">
      <h1 className="text-3xl">{t.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {t.text}
        <br />
        <strong className="font-bold text-foreground">{email}</strong>
      </p>

      <form action={action} className="mt-10 space-y-8">
        <CodeInput name="code" label={t.codeLabel} digitLabel={t.digit} />
        {state && "error" in state && <AuthError message={dict.errors[state.error]} />}
        <Button type="submit" block size="lg" disabled={pending || done}>
          {pending || done ? t.pending : t.submit}
        </Button>
      </form>

      <p className="mt-5 text-sm text-muted-foreground">
        {t.noCode}{" "}
        <button
          type="button"
          disabled={resending}
          onClick={() => startResend(resend)}
          className="font-bold text-primary hover:underline disabled:opacity-60"
        >
          {t.resend}
        </button>
      </p>
      {resent && (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          {"sent" in resent ? t.resent : dict.errors[resent.error]}
        </p>
      )}
      {devCode && <p className="mt-4 rounded-xl bg-soft px-3 py-2 text-xs text-accent">{fill(t.devCode, { code: devCode })}</p>}

      <BackToLogin href={signIn} label={t.back} />
    </AuthShell>
  );
}

function BackToLogin({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
      <Icon name="arrowLeft" className="h-4 w-4" /> {label}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/shared/ui/Button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { acceptInvitationAction, type AuthFormState } from "@/lib/auth/actions";
import { rememberSession } from "@/lib/auth/session";
import { localePath, routes } from "@/lib/routes";
import { AuthShell } from "./AuthCard";
import AuthError from "./AuthError";
import PasswordField from "./PasswordField";

export default function AcceptInvitationForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["account"];
}) {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [state, action, pending] = useActionState(async (previous: AuthFormState, form: FormData) => {
    const result = await acceptInvitationAction(previous, form);
    if (result && "user" in result) {
      rememberSession(result.user);
      router.replace(result.redirectTo);
      router.refresh();
    }
    return result;
  }, undefined);
  const invitation = dict.invitation;

  return (
    <div className="px-4 pb-40 pt-18">
      <AuthShell>
        <h1 className="text-3xl">{invitation.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{invitation.subtitle}</p>
        {!token ? (
          <div className="mt-6 space-y-5">
            <AuthError message={invitation.missingToken} />
            <Link href={localePath(lang, routes.signIn)} className="block text-center text-sm font-semibold text-accent hover:underline">
              {dict.verify.back}
            </Link>
          </div>
        ) : (
          <form action={action} className="mt-6 space-y-5">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="token" value={token} />
            <PasswordField
              label={dict.fields.password}
              name="password"
              autoComplete="new-password"
              minLength={6}
              required
              labels={{ show: dict.fields.showPassword, hide: dict.fields.hidePassword }}
            />
            {state && "error" in state && <AuthError message={dict.errors[state.error]} />}
            <Button type="submit" block size="lg" disabled={pending}>
              {pending ? invitation.pending : invitation.submit}
            </Button>
          </form>
        )}
      </AuthShell>
    </div>
  );
}

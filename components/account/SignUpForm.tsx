"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/shared/ui/Button";
import { TextField } from "@/components/shared/ui/Field";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { signUpAction, type AuthFormState } from "@/lib/auth/actions";
import { rememberSession } from "@/lib/auth/session";
import { localePath, routes } from "@/lib/routes";
import AuthCard from "./AuthCard";
import AuthError from "./AuthError";
import PasswordField from "./PasswordField";
import { safeNext } from "./safe-next";

export default function SignUpForm({ lang, dict }: { lang: Locale; dict: Dictionary["account"] }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), "");

  const [state, action, pending] = useActionState(async (previous: AuthFormState, form: FormData) => {
    const result = await signUpAction(previous, form);
    if (result && "user" in result) {
      rememberSession(result.user);
      router.replace(result.redirectTo);
      router.refresh();
    }
    return result;
  }, undefined);

  return (
    <AuthCard title={dict.signUp.title} subtitle={dict.signUp.subtitle} dict={dict}>
      <form action={action} className="space-y-5">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="next" value={next} />
        <TextField label={dict.fields.fullName} name="name" autoComplete="name" required />
        <TextField
          label={dict.fields.phone}
          name="phone"
          type="tel"
          placeholder={dict.fields.phonePlaceholder}
          autoComplete="tel"
          required
        />
        <TextField label={dict.fields.email} name="email" type="email" autoComplete="email" required />
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
          {pending ? dict.signUp.pending : dict.signUp.submit}
        </Button>
      </form>
      <Link
        href={next ? `${localePath(lang, routes.signIn)}?next=${encodeURIComponent(next)}` : localePath(lang, routes.signIn)}
        className="mt-6 block text-center text-sm font-semibold text-accent hover:underline"
      >
        {dict.signUp.switch}
      </Link>
    </AuthCard>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/ui/Button";
import { TextField } from "@/components/shared/ui/Field";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { signIn } from "@/lib/auth/session";
import { localePath, routes } from "@/lib/routes";
import AuthCard from "./AuthCard";
import PasswordField from "./PasswordField";
import { safeNext } from "./safe-next";

export default function SignInForm({ lang, dict }: { lang: Locale; dict: Dictionary["account"] }) {
  const router = useRouter();
  // ?next=/en/checkout brings the user back to checkout after signing in
  const next = safeNext(useSearchParams().get("next"), localePath(lang, routes.home));
  const passwordLabels = { show: dict.fields.showPassword, hide: dict.fields.hidePassword };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    signIn(String(form.get("email")));
    router.push(next);
  };

  const keepNext = (path: string) => `${localePath(lang, path)}?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard title={dict.signIn.title} subtitle={dict.signIn.subtitle} dict={dict}>
      <form onSubmit={submit} className="space-y-5">
        <TextField label={dict.fields.email} name="email" type="email" autoComplete="email" required />
        <div>
          <PasswordField
            label={dict.fields.password}
            name="password"
            autoComplete="current-password"
            required
            labels={passwordLabels}
          />
          {/* Not in the design: needed to reach the recovery page */}
          <Link
            href={localePath(lang, routes.forgotPassword)}
            className="mt-2 block text-right text-xs font-semibold text-accent hover:underline"
          >
            {dict.signIn.forgot}
          </Link>
        </div>
        <Button type="submit" block size="lg">
          {dict.signIn.submit}
        </Button>
      </form>
      <Link href={keepNext(routes.signUp)} className="mt-6 block text-center text-sm font-semibold text-accent hover:underline">
        {dict.signIn.switch}
      </Link>
    </AuthCard>
  );
}

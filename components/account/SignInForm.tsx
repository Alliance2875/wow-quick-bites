"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/shared/ui/Button";
import { TextField } from "@/components/shared/ui/Field";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { signInAction, type AuthFormState } from "@/lib/auth/actions";
import { rememberSession } from "@/lib/auth/session";
import { localePath, routes } from "@/lib/routes";
import AuthCard from "./AuthCard";
import AuthError from "./AuthError";
import PasswordField from "./PasswordField";
import { safeNext } from "./safe-next";

export default function SignInForm({ lang, dict }: { lang: Locale; dict: Dictionary["account"] }) {
  const router = useRouter();
  // ?next=/en/checkout brings the user back to checkout after signing in
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "");
  // Set by the Google callback when sign-in with Google did not complete
  const googleFailed = params.get("error") === "google";
  const googleConfigError = params.get("error") === "google-config";
  const backendConfigError = params.get("error") === "backend-config";
  const passwordLabels = { show: dict.fields.showPassword, hide: dict.fields.hidePassword };

  // The Server Action checks the credentials and sets the HttpOnly session cookie;
  // the public profile is then mirrored for the storefront header and checkout.
  const [state, action, pending] = useActionState(async (previous: AuthFormState, form: FormData) => {
    const result = await signInAction(previous, form);
    if (result && "user" in result) {
      rememberSession(result.user);
      router.replace(result.redirectTo);
      router.refresh();
    }
    return result;
  }, undefined);

  const keepNext = (path: string) =>
    next ? `${localePath(lang, path)}?next=${encodeURIComponent(next)}` : localePath(lang, path);

  return (
    <AuthCard
      title={dict.signIn.title}
      subtitle={dict.signIn.subtitle}
      dict={dict}
      lang={lang}
      next={next}
      googleConfigError={googleConfigError}
      backendConfigError={backendConfigError}
    >
      {googleFailed && !state && (
        <div className="mb-5">
          <AuthError message={dict.googleError} />
        </div>
      )}
      <form action={action} className="space-y-5">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="next" value={next} />
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
        {state && "error" in state && <AuthError message={dict.errors[state.error]} />}
        <Button type="submit" block size="lg" disabled={pending}>
          {pending ? dict.signIn.pending : dict.signIn.submit}
        </Button>
      </form>
      <Link href={keepNext(routes.signUp)} className="mt-6 block text-center text-sm font-semibold text-accent hover:underline">
        {dict.signIn.switch}
      </Link>
    </AuthCard>
  );
}

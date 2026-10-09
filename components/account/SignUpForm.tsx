"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/ui/Button";
import { TextField } from "@/components/shared/ui/Field";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { signUp } from "@/lib/auth/session";
import { localePath, routes } from "@/lib/routes";
import AuthCard from "./AuthCard";
import PasswordField from "./PasswordField";
import { safeNext } from "./safe-next";

export default function SignUpForm({ lang, dict }: { lang: Locale; dict: Dictionary["account"] }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), localePath(lang, routes.home));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    signUp({
      name: String(form.get("name")).trim(),
      phone: String(form.get("phone")).trim(),
      email: String(form.get("email")).trim(),
    });
    router.push(next);
  };

  return (
    <AuthCard title={dict.signUp.title} subtitle={dict.signUp.subtitle} dict={dict}>
      <form onSubmit={submit} className="space-y-5">
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
        <Button type="submit" block size="lg">
          {dict.signUp.submit}
        </Button>
      </form>
      <Link
        href={`${localePath(lang, routes.signIn)}?next=${encodeURIComponent(next)}`}
        className="mt-6 block text-center text-sm font-semibold text-accent hover:underline"
      >
        {dict.signUp.switch}
      </Link>
    </AuthCard>
  );
}

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

/** Centred card shared by the auth pages (sign in, create account, verify, complete profile). */
export function AuthShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="px-4 pb-40 pt-18">
      <div className={`mx-auto w-full max-w-[29.25rem] rounded-3xl bg-card p-7 light:border light:border-border sm:p-9 ${className ?? ""}`}>
        {children}
      </div>
    </div>
  );
}

/** Sign in / Create account: title, subtitle, Google button, "or", then the form. */
export default function AuthCard({
  title,
  subtitle,
  dict,
  lang,
  next,
  children,
}: {
  title: string;
  subtitle: string;
  dict: Dictionary["account"];
  lang: Locale;
  /** Page to return to after signing in (?next=) */
  next: string;
  children: React.ReactNode;
}) {
  // Full page navigation: the Route Handler redirects to Google's consent screen
  const google = `${routes.googleSignIn}?${new URLSearchParams({ lang, ...(next && { next }) })}`;

  return (
    <AuthShell>
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>

      <a
        href={google}
        className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-background text-sm font-semibold transition hover:brightness-125 light:border light:border-border light:bg-input"
      >
        {dict.google}
      </a>

      <p className="my-5 text-center text-xs text-muted-foreground">{dict.or}</p>

      {children}
    </AuthShell>
  );
}


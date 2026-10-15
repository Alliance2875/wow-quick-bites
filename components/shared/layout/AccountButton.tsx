"use client";

import Link from "next/link";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import { homeFor } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session";
import { localePath } from "@/lib/routes";
import SignOutButton from "./SignOutButton";

export default function AccountButton({
  lang,
  signInHref,
  labels,
}: {
  lang: Locale;
  signInHref: string;
  labels: { signIn: string; signOut: string; account: string };
}) {
  const user = useSession();

  if (!user) {
    return (
      <Link href={signInHref} className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold hover:underline">
        <Icon name="user" className="h-5 w-5" />
        <span className="hidden sm:inline">{labels.signIn}</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold">
      {/* Clients open their client area, staff their portal */}
      <Link
        href={localePath(lang, homeFor(user.role ?? "client"))}
        title={labels.account}
        aria-label={`${labels.account} · ${user.name}`}
        className="flex items-center gap-1.5 hover:underline"
      >
        <Icon name="user" className="h-5 w-5" />
        <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
      </Link>
      <SignOutButton lang={lang} className="text-xs underline-offset-4 hover:underline">
        ({labels.signOut})
      </SignOutButton>
    </div>
  );
}

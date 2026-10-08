"use client";

import Link from "next/link";
import Icon from "@/components/shared/ui/Icon";
import { signOut, useSession } from "@/lib/auth/session";

export default function AccountButton({
  signInHref,
  labels,
}: {
  signInHref: string;
  labels: { signIn: string; signOut: string };
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
      <Icon name="user" className="h-5 w-5" />
      <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
      <button type="button" onClick={signOut} className="text-xs underline-offset-4 hover:underline">
        ({labels.signOut})
      </button>
    </div>
  );
}

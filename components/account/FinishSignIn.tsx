"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { rememberSession, type User } from "@/lib/auth/session";
import { AuthShell } from "./AuthCard";

/** After "Continue with Google": mirrors the public profile for the storefront, then continues. */
export default function FinishSignIn({ user, redirectTo, label }: { user: User; redirectTo: string; label: string }) {
  const router = useRouter();

  useEffect(() => {
    rememberSession(user);
    router.replace(redirectTo);
    router.refresh();
  }, [user, redirectTo, router]);

  return (
    <AuthShell className="text-center">
      <p role="status" className="text-sm text-muted-foreground">
        {label}
      </p>
    </AuthShell>
  );
}

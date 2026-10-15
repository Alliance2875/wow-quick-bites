"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/shared/ui/Icon";
import { cn } from "@/lib/format";

/**
 * Portal layout: fixed sidebar on computers (≥ 1024px), slide-in drawer on phones and tablets.
 * The sidebar and top bar are server-rendered and passed in; only the drawer state lives here.
 * With `siteHeader` (client area, as in the designs): the storefront header sits on top, the
 * sidebar below it, and the portal top bar only remains on small screens (drawer button).
 */
export default function ShellFrame({
  sidebar,
  topbar,
  siteHeader,
  children,
  labels,
}: {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  siteHeader?: React.ReactNode;
  children: React.ReactNode;
  labels: { open: string; close: string };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("min-h-dvh bg-background", siteHeader ? "flex flex-col" : undefined)}>
    {siteHeader}
    <div data-portal className={cn("flex bg-background", siteHeader ? "flex-1" : "min-h-dvh")}>
      <aside
        id="portal-sidebar"
        // A tap on any link closes the drawer (the new page is already loading)
        onClick={(event) => (event.target as HTMLElement).closest("a") && setOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[17rem] shrink-0 border-r border-border bg-panel transition-transform duration-200",
          siteHeader
            ? "lg:sticky lg:top-20 lg:z-auto lg:h-[calc(100dvh-5rem)] lg:w-56 lg:translate-x-0"
            : "lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-56 lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full max-lg:invisible",
        )}
      >
        {open && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={labels.close}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-panel-muted lg:hidden"
          >
            <Icon name="x" />
          </button>
        )}
        {sidebar}
      </aside>

      {open && (
        <button
          type="button"
          aria-label={labels.close}
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "sticky z-30 flex h-16 items-center gap-3 border-b border-border bg-panel/95 px-4 backdrop-blur sm:px-6 lg:h-[4.5rem] lg:px-8",
            siteHeader ? "top-20 lg:hidden" : "top-0",
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={labels.open}
            aria-controls="portal-sidebar"
            aria-expanded={open}
            className="-ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-panel-muted lg:hidden"
          >
            <Icon name="menu" />
          </button>
          {topbar}
        </header>
        <main className="flex-1 px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pt-10">{children}</main>
      </div>
    </div>
    </div>
  );
}

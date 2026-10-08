"use client";

/**
 * Inline <script> that runs once during HTML parsing (before first paint).
 * On the client it renders as text/plain, so React never warns about it and never re-runs it
 * (pattern from the Next.js "preventing flash before hydration" guide).
 */
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

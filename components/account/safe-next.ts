/** Only same-site paths are accepted as ?next= targets (no "//evil.com" or "/\evil.com" open redirect). */
export const safeNext = (next: string | null, fallback: string) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;

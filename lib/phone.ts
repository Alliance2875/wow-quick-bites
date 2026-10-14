// Rwandan mobile numbers: "078 123 4567", "0781234567", "+250 781 234 567" are the same number.
// Shared by the forms (client) and the Server Actions (server): the server always re-checks.

/** "078 123 4567", or null when the value is not a Rwandan mobile number. */
export function normalizePhone(value: string): string | null {
  const digits = value.replace(/[\s().-]/g, "");
  const match = /^(?:\+?250|0)(7\d{8})$/.exec(digits);
  if (!match) return null;
  const local = `0${match[1]}`;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

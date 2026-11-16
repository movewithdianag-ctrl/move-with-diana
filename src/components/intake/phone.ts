/**
 * Light phone formatting for the contact block. Purely cosmetic: validation
 * (src/lib/intake.ts) only counts digits, so any format is accepted.
 *
 *  • US shapes are tidied as they are typed: 5615550123 becomes
 *    "(561) 555-0123", and a leading 1 is kept as the country code.
 *  • Anything starting with + or 0 (an international number) is left the way
 *    the person typed it, minus stray characters.
 *
 * The result never ends in punctuation, so Backspace always removes a digit.
 */
export function formatPhone(raw: string): string {
  const input = raw.trimStart();
  if (input === "") return "";

  if (input.startsWith("+")) {
    return `+${input.slice(1).replace(/[^\d\s().-]/g, "").replace(/\s{2,}/g, " ")}`;
  }

  const digits = input.replace(/\D/g, "");
  if (digits === "") return "";
  if (digits.startsWith("0")) return input.replace(/[^\d\s().-]/g, "").replace(/\s{2,}/g, " ");

  // US area codes never start with 1, so a leading 1 is the country code.
  const hasCountryCode = digits.startsWith("1");
  const national = hasCountryCode ? digits.slice(1) : digits;
  if (national.length > 10) return digits;

  let formatted = national;
  if (national.length > 6) {
    formatted = `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  } else if (national.length > 3) {
    formatted = `(${national.slice(0, 3)}) ${national.slice(3)}`;
  }

  if (!hasCountryCode) return formatted;
  return formatted ? `1 ${formatted}` : "1";
}

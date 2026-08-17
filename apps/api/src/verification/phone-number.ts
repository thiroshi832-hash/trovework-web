import { parsePhoneNumberFromString } from "libphonenumber-js";

export interface ParsedPhone {
  /** Normalised E.164, e.g. "+4915112345678". What we send and store. */
  e164: string;
  /** ISO 3166-1 alpha-2, or undefined for non-geographic ranges. */
  country: string | undefined;
}

/**
 * Parses and validates a number, and resolves which country will actually be
 * billed.
 *
 * Country has to come from a real numbering-plan lookup rather than the dial
 * prefix, because +1 is not one country: +1 416 is Canada at EUR 0.075 while
 * +1 876 is Jamaica at EUR 0.2358, and +1 246 is Barbados at EUR 0.2349.
 * Matching on the prefix alone would either bill us for the expensive
 * territories or lock out the US and Canada. Same story for +7, which is
 * Russia and Kazakhstan, and +262, which is Reunion and Mayotte.
 *
 * The gate is `isPossible`, not `isValid`. Validity checks the number against
 * known assigned ranges, and that metadata goes stale — a carrier opening a new
 * block would lock real users out of the platform with no signal to us. What
 * actually protects the budget is the country resolving to an allowed one, and
 * that is enforced by the caller: an unattributable number (`country`
 * undefined) can't be priced, so it is refused regardless.
 *
 * Returns null when the number cannot be parsed or is the wrong length for its
 * country — worth rejecting before paying for an SMS to nowhere.
 */
export function parsePhone(input: string): ParsedPhone | null {
  const trimmed = input.trim().replace(/[\s()\-.]/g, "");
  if (!trimmed) return null;

  // The form always sends a dial code; tolerate a missing "+" rather than
  // silently reading the number as national-format for some default region.
  const parsed = parsePhoneNumberFromString(trimmed.startsWith("+") ? trimmed : `+${trimmed}`);
  if (!parsed || !parsed.isPossible()) return null;

  return { e164: parsed.number, country: parsed.country };
}

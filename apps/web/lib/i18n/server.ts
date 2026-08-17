import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, matchLocale, type Locale } from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

/**
 * Resolves the request's locale: an explicit `locale` cookie wins (a future
 * in-app switcher), otherwise the browser's Accept-Language is matched against
 * the supported set. Reading these makes the route dynamic, which is required
 * to render per-visitor language.
 */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  return matchLocale((await headers()).get("accept-language")) ?? DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()];
}

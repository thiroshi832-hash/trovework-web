/**
 * Internationalization config. The site auto-detects the visitor's language
 * from their browser (Accept-Language) and renders in it, falling back to
 * English. Legal and safety-critical copy (Terms, Privacy, ID-verification
 * wording) deliberately stays in English until human-reviewed translations
 * exist — machine translation of that text is a liability on a trust platform.
 */

export const LOCALES = ["en", "es", "fr", "de", "pt", "ar", "zh", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Right-to-left languages — the <html dir> is set from this. */
export const RTL_LOCALES: readonly Locale[] = ["ar"];

/** Cookie a future in-app switcher can set to override the detected language. */
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** Picks the best supported locale from an Accept-Language header value. */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { base } of ranked) {
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

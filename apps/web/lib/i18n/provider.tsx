"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DICTIONARIES, type Dictionary } from "./dictionaries";
import { DEFAULT_LOCALE, type Locale } from "./config";

const I18nContext = createContext<Dictionary>(DICTIONARIES[DEFAULT_LOCALE]);

/** Feeds the detected locale's dictionary to client components via useDict(). */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext.Provider value={DICTIONARIES[locale]}>{children}</I18nContext.Provider>;
}

/** The translation dictionary for the current locale, in a client component. */
export function useDict(): Dictionary {
  return useContext(I18nContext);
}

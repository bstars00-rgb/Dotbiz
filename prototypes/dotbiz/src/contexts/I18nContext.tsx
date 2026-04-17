import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import strings, { type Locale } from "@/i18n/strings";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "dotbiz_locale";

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["EN", "KO", "JA", "ZH", "VI"].includes(stored)) return stored as Locale;
  } catch { /* ignore */ }
  return "EN";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: string): string => {
    const entry = strings[key];
    if (!entry) return key;
    return entry[locale] || entry["EN"] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

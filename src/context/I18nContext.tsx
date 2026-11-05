import React, { createContext, useContext, useState, useEffect } from 'react';
import translationsData from '../data/translations.json';

export type LocaleCode = 'fr' | 'en' | 'ar' | 'ary';

interface I18nContextType {
  locale: LocaleCode;
  setLocale: (loc: LocaleCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

const typedTranslations = translationsData as Record<string, any>;

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLocale?: LocaleCode }> = ({
  children,
  initialLocale = 'fr',
}) => {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    const saved = localStorage.getItem('tresoria-locale');
    if (saved && ['fr', 'en', 'ar', 'ary'].includes(saved)) {
      return saved as LocaleCode;
    }
    return initialLocale;
  });

  const isRtl = locale === 'ar';

  useEffect(() => {
    localStorage.setItem('tresoria-locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [locale, isRtl]);

  const setLocale = (loc: LocaleCode) => {
    setLocaleState(loc);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const parts = key.split('.');
    
    // helper to traverse
    const resolve = (lang: string) => {
      let current = typedTranslations[lang];
      if (!current) return undefined;
      for (const p of parts) {
        if (current && typeof current === 'object' && p in current) {
          current = current[p];
        } else {
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };

    let result = resolve(locale);
    if (!result && locale !== 'fr') {
      result = resolve('fr');
    }
    if (!result && locale !== 'en') {
      result = resolve('en');
    }

    if (!result) {
      return parts[parts.length - 1] || key;
    }

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replaceAll(`{${k}}`, String(v));
      }
    }

    return result;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

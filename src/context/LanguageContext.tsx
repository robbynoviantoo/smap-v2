'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import enTranslations from '@/locales/en.json';
import idTranslations from '@/locales/id.json';

export type Locale = 'id' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Locale, any> = {
  id: idTranslations,
  en: enTranslations,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('id');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = (localStorage.getItem('smap_locale') as Locale) || (Cookies.get('NEXT_LOCALE') as Locale);
    if (saved === 'en' || saved === 'id') {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = 'id';
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('smap_locale', newLocale);
    Cookies.set('NEXT_LOCALE', newLocale, { expires: 365, path: '/' });
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let currentVal: any = dictionaries[locale];

      // Navigate down object
      for (const k of keys) {
        if (currentVal && typeof currentVal === 'object' && k in currentVal) {
          currentVal = currentVal[k];
        } else {
          currentVal = undefined;
          break;
        }
      }

      // Fallback to the other locale if missing in current
      if (currentVal === undefined) {
        const fallbackLocale: Locale = locale === 'id' ? 'en' : 'id';
        let fallbackVal: any = dictionaries[fallbackLocale];
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        currentVal = fallbackVal;
      }

      // If still missing, return key or last part
      if (currentVal === undefined || typeof currentVal !== 'string') {
        return keys[keys.length - 1] || key;
      }

      let result = currentVal;
      if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
          result = result.replace(new RegExp(`:${pKey}`, 'g'), String(pVal));
          result = result.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
        }
      }

      return result;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

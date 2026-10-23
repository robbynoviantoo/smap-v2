'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    const nextLocale = locale === 'id' ? 'en' : 'id';
    setLocale(nextLocale);
  };

  const isId = locale === 'id';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-700 transition-all bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:border-brand-500/30 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 h-10 shadow-2xs cursor-pointer select-none active:scale-95"
      aria-label="Switch Language (ID / EN)"
      title={isId ? 'Ganti ke Bahasa Inggris / Switch to English' : 'Switch to Bahasa Indonesia'}
    >
      <span className="text-base leading-none">{isId ? '🇮🇩' : '🇬🇧'}</span>
      <span className="text-xs font-bold uppercase tracking-wider">{locale.toUpperCase()}</span>
    </button>
  );
};

export default LanguageSwitcher;

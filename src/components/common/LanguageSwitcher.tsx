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
      role="switch"
      aria-checked={!isId}
      onClick={toggleLanguage}
      className="relative grid h-11 w-20 shrink-0 grid-cols-2 items-center rounded-xl border border-gray-200 bg-gray-100 p-1 text-gray-600 transition-colors hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:focus-visible:ring-offset-gray-900 cursor-pointer select-none"
      aria-label="English"
      title={isId ? 'Ganti ke English' : 'Switch to Bahasa Indonesia'}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none dark:bg-gray-600 ${isId ? 'translate-x-0' : 'translate-x-full'}`}
      />
      <span aria-hidden="true" className={`relative text-xs font-semibold ${isId ? 'text-gray-900 dark:text-white' : ''}`}>ID</span>
      <span aria-hidden="true" className={`relative text-xs font-semibold ${!isId ? 'text-gray-900 dark:text-white' : ''}`}>EN</span>
    </button>
  );
};

export default LanguageSwitcher;

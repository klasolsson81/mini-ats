'use client';

import { useTransition, useEffect, useState } from 'react';
import { type Locale } from '@/lib/constants/locales';
import { setLocale } from '@/lib/actions/locale';
import { cn } from '@/lib/utils/cn';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState<Locale>('sv');

  useEffect(() => {
    const locale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    if (locale === 'en' || locale === 'sv') {
      setCurrentLocale(locale);
    }
  }, []);

  function handleChange(locale: Locale) {
    startTransition(async () => {
      setCurrentLocale(locale);
      await setLocale(locale);
      window.location.reload();
    });
  }

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/50">
      <button
        onClick={() => handleChange('sv')}
        disabled={isPending}
        className={cn(
          'w-10 h-7 rounded-lg overflow-hidden transition-all disabled:opacity-50',
          currentLocale === 'sv'
            ? 'ring-2 ring-cyan-500 ring-offset-1'
            : 'opacity-60 hover:opacity-100'
        )}
        title="Svenska"
      >
        <svg viewBox="0 0 16 10" className="w-full h-full">
          <rect width="16" height="10" fill="#006AA7"/>
          <rect x="5" width="2" height="10" fill="#FECC00"/>
          <rect y="4" width="16" height="2" fill="#FECC00"/>
        </svg>
      </button>
      <button
        onClick={() => handleChange('en')}
        disabled={isPending}
        className={cn(
          'w-10 h-7 rounded-lg overflow-hidden transition-all disabled:opacity-50',
          currentLocale === 'en'
            ? 'ring-2 ring-cyan-500 ring-offset-1'
            : 'opacity-60 hover:opacity-100'
        )}
        title="English"
      >
        <svg viewBox="0 0 60 30" className="w-full h-full">
          <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
          <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6"/>
        </svg>
      </button>
    </div>
  );
}

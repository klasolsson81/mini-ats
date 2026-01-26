'use client';

import { useTransition } from 'react';
import { locales, type Locale } from '@/lib/constants/locales';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();

  function handleChange(locale: Locale) {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  }

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleChange(locale)}
          disabled={isPending}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

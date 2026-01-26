'use server';

import { cookies } from 'next/headers';
import type { Locale } from '@/lib/constants/locales';

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000, // 1 year
  });
}

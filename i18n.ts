import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale } from './lib/constants/locales';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale =
    (cookieStore.get('NEXT_LOCALE')?.value as Locale) || defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

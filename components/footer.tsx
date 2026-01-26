import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            © {currentYear} Mini ATS. {t('footer.allRightsReserved')}.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

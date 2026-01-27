import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/20 glass py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            © {currentYear}{' '}
            <a
              href="https://klasolsson.se"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--primary)] transition-colors"
            >
              Klas Olsson
            </a>
            . {t('footer.allRightsReserved')}.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors"
            >
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

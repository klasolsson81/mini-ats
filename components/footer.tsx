'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PolicyModal } from './policy-modal';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const [modalType, setModalType] = useState<'privacy' | 'cookies' | null>(null);

  return (
    <>
      <footer className="py-6 shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {/* Links row */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <button
                onClick={() => setModalType('privacy')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
              >
                {t('footer.privacy')}
              </button>
              <button
                onClick={() => setModalType('cookies')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
              >
                {t('footer.cookies')}
              </button>
              <a
                href="mailto:klasolsson81@gmail.com"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
              >
                {t('footer.contact')}
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-500">
              © {currentYear}{' '}
              <a
                href="https://klasolsson.se"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Klas Olsson
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      <PolicyModal
        isOpen={modalType === 'privacy'}
        onClose={() => setModalType(null)}
        type="privacy"
      />
      <PolicyModal
        isOpen={modalType === 'cookies'}
        onClose={() => setModalType(null)}
        type="cookies"
      />
    </>
  );
}

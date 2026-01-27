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
      <footer className="border-t border-white/20 glass py-3 shrink-0 animate-flow-footer">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {/* Policy links */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setModalType('privacy')}
                className="text-xs font-medium text-gray-700 hover:text-cyan-700 transition-colors"
              >
                {t('footer.privacy')}
              </button>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => setModalType('cookies')}
                className="text-xs font-medium text-gray-700 hover:text-cyan-700 transition-colors"
              >
                {t('footer.cookies')}
              </button>
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-600">
              © {currentYear}{' '}
              <a
                href="https://klasolsson.se"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-cyan-700 transition-colors"
              >
                Klas Olsson
              </a>
              {' · '}{t('footer.allRightsReserved')}
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

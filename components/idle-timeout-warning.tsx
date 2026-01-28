'use client';

import { useTranslations } from 'next-intl';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { Clock, LogOut } from 'lucide-react';

export function IdleTimeoutWarning() {
  const t = useTranslations('auth');
  const { showWarning, remainingSeconds, stayLoggedIn, logout } = useIdleTimeout({
    warningMinutes: 25,
    logoutMinutes: 30,
  });

  if (!showWarning) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('sessionTimeout')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('sessionTimeoutDescription')}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-amber-800 mb-1">{t('loggingOutIn')}</p>
          <p className="text-3xl font-bold text-amber-900 font-mono">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('logoutNow')}
          </button>
          <button
            onClick={stayLoggedIn}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t('stayLoggedIn')}
          </button>
        </div>
      </div>
    </div>
  );
}

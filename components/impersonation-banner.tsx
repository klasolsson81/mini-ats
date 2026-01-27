'use client';

import { useTranslations } from 'next-intl';
import { stopImpersonation } from '@/lib/actions/impersonate';
import { useTransition } from 'react';
import { AlertCircle } from 'lucide-react';

interface ImpersonationBannerProps {
  tenantName: string;
}

export function ImpersonationBanner({ tenantName }: ImpersonationBannerProps) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();

  function handleStop() {
    startTransition(async () => {
      await stopImpersonation();
    });
  }

  return (
    <div className="bg-gradient-to-r from-yellow-100/90 to-orange-100/90 backdrop-blur-sm border-b border-yellow-300/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {t('impersonatingAs', { tenant: tenantName })}
            </p>
          </div>
          <button
            onClick={handleStop}
            disabled={isPending}
            className="px-4 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-white/50 text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('stopImpersonating')}
          </button>
        </div>
      </div>
    </div>
  );
}

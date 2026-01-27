'use client';

import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { stopImpersonation } from '@/lib/actions/impersonate';
import { useState, useTransition } from 'react';
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
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-900">
              {t('impersonatingAs', { tenant: tenantName })}
            </p>
          </div>
          <Button
            onClick={handleStop}
            disabled={isPending}
            variant="outline"
            size="sm"
            className="bg-white"
          >
            {t('stopImpersonating')}
          </Button>
        </div>
      </div>
    </div>
  );
}

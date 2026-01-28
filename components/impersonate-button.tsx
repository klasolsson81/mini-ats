'use client';

import { useTranslations } from 'next-intl';
import { impersonateTenant } from '@/lib/actions/impersonate';
import { useTransition } from 'react';
import { UserCheck } from 'lucide-react';

interface ImpersonateButtonProps {
  tenantId: string;
  tenantName: string;
}

export function ImpersonateButton({
  tenantId,
  tenantName: _tenantName,
}: ImpersonateButtonProps) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();

  function handleImpersonate() {
    startTransition(async () => {
      await impersonateTenant(tenantId);
    });
  }

  return (
    <button
      onClick={handleImpersonate}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <UserCheck className="h-3.5 w-3.5" />
      {t('actAs')}
    </button>
  );
}

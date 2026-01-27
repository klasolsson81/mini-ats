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
  tenantName,
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
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <UserCheck className="h-4 w-4" />
      {t('actAs')}
    </button>
  );
}

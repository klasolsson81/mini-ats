'use client';

import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
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
    <Button
      onClick={handleImpersonate}
      disabled={isPending}
      variant="outline"
      size="sm"
      className="w-full"
    >
      <UserCheck className="h-4 w-4 mr-2" />
      {t('actAs')}
    </Button>
  );
}

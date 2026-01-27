'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlowButton } from '@/components/ui/glow-button';
import { Plus } from 'lucide-react';
import { CreateJobDialog } from './create-job-dialog';

export function CreateJobButton() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <GlowButton onClick={() => setOpen(true)} variant="primary">
        <Plus className="mr-2 h-4 w-4" />
        {t('jobs.createJob')}
      </GlowButton>
      <CreateJobDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

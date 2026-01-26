'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateJobDialog } from './create-job-dialog';

export function CreateJobButton() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t('jobs.createJob')}
      </Button>
      <CreateJobDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

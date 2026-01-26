'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateCandidateDialog } from './create-candidate-dialog';

export function CreateCandidateButton() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t('candidates.createCandidate')}
      </Button>
      <CreateCandidateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

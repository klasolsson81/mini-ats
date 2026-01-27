'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlowButton } from '@/components/ui/glow-button';
import { Plus } from 'lucide-react';
import { CreateCandidateDialog } from './create-candidate-dialog';

export function CreateCandidateButton() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <GlowButton onClick={() => setOpen(true)} variant="primary">
        <Plus className="mr-2 h-4 w-4" />
        {t('candidates.createCandidate')}
      </GlowButton>
      <CreateCandidateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

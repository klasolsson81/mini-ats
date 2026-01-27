'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { CreateCandidateDialog } from './create-candidate-dialog';

export function CreateCandidateButton() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-300/50 transition-all duration-200 hover:scale-105"
      >
        <Plus className="h-5 w-5" />
        {t('candidates.createCandidate')}
      </button>
      <CreateCandidateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

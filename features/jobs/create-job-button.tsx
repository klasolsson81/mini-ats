'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { CreateJobDialog } from './create-job-dialog';

export function CreateJobButton() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-200/50 hover:shadow-xl hover:shadow-cyan-300/50 transition-all duration-200 hover:scale-105"
      >
        <Plus className="h-5 w-5" />
        {t('jobs.createJob')}
      </button>
      <CreateJobDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

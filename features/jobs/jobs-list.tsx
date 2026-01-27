'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Job } from '@/lib/types/database';
import { GlassCard } from '@/components/ui/glass-card';
import { PillBadge } from '@/components/ui/pill-badge';
import { GlowButton } from '@/components/ui/glow-button';
import { Briefcase, Edit, Trash2 } from 'lucide-react';
import { deleteJob } from '@/lib/actions/jobs';
import { toast } from 'sonner';
import { EditJobDialog } from './edit-job-dialog';

interface JobsListProps {
  jobs: Job[];
}

export function JobsList({ jobs }: JobsListProps) {
  const t = useTranslations();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`${t('jobs.deleteConfirm')} "${title}"?`)) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteJob(id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('jobs.jobDeleted'));
    }
    setIsDeleting(null);
  }

  if (jobs.length === 0) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('jobs.noJobs')}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Kom igång genom att skapa ditt första jobb.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <GlassCard key={job.id} hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {job.title}
                  </h3>
                  <PillBadge
                    variant={job.status === 'open' ? 'success' : 'secondary'}
                  >
                    {job.status === 'open' ? t('jobs.open') : t('jobs.closed')}
                  </PillBadge>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3">
                {job.description}
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingJob(job)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/50 hover:bg-white/80 border border-white/20 text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(job.id, job.title)}
                  disabled={isDeleting === job.id}
                  className="px-4 py-2 rounded-xl bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {editingJob && (
        <EditJobDialog
          job={editingJob}
          open={!!editingJob}
          onClose={() => setEditingJob(null)}
        />
      )}
    </>
  );
}

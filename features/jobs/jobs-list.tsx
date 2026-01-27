'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Job } from '@/lib/types/database';
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
      <div className="rounded-2xl bg-gradient-to-br from-cyan-100/50 via-sky-50/40 to-blue-100/50 backdrop-blur-sm border-2 border-cyan-300/50 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('jobs.noJobs')}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="group rounded-2xl bg-gradient-to-br from-cyan-100/50 via-sky-50/40 to-blue-100/50 backdrop-blur-sm border-2 border-cyan-300/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-cyan-400/60"
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {job.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'open'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm shadow-emerald-200/50'
                        : 'bg-gray-200/80 text-gray-600'
                    }`}
                  >
                    {job.status === 'open' ? t('jobs.open') : t('jobs.closed')}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200/50">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                {job.description || 'Ingen beskrivning'}
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingJob(job)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all duration-200 shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/50"
                >
                  <Edit className="h-4 w-4" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(job.id, job.title)}
                  disabled={isDeleting === job.id}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-medium transition-all duration-200 shadow-md shadow-rose-200/50 hover:shadow-lg hover:shadow-rose-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
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

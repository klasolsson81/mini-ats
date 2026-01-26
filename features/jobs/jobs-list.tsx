'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Job } from '@/lib/types/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Briefcase className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {t('jobs.noJobs')}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Kom igång genom att skapa ditt första jobb.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {job.title}
                  </h3>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      job.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.status === 'open' ? t('jobs.open') : t('jobs.closed')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">
                {job.description}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingJob(job)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(job.id, job.title)}
                  disabled={isDeleting === job.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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

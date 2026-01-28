'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { attachCandidateToJob } from '@/lib/actions/candidates';
import { Candidate, Job } from '@/lib/types/database';
import { STAGE_ORDER, type Stage } from '@/lib/constants/stages';
import { toast } from 'sonner';

interface AttachToJobDialogProps {
  candidate: Candidate;
  jobs: Pick<Job, 'id' | 'title'>[];
  open: boolean;
  onClose: () => void;
}

export function AttachToJobDialog({
  candidate,
  jobs,
  open,
  onClose,
}: AttachToJobDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const jobId = formData.get('job_id') as string;
    const stage = formData.get('stage') as Stage;

    const result = await attachCandidateToJob(candidate.id, jobId, stage);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('candidates.attachSuccess'));
      onClose();
    }

    setIsLoading(false);
  }

  if (jobs.length === 0) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{t('candidates.attachToJob')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-700">
            {t('candidates.noJobsAvailable')}
          </p>
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>{t('common.close')}</Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{t('candidates.attachToJob')}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-gray-700">
          {t('candidates.attachDescription', { name: candidate.full_name })}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="job_id"
            className="text-sm font-semibold leading-none text-gray-900"
          >
            {t('candidates.selectJob')}
          </label>
          <Select id="job_id" name="job_id" required disabled={isLoading}>
            <option value="">{t('candidates.selectJobPlaceholder')}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="stage"
            className="text-sm font-semibold leading-none text-gray-900"
          >
            {t('candidates.selectStage')}
          </label>
          <Select id="stage" name="stage" required disabled={isLoading}>
            {STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {t(`kanban.stages.${stage}`)}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('candidates.attachToJob')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

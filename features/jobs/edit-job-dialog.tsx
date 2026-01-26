'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { updateJob } from '@/lib/actions/jobs';
import { JOB_STATUS } from '@/lib/constants/job-status';
import { Job } from '@/lib/types/database';
import { toast } from 'sonner';

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

export function EditJobDialog({ job, open, onClose }: EditJobDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as 'open' | 'closed',
    };

    const result = await updateJob(job.id, data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('jobs.jobUpdated'));
      onClose();
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{t('jobs.editJob')}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('jobs.jobTitle')}
          </label>
          <Input
            id="title"
            name="title"
            required
            disabled={isLoading}
            defaultValue={job.title}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('jobs.description')}
          </label>
          <Textarea
            id="description"
            name="description"
            required
            disabled={isLoading}
            defaultValue={job.description}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('jobs.status')}
          </label>
          <Select
            id="status"
            name="status"
            required
            disabled={isLoading}
            defaultValue={job.status}
          >
            <option value={JOB_STATUS.OPEN}>{t('jobs.open')}</option>
            <option value={JOB_STATUS.CLOSED}>{t('jobs.closed')}</option>
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
            {isLoading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

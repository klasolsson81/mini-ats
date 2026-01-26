'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateCandidate } from '@/lib/actions/candidates';
import { Candidate } from '@/lib/types/database';
import { toast } from 'sonner';

interface EditCandidateDialogProps {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
}

export function EditCandidateDialog({
  candidate,
  open,
  onClose,
}: EditCandidateDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      linkedin_url: formData.get('linkedin_url') as string,
      notes: formData.get('notes') as string,
    };

    const result = await updateCandidate(candidate.id, data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('candidates.candidateUpdated'));
      onClose();
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{t('candidates.editCandidate')}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="full_name"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('candidates.fullName')} *
          </label>
          <Input
            id="full_name"
            name="full_name"
            required
            disabled={isLoading}
            defaultValue={candidate.full_name}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('candidates.email')}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            disabled={isLoading}
            defaultValue={candidate.email || ''}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('candidates.phone')}
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            disabled={isLoading}
            defaultValue={candidate.phone || ''}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="linkedin_url"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('candidates.linkedinUrl')}
          </label>
          <Input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            disabled={isLoading}
            defaultValue={candidate.linkedin_url || ''}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-medium leading-none text-gray-700"
          >
            {t('candidates.notes')}
          </label>
          <Textarea
            id="notes"
            name="notes"
            disabled={isLoading}
            defaultValue={candidate.notes || ''}
            rows={3}
          />
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

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCandidate } from '@/lib/actions/candidates';
import { toast } from 'sonner';

interface CreateCandidateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCandidateDialog({
  open,
  onClose,
}: CreateCandidateDialogProps) {
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

    const result = await createCandidate(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('candidates.candidateCreated'));
      onClose();
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{t('candidates.createCandidate')}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="full_name"
            className="text-sm font-semibold leading-none text-gray-900"
          >
            {t('candidates.fullName')} *
          </label>
          <Input
            id="full_name"
            name="full_name"
            required
            disabled={isLoading}
            placeholder="Anna Andersson"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold leading-none text-gray-900"
          >
            {t('candidates.email')}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            disabled={isLoading}
            placeholder="anna@example.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-semibold leading-none text-gray-900"
          >
            {t('candidates.phone')}
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            disabled={isLoading}
            placeholder="+46 70 123 45 67"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="linkedin_url"
            className="text-sm font-semibold leading-none text-gray-900"
          >
            {t('candidates.linkedinUrl')}
          </label>
          <Input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            disabled={isLoading}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-semibold leading-none text-gray-900"
          >
            {t('candidates.notes')}
          </label>
          <Textarea
            id="notes"
            name="notes"
            disabled={isLoading}
            placeholder="Anteckningar om kandidaten..."
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
            {isLoading ? t('common.loading') : t('common.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddUserToTenantFormProps {
  tenantId: string;
  tenantName: string;
}

export function AddUserToTenantForm({
  tenantId,
  tenantName,
}: AddUserToTenantFormProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/add-user-to-tenant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            ...formData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || t('errorOccurred'));
          return;
        }

        toast.success(t('userAddedToTenant'));
        setOpen(false);
        setFormData({ user_name: '', user_email: '', user_password: '' });
        router.refresh();
      } catch (_error) {
        toast.error(t('errorOccurred'));
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {t('addUser')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            {t('addUserToTenantTitle', { tenant: tenantName })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label
              htmlFor="user_name"
              className="block text-sm font-semibold text-gray-900 mb-1"
            >
              {t('userName')}
            </label>
            <Input
              id="user_name"
              type="text"
              value={formData.user_name}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor="user_email"
              className="block text-sm font-semibold text-gray-900 mb-1"
            >
              {t('userEmail')}
            </label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) =>
                setFormData({ ...formData, user_email: e.target.value })
              }
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor="user_password"
              className="block text-sm font-semibold text-gray-900 mb-1"
            >
              {t('userPassword')}
            </label>
            <Input
              id="user_password"
              type="password"
              value={formData.user_password}
              onChange={(e) =>
                setFormData({ ...formData, user_password: e.target.value })
              }
              required
              disabled={isPending}
              minLength={6}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

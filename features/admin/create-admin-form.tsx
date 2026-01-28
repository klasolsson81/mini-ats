'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function CreateAdminForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      user_name: formData.get('user_name') as string,
      user_email: formData.get('user_email') as string,
      user_password: formData.get('user_password') as string,
    };

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create admin');
      }

      toast.success(t('admin.adminCreated'));
      // Reset form safely
      const form = e.currentTarget;
      if (form) {
        form.reset();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('admin.errorOccurred');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.createAdminUser')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">
          {t('admin.adminDescription')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="user_name"
              className="text-sm font-semibold leading-none text-gray-900"
            >
              {t('admin.userName')} *
            </label>
            <Input
              id="user_name"
              name="user_name"
              required
              disabled={isLoading}
              placeholder="Anna Andersson"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user_email"
              className="text-sm font-semibold leading-none text-gray-900"
            >
              {t('admin.userEmail')} *
            </label>
            <Input
              id="user_email"
              name="user_email"
              type="email"
              required
              disabled={isLoading}
              placeholder="anna@devotion.ventures"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user_password"
              className="text-sm font-semibold leading-none text-gray-900"
            >
              {t('admin.userPassword')} *
            </label>
            <Input
              id="user_password"
              name="user_password"
              type="password"
              required
              disabled={isLoading}
              minLength={6}
              placeholder="Minst 6 tecken"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('common.loading') : t('admin.createAdmin')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

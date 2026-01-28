'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function CreateTenantForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tenant_name: formData.get('tenant_name') as string,
      user_name: formData.get('user_name') as string,
      user_email: formData.get('user_email') as string,
      user_password: formData.get('user_password') as string,
    };

    try {
      const response = await fetch('/api/admin/create-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create tenant');
      }

      toast.success(t('admin.tenantCreated'));
      e.currentTarget.reset();
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
        <CardTitle>{t('admin.newTenantAndUser')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="tenant_name"
              className="text-sm font-semibold leading-none text-gray-900"
            >
              {t('admin.tenantName')} *
            </label>
            <Input
              id="tenant_name"
              name="tenant_name"
              required
              disabled={isLoading}
              placeholder="Företag AB"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              {t('admin.firstUser')}
            </p>

            <div className="space-y-3">
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
                  placeholder="anna@foretag.se"
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
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('common.loading') : t('admin.createTenant')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateTenantForm } from '@/features/admin/create-tenant-form';
import { CreateAdminForm } from '@/features/admin/create-admin-form';
import { ImpersonateButton } from '@/components/impersonate-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Shield } from 'lucide-react';

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return {
    title: `${t('title')} - Mini ATS`,
  };
}

export default async function AdminPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only admins can access
  if (profile?.role !== 'admin') {
    redirect('/app');
  }

  // Fetch existing tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, profiles(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('pageTitle')}
        </h1>
        <p className="mt-2 text-gray-700">
          {t('subtitle')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/app/admin/users">
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            {t('viewAllUsers')}
          </Button>
        </Link>
        <Link href="/app/admin/audit-logs">
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            {t('viewAuditLogs')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Create Admin User */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('createAdmin')}
          </h2>
          <CreateAdminForm />
        </div>

        {/* Create Tenant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('createNewTenant')}
          </h2>
          <CreateTenantForm />
        </div>
      </div>

      {/* Existing Tenants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('existingTenants')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants && tenants.length > 0 ? (
            tenants.map((tenant: any) => (
              <div
                key={tenant.id}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                <Link
                  href={`/app/admin/tenants/${tenant.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-sm text-gray-600">
                    {tenant.profiles?.[0]?.count || 0} {t('users')}
                  </p>
                </Link>
                <div className="px-4 pb-4">
                  <ImpersonateButton
                    tenantId={tenant.id}
                    tenantName={tenant.name}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">{t('noTenants')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

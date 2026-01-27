import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImpersonateButton } from '@/components/impersonate-button';
import { AddUserToTenantForm } from '@/features/admin/add-user-to-tenant-form';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Users, TrendingUp, User } from 'lucide-react';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const t = await getTranslations('admin');
  return {
    title: t('tenantDetails'),
  };
}

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Fetch tenant details
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', params.id)
    .single();

  if (tenantError || !tenant) {
    notFound();
  }

  // Fetch users for this tenant
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', params.id)
    .order('created_at', { ascending: false });

  // Fetch statistics
  const { count: jobsCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact' })
    .eq('tenant_id', params.id);

  const { count: candidatesCount } = await supabase
    .from('candidates')
    .select('id', { count: 'exact' })
    .eq('tenant_id', params.id);

  const { count: activeCount } = await supabase
    .from('job_candidates')
    .select('id', { count: 'exact' })
    .eq('tenant_id', params.id)
    .not('stage', 'in', '(hired,rejected)');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/app/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToAdmin')}
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {tenant.name}
            </h1>
            <p className="mt-2 text-gray-700">{t('tenantDetailsSubtitle')}</p>
          </div>
          <ImpersonateButton
            tenantId={tenant.id}
            tenantName={tenant.name}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('totalJobs')}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('totalCandidates')}
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('activeInPipeline')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('tenantUsers')}</CardTitle>
            <AddUserToTenantForm tenantId={tenant.id} tenantName={tenant.name} />
          </div>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gray-100 p-2">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {u.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noUsers')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

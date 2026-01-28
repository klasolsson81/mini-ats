import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ImpersonateButton } from '@/components/impersonate-button';
import { AddUserToTenantForm } from '@/features/admin/add-user-to-tenant-form';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Users, TrendingUp, User } from 'lucide-react';

export async function generateMetadata({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('admin');
  return {
    title: `${t('tenantDetails')} - Mini ATS`,
  };
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  if (profile?.role !== 'admin') {
    redirect('/app');
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();

  if (tenantError || !tenant) {
    notFound();
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', id)
    .order('created_at', { ascending: false });

  const { count: jobsCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact' })
    .eq('tenant_id', id);

  const { count: candidatesCount } = await supabase
    .from('candidates')
    .select('id', { count: 'exact' })
    .eq('tenant_id', id);

  const { count: activeCount } = await supabase
    .from('job_candidates')
    .select('id', { count: 'exact' })
    .eq('tenant_id', id)
    .not('stage', 'in', '(hired,rejected)');

  const stats = [
    { label: t('totalJobs'), value: jobsCount || 0, icon: Briefcase, gradient: 'from-emerald-500 to-green-600' },
    { label: t('totalCandidates'), value: candidatesCount || 0, icon: Users, gradient: 'from-violet-500 to-purple-600' },
    { label: t('activeInPipeline'), value: activeCount || 0, icon: TrendingUp, gradient: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link
          href="/app/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToAdmin')}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
              {tenant.name}
            </h1>
            <p className="mt-1 text-gray-600 text-lg">{t('tenantDetailsSubtitle')}</p>
          </div>
          <ImpersonateButton
            tenantId={tenant.id}
            tenantName={tenant.name}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
                <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-50 via-cyan-50/90 to-white/95 backdrop-blur-xl" />
              </div>
              <div className="relative p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
          <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-white/90 backdrop-blur-xl" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-between p-4 border-b border-cyan-200/50">
            <h2 className="text-lg font-semibold text-gray-900">{t('tenantUsers')}</h2>
            <AddUserToTenantForm tenantId={tenant.id} tenantName={tenant.name} />
          </div>
          <div className="p-4">
            {users && users.length > 0 ? (
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg bg-white/40 border border-white/50 p-3 hover:bg-white/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{u.full_name}</p>
                        <p className="text-xs text-gray-600">{u.email}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-700">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">{t('noUsers')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

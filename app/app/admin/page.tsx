import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateTenantForm } from '@/features/admin/create-tenant-form';
import { CreateAdminForm } from '@/features/admin/create-admin-form';
import { ImpersonateButton } from '@/components/impersonate-button';
import Link from 'next/link';
import { Users, Shield, Building2, ChevronRight } from 'lucide-react';

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return {
    title: `${t('title')} - Mini ATS`,
  };
}

export default async function AdminPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin');
  const tCommon = await getTranslations('common');

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

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, profiles(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            {t('pageTitle')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href="/app/admin/users">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-white/50 via-cyan-50/30 to-blue-50/40 hover:from-white/70 hover:via-cyan-100/40 hover:to-blue-100/50 border border-cyan-200/40 hover:border-cyan-300/60 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200">
              <Users className="h-4 w-4 text-cyan-600" />
              {t('viewAllUsers')}
            </button>
          </Link>
          <Link href="/app/admin/audit-logs">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-white/50 via-cyan-50/30 to-blue-50/40 hover:from-white/70 hover:via-cyan-100/40 hover:to-blue-100/50 border border-cyan-200/40 hover:border-cyan-300/60 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200">
              <Shield className="h-4 w-4 text-cyan-600" />
              {t('viewAuditLogs')}
            </button>
          </Link>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Create Admin User */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400 via-purple-400 to-violet-500 p-[1.5px]">
            <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-violet-50 via-purple-50/90 to-white/95 backdrop-blur-xl" />
          </div>
          <div className="relative p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('createAdmin')}
              </h2>
            </div>
            <CreateAdminForm />
          </div>
        </div>

        {/* Create Tenant */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
            <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-50 via-cyan-50/90 to-white/95 backdrop-blur-xl" />
          </div>
          <div className="relative p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('createNewTenant')}
              </h2>
            </div>
            <CreateTenantForm />
          </div>
        </div>
      </div>

      {/* Existing Tenants - Table Style */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('existingTenants')}
        </h2>

        {tenants && tenants.length > 0 ? (
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
              <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-white/90 backdrop-blur-xl" />
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-200/50 bg-white/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                      {t('tenantName')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                      {t('users')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                      {tCommon('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-100/50">
                  {tenants.map((tenant: any) => (
                    <tr key={tenant.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/admin/tenants/${tenant.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">
                            {tenant.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-100/50 text-cyan-700">
                          {tenant.profiles?.[0]?.count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <ImpersonateButton
                            tenantId={tenant.id}
                            tenantName={tenant.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
              <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-50 via-cyan-50/90 to-white/95 backdrop-blur-xl" />
            </div>
            <div className="relative p-8 text-center">
              <p className="text-sm text-gray-600">{t('noTenants')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

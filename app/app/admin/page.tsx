import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateTenantForm } from '@/features/admin/create-tenant-form';
import { CreateAdminForm } from '@/features/admin/create-admin-form';
import { ImpersonateButton } from '@/components/impersonate-button';
import Link from 'next/link';
import { Users, Shield, Building2, ChevronRight } from 'lucide-react';
import { isAdminRole } from '@/lib/utils/roles';

interface TenantWithProfiles {
  id: string;
  name: string;
  created_at: string;
  profiles: { count: number }[] | null;
}

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

  if (!isAdminRole(profile?.role)) {
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            {t('pageTitle')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href="/app/admin/users">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 backdrop-blur-sm border-2 border-cyan-300/50 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md">
              <Users className="h-4 w-4 text-cyan-600" />
              {t('viewAllUsers')}
            </button>
          </Link>
          <Link href="/app/admin/audit-logs">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 backdrop-blur-sm border-2 border-violet-300/50 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md">
              <Shield className="h-4 w-4 text-violet-600" />
              {t('viewAuditLogs')}
            </button>
          </Link>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Create Admin User */}
        <div className="rounded-xl glass-violet border border-violet-300/50 shadow-sm">
          <div className="p-5 space-y-4">
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
        <div className="rounded-xl glass-cyan border border-cyan-300/50 shadow-sm">
          <div className="p-5 space-y-4">
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
      <div className="rounded-2xl glass-blue shadow-sm">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('existingTenants')}
              </h2>
              <p className="text-sm text-gray-600">
                {tenants?.length || 0} {t('users').toLowerCase()}
              </p>
            </div>
          </div>

          {tenants && tenants.length > 0 ? (
            <div className="rounded-xl overflow-hidden border-2 border-white/50 bg-white/30 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/40 bg-white/40">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-700">
                      {t('tenantName')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-700">
                      {t('users')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-700">
                      {tCommon('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  {(tenants as TenantWithProfiles[]).map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-white/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/admin/tenants/${tenant.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {tenant.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border border-blue-300/50">
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
          ) : (
            <div className="rounded-xl bg-white/30 backdrop-blur-sm border-2 border-white/50 p-8 text-center">
              <p className="text-sm text-gray-600">{t('noTenants')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

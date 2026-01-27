import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateTenantForm } from '@/features/admin/create-tenant-form';
import { CreateAdminForm } from '@/features/admin/create-admin-form';
import { ImpersonateButton } from '@/components/impersonate-button';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';
import { Users, Shield, Building2 } from 'lucide-react';

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
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
          {t('pageTitle')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/app/admin/users">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-white/20 text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-all duration-200">
            <Users className="h-4 w-4" />
            {t('viewAllUsers')}
          </button>
        </Link>
        <Link href="/app/admin/audit-logs">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-white/20 text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-all duration-200">
            <Shield className="h-4 w-4" />
            {t('viewAuditLogs')}
          </button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Admin User */}
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('createAdmin')}
              </h2>
            </div>
            <CreateAdminForm />
          </div>
        </GlassCard>

        {/* Create Tenant */}
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('createNewTenant')}
              </h2>
            </div>
            <CreateTenantForm />
          </div>
        </GlassCard>
      </div>

      {/* Existing Tenants */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('existingTenants')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants && tenants.length > 0 ? (
            tenants.map((tenant: any) => (
              <GlassCard key={tenant.id} hover>
                <div className="space-y-4">
                  <Link
                    href={`/app/admin/tenants/${tenant.id}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                          {tenant.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tenant.profiles?.[0]?.count || 0} {t('users')}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <ImpersonateButton
                    tenantId={tenant.id}
                    tenantName={tenant.name}
                  />
                </div>
              </GlassCard>
            ))
          ) : (
            <GlassCard>
              <p className="text-sm text-gray-600 text-center py-8">{t('noTenants')}</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

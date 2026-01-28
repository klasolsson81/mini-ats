import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Building2, Shield } from 'lucide-react';
import { BulkUsersManager } from '@/features/admin/bulk-users-manager';
import { KpiCard } from '@/components/ui/kpi-card';
import { isAdminRole } from '@/lib/utils/roles';

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return {
    title: `${t('allUsers')} - Mini ATS`,
  };
}

export default async function UsersPage() {
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
  if (!isAdminRole(profile?.role)) {
    redirect('/app');
  }

  // Fetch all users with their tenants
  const { data: users } = await supabase
    .from('profiles')
    .select('*, tenants(id, name)')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  const currentUserId = user.id;
  const currentUserRole = profile?.role || 'admin';

  // Separate admins and customers for stats (only count active users)
  const activeUsers = users?.filter((u) => u.is_active !== false) || [];
  const admins = activeUsers.filter((u) => isAdminRole(u.role));
  const customers = activeUsers.filter((u) => u.role === 'customer');

  // Transform users for BulkUsersManager
  const usersForManager = (users || []).map((u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    role: u.role as 'super_admin' | 'admin' | 'customer',
    is_active: u.is_active !== false,
    last_login_at: u.last_login_at,
    tenants: u.tenants,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
          {t('allUsers')}
        </h1>
        <p className="text-gray-600 text-sm sm:text-lg">{t('allUsersSubtitle')}</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-3 grid-cols-3 max-w-4xl">
        <KpiCard
          title={t('totalUsers')}
          value={activeUsers.length}
          icon={User}
          variant="blue"
        />
        <KpiCard
          title={t('adminUsers')}
          value={admins.length}
          icon={Shield}
          variant="purple"
        />
        <KpiCard
          title={t('customerUsers')}
          value={customers.length}
          icon={Building2}
          variant="emerald"
        />
      </div>

      {/* Users Lists with Bulk Actions */}
      <BulkUsersManager users={usersForManager} currentUserId={currentUserId} currentUserRole={currentUserRole} />
    </div>
  );
}

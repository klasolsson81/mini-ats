import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { UserActions } from '@/features/admin/user-actions';

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
  if (profile?.role !== 'admin') {
    redirect('/app');
  }

  // Fetch all users with their tenants
  const { data: users } = await supabase
    .from('profiles')
    .select('*, tenants(id, name)')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  const currentUserId = user.id;

  // Separate admins and customers
  const admins = users?.filter((u) => u.role === 'admin') || [];
  const customers = users?.filter((u) => u.role === 'customer') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('allUsers')}
        </h1>
        <p className="mt-2 text-gray-700">{t('allUsersSubtitle')}</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('totalUsers')}
            </CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('adminUsers')}
            </CardTitle>
            <Shield className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('customerUsers')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admins List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminUsers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length > 0 ? (
            <div className="space-y-3">
              {admins.map((u) => {
                const isActive = u.is_active !== false;
                const lastLogin = u.last_login_at
                  ? new Date(u.last_login_at).toLocaleString('sv-SE')
                  : null;

                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      isActive
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-300 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${isActive ? 'bg-blue-100' : 'bg-gray-200'}`}>
                        <Shield className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{u.full_name}</p>
                          {isActive ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{u.email}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {lastLogin ? lastLogin : t('neverLoggedIn')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {t('roleAdmin')}
                      </span>
                      <UserActions
                        userId={u.id}
                        isActive={isActive}
                        isSelf={u.id === currentUserId}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noAdminUsers')}</p>
          )}
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('customerUsers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <div className="space-y-3">
              {customers.map((u) => {
                const isActive = u.is_active !== false;
                const lastLogin = u.last_login_at
                  ? new Date(u.last_login_at).toLocaleString('sv-SE')
                  : null;

                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      isActive
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-300 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${isActive ? 'bg-green-100' : 'bg-gray-200'}`}>
                        <User className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{u.full_name}</p>
                          {isActive ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{u.email}</p>
                        {u.tenants && (
                          <Link
                            href={`/app/admin/tenants/${u.tenants.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            <Building2 className="h-3 w-3 inline mr-1" />
                            {u.tenants.name}
                          </Link>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {lastLogin ? lastLogin : t('neverLoggedIn')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        {t('roleCustomer')}
                      </span>
                      <UserActions
                        userId={u.id}
                        isActive={isActive}
                        isSelf={u.id === currentUserId}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noCustomerUsers')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

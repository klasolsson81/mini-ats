import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Shield } from 'lucide-react';
import Link from 'next/link';

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
    .order('created_at', { ascending: false });

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
              {admins.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {t('roleAdmin')}
                  </span>
                </div>
              ))}
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
              {customers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      {u.tenants && (
                        <Link
                          href={`/app/admin/tenants/${u.tenants.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {u.tenants.name}
                        </Link>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    {t('roleCustomer')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noCustomerUsers')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

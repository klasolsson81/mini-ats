import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateTenantForm } from '@/features/admin/create-tenant-form';

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return {
    title: t('title'),
  };
}

export default async function AdminPage() {
  const supabase = await createClient();
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
          Admin Panel
        </h1>
        <p className="mt-2 text-gray-600">
          Hantera kunder och användare
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Create Tenant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Skapa Ny Kund
          </h2>
          <CreateTenantForm />
        </div>

        {/* Existing Tenants */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Befintliga Kunder
          </h2>
          <div className="space-y-3">
            {tenants && tenants.length > 0 ? (
              tenants.map((tenant: any) => (
                <div
                  key={tenant.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-sm text-gray-500">
                    {tenant.profiles?.[0]?.count || 0} användare
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Inga kunder än.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

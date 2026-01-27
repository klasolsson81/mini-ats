import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DebugPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Test is_admin() function
  const { data: adminTest } = await supabase.rpc('is_admin');

  // Get all profiles (should work if admin)
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  // Get all tenants (should work if admin)
  const { data: allTenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('*');

  return (
    <div className="p-8 space-y-6 bg-white">
      <h1 className="text-2xl font-bold">Debug Information</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Current User (auth.users):</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Current Profile:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">is_admin() Result:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(adminTest, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">
            All Profiles Query (should work if admin):
          </h2>
          {profilesError ? (
            <div className="text-red-600">
              <p className="font-semibold">ERROR:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(profilesError, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-green-600 font-semibold mb-2">
                SUCCESS: Found {allProfiles?.length || 0} profiles
              </p>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(allProfiles, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">
            All Tenants Query (should work if admin):
          </h2>
          {tenantsError ? (
            <div className="text-red-600">
              <p className="font-semibold">ERROR:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(tenantsError, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-green-600 font-semibold mb-2">
                SUCCESS: Found {allTenants?.length || 0} tenants
              </p>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(allTenants, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 bg-yellow-50 rounded">
          <h2 className="font-semibold mb-2">Expected Behavior:</h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Profile role should be: &quot;admin&quot;</li>
            <li>is_admin() should return: true</li>
            <li>All Profiles query should show ALL profiles</li>
            <li>All Tenants query should show ALL tenants</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h2 className="font-semibold mb-2">Deployment Version Check:</h2>
          <p className="text-sm">
            If you see this page, the new code is deployed.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Deployed: 2026-01-27 (Password change fix)
          </p>
        </div>
      </div>
    </div>
  );
}

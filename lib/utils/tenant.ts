import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Gets the effective tenant ID for the current user.
 * If admin is impersonating, returns the impersonated tenant ID.
 * Otherwise, returns the user's own tenant ID.
 */
export async function getEffectiveTenantId(): Promise<{
  tenantId: string | null;
  isAdmin: boolean;
  isImpersonating: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { tenantId: null, isAdmin: false, isImpersonating: false };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // Check for impersonation
  if (isAdmin) {
    const cookieStore = await cookies();
    const impersonatedTenantId = cookieStore.get('IMPERSONATE_TENANT_ID')?.value;

    if (impersonatedTenantId) {
      return {
        tenantId: impersonatedTenantId,
        isAdmin: true,
        isImpersonating: true,
      };
    }
  }

  return {
    tenantId: profile?.tenant_id || null,
    isAdmin,
    isImpersonating: false,
  };
}

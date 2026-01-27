'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function impersonateTenant(tenantId: string) {
  const supabase = await createClient();

  // Verify user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Only admins can impersonate' };
  }

  // Verify tenant exists
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('id', tenantId)
    .single();

  if (!tenant) {
    return { error: 'Tenant not found' };
  }

  // Set impersonation cookie
  const cookieStore = await cookies();
  cookieStore.set('IMPERSONATE_TENANT_ID', tenantId, {
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  cookieStore.set('IMPERSONATE_TENANT_NAME', tenant.name, {
    path: '/',
    maxAge: 60 * 60 * 8,
    httpOnly: false, // Allow client to read for banner
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  redirect('/app');
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete('IMPERSONATE_TENANT_ID');
  cookieStore.delete('IMPERSONATE_TENANT_NAME');

  redirect('/app/admin');
}

export async function getImpersonationStatus() {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get('IMPERSONATE_TENANT_ID')?.value;
  const tenantName = cookieStore.get('IMPERSONATE_TENANT_NAME')?.value;

  if (!tenantId || !tenantName) {
    return { isImpersonating: false };
  }

  return {
    isImpersonating: true,
    tenantId,
    tenantName,
  };
}

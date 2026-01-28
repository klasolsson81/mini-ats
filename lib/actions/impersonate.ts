'use server';

import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isAdminRole } from '@/lib/utils/roles';

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

  if (!isAdminRole(profile?.role)) {
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

  // Get request metadata for audit log
  const headersList = await headers();
  const ipAddress =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('x-real-ip') ||
    'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Create audit log entry
  const { data: logEntry, error: logError } = await supabase
    .from('impersonation_logs')
    .insert({
      admin_id: user.id,
      tenant_id: tenantId,
      started_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (logError) {
    console.error('Failed to create audit log:', logError);
    // Continue anyway - don't block impersonation on logging failure
  }

  // Set impersonation cookies
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

  // Store log ID in cookie for later update
  if (logEntry?.id) {
    cookieStore.set('IMPERSONATE_LOG_ID', logEntry.id, {
      path: '/',
      maxAge: 60 * 60 * 8,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  redirect('/app');
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  const logId = cookieStore.get('IMPERSONATE_LOG_ID')?.value;

  // Update audit log with end time
  if (logId) {
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('impersonation_logs')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', logId);

    if (updateError) {
      console.error('Failed to update audit log:', updateError);
      // Continue anyway
    }
  }

  // Clear all impersonation cookies
  cookieStore.delete('IMPERSONATE_TENANT_ID');
  cookieStore.delete('IMPERSONATE_TENANT_NAME');
  cookieStore.delete('IMPERSONATE_LOG_ID');

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

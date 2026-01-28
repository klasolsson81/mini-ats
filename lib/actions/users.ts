'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from '@/lib/utils/audit-log';
import { isAdminRole, canModifyUser } from '@/lib/utils/roles';

/**
 * Toggle user active status (activate/deactivate)
 */
export async function toggleUserActive(userId: string, isActive: boolean) {
  const supabase = await createClient();

  // Verify caller is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Ej inloggad' };
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!isAdminRole(callerProfile?.role)) {
    return { error: 'Endast administratörer kan ändra användarstatus' };
  }

  // Prevent deactivating yourself
  if (userId === user.id && !isActive) {
    return { error: 'Du kan inte inaktivera ditt eget konto' };
  }

  // Get target user info for audit log and permission check
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', userId)
    .single();

  // Check if caller can modify target based on roles
  if (targetUser && callerProfile && !canModifyUser(callerProfile.role, targetUser.role)) {
    return { error: 'Du har inte behörighet att ändra denna användare' };
  }

  // Update user status
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    console.error('Toggle user active error:', error);
    return { error: 'Kunde inte uppdatera användarstatus' };
  }

  // Log audit event
  await logAuditEvent({
    eventType: isActive ? 'user.activated' : 'user.deactivated',
    targetType: 'user',
    targetId: userId,
    targetName: targetUser?.full_name || targetUser?.email,
    metadata: { email: targetUser?.email },
  });

  revalidatePath('/app/admin/users');
  return { success: true };
}

/**
 * Delete a user account (soft delete - just deactivate, or hard delete)
 * Note: Hard delete requires Supabase Admin API
 */
export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // Verify caller is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Ej inloggad' };
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!isAdminRole(callerProfile?.role)) {
    return { error: 'Endast administratörer kan ta bort användare' };
  }

  // Prevent deleting yourself
  if (userId === user.id) {
    return { error: 'Du kan inte ta bort ditt eget konto' };
  }

  // Check if user exists
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)
    .single();

  if (!targetUser) {
    return { error: 'Användaren hittades inte' };
  }

  // Check if caller can modify target based on roles
  if (callerProfile && !canModifyUser(callerProfile.role, targetUser.role)) {
    return { error: 'Du har inte behörighet att ta bort denna användare' };
  }

  // Check if this is the last admin
  if (isAdminRole(targetUser.role)) {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (count && count <= 1) {
      return { error: 'Kan inte ta bort den sista administratören' };
    }
  }

  // For MVP: Soft delete by deactivating the user
  // Full delete would require Supabase Admin API with service role key
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) {
    console.error('Delete user error:', error);
    return { error: 'Kunde inte ta bort användare' };
  }

  // Log audit event
  await logAuditEvent({
    eventType: 'user.deleted',
    targetType: 'user',
    targetId: userId,
    targetName: targetUser.full_name,
    metadata: { role: targetUser.role },
  });

  revalidatePath('/app/admin/users');
  return { success: true, softDeleted: true };
}

/**
 * Permanently delete a user (hard delete from Supabase Auth)
 * This removes the user completely - they can be re-created with same email
 */
export async function permanentDeleteUser(userId: string) {
  const supabase = await createClient();

  // Verify caller is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Ej inloggad' };
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!isAdminRole(callerProfile?.role)) {
    return { error: 'Endast administratörer kan ta bort användare permanent' };
  }

  // Prevent deleting yourself
  if (userId === user.id) {
    return { error: 'Du kan inte ta bort ditt eget konto' };
  }

  // Get target user info
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', userId)
    .single();

  if (!targetUser) {
    return { error: 'Användaren hittades inte' };
  }

  // Check if caller can modify target based on roles
  if (callerProfile && !canModifyUser(callerProfile.role, targetUser.role)) {
    return { error: 'Du har inte behörighet att ta bort denna användare' };
  }

  // Check if this is the last admin
  if (isAdminRole(targetUser.role)) {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (count && count <= 1) {
      return { error: 'Kan inte ta bort den sista administratören' };
    }
  }

  // Create Supabase admin client with service role key
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Delete profile first (foreign key constraint)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error('Delete profile error:', profileError);
    return { error: 'Kunde inte ta bort användarprofil' };
  }

  // Delete from Supabase Auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    console.error('Delete auth user error:', authError);
    return { error: 'Kunde inte ta bort användare från autentisering' };
  }

  // Log audit event
  await logAuditEvent({
    eventType: 'user.permanently_deleted',
    targetType: 'user',
    targetId: userId,
    targetName: targetUser.full_name,
    metadata: { email: targetUser.email, role: targetUser.role },
  });

  revalidatePath('/app/admin/users');
  return { success: true, permanentlyDeleted: true };
}

/**
 * Bulk toggle user active status
 */
export async function bulkToggleUserActive(userIds: string[], isActive: boolean) {
  const supabase = await createClient();

  // Verify caller is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Ej inloggad' };
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!isAdminRole(callerProfile?.role)) {
    return { error: 'Endast administratörer kan ändra användarstatus' };
  }

  // Get all target users to check permissions
  const { data: targetUsers } = await supabase
    .from('profiles')
    .select('id, role')
    .in('id', userIds);

  // Filter out users the caller cannot modify (super_admins if caller is not super_admin)
  const allowedIds = targetUsers
    ?.filter((u) => callerProfile && canModifyUser(callerProfile.role, u.role))
    .map((u) => u.id) || [];

  // Filter out self from deactivation
  const filteredIds = isActive
    ? allowedIds
    : allowedIds.filter((id) => id !== user.id);

  if (filteredIds.length === 0) {
    return { error: 'Inga användare att uppdatera' };
  }

  // Check for last admin protection when deactivating
  if (!isActive) {
    const adminIds = targetUsers?.filter((u) => isAdminRole(u.role) && filteredIds.includes(u.id)).map((u) => u.id) || [];

    if (adminIds.length > 0) {
      const { count: totalAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'super_admin'])
        .eq('is_active', true);

      const { count: selectedAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'super_admin'])
        .eq('is_active', true)
        .in('id', adminIds);

      if (totalAdmins && selectedAdmins && totalAdmins - selectedAdmins < 1) {
        return { error: 'Kan inte inaktivera alla administratörer' };
      }
    }
  }

  // Update all users
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .in('id', filteredIds);

  if (error) {
    console.error('Bulk toggle user active error:', error);
    return { error: 'Kunde inte uppdatera användarstatus' };
  }

  // Log audit event
  await logAuditEvent({
    eventType: isActive ? 'user.bulk_activated' : 'user.bulk_deactivated',
    targetType: 'user',
    targetName: `${filteredIds.length} användare`,
    metadata: { count: filteredIds.length, userIds: filteredIds },
  });

  revalidatePath('/app/admin/users');
  return { success: true, updatedCount: filteredIds.length };
}

/**
 * Update last login timestamp
 * Called after successful login
 */
export async function updateLastLogin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Ej inloggad' };
  }

  // Call the database function to update last login
  const { error } = await supabase.rpc('update_last_login', {
    user_id: user.id,
  });

  if (error) {
    console.error('Update last login error:', error);
    // Don't return error - this is not critical
  }

  return { success: true };
}

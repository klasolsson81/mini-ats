'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

  if (callerProfile?.role !== 'admin') {
    return { error: 'Endast administratörer kan ändra användarstatus' };
  }

  // Prevent deactivating yourself
  if (userId === user.id && !isActive) {
    return { error: 'Du kan inte inaktivera ditt eget konto' };
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

  if (callerProfile?.role !== 'admin') {
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

  // Check if this is the last admin
  if (targetUser.role === 'admin') {
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

  revalidatePath('/app/admin/users');
  return { success: true, softDeleted: true };
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

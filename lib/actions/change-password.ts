'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from '@/lib/utils/audit-log';

// Map common Supabase auth errors to user-friendly Swedish messages
function translateAuthError(error: string): string {
  const errorMap: Record<string, string> = {
    'New password should be different from the old password':
      'Det nya lösenordet måste skilja sig från det gamla',
    'Password should be at least 6 characters':
      'Lösenordet måste vara minst 6 tecken långt',
    'New password cannot be empty': 'Lösenordet får inte vara tomt',
  };

  return errorMap[error] || error;
}

export async function changePassword(newPassword: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Inte autentiserad' };
  }

  // Validate password (minimum 8 characters)
  if (newPassword.length < 8) {
    return { error: 'Lösenordet måste vara minst 8 tecken långt' };
  }

  // Update password in Supabase Auth
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (authError) {
    console.error('Auth error:', authError);
    return { error: translateAuthError(authError.message) };
  }

  // Clear the must_change_password flag
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id);

  if (profileError) {
    console.error('Profile error:', profileError);
    return { error: profileError.message };
  }

  // Refresh session to ensure it's up to date
  const { error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError) {
    console.error('Refresh error:', refreshError);
  }

  // Log audit event
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  await logAuditEvent({
    eventType: 'auth.password_changed',
    targetType: 'auth',
    targetId: user.id,
    targetName: profile?.full_name || profile?.email,
    metadata: { email: profile?.email },
  });

  revalidatePath('/app');
  revalidatePath('/');

  return { success: true };
}

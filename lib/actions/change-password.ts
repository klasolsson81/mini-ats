'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function changePassword(newPassword: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
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
    return { error: authError.message };
  }

  // Clear the must_change_password flag
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath('/app');
  return { success: true };
}

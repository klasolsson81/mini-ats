'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Map common Supabase auth errors to user-friendly Swedish messages
function translateAuthError(error: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Felaktigt användarnamn eller lösenord',
    'Email not confirmed': 'E-postadressen är inte bekräftad',
    'User not found': 'Användaren hittades inte',
    'Invalid email or password': 'Felaktigt användarnamn eller lösenord',
    'Email or password is incorrect': 'Felaktigt användarnamn eller lösenord',
    'Too many requests': 'För många inloggningsförsök. Försök igen om en stund',
  };

  return errorMap[error] || error;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Clear any leftover impersonation cookies before login
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete('IMPERSONATE_TENANT_ID');
  cookieStore.delete('IMPERSONATE_TENANT_NAME');
  cookieStore.delete('IMPERSONATE_LOG_ID');

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath('/', 'layout');
  redirect('/app');
}

export async function logout() {
  const supabase = await createClient();

  // Clear impersonation cookies before logging out
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete('IMPERSONATE_TENANT_ID');
  cookieStore.delete('IMPERSONATE_TENANT_NAME');
  cookieStore.delete('IMPERSONATE_LOG_ID');

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  // First verify the current password by attempting to sign in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: 'Användaren hittades inte' };
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: 'Nuvarande lösenord är felaktigt' };
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: translateAuthError(updateError.message) };
  }

  // Clear the must_change_password flag if it was set
  await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id);

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function forgotPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: true };
}

export async function resetPassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // Clear the must_change_password flag if it was set
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', user.id);
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

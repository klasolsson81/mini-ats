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

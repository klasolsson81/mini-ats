'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
} from '@/lib/utils/rate-limit';

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

// Get client IP from headers
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  // Try various headers (Vercel, Cloudflare, standard)
  return (
    headersList.get('x-real-ip') ||
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('cf-connecting-ip') ||
    'unknown'
  );
}

export async function login(formData: FormData) {
  // Get client IP for rate limiting
  const clientIp = await getClientIp();

  // Check rate limit before attempting login
  const rateLimitStatus = checkRateLimit(clientIp);
  if (rateLimitStatus.isLimited) {
    const minutes = Math.ceil(rateLimitStatus.resetInSeconds / 60);
    return {
      error: `För många inloggningsförsök. Försök igen om ${minutes} minuter.`,
      rateLimited: true,
      resetInSeconds: rateLimitStatus.resetInSeconds,
    };
  }

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

  const { error, data: authData } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Record failed attempt
    recordFailedAttempt(clientIp);
    const newStatus = checkRateLimit(clientIp);

    if (newStatus.remainingAttempts > 0) {
      return {
        error: `${translateAuthError(error.message)} (${newStatus.remainingAttempts} försök kvar)`,
        remainingAttempts: newStatus.remainingAttempts,
      };
    } else {
      const minutes = Math.ceil(newStatus.resetInSeconds / 60);
      return {
        error: `För många inloggningsförsök. Försök igen om ${minutes} minuter.`,
        rateLimited: true,
        resetInSeconds: newStatus.resetInSeconds,
      };
    }
  }

  // Clear rate limit on successful login
  clearRateLimit(clientIp);

  // Check if user must change password
  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('id', authData.user.id)
    .single();

  revalidatePath('/', 'layout');

  // Return success with redirect URL instead of calling redirect()
  // This allows the client to show a loading overlay during navigation
  const redirectTo = profile?.must_change_password ? '/change-password' : '/app';
  return { success: true, redirectTo };
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

  // Return success with redirect URL for client-side navigation
  return { success: true, redirectTo: '/login' };
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

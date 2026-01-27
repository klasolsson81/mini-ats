import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from '@/features/auth/change-password-form';

export async function generateMetadata() {
  const t = await getTranslations('auth');
  return {
    title: `${t('changePassword')} - Mini ATS`,
  };
}

export default async function ChangePasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password, full_name')
    .eq('id', user.id)
    .single();

  // If user doesn't need to change password, redirect to app
  if (!profile?.must_change_password) {
    redirect('/app');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Välkommen, {profile.full_name}!
          </h1>
          <p className="mt-4 text-center text-sm text-gray-700">
            För din säkerhet måste du välja ett nytt lösenord innan du fortsätter.
          </p>
          <p className="mt-2 text-center text-xs text-gray-600">
            Detta är ditt första besök med ett admin-genererat lösenord.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  );
}

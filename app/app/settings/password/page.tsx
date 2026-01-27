import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from '@/features/settings/change-password-form';
import { ArrowLeft, Key } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata() {
  const t = await getTranslations('settings');
  return {
    title: `${t('changePassword')} - Mini ATS`,
  };
}

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const t = await getTranslations('settings');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('account')}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Key className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            {t('changePassword')}
          </h1>
          <p className="text-gray-600">{t('passwordRequirements')}</p>
        </div>
      </div>

      {/* Form card */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
          <div className="absolute inset-[1.5px] rounded-[14px] bg-gradient-to-br from-blue-50 via-cyan-50/90 to-white/95 backdrop-blur-xl" />
        </div>
        <div className="relative p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}

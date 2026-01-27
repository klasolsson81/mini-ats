import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArrowLeft, User, Key, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata() {
  const t = await getTranslations('settings');
  return {
    title: `${t('title')} - Mini ATS`,
  };
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const t = await getTranslations('settings');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            {t('accountSettings')}
          </h1>
          <p className="text-gray-600">{t('personalInfo')}</p>
        </div>
      </div>

      {/* Profile info card */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
          <div className="absolute inset-[1.5px] rounded-[14px] bg-gradient-to-br from-blue-50 via-cyan-50/90 to-white/95 backdrop-blur-xl" />
        </div>
        <div className="relative p-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.full_name}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>

          {/* Info fields */}
          <div className="pt-4 border-t border-gray-200/50 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {t('fullName')}
              </label>
              <p className="text-gray-900 font-medium">{profile?.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {t('email')}
              </label>
              <p className="text-gray-900 font-medium">{profile?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings links */}
      <div className="space-y-2">
        <Link
          href="/app/settings/password"
          className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('changePassword')}</p>
              <p className="text-sm text-gray-500">{t('passwordRequirements')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

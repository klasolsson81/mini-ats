import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';
import { LanguageSwitcher } from '@/components/language-switcher';

export async function generateMetadata() {
  const t = await getTranslations('auth');
  return {
    title: `${t('resetPassword')} - Mini ATS`,
  };
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center login-bg px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle animated pulse glow */}
      <div className="absolute inset-0 pulse-glow-overlay pointer-events-none" />

      {/* Language switcher */}
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo text */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,200,255,0.5)] tracking-tight">
            Mini <span className="text-cyan-300">ATS</span>
          </h1>
          <p className="mt-2 text-cyan-100/80 text-sm font-medium tracking-wide">
            Applicant Tracking System
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}

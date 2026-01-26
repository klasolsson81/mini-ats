import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/features/auth/login-form';
import { LanguageSwitcher } from '@/components/language-switcher';

export async function generateMetadata() {
  const t = await getTranslations('auth');
  return {
    title: t('login'),
  };
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mini ATS
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Applicant Tracking System
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

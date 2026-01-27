'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/actions/auth';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // If successful, redirect() is called and component unmounts
  }

  return (
    <>
      {/* Fullscreen loading overlay during login */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center login-bg">
          <div className="text-center relative z-10">
            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/50">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {t('auth.loggingIn')}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.preparingSession')}
            </p>
          </div>
        </div>
      )}

      {/* Glassmorphism card with animated border */}
      <div className="animated-border-card shadow-2xl">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">{t('auth.login')}</h2>
            <p className="text-sm text-cyan-100 mt-1">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-white drop-shadow-sm"
              >
                {t('auth.email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                className="h-11 bg-white/30 backdrop-blur-sm border-white/40 text-gray-800 placeholder:text-gray-500 focus:border-cyan-300 focus:ring-cyan-300 focus:bg-white/50"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-white drop-shadow-sm"
              >
                {t('auth.password')}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="h-11 bg-white/30 backdrop-blur-sm border-white/40 text-gray-800 placeholder:text-gray-500 focus:border-cyan-300 focus:ring-cyan-300 focus:bg-white/50"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-300/50 p-3 text-sm text-white">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </span>
              ) : (
                t('auth.signIn')
              )}
            </button>

            {/* Forgot password link */}
            <div className="text-center pt-3">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-800 hover:text-blue-900 underline underline-offset-2 decoration-blue-400 hover:decoration-blue-600 transition-all"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

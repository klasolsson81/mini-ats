'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { forgotPassword } from '@/lib/actions/auth';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await forgotPassword(email);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="animated-border-card shadow-2xl">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-300" />
          </div>
          <h2 className="text-xl font-bold text-white drop-shadow-md mb-2">
            {t('auth.checkYourEmail')}
          </h2>
          <p className="text-cyan-100 text-sm mb-6">
            {t('auth.resetEmailSent', { email })}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-border-card shadow-2xl">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-cyan-300" />
          </div>
          <h2 className="text-2xl font-bold text-white drop-shadow-md text-center">
            {t('auth.forgotPassword')}
          </h2>
          <p className="text-sm text-cyan-100 mt-2 text-center">
            {t('auth.forgotPasswordSubtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
              t('auth.sendResetLink')
            )}
          </button>

          {/* Back to login */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

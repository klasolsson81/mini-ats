'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/actions/auth';
import { Loader2, Eye, EyeOff, Lock, CheckCircle, Check, X } from 'lucide-react';

export function ResetPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValidPassword = hasMinLength && hasLetter && hasNumber;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidPassword) {
      setError(t('auth.passwordRequirements'));
      return;
    }

    if (!passwordsMatch) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await resetPassword(password);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
            {t('auth.passwordUpdated')}
          </h2>
          <p className="text-cyan-100 text-sm mb-6">
            {t('auth.redirectingToLogin')}
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" />
          </div>
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
            <Lock className="w-6 h-6 text-cyan-300" />
          </div>
          <h2 className="text-2xl font-bold text-white drop-shadow-md text-center">
            {t('auth.resetPassword')}
          </h2>
          <p className="text-sm text-cyan-100 mt-2 text-center">
            {t('auth.resetPasswordSubtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-white drop-shadow-sm"
            >
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 pr-10 bg-white/30 backdrop-blur-sm border-white/40 text-gray-800 placeholder:text-gray-500 focus:border-cyan-300 focus:ring-cyan-300 focus:bg-white/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password requirements */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-2 text-xs">
                {hasMinLength ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-red-400" />
                )}
                <span className={hasMinLength ? 'text-green-200' : 'text-cyan-100/70'}>
                  {t('auth.minCharacters')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hasLetter ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-red-400" />
                )}
                <span className={hasLetter ? 'text-green-200' : 'text-cyan-100/70'}>
                  {t('auth.hasLetter')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hasNumber ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-red-400" />
                )}
                <span className={hasNumber ? 'text-green-200' : 'text-cyan-100/70'}>
                  {t('auth.hasNumber')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-white drop-shadow-sm"
            >
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 pr-10 bg-white/30 backdrop-blur-sm border-white/40 text-gray-800 placeholder:text-gray-500 focus:border-cyan-300 focus:ring-cyan-300 focus:bg-white/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs pt-1">
                {passwordsMatch ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-red-400" />
                )}
                <span className={passwordsMatch ? 'text-green-200' : 'text-red-300'}>
                  {passwordsMatch ? t('auth.passwordsMatch') : t('auth.passwordsDontMatch')}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-300/50 p-3 text-sm text-white">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isValidPassword || !passwordsMatch}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('common.loading')}
              </span>
            ) : (
              t('auth.setNewPassword')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

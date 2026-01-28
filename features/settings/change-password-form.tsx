'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword } from '@/lib/actions/auth';

function ValidationItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <X className="w-4 h-4 text-gray-300" />
      )}
      <span className={valid ? 'text-emerald-600' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}

export function ChangePasswordForm() {
  const t = useTranslations('settings');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password validation
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const isValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasLetter &&
    hasNumber &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;

    startTransition(async () => {
      const result = await changePassword(currentPassword, newPassword);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('passwordChanged'));
        router.push('/app');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current password */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          {t('currentPassword')}
        </label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showCurrent ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* New password */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          {t('newPassword')}
        </label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNew ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Password requirements */}
        {newPassword.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 space-y-1.5">
            <ValidationItem valid={hasMinLength} text={t('minLength')} />
            <ValidationItem valid={hasLetter} text={t('hasLetter')} />
            <ValidationItem valid={hasNumber} text={t('hasNumber')} />
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          {t('confirmPassword')}
        </label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Match indicator */}
        {confirmPassword.length > 0 && (
          <div className="flex items-center gap-2 text-sm mt-2">
            {passwordsMatch ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600">{t('passwordsMatch')}</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-500" />
                <span className="text-red-600">{t('passwordsDontMatch')}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isPending}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('updatePassword')}...
          </>
        ) : (
          t('updatePassword')
        )}
      </button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changePassword } from '@/lib/actions/change-password';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Check } from 'lucide-react';

export function ChangePasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  };

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Lösenordet uppfyller inte kraven');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Lösenorden matchar inte');
      return;
    }

    setIsLoading(true);

    const result = await changePassword(password);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success('Lösenord uppdaterat!');
      // Show redirecting overlay and ensure it's rendered before redirect
      setIsRedirecting(true);
      // Use requestAnimationFrame to ensure the overlay is painted before redirect
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Use window.location for full page reload to ensure session is refreshed
          setTimeout(() => {
            window.location.href = '/app';
          }, 300);
        });
      });
    }
  }

  return (
    <>
      {/* Fullscreen redirecting overlay with high priority rendering */}
      {isRedirecting && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 9999
          }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-lg font-semibold text-gray-900">
              Tar dig till appen...
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Din session uppdateras
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t('changePassword')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !isRedirecting && (
            <div className="mb-4 rounded-lg bg-blue-50 p-4 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-sm font-medium text-blue-900">
                Uppdaterar lösenord...
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-900"
            >
              {t('newPassword')}
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
                placeholder="Ange ditt nya lösenord"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="space-y-1 text-xs">
                <div
                  className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <Check
                    className={`h-3 w-3 ${passwordStrength.hasMinLength ? 'opacity-100' : 'opacity-30'}`}
                  />
                  <span>Minst 8 tecken</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordStrength.hasLetter ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <Check
                    className={`h-3 w-3 ${passwordStrength.hasLetter ? 'opacity-100' : 'opacity-30'}`}
                  />
                  <span>Innehåller bokstäver</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <Check
                    className={`h-3 w-3 ${passwordStrength.hasNumber ? 'opacity-100' : 'opacity-30'}`}
                  />
                  <span>Innehåller siffror</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-gray-900"
            >
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
                placeholder="Upprepa ditt nya lösenord"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <p
                className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}
              >
                {passwordsMatch
                  ? '✓ Lösenorden matchar'
                  : '✗ Lösenorden matchar inte'}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isRedirecting || !isPasswordValid || !passwordsMatch}
          >
            {isLoading ? t('loading') : t('updatePassword')}
          </Button>
        </form>
      </CardContent>
    </Card>
    </>
  );
}

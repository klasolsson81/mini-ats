'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Power, PowerOff, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toggleUserActive, deleteUser } from '@/lib/actions/users';

interface UserActionsProps {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
}

export function UserActions({ userId, isActive, isSelf }: UserActionsProps) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggleActive = () => {
    if (isSelf) {
      toast.error(t('cannotDeactivateSelf'));
      return;
    }

    startTransition(async () => {
      const result = await toggleUserActive(userId, !isActive);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? t('userDeactivated') : t('userActivated'));
      }
    });
  };

  const handleDelete = () => {
    if (isSelf) {
      toast.error(t('cannotDeleteSelf'));
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('userDeleted'));
      }
      setShowConfirm(false);
    });
  };

  if (isSelf) {
    return (
      <span className="text-xs text-gray-400 italic">
        (dig själv)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Active Button */}
      <button
        onClick={handleToggleActive}
        disabled={isPending}
        className={`p-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } disabled:opacity-50`}
        title={isActive ? t('deactivate') : t('activate')}
        aria-label={isActive ? t('deactivate') : t('activate')}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isActive ? (
          <PowerOff className="w-4 h-4" />
        ) : (
          <Power className="w-4 h-4" />
        )}
      </button>

      {/* Delete Button */}
      {showConfirm ? (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Ja'
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Nej
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
          title={t('deleteUser')}
          aria-label={t('deleteUser')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

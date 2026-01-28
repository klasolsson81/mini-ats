'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Power, PowerOff, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { toggleUserActive, deleteUser, permanentDeleteUser } from '@/lib/actions/users';

interface UserActionsProps {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
}

export function UserActions({ userId, isActive, isSelf }: UserActionsProps) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPermanentConfirm, setShowPermanentConfirm] = useState(false);

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

  const handlePermanentDelete = () => {
    if (!showPermanentConfirm) {
      setShowPermanentConfirm(true);
      return;
    }

    startTransition(async () => {
      const result = await permanentDeleteUser(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('userPermanentlyDeleted'));
      }
      setShowPermanentConfirm(false);
    });
  };

  if (isSelf) {
    return (
      <span className="text-xs text-gray-400 italic">
        (dig själv)
      </span>
    );
  }

  // For inactive users: show Activate + Permanent Delete
  if (!isActive) {
    return (
      <div className="flex items-center gap-2">
        {/* Activate Button */}
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
          title={t('activate')}
          aria-label={t('activate')}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>

        {/* Permanent Delete Button */}
        {showPermanentConfirm ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-600 font-medium">{t('permanentDeleteConfirm')}</span>
            <button
              onClick={handlePermanentDelete}
              disabled={isPending}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                t('yes')
              )}
            </button>
            <button
              onClick={() => setShowPermanentConfirm(false)}
              disabled={isPending}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {t('no')}
            </button>
          </div>
        ) : (
          <button
            onClick={handlePermanentDelete}
            disabled={isPending}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            title={t('permanentDelete')}
            aria-label={t('permanentDelete')}
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // For active users: show Deactivate + Soft Delete
  return (
    <div className="flex items-center gap-2">
      {/* Toggle Active Button */}
      <button
        onClick={handleToggleActive}
        disabled={isPending}
        className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50"
        title={t('deactivate')}
        aria-label={t('deactivate')}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <PowerOff className="w-4 h-4" />
        )}
      </button>

      {/* Delete Button (Soft) */}
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
              t('yes')
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            {t('no')}
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

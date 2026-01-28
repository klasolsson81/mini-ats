'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  User,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Power,
  PowerOff,
  Loader2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserActions } from './user-actions';
import { bulkToggleUserActive } from '@/lib/actions/users';
import { isAdminRole } from '@/lib/utils/roles';

interface UserWithTenant {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'customer';
  is_active: boolean;
  last_login_at: string | null;
  tenants: { id: string; name: string } | null;
}

interface BulkUsersManagerProps {
  users: UserWithTenant[];
  currentUserId: string;
  currentUserRole: string;
}

export function BulkUsersManager({ users, currentUserId, currentUserRole }: BulkUsersManagerProps) {
  const t = useTranslations('admin');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [showInactive, setShowInactive] = useState(false);

  // Filter users based on showInactive toggle
  const activeAdmins = users.filter((u) => isAdminRole(u.role) && u.is_active !== false);
  const inactiveAdmins = users.filter((u) => isAdminRole(u.role) && u.is_active === false);
  const activeCustomers = users.filter((u) => u.role === 'customer' && u.is_active !== false);
  const inactiveCustomers = users.filter((u) => u.role === 'customer' && u.is_active === false);

  const admins = showInactive ? users.filter((u) => isAdminRole(u.role)) : activeAdmins;
  const customers = showInactive ? users.filter((u) => u.role === 'customer') : activeCustomers;

  const totalInactive = inactiveAdmins.length + inactiveCustomers.length;

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = (userList: UserWithTenant[]) => {
    const newSelected = new Set(selectedIds);
    userList.forEach((u) => {
      if (u.id !== currentUserId) {
        newSelected.add(u.id);
      }
    });
    setSelectedIds(newSelected);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkActivate = () => {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await bulkToggleUserActive(ids, true);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('bulkActivated', { count: result.updatedCount }));
        setSelectedIds(new Set());
      }
    });
  };

  const handleBulkDeactivate = () => {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await bulkToggleUserActive(ids, false);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('bulkDeactivated', { count: result.updatedCount }));
        setSelectedIds(new Set());
      }
    });
  };

  const renderUserRow = (u: UserWithTenant, isAdmin: boolean) => {
    const isActive = u.is_active !== false;
    const lastLogin = u.last_login_at
      ? new Date(u.last_login_at).toLocaleString('sv-SE')
      : null;
    const isSelected = selectedIds.has(u.id);
    const isSelf = u.id === currentUserId;

    return (
      <div
        key={u.id}
        className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
          isSelected
            ? 'border-blue-400 bg-blue-500/10 ring-1 ring-blue-400'
            : isActive
              ? 'glass border-white/30'
              : 'bg-gray-100/50 border-gray-300/50 opacity-60'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isSelf}
            onChange={() => toggleSelect(u.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            aria-label={`${t('selectUser')} ${u.full_name}`}
          />

          <div
            className={`rounded-full p-2 ${
              isAdmin
                ? isActive
                  ? 'bg-blue-100'
                  : 'bg-gray-200'
                : isActive
                  ? 'bg-green-100'
                  : 'bg-gray-200'
            }`}
          >
            {isAdmin ? (
              <Shield
                className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
              />
            ) : (
              <User
                className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{u.full_name}</p>
              {isActive ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">{u.email}</p>
            {!isAdmin && u.tenants && (
              <Link
                href={`/app/admin/tenants/${u.tenants.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                <Building2 className="h-3 w-3 inline mr-1" />
                {u.tenants.name}
              </Link>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Clock className="h-3 w-3" />
              {lastLogin ? lastLogin : t('neverLoggedIn')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              u.role === 'super_admin'
                ? 'bg-purple-100 text-purple-800'
                : isAdmin
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
            }`}
          >
            {u.role === 'super_admin' ? t('roleSuperAdmin') : isAdmin ? t('roleAdmin') : t('roleCustomer')}
          </span>
          <UserActions
            userId={u.id}
            isActive={isActive}
            isSelf={isSelf}
            targetRole={u.role}
            callerRole={currentUserRole}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-2xl">
            <span className="text-sm font-medium">
              {t('selectedCount', { count: selectedIds.size })}
            </span>
            <div className="h-6 w-px bg-gray-700" />
            <button
              onClick={handleBulkActivate}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              {t('bulkActivate')}
            </button>
            <button
              onClick={handleBulkDeactivate}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PowerOff className="h-4 w-4" />
              )}
              {t('bulkDeactivate')}
            </button>
            <button
              onClick={deselectAll}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('deselectAll')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Show Inactive Toggle */}
      {totalInactive > 0 && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showInactive
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showInactive ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showInactive
              ? t('hideInactiveUsers')
              : t('showInactiveUsers', { count: totalInactive })}
          </button>
        </div>
      )}

      {/* Admins List */}
      <div className="rounded-2xl glass border border-white/30 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <h2 className="text-lg font-semibold text-gray-900">{t('adminUsers')}</h2>
          {admins.filter((u) => u.id !== currentUserId).length > 0 && (
            <button
              onClick={() => selectAll(admins)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {t('selectAll')}
            </button>
          )}
        </div>
        <div className="p-5">
          {admins.length > 0 ? (
            <div className="space-y-3">
              {admins.map((u) => renderUserRow(u, true))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noAdminUsers')}</p>
          )}
        </div>
      </div>

      {/* Customers List */}
      <div className="rounded-2xl glass border border-white/30 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <h2 className="text-lg font-semibold text-gray-900">{t('customerUsers')}</h2>
          {customers.length > 0 && (
            <button
              onClick={() => selectAll(customers)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {t('selectAll')}
            </button>
          )}
        </div>
        <div className="p-5">
          {customers.length > 0 ? (
            <div className="space-y-3">
              {customers.map((u) => renderUserRow(u, false))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noCustomerUsers')}</p>
          )}
        </div>
      </div>
    </>
  );
}

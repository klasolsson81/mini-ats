'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Clock, User, Building2, ArrowRight } from 'lucide-react';

interface Impersonation {
  id: string;
  started_at: string;
  admin_name: string;
  tenant_name: string;
}

interface AdminRecentActivityProps {
  recentImpersonations: Impersonation[];
}

export function AdminRecentActivity({ recentImpersonations }: AdminRecentActivityProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="rounded-2xl glass border border-white/30 shadow-sm p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('recentImpersonations')}
        </h3>
        <Link
          href="/app/admin/audit-logs"
          className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {recentImpersonations.length > 0 ? (
        <div className="space-y-3">
          {recentImpersonations.map((imp) => (
            <div
              key={imp.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{imp.admin_name}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{imp.tenant_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {new Date(imp.started_at).toLocaleString('sv-SE', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 py-4 text-center">
          {t('noRecentActivity')}
        </p>
      )}
    </div>
  );
}

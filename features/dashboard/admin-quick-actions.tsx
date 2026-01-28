'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Building2, Users, ScrollText, UserPlus } from 'lucide-react';

export function AdminQuickActions() {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const actions = [
    {
      label: t('viewTenants'),
      icon: Building2,
      href: '/app/admin',
      variant: 'blue' as const,
    },
    {
      label: t('viewUsers'),
      icon: Users,
      href: '/app/admin/users',
      variant: 'emerald' as const,
    },
    {
      label: t('viewAuditLogs'),
      icon: ScrollText,
      href: '/app/admin/audit-logs',
      variant: 'purple' as const,
    },
    {
      label: t('createTenant'),
      icon: UserPlus,
      href: '/app/admin#create',
      variant: 'cyan' as const,
    },
  ];

  const variantClasses = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200',
  };

  return (
    <div className="rounded-2xl glass border border-white/30 shadow-sm p-6 max-w-4xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('adminActions')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${variantClasses[action.variant]}`}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-sm font-medium text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban as KanbanIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { logout } from '@/lib/actions/auth';
import { Button } from './ui/button';
import { LanguageSwitcher } from './language-switcher';

interface SidebarProps {
  profile: Profile;
  isImpersonating?: boolean;
}

export function Sidebar({ profile, isImpersonating = false }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const isAdmin = profile.role === 'admin';

  const navigation = [
    {
      name: t('nav.dashboard'),
      href: '/app',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: t('nav.kanban'),
      href: '/app/kanban',
      icon: KanbanIcon,
    },
    {
      name: t('nav.jobs'),
      href: '/app/jobs',
      icon: Briefcase,
    },
    {
      name: t('nav.candidates'),
      href: '/app/candidates',
      icon: Users,
    },
  ];

  // Only show Admin link if user is admin AND not currently impersonating
  if (isAdmin && !isImpersonating) {
    navigation.push({
      name: t('nav.admin'),
      href: '/app/admin',
      icon: Settings,
    });
  }

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-900">Mini ATS</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-4">
        <div className="px-2">
          <p className="text-sm font-medium text-gray-900">
            {profile.full_name}
          </p>
          <p className="text-xs text-gray-500">{profile.email}</p>
          {isAdmin && !isImpersonating && (
            <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Admin
            </span>
          )}
        </div>

        <LanguageSwitcher />

        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('auth.logout')}
          </Button>
        </form>
      </div>
    </aside>
  );
}

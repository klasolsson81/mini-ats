'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban as KanbanIcon,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { logout } from '@/lib/actions/auth';
import { PillBadge } from './ui/pill-badge';
import { LanguageSwitcher } from './language-switcher';

interface SidebarProps {
  profile: Profile;
  isImpersonating?: boolean;
}

export function Sidebar({ profile, isImpersonating = false }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

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
    <aside className="flex w-20 flex-col glass border-r border-white/20 relative z-10">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center px-3 border-b border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shadow-lg glow-primary">
          <span className="text-white font-bold text-lg">MA</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center py-8 px-3 space-y-4">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const isNavigating = isPending && pendingHref === item.href;

          const handleNavigate = (e: React.MouseEvent) => {
            e.preventDefault();
            if (isActive || isPending) return;

            setPendingHref(item.href);
            startTransition(() => {
              router.push(item.href);
            });
          };

          return (
            <button
              key={item.name}
              onClick={handleNavigate}
              disabled={isPending}
              title={item.name}
              className={cn(
                'group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg glow-primary scale-110'
                  : 'bg-white/40 text-gray-600 hover:bg-white/60 hover:scale-105 hover:shadow-md',
                isPending && 'opacity-50 cursor-wait'
              )}
            >
              {isNavigating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <item.icon className="w-6 h-6" />
              )}

              {/* Tooltip on hover */}
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-4 space-y-4">
        {/* Profile avatar */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
            {profile.full_name?.charAt(0) || 'U'}
          </div>
          {isAdmin && !isImpersonating && (
            <PillBadge variant="primary" className="mt-2 text-[10px] px-2 py-0.5">
              Admin
            </PillBadge>
          )}
        </div>

        {/* Language switcher - compact */}
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>

        {/* Logout button */}
        <form action={logout} className="flex justify-center">
          <button
            type="submit"
            title={t('auth.logout')}
            className="w-12 h-12 rounded-xl bg-white/40 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200 flex items-center justify-center group"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
    </aside>
  );
}

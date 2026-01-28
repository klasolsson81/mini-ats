'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban as KanbanIcon,
  LogOut,
  Loader2,
  ChevronUp,
  Key,
  User,
  Search,
  Building2,
  ScrollText,
} from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { logout } from '@/lib/actions/auth';
import { setLocale } from '@/lib/actions/locale';
import { PillBadge } from './ui/pill-badge';

interface SidebarProps {
  profile: Profile;
  isImpersonating?: boolean;
}

function getLocaleFromCookie(): 'sv' | 'en' {
  const locale = document.cookie
    .split('; ')
    .find((row) => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];
  return (locale === 'en' || locale === 'sv') ? locale : 'sv';
}

function subscribeToLocale() {
  return () => {};
}

function getServerLocale(): 'sv' | 'en' {
  return 'sv';
}

export function Sidebar({ profile, isImpersonating = false }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLocale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleFromCookie,
    getServerLocale
  );

  const isAdmin = profile.role === 'admin';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsUserMenuOpen(false);
    const result = await logout();
    if (result?.success && result.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Separate navigation for Admin Portal vs Customer Portal
  const adminNavigation = [
    {
      name: t('nav.dashboard'),
      href: '/app',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: t('nav.tenants'),
      href: '/app/admin',
      icon: Building2,
      exact: true,
    },
    {
      name: t('nav.users'),
      href: '/app/admin/users',
      icon: Users,
    },
    {
      name: t('nav.auditLogs'),
      href: '/app/admin/audit-logs',
      icon: ScrollText,
    },
  ];

  const customerNavigation = [
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
    {
      name: t('nav.search'),
      href: '/app/search',
      icon: Search,
    },
  ];

  // Admin without impersonation sees Admin Portal
  // Admin with impersonation sees Customer Portal (acting as customer)
  // Customer always sees Customer Portal
  const navigation = (isAdmin && !isImpersonating) ? adminNavigation : customerNavigation;

  const handleLanguageChange = async (locale: 'sv' | 'en') => {
    await setLocale(locale);
    setIsUserMenuOpen(false);
    window.location.reload();
  };

  return (
    <aside className="flex w-28 flex-col glass border-r border-white/20 relative z-10 overflow-visible animate-flow">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center px-2 border-b border-white/10">
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 flex items-center justify-center shadow-lg ring-2 ring-white/30">
            <span className="text-white font-black text-base tracking-tight">ats</span>
          </div>
          <span className="text-[9px] font-semibold text-gray-600 mt-1 tracking-wider uppercase">mini</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center py-6 px-2 space-y-2">
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
              className={cn(
                'group relative flex flex-col items-center justify-center w-full py-3 px-2 rounded-xl transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg glow-primary'
                  : 'bg-white/30 text-gray-600 hover:bg-white/50 hover:text-gray-900',
                isPending && 'opacity-50 cursor-wait'
              )}
            >
              {isNavigating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span
                className={cn(
                  'text-[10px] font-medium mt-1 truncate max-w-full',
                  isActive ? 'text-white' : 'text-gray-600'
                )}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User section with dropdown menu */}
      <div className="border-t border-white/10 p-3 overflow-visible" ref={menuRef}>
        <div className="relative overflow-visible">
          {/* User button */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              'w-full flex flex-col items-center p-3 rounded-xl transition-all duration-200',
              isUserMenuOpen
                ? 'bg-gradient-to-br from-cyan-100/80 to-blue-100/80 shadow-md ring-2 ring-cyan-300/50'
                : 'bg-white/30 hover:bg-white/50'
            )}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            aria-label={t('nav.userMenu')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white/50">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-[10px] font-medium text-gray-700 mt-1.5 truncate max-w-full">
              {profile.full_name?.split(' ')[0] || t('nav.users')}
            </span>
            {isAdmin && !isImpersonating && (
              <PillBadge
                variant="primary"
                className="mt-1 text-[8px] px-1.5 py-0.5"
              >
                Admin
              </PillBadge>
            )}
            <ChevronUp
              className={cn(
                'w-3 h-3 text-gray-500 mt-1 transition-transform duration-200',
                isUserMenuOpen ? '' : 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown menu - fits within sidebar width */}
          {isUserMenuOpen && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[104px] z-50"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Gradient border wrapper */}
              <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 shadow-xl">
                <div className="bg-white rounded-[10px] overflow-hidden">
                  {/* Language switcher - flags only */}
                  <div className="p-2 flex justify-center gap-2 border-b border-cyan-100 bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
                  <button
                    onClick={() => handleLanguageChange('sv')}
                    className={cn(
                      'w-10 h-7 rounded overflow-hidden transition-all',
                      currentLocale === 'sv'
                        ? 'ring-2 ring-cyan-500 ring-offset-1'
                        : 'opacity-60 hover:opacity-100'
                    )}
                    title="Svenska"
                    aria-label="Byt till svenska"
                  >
                    <svg viewBox="0 0 16 10" className="w-full h-full">
                      <rect width="16" height="10" fill="#006AA7"/>
                      <rect x="5" width="2" height="10" fill="#FECC00"/>
                      <rect y="4" width="16" height="2" fill="#FECC00"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={cn(
                      'w-10 h-7 rounded overflow-hidden transition-all',
                      currentLocale === 'en'
                        ? 'ring-2 ring-cyan-500 ring-offset-1'
                        : 'opacity-60 hover:opacity-100'
                    )}
                    title="English"
                    aria-label="Switch to English"
                  >
                    <svg viewBox="0 0 60 30" className="w-full h-full">
                      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                      <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6"/>
                    </svg>
                  </button>
                </div>

                {/* Menu items - icons only */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push('/app/settings/password');
                    }}
                    className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors"
                    title={t('settings.changePassword')}
                    aria-label={t('settings.changePassword')}
                  >
                    <Key className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push('/app/settings');
                    }}
                    className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors"
                    title={t('settings.account')}
                    aria-label={t('settings.account')}
                  >
                    <User className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <div className="border-t border-cyan-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title={t('auth.logout')}
                    aria-label={t('auth.logout')}
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

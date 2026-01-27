'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Briefcase, Users, Clock, Building2, ChevronRight } from 'lucide-react';

interface RecentJob {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface RecentCandidate {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
}

interface RecentImpersonation {
  id: string;
  tenant_name: string;
  started_at: string;
  admin_name: string;
}

interface RecentActivityProps {
  recentJobs: RecentJob[];
  recentCandidates: RecentCandidate[];
  recentImpersonations?: RecentImpersonation[];
  isAdmin: boolean;
}

function formatRelativeTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return locale === 'sv' ? 'Just nu' : 'Just now';
  if (diffMins < 60)
    return locale === 'sv' ? `${diffMins} min sedan` : `${diffMins} min ago`;
  if (diffHours < 24)
    return locale === 'sv' ? `${diffHours}h sedan` : `${diffHours}h ago`;
  if (diffDays === 1) return locale === 'sv' ? 'Igår' : 'Yesterday';
  if (diffDays < 7)
    return locale === 'sv' ? `${diffDays} dagar sedan` : `${diffDays} days ago`;

  return date.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RecentActivity({
  recentJobs,
  recentCandidates,
  recentImpersonations = [],
  isAdmin,
}: RecentActivityProps) {
  const t = useTranslations('dashboard');
  const locale = useTranslations('common')('appName').includes('Mini') ? 'sv' : 'en';

  const hasActivity =
    recentJobs.length > 0 ||
    recentCandidates.length > 0 ||
    recentImpersonations.length > 0;

  if (!hasActivity) {
    return (
      <div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 p-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('recentActivity')}
          </h3>
        </div>
        <p className="text-sm text-gray-600">{t('noRecentActivity')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 max-w-6xl">
      {/* Recent Jobs Table */}
      <div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('recentJobs')}
              </h3>
            </div>
            <Link
              href="/app/jobs"
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] flex items-center gap-1"
            >
              {t('viewAll')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noJobs')}</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/30 bg-white/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                      {t('jobTitle')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">
                      {t('date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {recentJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-white/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {job.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-gray-600">
                          {formatDate(job.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Candidates Table */}
      <div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('recentCandidates')}
              </h3>
            </div>
            <Link
              href="/app/candidates"
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] flex items-center gap-1"
            >
              {t('viewAll')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentCandidates.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noCandidates')}</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/30 bg-white/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                      {t('candidateName')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">
                      {t('date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {recentCandidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className="hover:bg-white/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {candidate.full_name}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-gray-600">
                          {formatDate(candidate.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Impersonations (Admin only) - Full width if present */}
      {isAdmin && recentImpersonations.length > 0 && (
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/30 backdrop-blur-md border border-amber-300/30 p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('recentImpersonations')}
                  </h3>
                </div>
                <Link
                  href="/app/admin/audit-logs"
                  className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] flex items-center gap-1"
                >
                  {t('viewAll')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-xl border border-amber-200/30 bg-amber-50/20 backdrop-blur-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-200/30 bg-amber-100/20">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                        Admin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                        {t('tenant')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">
                        {t('date')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/30">
                    {recentImpersonations.map((imp) => (
                      <tr
                        key={imp.id}
                        className="hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {imp.admin_name}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">
                            {imp.tenant_name}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-gray-600">
                            {formatRelativeTime(imp.started_at, locale)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

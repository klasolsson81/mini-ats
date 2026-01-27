'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Clock, Building2 } from 'lucide-react';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('recentActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <p className="text-sm text-gray-600">{t('noRecentActivity')}</p>
        ) : (
          <div className="space-y-4">
            {/* Recent Jobs */}
            {recentJobs.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  {t('recentJobs')}
                </h4>
                <div className="space-y-2">
                  {recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      href="/app/jobs"
                      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
                    >
                      <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(job.created_at, locale)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Candidates */}
            {recentCandidates.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  {t('recentCandidates')}
                </h4>
                <div className="space-y-2">
                  {recentCandidates.map((candidate) => (
                    <Link
                      key={candidate.id}
                      href="/app/candidates"
                      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
                    >
                      <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {candidate.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(candidate.created_at, locale)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Impersonations (Admin only) */}
            {isAdmin && recentImpersonations.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  {t('recentImpersonations')}
                </h4>
                <div className="space-y-2">
                  {recentImpersonations.map((imp) => (
                    <Link
                      key={imp.id}
                      href="/app/admin/audit-logs"
                      className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 transition-colors hover:bg-yellow-100"
                    >
                      <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {imp.admin_name} → {imp.tenant_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatRelativeTime(imp.started_at, locale)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

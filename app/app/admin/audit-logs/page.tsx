import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, User, Building2 } from 'lucide-react';

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return {
    title: t('auditLogs'),
  };
}

function calculateDuration(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();

  const diffMs = end.getTime() - start.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  const hours = diffHour;
  const minutes = diffMin % 60;
  const seconds = diffSec % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (hours === 0 && minutes === 0 && seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '< 1s';
}

export default async function AuditLogsPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only admins can access
  if (profile?.role !== 'admin') {
    redirect('/app');
  }

  // Fetch audit logs with admin and tenant names
  const { data: logs } = await supabase
    .from('impersonation_logs')
    .select(`
      *,
      admin:profiles!impersonation_logs_admin_id_fkey(full_name, email),
      tenant:tenants!impersonation_logs_tenant_id_fkey(name)
    `)
    .order('started_at', { ascending: false })
    .limit(100);

  const activeSessions = logs?.filter((log) => !log.ended_at).length || 0;
  const totalSessions = logs?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('auditLogs')}
        </h1>
        <p className="mt-2 text-gray-700">{t('auditLogsSubtitle')}</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('totalSessions')}
            </CardTitle>
            <Shield className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('activeSessions')}
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('impersonationHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('adminUser')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('tenant')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('startedAt')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('endedAt')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('duration')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('ipAddress')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log: any) => {
                    const isActive = !log.ended_at;
                    return (
                      <tr
                        key={log.id}
                        className={isActive ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {log.admin?.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {log.admin?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {log.tenant?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(log.started_at).toLocaleString('sv-SE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {isActive ? (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                              {t('active')}
                            </span>
                          ) : (
                            <span className="text-gray-700">
                              {new Date(log.ended_at).toLocaleString('sv-SE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {calculateDuration(log.started_at, log.ended_at)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                          {log.ip_address || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noAuditLogs')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

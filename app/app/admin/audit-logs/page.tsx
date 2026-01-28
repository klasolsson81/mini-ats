import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield, Clock, User, Building2, Activity } from 'lucide-react';
import { KpiCard } from '@/components/ui/kpi-card';
import {
  getEventTypeLabel,
  getEventTypeColor,
  type AuditEventType,
} from '@/lib/utils/audit-log';
import { isAdminRole } from '@/lib/utils/roles';

interface ImpersonationLog {
  id: string;
  started_at: string;
  ended_at: string | null;
  ip_address: string | null;
  admin: { full_name: string; email: string } | null;
  tenant: { name: string } | null;
}

interface AuditLog {
  id: string;
  event_type: AuditEventType;
  target_type: string | null;
  target_id: string | null;
  target_name: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor: { full_name: string; email: string } | null;
}

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return {
    title: `${t('auditLogs')} - Mini ATS`,
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
  if (!isAdminRole(profile?.role)) {
    redirect('/app');
  }

  // Fetch impersonation logs with admin and tenant names
  const { data: logs } = await supabase
    .from('impersonation_logs')
    .select(`
      *,
      admin:profiles!impersonation_logs_admin_id_fkey(full_name, email),
      tenant:tenants!impersonation_logs_tenant_id_fkey(name)
    `)
    .order('started_at', { ascending: false })
    .limit(100);

  // Fetch general audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles!audit_logs_actor_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const activeSessions = logs?.filter((log) => !log.ended_at).length || 0;
  const totalSessions = logs?.length || 0;
  const totalEvents = auditLogs?.length || 0;

  return (
    <div className="space-y-6 sm:space-y-8 overflow-hidden">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
          {t('auditLogs')}
        </h1>
        <p className="text-gray-600 text-xs sm:text-lg">{t('auditLogsSubtitle')}</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-2 sm:gap-3 grid-cols-3 max-w-4xl">
        <KpiCard
          title={t('totalSessions')}
          value={totalSessions}
          icon={Shield}
          variant="blue"
        />
        <KpiCard
          title={t('activeSessions')}
          value={activeSessions}
          icon={Clock}
          variant="emerald"
        />
        <KpiCard
          title={t('totalEvents')}
          value={totalEvents}
          icon={Activity}
          variant="purple"
        />
      </div>

      {/* Impersonation History Table */}
      <div className="rounded-2xl glass border border-white/30 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-white/20">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{t('impersonationHistory')}</h2>
        </div>
        <div className="p-3 sm:p-5">
          {logs && logs.length > 0 ? (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="border-b border-gray-200/50 bg-white/30">
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
                <tbody className="divide-y divide-gray-200/50">
                  {(logs as ImpersonationLog[]).map((log) => {
                    const isActive = !log.ended_at;
                    return (
                      <tr
                        key={log.id}
                        className={isActive ? 'bg-yellow-100/50' : 'hover:bg-white/30'}
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
                            timeZone: 'Europe/Stockholm',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {isActive ? (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                              {t('active')}
                            </span>
                          ) : (
                            <span className="text-gray-700">
                              {new Date(log.ended_at!).toLocaleString('sv-SE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Europe/Stockholm',
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
        </div>
      </div>

      {/* General Audit Logs Table */}
      <div className="rounded-2xl glass border border-white/30 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-white/20">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{t('generalAuditLogs')}</h2>
        </div>
        <div className="p-3 sm:p-5">
          {auditLogs && auditLogs.length > 0 ? (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="border-b border-gray-200/50 bg-white/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('eventType')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('actor')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('target')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('timestamp')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {t('ipAddress')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {(auditLogs as AuditLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-white/30">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEventTypeColor(log.event_type)}`}
                        >
                          {getEventTypeLabel(log.event_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.actor?.full_name || '-'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.actor?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {log.target_name || '-'}
                        </p>
                        {typeof log.metadata === 'object' && log.metadata !== null && 'email' in log.metadata && (
                          <p className="text-xs text-gray-500">
                            {String((log.metadata as Record<string, unknown>).email)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(log.created_at).toLocaleString('sv-SE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Europe/Stockholm',
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {log.ip_address || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{t('noGeneralAuditLogs')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

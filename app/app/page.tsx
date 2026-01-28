import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Briefcase, Users, TrendingUp, Building2, ScrollText } from 'lucide-react';
import { getEffectiveTenantId } from '@/lib/utils/tenant';
import { QuickActions } from '@/features/dashboard/quick-actions';
import { RecentActivity } from '@/features/dashboard/recent-activity';
import { PipelineStats } from '@/features/dashboard/pipeline-stats';
import { AttentionNeeded } from '@/features/dashboard/attention-needed';
import { ConversionMetrics } from '@/features/dashboard/conversion-metrics';
import { KpiCard } from '@/components/ui/kpi-card';
import { AdminQuickActions } from '@/features/dashboard/admin-quick-actions';
import { AdminRecentActivity } from '@/features/dashboard/admin-recent-activity';

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

interface ImpersonationLogRaw {
  id: string;
  started_at: string;
  admin: { full_name: string } | null;
  tenant: { name: string } | null;
}

interface PipelineItem {
  stage: string;
}

interface HiredItem {
  created_at: string;
}

interface StaleItem {
  id: string;
  stage: string;
  created_at: string;
  candidates: { full_name: string } | null;
  jobs: { title: string } | null;
}

export async function generateMetadata() {
  const t = await getTranslations('nav');
  return {
    title: `${t('dashboard')} - Mini ATS`,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations('dashboard');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single();

  const { tenantId, isAdmin } = await getEffectiveTenantId();

  let jobsCount = 0;
  let openJobsCount = 0;
  let candidatesCount = 0;
  let activeCount = 0;
  let recentJobs: RecentJob[] = [];
  let recentCandidates: RecentCandidate[] = [];
  let recentImpersonations: { id: string; started_at: string; admin_name: string; tenant_name: string }[] = [];
  let pipelineStats: { stage: string; count: number }[] = [];
  let stageCountsRecord: Record<string, number> = {};
  let avgDaysToHire: number | null = null;
  let staleCandidates: {
    id: string;
    candidate_name: string;
    job_title: string;
    stage: string;
    days_in_stage: number;
  }[] = [];

  // Admin platform stats
  let tenantsCount = 0;
  let usersCount = 0;
  let adminUsersCount = 0;
  let auditEventsCount = 0;

  // Admin-only platform stats (when not impersonating)
  if (isAdmin && !tenantId) {
    const { count: tenants } = await supabase
      .from('tenants')
      .select('id', { count: 'exact' });
    tenantsCount = tenants || 0;

    const { count: users } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });
    usersCount = users || 0;

    const { count: admins } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin');
    adminUsersCount = admins || 0;

    const { count: events } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact' });
    auditEventsCount = events || 0;

    // Fetch total jobs across all tenants
    const { count: allJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' });
    jobsCount = allJobs || 0;

    // Fetch recent impersonations for admin
    const { data: impersonationsData } = await supabase
      .from('impersonation_logs')
      .select(
        `
        id,
        started_at,
        admin:profiles!impersonation_logs_admin_id_fkey(full_name),
        tenant:tenants!impersonation_logs_tenant_id_fkey(name)
      `
      )
      .order('started_at', { ascending: false })
      .limit(5);

    recentImpersonations =
      (impersonationsData as ImpersonationLogRaw[] | null)?.map((imp) => ({
        id: imp.id,
        started_at: imp.started_at,
        admin_name: imp.admin?.full_name || 'Unknown',
        tenant_name: imp.tenant?.name || 'Unknown',
      })) || [];
  }

  // Customer/tenant-specific stats (only when viewing as tenant)
  if (tenantId) {
    const { count: jobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId);
    jobsCount = jobs || 0;

    const { count: openJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' })
      .eq('status', 'open')
      .eq('tenant_id', tenantId);
    openJobsCount = openJobs || 0;

    const { count: candidates } = await supabase
      .from('candidates')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId);
    candidatesCount = candidates || 0;

    const { count: active } = await supabase
      .from('job_candidates')
      .select('id', { count: 'exact' })
      .not('stage', 'in', '(hired,rejected)')
      .eq('tenant_id', tenantId);
    activeCount = active || 0;

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('id, title, status, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5);
    recentJobs = jobsData || [];

    const { data: candidatesData } = await supabase
      .from('candidates')
      .select('id, full_name, email, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5);
    recentCandidates = candidatesData || [];

    const { data: pipelineData } = await supabase
      .from('job_candidates')
      .select('stage')
      .eq('tenant_id', tenantId);

    const stageCounts: Record<string, number> = {};
    (pipelineData as PipelineItem[] | null)?.forEach((item) => {
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
    });
    stageCountsRecord = stageCounts;
    pipelineStats = Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count,
    }));

    const { data: hiredData } = await supabase
      .from('job_candidates')
      .select('created_at')
      .eq('stage', 'hired')
      .eq('tenant_id', tenantId);

    if (hiredData && hiredData.length > 0) {
      const now = new Date();
      const totalDays = (hiredData as HiredItem[]).reduce((sum: number, item) => {
        const createdAt = new Date(item.created_at);
        const days = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgDaysToHire = Math.round(totalDays / hiredData.length);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: staleData } = await supabase
      .from('job_candidates')
      .select(`id, stage, created_at, candidates(full_name), jobs(title)`)
      .eq('tenant_id', tenantId)
      .not('stage', 'in', '(hired,rejected)')
      .lt('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })
      .limit(5);

    staleCandidates =
      (staleData as StaleItem[] | null)?.map((item) => {
        const createdAt = new Date(item.created_at);
        const now = new Date();
        const daysInStage = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: item.id,
          candidate_name: item.candidates?.full_name || 'Unknown',
          job_title: item.jobs?.title || 'Unknown',
          stage: item.stage,
          days_in_stage: daysInStage,
        };
      }) || [];
  }

  // Determine if showing admin portal or customer portal
  const showAdminPortal = isAdmin && !tenantId;

  // Admin Portal - completely different dashboard
  if (showAdminPortal) {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            {t('adminTitle')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('welcome', { name: profile?.full_name })}
          </p>
        </div>

        {/* Platform KPI Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl">
          <KpiCard
            title={t('totalTenants')}
            value={tenantsCount}
            icon={Building2}
            variant="blue"
            href="/app/admin"
          />
          <KpiCard
            title={t('totalUsers')}
            value={usersCount}
            subtitle={t('adminCount', { count: adminUsersCount })}
            icon={Users}
            variant="emerald"
            href="/app/admin/users"
          />
          <KpiCard
            title={t('totalJobsAll')}
            value={jobsCount}
            icon={Briefcase}
            variant="cyan"
          />
          <KpiCard
            title={t('auditEvents')}
            value={auditEventsCount}
            icon={ScrollText}
            variant="purple"
            href="/app/admin/audit-logs"
          />
        </div>

        {/* Admin Quick Actions */}
        <AdminQuickActions />

        {/* Admin Recent Activity */}
        <AdminRecentActivity recentImpersonations={recentImpersonations} />
      </div>
    );
  }

  // Customer Portal - regular dashboard
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('welcome', { name: profile?.full_name })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 max-w-5xl">
        <KpiCard
          title={t('totalJobs')}
          value={jobsCount}
          subtitle={t('openJobs', { count: openJobsCount })}
          icon={Briefcase}
          variant="blue"
          href="/app/jobs"
        />
        <KpiCard
          title={t('totalCandidates')}
          value={candidatesCount}
          icon={Users}
          variant="emerald"
          href="/app/candidates"
        />
        <KpiCard
          title={t('activeInPipeline')}
          value={activeCount}
          icon={TrendingUp}
          variant="cyan"
          href="/app/kanban"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Attention Needed */}
      <AttentionNeeded staleCandidates={staleCandidates} />

      {/* Pipeline Stats */}
      <PipelineStats stats={pipelineStats} />

      {/* Conversion Metrics */}
      <ConversionMetrics
        stageCounts={stageCountsRecord}
        avgDaysToHire={avgDaysToHire}
      />

      {/* Recent Activity */}
      <RecentActivity
        recentJobs={recentJobs}
        recentCandidates={recentCandidates}
        recentImpersonations={[]}
        isAdmin={false}
      />
    </div>
  );
}

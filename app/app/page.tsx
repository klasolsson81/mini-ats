import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Users, TrendingUp, Settings } from 'lucide-react';
import { getEffectiveTenantId } from '@/lib/utils/tenant';
import { QuickActions } from '@/features/dashboard/quick-actions';
import { RecentActivity } from '@/features/dashboard/recent-activity';
import { PipelineStats } from '@/features/dashboard/pipeline-stats';
import { AttentionNeeded } from '@/features/dashboard/attention-needed';
import { ConversionMetrics } from '@/features/dashboard/conversion-metrics';
import { KpiCard } from '@/components/ui/kpi-card';

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

  if (tenantId || isAdmin) {
    // Fetch total jobs count
    const jobsQuery = supabase.from('jobs').select('id', { count: 'exact' });
    if (tenantId) {
      jobsQuery.eq('tenant_id', tenantId);
    }
    const { count: jobs } = await jobsQuery;
    jobsCount = jobs || 0;

    // Fetch open jobs count
    const openJobsQuery = supabase
      .from('jobs')
      .select('id', { count: 'exact' })
      .eq('status', 'open');
    if (tenantId) {
      openJobsQuery.eq('tenant_id', tenantId);
    }
    const { count: openJobs } = await openJobsQuery;
    openJobsCount = openJobs || 0;

    const candidatesQuery = supabase
      .from('candidates')
      .select('id', { count: 'exact' });
    if (tenantId) {
      candidatesQuery.eq('tenant_id', tenantId);
    }
    const { count: candidates } = await candidatesQuery;
    candidatesCount = candidates || 0;

    const activeQuery = supabase
      .from('job_candidates')
      .select('id', { count: 'exact' })
      .not('stage', 'in', '(hired,rejected)');
    if (tenantId) {
      activeQuery.eq('tenant_id', tenantId);
    }
    const { count: active } = await activeQuery;
    activeCount = active || 0;

    // Fetch recent jobs (last 5)
    const jobsDataQuery = supabase
      .from('jobs')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (tenantId) {
      jobsDataQuery.eq('tenant_id', tenantId);
    }
    const { data: jobsData } = await jobsDataQuery;
    recentJobs = jobsData || [];

    // Fetch recent candidates (last 5)
    const candidatesDataQuery = supabase
      .from('candidates')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (tenantId) {
      candidatesDataQuery.eq('tenant_id', tenantId);
    }
    const { data: candidatesData } = await candidatesDataQuery;
    recentCandidates = candidatesData || [];

    // Fetch recent impersonations (admin only, last 3)
    if (isAdmin && !tenantId) {
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
        .limit(3);

      recentImpersonations =
        (impersonationsData as ImpersonationLogRaw[] | null)?.map((imp) => ({
          id: imp.id,
          started_at: imp.started_at,
          admin_name: imp.admin?.full_name || 'Unknown',
          tenant_name: imp.tenant?.name || 'Unknown',
        })) || [];
    }

    // Fetch pipeline stats (group by stage)
    const pipelineQuery = supabase
      .from('job_candidates')
      .select('stage');
    if (tenantId) {
      pipelineQuery.eq('tenant_id', tenantId);
    }
    const { data: pipelineData } = await pipelineQuery;

    // Group by stage and count
    const stageCounts: Record<string, number> = {};
    (pipelineData as PipelineItem[] | null)?.forEach((item) => {
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
    });
    stageCountsRecord = stageCounts;

    // Convert to array for component
    pipelineStats = Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count,
    }));

    // Calculate average days to hire
    const hiredQuery = supabase
      .from('job_candidates')
      .select('created_at')
      .eq('stage', 'hired');

    if (tenantId) {
      hiredQuery.eq('tenant_id', tenantId);
    }

    const { data: hiredData } = await hiredQuery;

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

    // Fetch stale candidates (in active stages for >7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleQuery = supabase
      .from('job_candidates')
      .select(
        `
        id,
        stage,
        created_at,
        candidates(full_name),
        jobs(title)
      `
      )
      .not('stage', 'in', '(hired,rejected)')
      .lt('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })
      .limit(5);

    if (tenantId) {
      staleQuery.eq('tenant_id', tenantId);
    }

    const { data: staleData } = await staleQuery;

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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
          {isAdmin && !tenantId ? t('adminTitle') : t('title')}
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

      {/* Quick Actions & Admin Panel */}
      <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
        <QuickActions />

        {isAdmin && !tenantId && (
          <div className="rounded-2xl glass-cyan border border-cyan-300/50 shadow-sm">
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('adminPanel')}
                </h3>
              </div>
              <Link
                href="/app/admin"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                {t('manageUsersAndTenants')}
              </Link>
            </div>
          </div>
        )}
      </div>

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
        recentImpersonations={recentImpersonations}
        isAdmin={isAdmin}
      />
    </div>
  );
}

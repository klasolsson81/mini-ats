import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Users, TrendingUp, Settings } from 'lucide-react';
import { getEffectiveTenantId } from '@/lib/utils/tenant';
import { QuickActions } from '@/features/dashboard/quick-actions';
import { RecentActivity } from '@/features/dashboard/recent-activity';
import { PipelineStats } from '@/features/dashboard/pipeline-stats';
import { KpiCard } from '@/components/ui/kpi-card';
import { GlassCard } from '@/components/ui/glass-card';

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
  let candidatesCount = 0;
  let activeCount = 0;
  let recentJobs: any[] = [];
  let recentCandidates: any[] = [];
  let recentImpersonations: any[] = [];
  let pipelineStats: { stage: string; count: number }[] = [];

  if (tenantId || isAdmin) {
    // Fetch counts
    const jobsQuery = supabase.from('jobs').select('id', { count: 'exact' });
    if (tenantId) {
      jobsQuery.eq('tenant_id', tenantId);
    }
    const { count: jobs } = await jobsQuery;
    jobsCount = jobs || 0;

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
        impersonationsData?.map((imp: any) => ({
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
    pipelineData?.forEach((item: any) => {
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
    });

    // Convert to array for component
    pipelineStats = Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count,
    }));
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title={t('totalJobs')}
          value={jobsCount}
          icon={Briefcase}
          variant="blue"
        />
        <KpiCard
          title={t('totalCandidates')}
          value={candidatesCount}
          icon={Users}
          variant="purple"
        />
        <KpiCard
          title={t('activeInPipeline')}
          value={activeCount}
          icon={TrendingUp}
          variant="cyan"
        />
      </div>

      {/* Quick Actions & Admin Panel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <QuickActions />

        {isAdmin && !tenantId && (
          <GlassCard>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-md">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('adminPanel')}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {t('manageUsersAndTenants')}
              </p>
              <Link
                href="/app/admin"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Pipeline Stats */}
      <PipelineStats stats={pipelineStats} />

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

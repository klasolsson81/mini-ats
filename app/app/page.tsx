import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, TrendingUp } from 'lucide-react';
import { getEffectiveTenantId } from '@/lib/utils/tenant';
import { QuickActions } from '@/features/dashboard/quick-actions';
import { RecentActivity } from '@/features/dashboard/recent-activity';
import { PipelineStats } from '@/features/dashboard/pipeline-stats';

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {isAdmin && !tenantId ? t('adminTitle') : t('title')}
        </h1>
        <p className="mt-2 text-gray-700">
          {t('welcome', { name: profile?.full_name })}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('totalJobs')}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('totalCandidates')}
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {t('activeInPipeline')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />

        {isAdmin && !tenantId && (
          <Card>
            <CardHeader>
              <CardTitle>{t('adminPanel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/app/admin">
                <Button variant="outline" className="w-full justify-start">
                  {t('manageUsersAndTenants')}
                </Button>
              </Link>
            </CardContent>
          </Card>
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

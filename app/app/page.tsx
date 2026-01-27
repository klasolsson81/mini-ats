import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, TrendingUp } from 'lucide-react';
import { getEffectiveTenantId } from '@/lib/utils/tenant';

export async function generateMetadata() {
  const t = await getTranslations('nav');
  return {
    title: t('dashboard'),
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

  if (tenantId || isAdmin) {
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
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {isAdmin ? t('adminTitle') : t('title')}
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
        <Card>
          <CardHeader>
            <CardTitle>{t('quickStart')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/app/kanban">
              <Button variant="outline" className="w-full justify-start">
                {t('viewKanban')}
              </Button>
            </Link>
            <Link href="/app/jobs">
              <Button variant="outline" className="w-full justify-start">
                {t('manageJobs')}
              </Button>
            </Link>
            <Link href="/app/candidates">
              <Button variant="outline" className="w-full justify-start">
                {t('manageCandidates')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isAdmin && (
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
    </div>
  );
}

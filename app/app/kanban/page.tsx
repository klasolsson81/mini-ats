import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KanbanBoard } from '@/features/kanban/kanban-board';
import { getEffectiveTenantId } from '@/lib/utils/tenant';

export async function generateMetadata() {
  const t = await getTranslations('kanban');
  return {
    title: `${t('title')} - Mini ATS`,
  };
}

export default async function KanbanPage() {
  const supabase = await createClient();
  const t = await getTranslations('kanban');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { tenantId, isAdmin } = await getEffectiveTenantId();

  // Fetch jobs for filter
  const jobsQuery = supabase.from('jobs').select('id, title').eq('status', 'open');
  if (tenantId) {
    jobsQuery.eq('tenant_id', tenantId);
  } else if (!isAdmin) {
    jobsQuery.eq('tenant_id', 'none');
  }
  const { data: jobs } = await jobsQuery;

  // Fetch all job_candidates with candidate and job info
  const jcQuery = supabase
    .from('job_candidates')
    .select(`
      *,
      candidates (*),
      jobs (*)
    `)
    .order('created_at', { ascending: false });

  if (tenantId) {
    jcQuery.eq('tenant_id', tenantId);
  } else if (!isAdmin) {
    jcQuery.eq('tenant_id', 'none');
  }

  const { data: jobCandidates } = await jcQuery;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-700">
          {t('subtitle')}
        </p>
      </div>

      <KanbanBoard
        jobCandidates={jobCandidates || []}
        jobs={jobs || []}
      />
    </div>
  );
}

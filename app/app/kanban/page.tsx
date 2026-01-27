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

  // Fetch jobs for filter (include all jobs, not just open)
  const jobsQuery = supabase.from('jobs').select('id, title').order('title');
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
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-gray-600 text-lg">
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

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KanbanBoard } from '@/features/kanban/kanban-board';

export async function generateMetadata() {
  const t = await getTranslations('kanban');
  return {
    title: t('title'),
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  // Fetch jobs for filter
  const jobsQuery = supabase.from('jobs').select('id, title').eq('status', 'open');
  if (profile?.role !== 'admin' && profile?.tenant_id) {
    jobsQuery.eq('tenant_id', profile.tenant_id);
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

  if (profile?.role !== 'admin' && profile?.tenant_id) {
    jcQuery.eq('tenant_id', profile.tenant_id);
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

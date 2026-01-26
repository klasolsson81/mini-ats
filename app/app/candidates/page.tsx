import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CandidatesList } from '@/features/candidates/candidates-list';
import { CreateCandidateButton } from '@/features/candidates/create-candidate-button';

export async function generateMetadata() {
  const t = await getTranslations('candidates');
  return {
    title: t('title'),
  };
}

export default async function CandidatesPage() {
  const supabase = await createClient();
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

  const query = supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (profile?.role !== 'admin' && profile?.tenant_id) {
    query.eq('tenant_id', profile.tenant_id);
  }

  const { data: candidates } = await query;

  // Get jobs for attach dialog
  const jobsQuery = supabase.from('jobs').select('id, title').eq('status', 'open');
  if (profile?.role !== 'admin' && profile?.tenant_id) {
    jobsQuery.eq('tenant_id', profile.tenant_id);
  }
  const { data: jobs } = await jobsQuery;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Kandidater
          </h1>
          <p className="mt-2 text-gray-600">
            Hantera kandidater och deras profiler
          </p>
        </div>
        <CreateCandidateButton />
      </div>

      <CandidatesList candidates={candidates || []} jobs={jobs || []} />
    </div>
  );
}

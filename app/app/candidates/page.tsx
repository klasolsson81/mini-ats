import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CandidatesList } from '@/features/candidates/candidates-list';
import { CreateCandidateButton } from '@/features/candidates/create-candidate-button';
import { getEffectiveTenantId } from '@/lib/utils/tenant';

export async function generateMetadata() {
  const t = await getTranslations('candidates');
  return {
    title: t('title'),
  };
}

export default async function CandidatesPage() {
  const supabase = await createClient();
  const t = await getTranslations('candidates');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { tenantId, isAdmin } = await getEffectiveTenantId();

  const query = supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (tenantId) {
    query.eq('tenant_id', tenantId);
  } else if (!isAdmin) {
    query.eq('tenant_id', 'none');
  }

  const { data: candidates } = await query;

  // Get jobs for attach dialog
  const jobsQuery = supabase.from('jobs').select('id, title').eq('status', 'open');
  if (tenantId) {
    jobsQuery.eq('tenant_id', tenantId);
  } else if (!isAdmin) {
    jobsQuery.eq('tenant_id', 'none');
  }
  const { data: jobs } = await jobsQuery;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('title')}
          </h1>
          <p className="mt-2 text-gray-700">
            {t('subtitle')}
          </p>
        </div>
        <CreateCandidateButton />
      </div>

      <CandidatesList candidates={candidates || []} jobs={jobs || []} />
    </div>
  );
}

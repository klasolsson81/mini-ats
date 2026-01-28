import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getImpersonationStatus } from '@/lib/actions/impersonate';
import { CandidateSearch } from '@/features/search/candidate-search';

export async function generateMetadata() {
  const t = await getTranslations('search');
  return {
    title: `${t('title')} - Mini ATS`,
  };
}

export default async function SearchPage() {
  const supabase = await createClient();
  const t = await getTranslations('search');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Get effective tenant ID (handles impersonation)
  const impersonation = await getImpersonationStatus();
  const tenantId = impersonation.isImpersonating
    ? impersonation.tenantId
    : profile.tenant_id;

  // Fetch all candidates for this tenant
  const { data: candidates } = await supabase
    .from('candidates')
    .select(`
      *,
      job_candidates (
        id,
        stage,
        jobs (
          id,
          title
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  // Fetch jobs for filter
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('tenant_id', tenantId)
    .eq('status', 'open')
    .order('title');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-700">{t('subtitle')}</p>
      </div>

      {/* Search Component */}
      <CandidateSearch
        candidates={candidates || []}
        jobs={jobs || []}
      />
    </div>
  );
}

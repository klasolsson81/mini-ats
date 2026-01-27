import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JobsList } from '@/features/jobs/jobs-list';
import { CreateJobButton } from '@/features/jobs/create-job-button';
import { getEffectiveTenantId } from '@/lib/utils/tenant';

export async function generateMetadata() {
  const t = await getTranslations('jobs');
  return {
    title: `${t('title')} - Mini ATS`,
  };
}

export default async function JobsPage() {
  const supabase = await createClient();
  const t = await getTranslations('jobs');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { tenantId, isAdmin } = await getEffectiveTenantId();

  const query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

  if (tenantId) {
    query.eq('tenant_id', tenantId);
  } else if (!isAdmin) {
    query.eq('tenant_id', 'none');
  }

  const { data: jobs } = await query;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header with title and button side by side */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('subtitle')}
          </p>
        </div>
        <CreateJobButton />
      </div>

      <JobsList jobs={jobs || []} />
    </div>
  );
}

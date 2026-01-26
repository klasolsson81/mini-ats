import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JobsList } from '@/features/jobs/jobs-list';
import { CreateJobButton } from '@/features/jobs/create-job-button';

export async function generateMetadata() {
  const t = await getTranslations('jobs');
  return {
    title: t('title'),
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  const query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

  if (profile?.role !== 'admin' && profile?.tenant_id) {
    query.eq('tenant_id', profile.tenant_id);
  }

  const { data: jobs } = await query;

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
        <CreateJobButton />
      </div>

      <JobsList jobs={jobs || []} />
    </div>
  );
}

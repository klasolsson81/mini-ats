'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { jobSchema, type JobFormData } from '@/lib/validations/job';
import { getEffectiveTenantId } from '@/lib/utils/tenant';

export async function createJob(data: JobFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const validated = jobSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { tenantId } = await getEffectiveTenantId();

  if (!tenantId) {
    return { error: 'Tenant required' };
  }

  const { error } = await supabase.from('jobs').insert({
    ...validated.data,
    tenant_id: tenantId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/jobs');
  return { success: true };
}

export async function updateJob(id: string, data: JobFormData) {
  const supabase = await createClient();

  const validated = jobSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from('jobs')
    .update(validated.data)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/jobs');
  return { success: true };
}

export async function deleteJob(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('jobs').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/jobs');
  return { success: true };
}

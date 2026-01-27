'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  candidateSchema,
  type CandidateFormData,
} from '@/lib/validations/candidate';
import { Stage } from '../constants/stages';
import { getEffectiveTenantId } from '@/lib/utils/tenant';

export async function createCandidate(data: CandidateFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const validated = candidateSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { tenantId } = await getEffectiveTenantId();

  if (!tenantId) {
    return { error: 'Tenant required' };
  }

  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      ...validated.data,
      tenant_id: tenantId,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/candidates');
  return { success: true, candidate };
}

export async function updateCandidate(id: string, data: CandidateFormData) {
  const supabase = await createClient();

  const validated = candidateSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from('candidates')
    .update(validated.data)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/candidates');
  revalidatePath('/app/kanban');
  return { success: true };
}

export async function deleteCandidate(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('candidates').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/candidates');
  revalidatePath('/app/kanban');
  return { success: true };
}

export async function attachCandidateToJob(
  candidateId: string,
  jobId: string,
  stage: Stage
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { tenantId } = await getEffectiveTenantId();

  if (!tenantId) {
    return { error: 'Tenant required' };
  }

  const { error } = await supabase.from('job_candidates').insert({
    candidate_id: candidateId,
    job_id: jobId,
    stage,
    tenant_id: tenantId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/kanban');
  return { success: true };
}

export async function updateCandidateStage(
  jobCandidateId: string,
  stage: Stage
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('job_candidates')
    .update({ stage })
    .eq('id', jobCandidateId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/kanban');
  return { success: true };
}

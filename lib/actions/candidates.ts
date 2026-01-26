'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  candidateSchema,
  type CandidateFormData,
} from '@/lib/validations/candidate';
import { Stage } from '../constants/stages';

export async function createCandidate(data: CandidateFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  const validated = candidateSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  if (!profile.tenant_id) {
    return { error: 'Tenant required' };
  }

  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      ...validated.data,
      tenant_id: profile.tenant_id,
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
    return { error: validated.error.errors[0].message };
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    return { error: 'Tenant required' };
  }

  const { error } = await supabase.from('job_candidates').insert({
    candidate_id: candidateId,
    job_id: jobId,
    stage,
    tenant_id: profile.tenant_id,
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

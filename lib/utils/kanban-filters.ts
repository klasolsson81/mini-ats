import { STAGE_ORDER, type Stage } from '@/lib/constants/stages';

/**
 * Types for Kanban filtering
 */
export interface KanbanCandidate {
  id: string;
  full_name: string;
  email: string | null;
  linkedin_url: string | null;
}

export interface KanbanJob {
  id: string;
  title: string;
}

export interface KanbanJobCandidate {
  id: string;
  stage: string;
  candidate_id: string;
  job_id: string;
  candidates: KanbanCandidate;
  jobs: KanbanJob;
}

/**
 * Filter job candidates by job ID and search query
 *
 * @param jobCandidates - Array of job candidates to filter
 * @param selectedJobId - Job ID to filter by, or 'all' for no job filter
 * @param searchQuery - Search string to filter by candidate name
 * @returns Filtered array of job candidates
 */
export function filterJobCandidates(
  jobCandidates: KanbanJobCandidate[],
  selectedJobId: string,
  searchQuery: string
): KanbanJobCandidate[] {
  let filtered = jobCandidates;

  // Filter by job
  if (selectedJobId !== 'all') {
    filtered = filtered.filter((jc) => jc.job_id === selectedJobId);
  }

  // Filter by search query (candidate name)
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    const query = trimmedQuery.toLowerCase();
    filtered = filtered.filter((jc) =>
      jc.candidates.full_name.toLowerCase().includes(query)
    );
  }

  return filtered;
}

/**
 * Group job candidates by their stage
 *
 * @param jobCandidates - Array of job candidates to group
 * @returns Record mapping stage names to arrays of job candidates
 */
export function groupByStage(
  jobCandidates: KanbanJobCandidate[]
): Record<Stage, KanbanJobCandidate[]> {
  const grouped: Record<string, KanbanJobCandidate[]> = {};

  // Initialize all stages with empty arrays
  STAGE_ORDER.forEach((stage) => {
    grouped[stage] = [];
  });

  // Group candidates
  jobCandidates.forEach((jc) => {
    if (grouped[jc.stage]) {
      grouped[jc.stage].push(jc);
    }
  });

  return grouped as Record<Stage, KanbanJobCandidate[]>;
}

/**
 * Count candidates per stage
 *
 * @param jobCandidates - Array of job candidates
 * @returns Record mapping stage names to counts
 */
export function countByStage(
  jobCandidates: KanbanJobCandidate[]
): Record<Stage, number> {
  const counts: Record<string, number> = {};

  STAGE_ORDER.forEach((stage) => {
    counts[stage] = 0;
  });

  jobCandidates.forEach((jc) => {
    if (counts[jc.stage] !== undefined) {
      counts[jc.stage]++;
    }
  });

  return counts as Record<Stage, number>;
}

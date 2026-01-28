import { describe, it, expect } from 'vitest';
import {
  filterJobCandidates,
  groupByStage,
  countByStage,
  type KanbanJobCandidate,
} from '../kanban-filters';

// Test data factory
function createJobCandidate(
  id: string,
  name: string,
  jobId: string,
  jobTitle: string,
  stage: string
): KanbanJobCandidate {
  return {
    id,
    stage,
    candidate_id: `candidate-${id}`,
    job_id: jobId,
    candidates: {
      id: `candidate-${id}`,
      full_name: name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      linkedin_url: null,
    },
    jobs: {
      id: jobId,
      title: jobTitle,
    },
  };
}

// Sample test data
const testCandidates: KanbanJobCandidate[] = [
  createJobCandidate('1', 'Anna Andersson', 'job-1', 'Frontend Developer', 'sourced'),
  createJobCandidate('2', 'Erik Eriksson', 'job-1', 'Frontend Developer', 'interview'),
  createJobCandidate('3', 'Maria Svensson', 'job-2', 'Backend Developer', 'screening'),
  createJobCandidate('4', 'Johan Johansson', 'job-2', 'Backend Developer', 'offer'),
  createJobCandidate('5', 'Anna Nilsson', 'job-1', 'Frontend Developer', 'hired'),
  createJobCandidate('6', 'Karl Karlsson', 'job-3', 'Designer', 'applied'),
];

describe('filterJobCandidates', () => {
  describe('job filtering', () => {
    it('returns all candidates when selectedJobId is "all"', () => {
      const result = filterJobCandidates(testCandidates, 'all', '');
      expect(result).toHaveLength(6);
    });

    it('filters by job ID', () => {
      const result = filterJobCandidates(testCandidates, 'job-1', '');
      expect(result).toHaveLength(3);
      expect(result.every((jc) => jc.job_id === 'job-1')).toBe(true);
    });

    it('returns empty array for non-existent job ID', () => {
      const result = filterJobCandidates(testCandidates, 'non-existent', '');
      expect(result).toHaveLength(0);
    });
  });

  describe('search filtering', () => {
    it('filters by candidate name (case-insensitive)', () => {
      const result = filterJobCandidates(testCandidates, 'all', 'anna');
      expect(result).toHaveLength(2);
      expect(result.map((jc) => jc.candidates.full_name)).toContain('Anna Andersson');
      expect(result.map((jc) => jc.candidates.full_name)).toContain('Anna Nilsson');
    });

    it('handles uppercase search query', () => {
      const result = filterJobCandidates(testCandidates, 'all', 'ANNA');
      expect(result).toHaveLength(2);
    });

    it('handles mixed case search query', () => {
      const result = filterJobCandidates(testCandidates, 'all', 'AnNa');
      expect(result).toHaveLength(2);
    });

    it('filters by partial name match', () => {
      const result = filterJobCandidates(testCandidates, 'all', 'sson');
      expect(result).toHaveLength(6); // All Swedish names end in -sson
    });

    it('returns empty array for no matches', () => {
      const result = filterJobCandidates(testCandidates, 'all', 'xyz');
      expect(result).toHaveLength(0);
    });

    it('ignores whitespace-only search query', () => {
      const result = filterJobCandidates(testCandidates, 'all', '   ');
      expect(result).toHaveLength(6);
    });

    it('trims search query', () => {
      const result = filterJobCandidates(testCandidates, 'all', '  anna  ');
      expect(result).toHaveLength(2);
    });
  });

  describe('combined filtering', () => {
    it('applies both job and search filters', () => {
      const result = filterJobCandidates(testCandidates, 'job-1', 'anna');
      expect(result).toHaveLength(2);
      expect(result.every((jc) => jc.job_id === 'job-1')).toBe(true);
      expect(result.every((jc) => jc.candidates.full_name.toLowerCase().includes('anna'))).toBe(true);
    });

    it('returns empty when no candidates match both filters', () => {
      const result = filterJobCandidates(testCandidates, 'job-3', 'anna');
      expect(result).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('handles empty input array', () => {
      const result = filterJobCandidates([], 'all', '');
      expect(result).toHaveLength(0);
    });

    it('handles empty search with specific job', () => {
      const result = filterJobCandidates(testCandidates, 'job-2', '');
      expect(result).toHaveLength(2);
    });
  });
});

describe('groupByStage', () => {
  it('groups candidates by stage', () => {
    const result = groupByStage(testCandidates);

    expect(result.sourced).toHaveLength(1);
    expect(result.applied).toHaveLength(1);
    expect(result.screening).toHaveLength(1);
    expect(result.interview).toHaveLength(1);
    expect(result.offer).toHaveLength(1);
    expect(result.hired).toHaveLength(1);
    expect(result.rejected).toHaveLength(0);
  });

  it('initializes all stages even when empty', () => {
    const result = groupByStage([]);

    expect(result.sourced).toEqual([]);
    expect(result.applied).toEqual([]);
    expect(result.screening).toEqual([]);
    expect(result.interview).toEqual([]);
    expect(result.offer).toEqual([]);
    expect(result.hired).toEqual([]);
    expect(result.rejected).toEqual([]);
  });

  it('handles multiple candidates in same stage', () => {
    const sameStageCandidates = [
      createJobCandidate('1', 'Test 1', 'job-1', 'Job', 'interview'),
      createJobCandidate('2', 'Test 2', 'job-1', 'Job', 'interview'),
      createJobCandidate('3', 'Test 3', 'job-1', 'Job', 'interview'),
    ];

    const result = groupByStage(sameStageCandidates);
    expect(result.interview).toHaveLength(3);
  });

  it('ignores candidates with invalid stages', () => {
    const withInvalidStage = [
      ...testCandidates,
      createJobCandidate('99', 'Invalid', 'job-1', 'Job', 'invalid_stage'),
    ];

    const result = groupByStage(withInvalidStage);
    const totalGrouped = Object.values(result).flat().length;
    expect(totalGrouped).toBe(6); // Only valid stages counted
  });
});

describe('countByStage', () => {
  it('counts candidates per stage', () => {
    const result = countByStage(testCandidates);

    expect(result.sourced).toBe(1);
    expect(result.applied).toBe(1);
    expect(result.screening).toBe(1);
    expect(result.interview).toBe(1);
    expect(result.offer).toBe(1);
    expect(result.hired).toBe(1);
    expect(result.rejected).toBe(0);
  });

  it('returns all zeros for empty array', () => {
    const result = countByStage([]);

    expect(result.sourced).toBe(0);
    expect(result.applied).toBe(0);
    expect(result.screening).toBe(0);
    expect(result.interview).toBe(0);
    expect(result.offer).toBe(0);
    expect(result.hired).toBe(0);
    expect(result.rejected).toBe(0);
  });

  it('counts multiple candidates in same stage', () => {
    const multipleSameStage = [
      createJobCandidate('1', 'Test 1', 'job-1', 'Job', 'interview'),
      createJobCandidate('2', 'Test 2', 'job-1', 'Job', 'interview'),
      createJobCandidate('3', 'Test 3', 'job-1', 'Job', 'interview'),
      createJobCandidate('4', 'Test 4', 'job-1', 'Job', 'offer'),
    ];

    const result = countByStage(multipleSameStage);
    expect(result.interview).toBe(3);
    expect(result.offer).toBe(1);
  });
});

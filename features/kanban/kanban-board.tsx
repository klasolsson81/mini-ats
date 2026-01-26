'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { STAGE_ORDER } from '@/lib/constants/stages';
import { KanbanColumn } from './kanban-column';

interface Candidate {
  id: string;
  full_name: string;
  email: string | null;
  linkedin_url: string | null;
}

interface Job {
  id: string;
  title: string;
}

interface JobCandidate {
  id: string;
  stage: string;
  candidate_id: string;
  job_id: string;
  candidates: Candidate;
  jobs: Job;
}

interface KanbanBoardProps {
  jobCandidates: JobCandidate[];
  jobs: Pick<Job, 'id' | 'title'>[];
}

export function KanbanBoard({ jobCandidates, jobs }: KanbanBoardProps) {
  const t = useTranslations();
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = useMemo(() => {
    let filtered = jobCandidates;

    // Filter by job
    if (selectedJobId !== 'all') {
      filtered = filtered.filter((jc) => jc.job_id === selectedJobId);
    }

    // Filter by search query (candidate name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((jc) =>
        jc.candidates.full_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [jobCandidates, selectedJobId, searchQuery]);

  // Group by stage
  const candidatesByStage = useMemo(() => {
    const grouped: Record<string, JobCandidate[]> = {};
    STAGE_ORDER.forEach((stage) => {
      grouped[stage] = [];
    });

    filteredCandidates.forEach((jc) => {
      if (grouped[jc.stage]) {
        grouped[jc.stage].push(jc);
      }
    });

    return grouped;
  }, [filteredCandidates]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-64">
          <Select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="all">{t('kanban.allJobs')}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('kanban.searchCandidates')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4 min-w-full">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={candidatesByStage[stage] || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

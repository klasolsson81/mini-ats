'use client';

import { useTranslations } from 'next-intl';
import { KanbanCard } from './kanban-card';

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

interface KanbanColumnProps {
  stage: string;
  candidates: JobCandidate[];
}

export function KanbanColumn({ stage, candidates }: KanbanColumnProps) {
  const t = useTranslations();

  const stageColors: Record<string, string> = {
    sourced: 'bg-gray-100 border-gray-300',
    applied: 'bg-blue-50 border-blue-200',
    screening: 'bg-purple-50 border-purple-200',
    interview: 'bg-yellow-50 border-yellow-200',
    offer: 'bg-green-50 border-green-200',
    hired: 'bg-emerald-100 border-emerald-300',
    rejected: 'bg-red-50 border-red-200',
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`rounded-lg border-2 ${stageColors[stage]} p-4`}>
        {/* Column Header */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">
            {t(`kanban.stages.${stage}`)}
          </h3>
          <p className="text-sm text-gray-600">{candidates.length}</p>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {t('kanban.noCandidate')}
            </p>
          ) : (
            candidates.map((jc) => (
              <KanbanCard key={jc.id} jobCandidate={jc} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

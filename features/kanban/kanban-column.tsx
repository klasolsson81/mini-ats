'use client';

import { useTranslations } from 'next-intl';
import { KanbanCard } from './kanban-card';
import { useDroppable } from '@dnd-kit/core';

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
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  // Soft pastel colors matching reference images
  const stagePastelBg: Record<string, string> = {
    sourced: 'bg-pastel-gray',
    applied: 'bg-pastel-blue',
    screening: 'bg-pastel-purple',
    interview: 'bg-pastel-green',
    offer: 'bg-pastel-yellow',
    hired: 'bg-pastel-orange',
    rejected: 'bg-pastel-pink',
  };

  const pastelBg = stagePastelBg[stage] || stagePastelBg.sourced;

  return (
    <div className="flex flex-col" ref={setNodeRef}>
      <div
        className={`flex flex-col rounded-xl ${pastelBg} h-full min-h-[500px] p-3 transition-all duration-300 ${
          isOver ? 'ring-2 ring-[var(--primary)] ring-offset-2 scale-[1.02] shadow-lg' : 'shadow-sm'
        }`}
      >
        {/* Column Header - subtle, not gradient */}
        <div className="mb-3 px-2 py-1">
          <h3 className="font-semibold text-gray-700 text-base">
            {t(`kanban.stages.${stage}`)}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{candidates.length}</p>
        </div>

        {/* Cards - overflow-y-auto keeps scrolling, but overflow-x-visible prevents clipping drag overlay */}
        <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-visible">
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
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

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

// Column header colors
const HEADER_COLORS: Record<string, string> = {
  sourced: 'from-slate-400 to-slate-600',
  applied: 'from-blue-400 to-blue-600',
  screening: 'from-violet-400 to-purple-600',
  interview: 'from-emerald-400 to-green-600',
  offer: 'from-amber-400 to-yellow-500',
  hired: 'from-orange-400 to-orange-600',
  rejected: 'from-rose-400 to-pink-600',
};

// Column background colors (CSS classes from globals.css)
const COLUMN_BG: Record<string, string> = {
  sourced: 'kanban-col-sourced',
  applied: 'kanban-col-applied',
  screening: 'kanban-col-screening',
  interview: 'kanban-col-interview',
  offer: 'kanban-col-offer',
  hired: 'kanban-col-hired',
  rejected: 'kanban-col-rejected',
};

export function KanbanColumn({ stage, candidates }: KanbanColumnProps) {
  const t = useTranslations();
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const headerColor = HEADER_COLORS[stage] || HEADER_COLORS.sourced;
  const columnBg = COLUMN_BG[stage] || COLUMN_BG.sourced;

  return (
    <div className="flex flex-col" ref={setNodeRef}>
      <div
        className={`flex flex-col rounded-2xl ${columnBg} backdrop-blur-sm border border-white/30 h-full min-h-[500px] p-3 transition-all duration-300 ${
          isOver
            ? 'ring-2 ring-[var(--primary)] ring-offset-2 scale-[1.02]'
            : ''
        }`}
      >
        {/* Column Header with gradient badge */}
        <div className="mb-4 flex items-center justify-between">
          <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${headerColor} shadow-md`}>
            <h3 className="font-semibold text-white text-sm">
              {t(`kanban.stages.${stage}`)}
            </h3>
          </div>
          <span className="text-xs font-medium text-gray-600 bg-white/50 px-2 py-1 rounded-full backdrop-blur-sm">
            {candidates.length}
          </span>
        </div>

        {/* Cards */}
        <div className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-1">
          {candidates.length === 0 ? (
            <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-gray-300/50 bg-white/10">
              <p className="text-sm text-gray-400">
                {t('kanban.noCandidate')}
              </p>
            </div>
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

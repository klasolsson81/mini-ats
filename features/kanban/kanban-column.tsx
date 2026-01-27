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

// Column styles with gradients and glows
const COLUMN_STYLES: Record<string, {
  bg: string;
  headerBg: string;
  glow: string;
  border: string;
}> = {
  sourced: {
    bg: 'from-slate-200/60 via-slate-100/40 to-slate-50/30',
    headerBg: 'from-slate-400 to-slate-600',
    glow: 'shadow-slate-200/50',
    border: 'border-slate-300/40',
  },
  applied: {
    bg: 'from-blue-200/60 via-blue-100/40 to-blue-50/30',
    headerBg: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-200/50',
    border: 'border-blue-300/40',
  },
  screening: {
    bg: 'from-violet-200/60 via-purple-100/40 to-violet-50/30',
    headerBg: 'from-violet-400 to-purple-600',
    glow: 'shadow-violet-200/50',
    border: 'border-violet-300/40',
  },
  interview: {
    bg: 'from-emerald-200/60 via-green-100/40 to-emerald-50/30',
    headerBg: 'from-emerald-400 to-green-600',
    glow: 'shadow-emerald-200/50',
    border: 'border-emerald-300/40',
  },
  offer: {
    bg: 'from-amber-200/60 via-yellow-100/40 to-amber-50/30',
    headerBg: 'from-amber-400 to-yellow-500',
    glow: 'shadow-amber-200/50',
    border: 'border-amber-300/40',
  },
  hired: {
    bg: 'from-orange-200/60 via-orange-100/40 to-orange-50/30',
    headerBg: 'from-orange-400 to-orange-600',
    glow: 'shadow-orange-200/50',
    border: 'border-orange-300/40',
  },
  rejected: {
    bg: 'from-rose-200/60 via-pink-100/40 to-rose-50/30',
    headerBg: 'from-rose-400 to-pink-600',
    glow: 'shadow-rose-200/50',
    border: 'border-rose-300/40',
  },
};

export function KanbanColumn({ stage, candidates }: KanbanColumnProps) {
  const t = useTranslations();
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const styles = COLUMN_STYLES[stage] || COLUMN_STYLES.sourced;

  return (
    <div className="flex flex-col" ref={setNodeRef}>
      <div
        className={`flex flex-col rounded-2xl bg-gradient-to-b ${styles.bg} backdrop-blur-sm border ${styles.border} h-full min-h-[500px] p-3 transition-all duration-300 ${
          isOver
            ? `ring-2 ring-[var(--primary)] ring-offset-2 scale-[1.02] shadow-xl ${styles.glow}`
            : `shadow-lg ${styles.glow}`
        }`}
      >
        {/* Column Header with gradient badge */}
        <div className="mb-4 flex items-center justify-between">
          <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${styles.headerBg} shadow-md`}>
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
            <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-gray-300/50 bg-white/20">
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

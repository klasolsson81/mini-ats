'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { TrendingUp, ChevronRight } from 'lucide-react';

interface PipelineStatsProps {
  stats: {
    stage: string;
    count: number;
  }[];
}

// Stage colors for the horizontal bar
const STAGE_COLORS: Record<string, string> = {
  sourced: 'bg-slate-500',
  applied: 'bg-blue-500',
  screening: 'bg-violet-500',
  interview: 'bg-emerald-500',
  offer: 'bg-amber-500',
  hired: 'bg-orange-500',
  rejected: 'bg-rose-500',
};

const STAGE_BG_COLORS: Record<string, string> = {
  sourced: 'bg-slate-100 text-slate-700 border-slate-200',
  applied: 'bg-blue-100 text-blue-700 border-blue-200',
  screening: 'bg-violet-100 text-violet-700 border-violet-200',
  interview: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  offer: 'bg-amber-100 text-amber-700 border-amber-200',
  hired: 'bg-orange-100 text-orange-700 border-orange-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

// Define the order of stages for display
const STAGE_ORDER = [
  'sourced',
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
];

export function PipelineStats({ stats }: PipelineStatsProps) {
  const t = useTranslations();
  const tKanban = useTranslations('kanban.stages');

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  // Sort stats by stage order and include all stages
  const allStages = STAGE_ORDER.map((stage) => {
    const found = stats.find((s) => s.stage === stage);
    return {
      stage,
      count: found?.count || 0,
    };
  });

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl glass-cyan border border-cyan-300/50 shadow-sm max-w-6xl">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('dashboard.pipelineOverview')}
              </h3>
              <p className="text-sm text-gray-600">
                {total} {t('dashboard.totalCandidates').toLowerCase()}
              </p>
            </div>
          </div>
          <Link
            href="/app/kanban"
            className="flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            {t('dashboard.viewKanban')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="h-4 rounded-full bg-white/50 overflow-hidden flex">
          {allStages.map((stat) => {
            if (stat.count === 0) return null;
            const width = (stat.count / total) * 100;
            return (
              <div
                key={stat.stage}
                className={`${STAGE_COLORS[stat.stage]} h-full transition-all duration-500`}
                style={{ width: `${width}%` }}
                title={`${tKanban(stat.stage)}: ${stat.count}`}
              />
            );
          })}
        </div>

        {/* Stage Pills */}
        <div className="flex flex-wrap gap-2">
          {allStages.map((stat) => {
            const colors = STAGE_BG_COLORS[stat.stage];
            return (
              <div
                key={stat.stage}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${colors}`}
              >
                <span>{tKanban(stat.stage)}</span>
                <span className="font-bold">{stat.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

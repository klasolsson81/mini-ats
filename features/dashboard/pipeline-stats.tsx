'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

interface PipelineStatsProps {
  stats: {
    stage: string;
    count: number;
  }[];
}

// Vibrant gradient colors for each stage
const STAGE_COLORS: Record<string, { gradient: string; text: string }> = {
  sourced: {
    gradient: 'from-slate-400 to-slate-600',
    text: 'text-white',
  },
  applied: {
    gradient: 'from-blue-400 to-blue-600',
    text: 'text-white',
  },
  screening: {
    gradient: 'from-violet-400 to-purple-600',
    text: 'text-white',
  },
  interview: {
    gradient: 'from-emerald-400 to-green-600',
    text: 'text-white',
  },
  offer: {
    gradient: 'from-amber-400 to-yellow-500',
    text: 'text-gray-900',
  },
  hired: {
    gradient: 'from-orange-400 to-orange-600',
    text: 'text-white',
  },
  rejected: {
    gradient: 'from-rose-400 to-pink-600',
    text: 'text-white',
  },
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

  const totalActive = stats
    .filter((s) => s.stage !== 'hired' && s.stage !== 'rejected')
    .reduce((sum, s) => sum + s.count, 0);

  // Sort stats by stage order
  const sortedStats = [...stats].sort((a, b) => {
    const aIndex = STAGE_ORDER.indexOf(a.stage);
    const bIndex = STAGE_ORDER.indexOf(b.stage);
    return aIndex - bIndex;
  });

  return (
    <div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 p-6 max-w-6xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('dashboard.pipelineOverview')}
            </h3>
          </div>
          <Link
            href="/app/kanban"
            className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
          >
            {t('dashboard.viewKanban')} →
          </Link>
        </div>

        {stats.length === 0 ? (
          <p className="text-sm text-gray-600">{t('dashboard.noCandidates')}</p>
        ) : (
          <div className="space-y-4">
            {/* Total Active - Compact */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-300/30">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">{totalActive}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {t('dashboard.activeInPipeline')}
                </p>
                <p className="text-xs text-gray-600">
                  {stats.filter((s) => s.stage !== 'hired' && s.stage !== 'rejected').length} {t('kanban.stages.screening').toLowerCase()}
                </p>
              </div>
            </div>

            {/* Stage Breakdown - Gradient cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {sortedStats.map((stat) => {
                const colors = STAGE_COLORS[stat.stage] || STAGE_COLORS.sourced;
                const stageName = tKanban(stat.stage);

                return (
                  <div
                    key={stat.stage}
                    className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.gradient} p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md`}
                  >
                    <div className="relative z-10">
                      <p className={`text-xs font-semibold ${colors.text} opacity-90 mb-1 truncate`}>
                        {stageName}
                      </p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{stat.count}</p>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-50" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

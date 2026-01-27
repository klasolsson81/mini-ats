'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp } from 'lucide-react';

interface PipelineStatsProps {
  stats: {
    stage: string;
    count: number;
  }[];
}

// Match kanban column colors exactly
const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  sourced: {
    bg: 'bg-slate-200',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  applied: {
    bg: 'bg-blue-200',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  screening: {
    bg: 'bg-violet-200',
    text: 'text-violet-700',
    border: 'border-violet-300',
  },
  interview: {
    bg: 'bg-emerald-200',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
  },
  offer: {
    bg: 'bg-amber-200',
    text: 'text-amber-700',
    border: 'border-amber-300',
  },
  hired: {
    bg: 'bg-orange-200',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  rejected: {
    bg: 'bg-pink-200',
    text: 'text-pink-700',
    border: 'border-pink-300',
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
    <GlassCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] flex items-center justify-center">
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
            {/* Total Active Summary */}
            <div className="rounded-xl bg-gradient-to-r from-cyan-100 via-cyan-50 to-cyan-100/50 border border-cyan-200/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600 mb-1">
                    {t('dashboard.activeInPipeline')}
                  </p>
                  <p className="text-4xl font-bold text-gray-900">{totalActive}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Stage Breakdown - Full colored cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {sortedStats.map((stat) => {
                const colors = STAGE_COLORS[stat.stage] || STAGE_COLORS.sourced;
                const stageName = tKanban(stat.stage);

                return (
                  <div
                    key={stat.stage}
                    className={`relative overflow-hidden rounded-xl ${colors.bg} border ${colors.border} p-4 transition-all duration-200 hover:scale-105 hover:shadow-md`}
                  >
                    <div className="relative z-10">
                      <p className={`text-xs font-semibold ${colors.text} mb-1 truncate`}>
                        {stageName}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface PipelineStatsProps {
  stats: {
    stage: string;
    count: number;
  }[];
}

const STAGE_COLORS: Record<string, string> = {
  sourced: 'bg-blue-100 text-blue-800 border-blue-200',
  applied: 'bg-purple-100 text-purple-800 border-purple-200',
  screening: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  interview: 'bg-orange-100 text-orange-800 border-orange-200',
  offer: 'bg-green-100 text-green-800 border-green-200',
  hired: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function PipelineStats({ stats }: PipelineStatsProps) {
  const t = useTranslations();
  const tKanban = useTranslations('kanban.stages');

  const totalActive = stats
    .filter((s) => s.stage !== 'hired' && s.stage !== 'rejected')
    .reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('dashboard.pipelineOverview')}
          </span>
          <Link
            href="/app/kanban"
            className="text-sm font-normal text-blue-600 hover:text-blue-700 hover:underline"
          >
            {t('dashboard.viewKanban')}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-sm text-gray-600">{t('dashboard.noCandidates')}</p>
        ) : (
          <div className="space-y-3">
            {/* Total Active Summary */}
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-semibold uppercase text-blue-900">
                {t('dashboard.activeInPipeline')}
              </p>
              <p className="text-2xl font-bold text-blue-900">{totalActive}</p>
            </div>

            {/* Stage Breakdown */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {stats.map((stat) => {
                const colorClass =
                  STAGE_COLORS[stat.stage] || 'bg-gray-100 text-gray-800';
                const stageName = tKanban(stat.stage);

                return (
                  <div
                    key={stat.stage}
                    className={`flex flex-col items-center justify-center rounded-lg border p-3 ${colorClass}`}
                  >
                    <p className="text-xs font-medium">{stageName}</p>
                    <p className="text-xl font-bold">{stat.count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

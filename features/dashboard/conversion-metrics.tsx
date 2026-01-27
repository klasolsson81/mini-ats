'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, Clock, Target, ArrowRight } from 'lucide-react';

interface ConversionMetricsProps {
  stageCounts: Record<string, number>;
  avgDaysToHire: number | null;
}

const FUNNEL_STAGES = ['applied', 'screening', 'interview', 'offer', 'hired'];

export function ConversionMetrics({
  stageCounts,
  avgDaysToHire,
}: ConversionMetricsProps) {
  const t = useTranslations('dashboard');
  const tKanban = useTranslations('kanban');

  // Calculate conversion rates between stages
  const conversions: { from: string; to: string; rate: number }[] = [];

  for (let i = 0; i < FUNNEL_STAGES.length - 1; i++) {
    const fromStage = FUNNEL_STAGES[i];
    const toStage = FUNNEL_STAGES[i + 1];

    // Sum all candidates in this stage and later stages
    const totalFromHere = FUNNEL_STAGES.slice(i).reduce(
      (sum, stage) => sum + (stageCounts[stage] || 0),
      0
    );
    const totalToThere = FUNNEL_STAGES.slice(i + 1).reduce(
      (sum, stage) => sum + (stageCounts[stage] || 0),
      0
    );

    const rate = totalFromHere > 0 ? (totalToThere / totalFromHere) * 100 : 0;
    conversions.push({ from: fromStage, to: toStage, rate });
  }

  // Calculate overall conversion (applied -> hired)
  const appliedTotal = FUNNEL_STAGES.reduce(
    (sum, stage) => sum + (stageCounts[stage] || 0),
    0
  );
  const hiredCount = stageCounts['hired'] || 0;
  const overallRate = appliedTotal > 0 ? (hiredCount / appliedTotal) * 100 : 0;

  const hasData = appliedTotal > 0 || avgDaysToHire !== null;

  if (!hasData) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
      {/* Conversion Funnel */}
      <div className="rounded-2xl glass-violet border border-violet-300/50 shadow-sm">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('conversionFunnel')}
              </h3>
              <p className="text-sm text-gray-600">{t('conversionSubtitle')}</p>
            </div>
          </div>

          <div className="space-y-2">
            {conversions.slice(0, 3).map((conv) => (
              <div
                key={`${conv.from}-${conv.to}`}
                className="flex items-center justify-between rounded-lg glass-bg-white border border-white/50 p-2.5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">
                    {tKanban(`stages.${conv.from}`)}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="font-medium text-gray-700">
                    {tKanban(`stages.${conv.to}`)}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${conv.rate >= 50 ? 'text-emerald-600' : conv.rate >= 25 ? 'text-amber-600' : 'text-gray-600'}`}
                >
                  {conv.rate.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          {/* Overall rate */}
          <div className="flex items-center justify-between rounded-xl bg-violet-100/50 border border-violet-200/50 p-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('overallConversion')}
              </span>
            </div>
            <span className="text-lg font-bold text-violet-600">
              {overallRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Time to Hire */}
      <div className="rounded-2xl glass-emerald border border-emerald-300/50 shadow-sm">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('timeToHire')}
              </h3>
              <p className="text-sm text-gray-600">{t('timeToHireSubtitle')}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {avgDaysToHire !== null ? (
              <>
                <span className="text-5xl font-bold text-gray-900">
                  {avgDaysToHire}
                </span>
                <span className="text-sm text-gray-600 mt-1">
                  {t('daysAverage')}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">{t('noHiredYet')}</span>
            )}
          </div>

          {avgDaysToHire !== null && (
            <div className="text-center text-xs text-gray-500">
              {t('basedOnHired', { count: hiredCount })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

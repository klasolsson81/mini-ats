'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AlertTriangle, Clock, User, ChevronRight } from 'lucide-react';

interface StaleCandidate {
  id: string;
  candidate_name: string;
  job_title: string;
  stage: string;
  days_in_stage: number;
}

interface AttentionNeededProps {
  staleCandidates: StaleCandidate[];
}

const STAGE_COLORS: Record<string, string> = {
  sourced: 'bg-slate-100 text-slate-700',
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-violet-100 text-violet-700',
  interview: 'bg-emerald-100 text-emerald-700',
  offer: 'bg-amber-100 text-amber-700',
};

export function AttentionNeeded({ staleCandidates }: AttentionNeededProps) {
  const t = useTranslations('dashboard');
  const tKanban = useTranslations('kanban');
  const locale = useLocale();

  if (staleCandidates.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl glass-amber border border-amber-300/50 shadow-sm max-w-4xl">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('attentionNeeded')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('attentionNeededSubtitle', { count: staleCandidates.length })}
              </p>
            </div>
          </div>
          <Link
            href="/app/kanban"
            className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            {t('viewAll')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          {staleCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center justify-between rounded-xl glass-bg-white border border-white/50 p-3 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {candidate.candidate_name}
                  </p>
                  <p className="text-xs text-gray-600">{candidate.job_title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[candidate.stage] || 'bg-gray-100 text-gray-700'}`}
                >
                  {tKanban(`stages.${candidate.stage}`)}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Clock className="w-3 h-3" />
                  <span>
                    {locale === 'sv'
                      ? `${candidate.days_in_stage}d`
                      : `${candidate.days_in_stage}d`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { CreateJobDialog } from '@/features/jobs/create-job-dialog';
import { CreateCandidateDialog } from '@/features/candidates/create-candidate-dialog';
import { Briefcase, Users, TrendingUp, Zap, ChevronRight } from 'lucide-react';

export function QuickActions() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);

  const handleJobCreated = () => {
    setShowJobDialog(false);
    router.refresh();
  };

  const handleCandidateCreated = () => {
    setShowCandidateDialog(false);
    router.refresh();
  };

  const actions = [
    {
      key: 'kanban',
      label: t('viewKanban'),
      icon: TrendingUp,
      gradient: 'from-blue-400 to-blue-600',
      onClick: () => router.push('/app/kanban'),
    },
    {
      key: 'job',
      label: t('createJob'),
      icon: Briefcase,
      gradient: 'from-green-400 to-green-600',
      onClick: () => setShowJobDialog(true),
    },
    {
      key: 'candidate',
      label: t('createCandidate'),
      icon: Users,
      gradient: 'from-purple-400 to-purple-600',
      onClick: () => setShowCandidateDialog(true),
    },
  ];

  return (
    <>
      <GlassCard>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('quickStart')}
            </h3>
          </div>

          <div className="space-y-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/40 hover:bg-white/70 transition-all duration-200 group border border-white/30 hover:border-white/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                      {action.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <CreateJobDialog
        open={showJobDialog}
        onClose={handleJobCreated}
      />
      <CreateCandidateDialog
        open={showCandidateDialog}
        onClose={handleCandidateCreated}
      />
    </>
  );
}

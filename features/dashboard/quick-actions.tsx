'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateJobDialog } from '@/features/jobs/create-job-dialog';
import { CreateCandidateDialog } from '@/features/candidates/create-candidate-dialog';
import { Briefcase, Users, TrendingUp, Plus } from 'lucide-react';

export function QuickActions() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);

  const handleJobCreated = () => {
    setShowJobDialog(false);
    router.refresh(); // Refresh to update stats
  };

  const handleCandidateCreated = () => {
    setShowCandidateDialog(false);
    router.refresh(); // Refresh to update stats
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('quickStart')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => router.push('/app/kanban')}
          >
            <TrendingUp className="h-4 w-4" />
            {t('viewKanban')}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setShowJobDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <Briefcase className="h-4 w-4" />
            {t('createJob')}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setShowCandidateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <Users className="h-4 w-4" />
            {t('createCandidate')}
          </Button>
        </CardContent>
      </Card>

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

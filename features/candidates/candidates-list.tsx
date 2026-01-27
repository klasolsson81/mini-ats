'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate, Job } from '@/lib/types/database';
import { GlassCard } from '@/components/ui/glass-card';
import { PillBadge } from '@/components/ui/pill-badge';
import { Users, Edit, Trash2, Briefcase, Linkedin, Mail, Phone } from 'lucide-react';
import { deleteCandidate } from '@/lib/actions/candidates';
import { toast } from 'sonner';
import { EditCandidateDialog } from './edit-candidate-dialog';
import { AttachToJobDialog } from './attach-to-job-dialog';

interface CandidateWithJobs extends Candidate {
  job_candidates?: Array<{
    id: string;
    stage: string;
    jobs: {
      id: string;
      title: string;
    } | null;
  }>;
}

interface CandidatesListProps {
  candidates: CandidateWithJobs[];
  jobs: Pick<Job, 'id' | 'title'>[];
}

export function CandidatesList({ candidates, jobs }: CandidatesListProps) {
  const t = useTranslations();
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [attachingCandidate, setAttachingCandidate] =
    useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${t('candidates.deleteConfirm')} "${name}"?`)) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteCandidate(id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('candidates.candidateDeleted'));
    }
    setIsDeleting(null);
  }

  if (candidates.length === 0) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('candidates.noCandidates')}
          </h3>
        </div>
      </GlassCard>
    );
  }

  const getStageVariant = (stage: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
      sourced: 'secondary',
      applied: 'primary',
      screening: 'primary',
      interview: 'warning',
      offer: 'success',
      hired: 'success',
      rejected: 'danger',
    };
    return variants[stage] || 'secondary';
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <GlassCard key={candidate.id} hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="flex-1 font-semibold text-lg text-gray-900">
                  {candidate.full_name}
                </h3>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Job assignments */}
              {candidate.job_candidates && candidate.job_candidates.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-white/30">
                  {candidate.job_candidates.map((jc) => (
                    <div key={jc.id} className="rounded-lg bg-white/30 p-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 truncate">
                          {jc.jobs?.title || 'Unknown Job'}
                        </span>
                      </div>
                      <div className="ml-7">
                        <PillBadge variant={getStageVariant(jc.stage)}>
                          {t(`kanban.stages.${jc.stage}`)}
                        </PillBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact info */}
              <div className="space-y-2">
                {candidate.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="truncate">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <Linkedin className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="truncate font-medium">LinkedIn Profil</span>
                  </a>
                )}
                {candidate.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2 pt-1">
                    {candidate.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAttachingCandidate(candidate)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/50 hover:bg-white/80 border border-white/20 text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-all duration-200"
                >
                  <Briefcase className="h-4 w-4" />
                  Koppla
                </button>
                <button
                  onClick={() => setEditingCandidate(candidate)}
                  className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/80 border border-white/20 text-gray-900 hover:text-[var(--primary)] transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(candidate.id, candidate.full_name)}
                  disabled={isDeleting === candidate.id}
                  className="px-3 py-2 rounded-xl bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {editingCandidate && (
        <EditCandidateDialog
          candidate={editingCandidate}
          open={!!editingCandidate}
          onClose={() => setEditingCandidate(null)}
        />
      )}

      {attachingCandidate && (
        <AttachToJobDialog
          candidate={attachingCandidate}
          jobs={jobs}
          open={!!attachingCandidate}
          onClose={() => setAttachingCandidate(null)}
        />
      )}
    </>
  );
}

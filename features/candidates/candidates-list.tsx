'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate, Job } from '@/lib/types/database';
import { Users, Edit, Trash2, Briefcase, Linkedin, Mail, Phone, Link } from 'lucide-react';
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

const STAGE_COLORS: Record<string, string> = {
  sourced: 'bg-slate-500',
  applied: 'bg-blue-500',
  screening: 'bg-violet-500',
  interview: 'bg-emerald-500',
  offer: 'bg-amber-500',
  hired: 'bg-orange-500',
  rejected: 'bg-rose-500',
};

export function CandidatesList({ candidates, jobs }: CandidatesListProps) {
  const t = useTranslations();
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [attachingCandidate, setAttachingCandidate] = useState<Candidate | null>(null);
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
      <div className="rounded-2xl bg-gradient-to-br from-cyan-100/50 via-sky-50/40 to-blue-100/50 backdrop-blur-sm border-2 border-cyan-300/50 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('candidates.noCandidates')}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => {
          const initials = candidate.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const firstJob = candidate.job_candidates?.[0];

          return (
            <div
              key={candidate.id}
              className="group rounded-xl bg-gradient-to-br from-cyan-100/50 via-sky-50/40 to-blue-100/50 backdrop-blur-sm border-2 border-cyan-300/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-cyan-400/60"
            >
              <div className="p-4 space-y-3">
                {/* Header: Avatar + Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-sm font-bold text-white">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {candidate.full_name}
                    </h3>
                    {firstJob && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600 truncate">
                          {firstJob.jobs?.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage badge */}
                {firstJob && (
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold text-white ${STAGE_COLORS[firstJob.stage] || 'bg-gray-500'}`}>
                      {t(`kanban.stages.${firstJob.stage}`)}
                    </span>
                  </div>
                )}

                {/* Contact info - compact */}
                <div className="space-y-1.5 text-xs">
                  {candidate.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                  )}
                  {candidate.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.linkedin_url && (
                    <a
                      href={candidate.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span className="truncate">LinkedIn Profil</span>
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setAttachingCandidate(candidate)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Link className="w-3.5 h-3.5" />
                    Koppla
                  </button>
                  <button
                    onClick={() => setEditingCandidate(candidate)}
                    className="px-3 py-2 rounded-lg bg-white/50 hover:bg-white/70 border border-white/30 text-gray-700 hover:text-blue-600 transition-all duration-200"
                    aria-label={t('common.edit')}
                  >
                    <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleDelete(candidate.id, candidate.full_name)}
                    disabled={isDeleting === candidate.id}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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

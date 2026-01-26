'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate, Job } from '@/lib/types/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, Briefcase, Linkedin, Mail, Phone } from 'lucide-react';
import { deleteCandidate } from '@/lib/actions/candidates';
import { toast } from 'sonner';
import { EditCandidateDialog } from './edit-candidate-dialog';
import { AttachToJobDialog } from './attach-to-job-dialog';

interface CandidatesListProps {
  candidates: Candidate[];
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {t('candidates.noCandidates')}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Kom igång genom att lägga till din första kandidat.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {candidate.full_name}
                  </h3>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.linkedin_url && (
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">LinkedIn Profil</span>
                </a>
              )}
              {candidate.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {candidate.notes}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttachingCandidate(candidate)}
                  className="flex-1"
                >
                  <Briefcase className="mr-1 h-4 w-4" />
                  Koppla
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCandidate(candidate)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(candidate.id, candidate.full_name)}
                  disabled={isDeleting === candidate.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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

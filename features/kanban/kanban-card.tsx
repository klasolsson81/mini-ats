'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Mail, Linkedin, Briefcase, GripVertical } from 'lucide-react';
import { STAGE_ORDER } from '@/lib/constants/stages';
import { updateCandidateStage } from '@/lib/actions/candidates';
import { toast } from 'sonner';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Candidate {
  id: string;
  full_name: string;
  email: string | null;
  linkedin_url: string | null;
}

interface Job {
  id: string;
  title: string;
}

interface JobCandidate {
  id: string;
  stage: string;
  candidate_id: string;
  job_id: string;
  candidates: Candidate;
  jobs: Job;
}

interface KanbanCardProps {
  jobCandidate: JobCandidate;
}

export function KanbanCard({ jobCandidate }: KanbanCardProps) {
  const t = useTranslations();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStage, setCurrentStage] = useState(jobCandidate.stage);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: jobCandidate.id,
    });

  async function handleStageChange(newStage: string) {
    if (newStage === currentStage) return;

    setIsUpdating(true);
    const result = await updateCandidateStage(jobCandidate.id, newStage as any);

    if (result.error) {
      toast.error(result.error);
      // Revert on error
      setCurrentStage(jobCandidate.stage);
    } else {
      toast.success(t('kanban.stageUpdated'));
      setCurrentStage(newStage);
    }

    setIsUpdating(false);
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-white hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4 space-y-3">
        {/* Drag Handle + Candidate Name */}
        <div className="flex items-start gap-2">
          <button
            {...listeners}
            {...attributes}
            className="touch-none cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-0.5"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <h4 className="flex-1 font-semibold text-gray-900">
            {jobCandidate.candidates.full_name}
          </h4>
        </div>

        {/* Job Title */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{jobCandidate.jobs.title}</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-1">
          {jobCandidate.candidates.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{jobCandidate.candidates.email}</span>
            </div>
          )}
          {jobCandidate.candidates.linkedin_url && (
            <a
              href={jobCandidate.candidates.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
            >
              <Linkedin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">LinkedIn</span>
            </a>
          )}
        </div>

        {/* Stage Selector */}
        <div className="pt-2">
          <Select
            value={currentStage}
            onChange={(e) => handleStageChange(e.target.value)}
            disabled={isUpdating}
            className="text-sm"
          >
            {STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {t(`kanban.stages.${stage}`)}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

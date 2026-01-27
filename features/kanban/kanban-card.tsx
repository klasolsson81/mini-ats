'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/select';
import { Mail, Linkedin, Briefcase, User } from 'lucide-react';
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
  isOverlay?: boolean;
}

// Card gradient styles matching column colors
const CARD_STYLES: Record<string, { gradient: string; border: string; iconBg: string }> = {
  sourced: {
    gradient: 'from-slate-100/80 via-slate-50/60 to-white/40',
    border: 'border-slate-200/50',
    iconBg: 'from-slate-400 to-slate-600',
  },
  applied: {
    gradient: 'from-blue-100/80 via-blue-50/60 to-white/40',
    border: 'border-blue-200/50',
    iconBg: 'from-blue-400 to-blue-600',
  },
  screening: {
    gradient: 'from-violet-100/80 via-purple-50/60 to-white/40',
    border: 'border-violet-200/50',
    iconBg: 'from-violet-400 to-purple-600',
  },
  interview: {
    gradient: 'from-emerald-100/80 via-green-50/60 to-white/40',
    border: 'border-emerald-200/50',
    iconBg: 'from-emerald-400 to-green-600',
  },
  offer: {
    gradient: 'from-amber-100/80 via-yellow-50/60 to-white/40',
    border: 'border-amber-200/50',
    iconBg: 'from-amber-400 to-yellow-500',
  },
  hired: {
    gradient: 'from-orange-100/80 via-orange-50/60 to-white/40',
    border: 'border-orange-200/50',
    iconBg: 'from-orange-400 to-orange-600',
  },
  rejected: {
    gradient: 'from-rose-100/80 via-pink-50/60 to-white/40',
    border: 'border-rose-200/50',
    iconBg: 'from-rose-400 to-pink-600',
  },
};

export function KanbanCard({ jobCandidate, isOverlay = false }: KanbanCardProps) {
  const t = useTranslations();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStage, setCurrentStage] = useState(jobCandidate.stage);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: jobCandidate.id,
      disabled: isOverlay,
    });

  async function handleStageChange(newStage: string) {
    if (newStage === currentStage) return;

    setIsUpdating(true);
    const result = await updateCandidateStage(jobCandidate.id, newStage as any);

    if (result.error) {
      toast.error(result.error);
      setCurrentStage(jobCandidate.stage);
    } else {
      toast.success(t('kanban.stageUpdated'));
      setCurrentStage(newStage);
    }

    setIsUpdating(false);
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const cardStyle = CARD_STYLES[currentStage] || CARD_STYLES.sourced;

  // Get initials for avatar
  const initials = jobCandidate.candidates.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? undefined : style}
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
      className={`rounded-xl bg-gradient-to-br ${cardStyle.gradient} backdrop-blur-sm border ${cardStyle.border} transition-all duration-200 ${
        isOverlay
          ? 'shadow-2xl rotate-2 cursor-grabbing scale-105 ring-2 ring-[var(--primary)]/50'
          : 'hover:shadow-lg hover:-translate-y-1 cursor-grab active:cursor-grabbing shadow-md'
      }`}
    >
      <div className="p-3.5 space-y-3">
        {/* Header with Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cardStyle.iconBg} flex items-center justify-center shadow-md flex-shrink-0`}>
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {jobCandidate.candidates.full_name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{jobCandidate.jobs.title}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5 pl-12">
          {jobCandidate.candidates.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Mail className="h-3 w-3 flex-shrink-0 text-gray-400" />
              <span className="truncate">{jobCandidate.candidates.email}</span>
            </div>
          )}
          {jobCandidate.candidates.linkedin_url && (
            <a
              href={jobCandidate.candidates.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <Linkedin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate font-medium">LinkedIn</span>
            </a>
          )}
        </div>

        {/* Stage Selector */}
        <div
          className="pt-1"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Select
            value={currentStage}
            onChange={(e) => handleStageChange(e.target.value)}
            disabled={isUpdating}
            className="text-xs bg-white/50 border-white/50 backdrop-blur-sm"
          >
            {STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {t(`kanban.stages.${stage}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

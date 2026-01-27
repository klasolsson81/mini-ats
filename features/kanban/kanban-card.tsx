'use client';

import { useTranslations } from 'next-intl';
import { Mail, Linkedin, Briefcase } from 'lucide-react';
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

// Card styles with visible borders matching column colors
const CARD_STYLES: Record<string, { bg: string; border: string; iconBg: string }> = {
  sourced: {
    bg: 'from-white/80 to-slate-50/60',
    border: 'border-slate-400/60',
    iconBg: 'from-slate-400 to-slate-600',
  },
  applied: {
    bg: 'from-white/80 to-blue-50/60',
    border: 'border-blue-400/60',
    iconBg: 'from-blue-400 to-blue-600',
  },
  screening: {
    bg: 'from-white/80 to-violet-50/60',
    border: 'border-violet-400/60',
    iconBg: 'from-violet-400 to-purple-600',
  },
  interview: {
    bg: 'from-white/80 to-emerald-50/60',
    border: 'border-emerald-400/60',
    iconBg: 'from-emerald-400 to-green-600',
  },
  offer: {
    bg: 'from-white/80 to-amber-50/60',
    border: 'border-amber-400/60',
    iconBg: 'from-amber-400 to-yellow-500',
  },
  hired: {
    bg: 'from-white/80 to-orange-50/60',
    border: 'border-orange-400/60',
    iconBg: 'from-orange-400 to-orange-600',
  },
  rejected: {
    bg: 'from-white/80 to-rose-50/60',
    border: 'border-rose-400/60',
    iconBg: 'from-rose-400 to-pink-600',
  },
};

export function KanbanCard({ jobCandidate, isOverlay = false }: KanbanCardProps) {
  const t = useTranslations();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: jobCandidate.id,
      disabled: isOverlay,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const cardStyle = CARD_STYLES[jobCandidate.stage] || CARD_STYLES.sourced;

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
      className={`rounded-xl bg-gradient-to-br ${cardStyle.bg} backdrop-blur-sm border-2 ${cardStyle.border} transition-all duration-200 ${
        isOverlay
          ? 'shadow-2xl rotate-2 cursor-grabbing scale-105 ring-2 ring-[var(--primary)]/50'
          : 'hover:shadow-lg hover:-translate-y-1 cursor-grab active:cursor-grabbing shadow-md'
      }`}
    >
      <div className="p-3 space-y-2">
        {/* Header with Avatar and Name */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cardStyle.iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
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

        {/* Contact Info - Compact */}
        <div className="flex items-center gap-3 text-xs text-gray-500 pl-10">
          {jobCandidate.candidates.email && (
            <div className="flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{jobCandidate.candidates.email}</span>
            </div>
          )}
          {jobCandidate.candidates.linkedin_url && (
            <a
              href={jobCandidate.candidates.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <Linkedin className="h-3 w-3 flex-shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

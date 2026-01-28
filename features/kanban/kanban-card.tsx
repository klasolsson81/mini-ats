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

// Icon background colors by stage
const ICON_COLORS: Record<string, string> = {
  sourced: 'from-slate-400 to-slate-600',
  applied: 'from-blue-400 to-blue-600',
  screening: 'from-violet-400 to-purple-600',
  interview: 'from-emerald-400 to-green-600',
  offer: 'from-amber-400 to-yellow-500',
  hired: 'from-orange-400 to-orange-600',
  rejected: 'from-rose-400 to-pink-600',
};

export function KanbanCard({ jobCandidate, isOverlay = false }: KanbanCardProps) {
  // Translation hook available for future use
  const _t = useTranslations();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: jobCandidate.id,
      disabled: isOverlay,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const iconColor = ICON_COLORS[jobCandidate.stage] || ICON_COLORS.sourced;

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
      className={`rounded-xl bg-white/40 backdrop-blur-sm border-2 border-white/70 shadow-sm transition-all duration-200 ${
        isOverlay
          ? 'shadow-2xl rotate-2 cursor-grabbing scale-105 ring-2 ring-[var(--primary)]/50 bg-white/70'
          : 'hover:shadow-md hover:-translate-y-1 hover:bg-white/55 hover:border-white/80 cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="p-3 space-y-2">
        {/* Header with Avatar and Name */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-sm flex-shrink-0`}>
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

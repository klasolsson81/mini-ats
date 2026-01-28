'use client';

import { useState, useMemo, useOptimistic, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Filter } from 'lucide-react';
import { STAGE_ORDER, type Stage } from '@/lib/constants/stages';
import { filterJobCandidates, groupByStage } from '@/lib/utils/kanban-filters';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { updateCandidateStage } from '@/lib/actions/candidates';
import { toast } from 'sonner';

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

interface KanbanBoardProps {
  jobCandidates: JobCandidate[];
  jobs: Pick<Job, 'id' | 'title'>[];
}

type OptimisticUpdate = {
  id: string;
  newStage: Stage;
};

export function KanbanBoard({ jobCandidates, jobs }: KanbanBoardProps) {
  const t = useTranslations();
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticCandidates, updateOptimisticCandidates] = useOptimistic(
    jobCandidates,
    (state: JobCandidate[], update: OptimisticUpdate) => {
      // Find the candidate being moved
      const movedCandidate = state.find((jc) => jc.id === update.id);
      if (!movedCandidate) return state;

      // Remove from current position and add to end with new stage
      // This ensures the candidate appears at the bottom of the new column
      const withoutMoved = state.filter((jc) => jc.id !== update.id);
      return [...withoutMoved, { ...movedCandidate, stage: update.newStage }];
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const jobCandidateId = active.id as string;
    const newStage = over.id as Stage;

    // Keep reference for potential future rollback on error
    const _originalCandidate = jobCandidates.find((jc) => jc.id === jobCandidateId);

    startTransition(async () => {
      updateOptimisticCandidates({ id: jobCandidateId, newStage });

      const result = await updateCandidateStage(jobCandidateId, newStage);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('kanban.stageUpdated'));
      }
    });
  }

  const filteredCandidates = useMemo(
    () => filterJobCandidates(optimisticCandidates, selectedJobId, searchQuery),
    [optimisticCandidates, selectedJobId, searchQuery]
  );

  const candidatesByStage = useMemo(
    () => groupByStage(filteredCandidates),
    [filteredCandidates]
  );

  const activeJobCandidate = useMemo(() => {
    if (!activeId) return null;
    return filteredCandidates.find((jc) => jc.id === activeId) || null;
  }, [activeId, filteredCandidates]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl glass-cyan border border-cyan-300/50 shadow-sm p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 sm:flex-none sm:w-48">
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                disabled={isPending}
                className="bg-white/50 border-cyan-200/50 backdrop-blur-sm"
              >
                <option value="all">{t('kanban.allJobs')}</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" />
            <Input
              placeholder={t('kanban.searchCandidates')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gradient-to-r from-white/50 via-cyan-50/30 to-blue-50/40 border-cyan-200/50 backdrop-blur-sm focus:border-cyan-400/50 focus:ring-cyan-400/30"
              disabled={isPending}
            />
            {isPending && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-cyan-500" />
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="bg-white/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/30">
              {filteredCandidates.length} {t('candidates.title').toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => setActiveId(event.active.id as string)}
      >
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={candidatesByStage[stage] || []}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeJobCandidate ? (
            <KanbanCard jobCandidate={activeJobCandidate} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

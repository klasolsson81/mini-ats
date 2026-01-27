'use client';

import { useState, useMemo, useOptimistic, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Filter } from 'lucide-react';
import { STAGE_ORDER, type Stage } from '@/lib/constants/stages';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
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
      return state.map((jc) =>
        jc.id === update.id ? { ...jc, stage: update.newStage } : jc
      );
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const jobCandidateId = active.id as string;
    const newStage = over.id as Stage;

    const originalCandidate = jobCandidates.find((jc) => jc.id === jobCandidateId);
    const originalStage = originalCandidate?.stage;

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

  const filteredCandidates = useMemo(() => {
    let filtered = optimisticCandidates;

    if (selectedJobId !== 'all') {
      filtered = filtered.filter((jc) => jc.job_id === selectedJobId);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((jc) =>
        jc.candidates.full_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [optimisticCandidates, selectedJobId, searchQuery]);

  const candidatesByStage = useMemo(() => {
    const grouped: Record<string, JobCandidate[]> = {};
    STAGE_ORDER.forEach((stage) => {
      grouped[stage] = [];
    });

    filteredCandidates.forEach((jc) => {
      if (grouped[jc.stage]) {
        grouped[jc.stage].push(jc);
      }
    });

    return grouped;
  }, [filteredCandidates]);

  const activeJobCandidate = useMemo(() => {
    if (!activeId) return null;
    return filteredCandidates.find((jc) => jc.id === activeId) || null;
  }, [activeId, filteredCandidates]);

  return (
    <div className="space-y-6">
      {/* Filters - Tech style */}
      <div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div className="w-48">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
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

'use client';

import { useState, useMemo, useOptimistic, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
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

  // Optimistic updates: UI updates instantly before server confirms
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
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const jobCandidateId = active.id as string;
    const newStage = over.id as Stage;

    // Find current stage for potential revert
    const originalCandidate = jobCandidates.find((jc) => jc.id === jobCandidateId);
    const originalStage = originalCandidate?.stage;

    // Optimistic update: update UI immediately
    startTransition(async () => {
      updateOptimisticCandidates({ id: jobCandidateId, newStage });

      // Sync with server in background
      const result = await updateCandidateStage(jobCandidateId, newStage);

      if (result.error) {
        // On error, revert happens automatically via re-render
        toast.error(result.error);
      } else {
        toast.success(t('kanban.stageUpdated'));
      }
    });
  }

  const filteredCandidates = useMemo(() => {
    let filtered = optimisticCandidates;

    // Filter by job
    if (selectedJobId !== 'all') {
      filtered = filtered.filter((jc) => jc.job_id === selectedJobId);
    }

    // Filter by search query (candidate name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((jc) =>
        jc.candidates.full_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [optimisticCandidates, selectedJobId, searchQuery]);

  // Group by stage
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

  // Find the active job candidate for DragOverlay
  const activeJobCandidate = useMemo(() => {
    if (!activeId) return null;
    return filteredCandidates.find((jc) => jc.id === activeId) || null;
  }, [activeId, filteredCandidates]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-64">
          <Select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={isPending}
          >
            <option value="all">{t('kanban.allJobs')}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('kanban.searchCandidates')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={isPending}
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-600" />
          )}
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

        {/* DragOverlay: Renders dragged card above everything */}
        <DragOverlay dropAnimation={null}>
          {activeJobCandidate ? (
            <KanbanCard jobCandidate={activeJobCandidate} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

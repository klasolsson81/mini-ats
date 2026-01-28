'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, Mail, Phone, Linkedin, Briefcase, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
}

interface JobCandidate {
  id: string;
  stage: string;
  jobs: Job | null;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  job_candidates: JobCandidate[];
}

interface CandidateSearchProps {
  candidates: Candidate[];
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

export function CandidateSearch({ candidates, jobs }: CandidateSearchProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Filter by search query (name, email, phone, notes)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.full_name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query)
      );
    }

    // Filter by job
    if (selectedJobId !== 'all') {
      filtered = filtered.filter((c) =>
        c.job_candidates.some((jc) => jc.jobs?.id === selectedJobId)
      );
    }

    // Filter by stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter((c) =>
        c.job_candidates.some((jc) => jc.stage === selectedStage)
      );
    }

    return filtered;
  }, [candidates, searchQuery, selectedJobId, selectedStage]);

  const stages = [
    'sourced',
    'applied',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected',
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl glass-cyan border border-cyan-300/50 shadow-sm p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" />
            <Input
              placeholder={t('search.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gradient-to-r from-white/50 via-cyan-50/30 to-blue-50/40 border-cyan-200/50 backdrop-blur-sm focus:border-cyan-400/50 focus:ring-cyan-400/30"
            />
          </div>

          {/* Job Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-500" />
            <Select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-48 bg-white/50 border-cyan-200/50"
            >
              <option value="all">{t('search.allJobs')}</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Stage Filter */}
          <div>
            <Select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-40 bg-white/50 border-cyan-200/50"
            >
              <option value="all">{t('search.allStages')}</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {t(`kanban.stages.${stage}`)}
                </option>
              ))}
            </Select>
          </div>

          {/* Result count */}
          <div className="text-sm text-gray-600 bg-white/50 px-3 py-1.5 rounded-lg border border-white/30">
            {filteredCandidates.length} {t('search.results')}
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredCandidates.length === 0 ? (
        <div className="rounded-2xl glass-cyan border border-cyan-300/50 shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {searchQuery ? t('search.noResults') : t('search.noSearchYet')}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {searchQuery ? t('search.tryDifferentSearch') : t('search.startTyping')}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map((candidate) => {
            const initials = candidate.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

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
                      <p className="text-xs text-gray-500">
                        {new Date(candidate.created_at).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  </div>

                  {/* Jobs and Stages */}
                  {candidate.job_candidates.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.job_candidates.map((jc) => (
                        <div key={jc.id} className="flex items-center gap-1">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                              STAGE_COLORS[jc.stage] || 'bg-gray-500'
                            }`}
                          >
                            {t(`kanban.stages.${jc.stage}`)}
                          </span>
                          {jc.jobs && (
                            <span className="text-xs text-gray-600 truncate max-w-[100px]">
                              {jc.jobs.title}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contact info */}
                  <div className="space-y-1.5 text-xs">
                    {candidate.email && (
                      <a
                        href={`mailto:${candidate.email}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-cyan-600"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{candidate.email}</span>
                      </a>
                    )}
                    {candidate.phone && (
                      <a
                        href={`tel:${candidate.phone}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-cyan-600"
                      >
                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{candidate.phone}</span>
                      </a>
                    )}
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span className="truncate">LinkedIn</span>
                      </a>
                    )}
                  </div>

                  {/* Notes preview */}
                  {candidate.notes && (
                    <p className="text-xs text-gray-500 line-clamp-2 bg-white/30 rounded-lg p-2">
                      {candidate.notes}
                    </p>
                  )}

                  {/* View in Kanban */}
                  <Link
                    href="/app/kanban"
                    className="block text-center text-xs text-cyan-600 hover:text-cyan-700 font-medium pt-2 border-t border-cyan-200/50"
                  >
                    <Briefcase className="w-3 h-3 inline mr-1" />
                    {t('search.viewInKanban')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

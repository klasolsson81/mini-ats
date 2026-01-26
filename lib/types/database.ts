import { Role } from '../constants/roles';
import { Stage } from '../constants/stages';
import { JobStatus } from '../constants/job-status';

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  role: Role;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Job {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: JobStatus;
  created_at: string;
  updated_at?: string;
}

export interface Candidate {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface JobCandidate {
  id: string;
  tenant_id: string;
  job_id: string;
  candidate_id: string;
  stage: Stage;
  created_at: string;
  updated_at?: string;
}

export interface CandidateWithJob extends Candidate {
  job_candidate: JobCandidate;
  job: Job;
}

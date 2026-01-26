-- Mini ATS Database Schema
-- Initial migration with full RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE job_status_type AS ENUM ('open', 'closed');
CREATE TYPE candidate_stage AS ENUM ('sourced', 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Tenants table (each customer company)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status job_status_type NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job candidates junction table (candidate attached to job with stage)
CREATE TABLE job_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  stage candidate_stage NOT NULL DEFAULT 'sourced',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_jobs_tenant_id ON jobs(tenant_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_candidates_tenant_id ON candidates(tenant_id);
CREATE INDEX idx_job_candidates_tenant_id ON job_candidates(tenant_id);
CREATE INDEX idx_job_candidates_job_id ON job_candidates(job_id);
CREATE INDEX idx_job_candidates_candidate_id ON job_candidates(candidate_id);
CREATE INDEX idx_job_candidates_stage ON job_candidates(stage);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to get current user ID
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- Function to get current user's tenant ID
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = current_user_id();
$$ LANGUAGE SQL STABLE;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = current_user_id()
    AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger to automatically update updated_at column
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_candidates_updated_at
  BEFORE UPDATE ON job_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_candidates ENABLE ROW LEVEL SECURITY;

-- Tenants policies
CREATE POLICY "Admins can view all tenants"
  ON tenants FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert tenants"
  ON tenants FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update tenants"
  ON tenants FOR UPDATE
  USING (is_admin());

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = current_user_id());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = current_user_id());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Jobs policies
CREATE POLICY "Users can view jobs in their tenant"
  ON jobs FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can insert jobs in their tenant"
  ON jobs FOR INSERT
  WITH CHECK (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can update jobs in their tenant"
  ON jobs FOR UPDATE
  USING (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can delete jobs in their tenant"
  ON jobs FOR DELETE
  USING (tenant_id = current_tenant_id() OR is_admin());

-- Candidates policies
CREATE POLICY "Users can view candidates in their tenant"
  ON candidates FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can insert candidates in their tenant"
  ON candidates FOR INSERT
  WITH CHECK (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can update candidates in their tenant"
  ON candidates FOR UPDATE
  USING (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can delete candidates in their tenant"
  ON candidates FOR DELETE
  USING (tenant_id = current_tenant_id() OR is_admin());

-- Job candidates policies
CREATE POLICY "Users can view job_candidates in their tenant"
  ON job_candidates FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can insert job_candidates in their tenant"
  ON job_candidates FOR INSERT
  WITH CHECK (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can update job_candidates in their tenant"
  ON job_candidates FOR UPDATE
  USING (tenant_id = current_tenant_id() OR is_admin());

CREATE POLICY "Users can delete job_candidates in their tenant"
  ON job_candidates FOR DELETE
  USING (tenant_id = current_tenant_id() OR is_admin());

-- =============================================================================
-- SEED DATA (for testing)
-- =============================================================================

-- Note: Admin users should be created via the admin panel or API
-- This is just a reference for the expected data structure

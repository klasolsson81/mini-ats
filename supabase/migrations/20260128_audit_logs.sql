-- Level 2 Audit Logging
-- Tracks user management, tenant management, and authentication events

-- =============================================================================
-- Create audit_logs table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'user.created', 'tenant.deleted', etc
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT, -- 'user', 'tenant', 'auth'
  target_id UUID,
  target_name TEXT, -- Human-readable name for display
  metadata JSONB DEFAULT '{}', -- Extra context (role, email, etc)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================================================
-- RLS Policies - Only admins can read audit logs
-- =============================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================================================
-- Event Types Reference
-- =============================================================================
-- User Management:
--   user.created       - Admin creates new user
--   user.deleted       - Admin deletes user (soft delete)
--   user.activated     - Admin activates user
--   user.deactivated   - Admin deactivates user
--   user.role_changed  - Admin changes user role
--
-- Tenant Management:
--   tenant.created     - Admin creates new tenant
--   tenant.deleted     - Admin deletes tenant
--   tenant.updated     - Admin updates tenant info
--
-- Authentication:
--   auth.password_changed - User changes password
--   auth.password_reset   - Password reset requested
--   auth.login_failed     - Failed login attempt
-- =============================================================================

-- Fix Supabase Security Warnings
-- Addresses function search_path and RLS policy issues

-- =============================================================================
-- FIX 1: Function Search Path Mutable
-- Set explicit search_path to prevent search_path injection attacks
-- =============================================================================

-- Fix update_last_login function
CREATE OR REPLACE FUNCTION public.update_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix current_user_id function
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE
SET search_path = public;

-- Fix current_tenant_id function (also needs fixing)
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = public.current_user_id();
$$ LANGUAGE SQL STABLE
SET search_path = public;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public;

-- Fix update_updated_at_column function (if it exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- =============================================================================
-- FIX 2: RLS Policy Always True for impersonation_logs
-- Make policies more restrictive - only admins can insert/update
-- =============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can insert impersonation logs" ON public.impersonation_logs;
DROP POLICY IF EXISTS "Service role can update impersonation logs" ON public.impersonation_logs;

-- Create more restrictive policies - only admins can insert/update
CREATE POLICY "Admins can insert impersonation logs"
ON public.impersonation_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update their own impersonation logs"
ON public.impersonation_logs
FOR UPDATE
TO authenticated
USING (
  admin_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  admin_id = auth.uid()
);

-- =============================================================================
-- Note: auth_leaked_password_protection
-- This is a Supabase Dashboard setting, not a SQL fix.
-- Go to: Dashboard > Authentication > Settings > Password > Enable "Leaked Password Protection"
-- =============================================================================

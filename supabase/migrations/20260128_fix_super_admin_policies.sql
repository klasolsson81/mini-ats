-- Fix RLS policies to include super_admin role
-- The previous policies only checked for 'admin' role, excluding 'super_admin'

-- =============================================================================
-- FIX 1: Update is_admin() function to include super_admin
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public;

-- =============================================================================
-- FIX 2: Update impersonation_logs SELECT policy
-- =============================================================================

DROP POLICY IF EXISTS "Admins can view all impersonation logs" ON public.impersonation_logs;

CREATE POLICY "Admins can view all impersonation logs"
ON public.impersonation_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- =============================================================================
-- FIX 3: Update impersonation_logs INSERT policy
-- =============================================================================

DROP POLICY IF EXISTS "Admins can insert impersonation logs" ON public.impersonation_logs;

CREATE POLICY "Admins can insert impersonation logs"
ON public.impersonation_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- =============================================================================
-- FIX 4: Update impersonation_logs UPDATE policy
-- =============================================================================

DROP POLICY IF EXISTS "Admins can update their own impersonation logs" ON public.impersonation_logs;

CREATE POLICY "Admins can update their own impersonation logs"
ON public.impersonation_logs
FOR UPDATE
TO authenticated
USING (
  admin_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  admin_id = auth.uid()
);

-- Add comment
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user has admin or super_admin role';

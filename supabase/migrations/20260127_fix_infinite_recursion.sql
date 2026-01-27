-- =============================================================================
-- FIX INFINITE RECURSION IN is_admin() AND current_tenant_id()
-- =============================================================================
-- Problem: RLS policies call is_admin() which reads profiles,
-- which triggers RLS policies again, causing infinite recursion
--
-- Solution: Make these functions use SECURITY DEFINER to bypass RLS
-- =============================================================================

-- Fix is_admin() to bypass RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION is_admin() IS
'Checks if current user has admin role. Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion.';

-- Fix current_tenant_id() to bypass RLS
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION current_tenant_id() IS
'Returns tenant_id for current user. Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion.';

-- current_user_id() doesn't need fixing as it doesn't read from profiles
-- But let's add a comment for clarity
COMMENT ON FUNCTION current_user_id() IS
'Returns current authenticated user ID from auth.uid(). Does not trigger RLS.';

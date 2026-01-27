-- =============================================================================
-- VERIFY AND CLEANUP SCRIPT
-- Run this to check for orphaned profiles and clean up test accounts
-- =============================================================================

-- 1. Check for any zeback_ accounts
SELECT 'Checking for zeback_ accounts...' as status;
SELECT * FROM profiles WHERE email LIKE '%zeback_%';
SELECT * FROM auth.users WHERE email LIKE '%zeback_%';

-- 2. Clean up any orphaned profiles (profiles without auth.users)
SELECT 'Checking for orphaned profiles...' as status;
SELECT p.*
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- 3. Clean up any users without profiles (auth.users without profiles)
SELECT 'Checking for auth users without profiles...' as status;
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. If you need to DELETE zeback_ accounts, uncomment these:
-- DELETE FROM profiles WHERE email LIKE '%zeback_%';
-- DELETE FROM auth.users WHERE email LIKE '%zeback_%';

-- 5. Verify admin profiles have correct role
SELECT 'Verifying admin profiles...' as status;
SELECT id, email, role, tenant_id, must_change_password
FROM profiles
WHERE role = 'admin';

-- 6. Test is_admin() function for a specific email
-- Replace 'zeback_@hotmail.com' with the email you want to test
SELECT 'Testing is_admin() function...' as status;
SELECT
  p.email,
  p.role,
  (SELECT is_admin() FROM profiles WHERE id = p.id LIMIT 1) as is_admin_result
FROM profiles p
WHERE p.email = 'zeback_@hotmail.com';

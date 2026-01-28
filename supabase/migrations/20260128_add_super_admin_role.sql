-- Add super_admin role support
-- Super admins cannot be deleted or deactivated by regular admins

-- Update Klas Olsson to super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'klasolsson81@gmail.com';

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: super_admin (owner, cannot be deleted), admin (can manage), customer (tenant user)';

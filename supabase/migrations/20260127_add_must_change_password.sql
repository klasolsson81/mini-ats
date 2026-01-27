-- Add must_change_password column to profiles table
-- Users created by admin will be forced to change password on first login

ALTER TABLE profiles
ADD COLUMN must_change_password BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.must_change_password IS 'Forces user to change password on first login (for admin-created accounts)';

-- Update existing admin-created accounts (optional, for safety keep false by default)
-- UPDATE profiles SET must_change_password = false WHERE must_change_password IS NULL;

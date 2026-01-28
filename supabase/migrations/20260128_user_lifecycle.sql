-- User Lifecycle Management Migration
-- Adds is_active and last_login_at columns to profiles

-- Add is_active column (default TRUE for existing users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Add last_login_at column (nullable, updated on each login)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create index for active users filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Comment on columns
COMMENT ON COLUMN profiles.is_active IS 'Whether the user account is active. Inactive users cannot log in.';
COMMENT ON COLUMN profiles.last_login_at IS 'Timestamp of the users last successful login.';

-- Function to update last login timestamp
-- This should be called after successful login
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (for login tracking)
GRANT EXECUTE ON FUNCTION update_last_login(UUID) TO authenticated;

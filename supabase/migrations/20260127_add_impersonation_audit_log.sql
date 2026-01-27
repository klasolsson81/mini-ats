-- Create impersonation audit log table
CREATE TABLE IF NOT EXISTS impersonation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_impersonation_logs_admin_id ON impersonation_logs(admin_id);
CREATE INDEX idx_impersonation_logs_tenant_id ON impersonation_logs(tenant_id);
CREATE INDEX idx_impersonation_logs_started_at ON impersonation_logs(started_at DESC);

-- Add RLS policies
ALTER TABLE impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all impersonation logs"
  ON impersonation_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only system (service role) can insert logs
CREATE POLICY "Service role can insert impersonation logs"
  ON impersonation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only system (service role) can update logs
CREATE POLICY "Service role can update impersonation logs"
  ON impersonation_logs
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add comment
COMMENT ON TABLE impersonation_logs IS 'Audit log for admin impersonation of tenant accounts';

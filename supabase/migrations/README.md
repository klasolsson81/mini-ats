# Database Migrations

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for this project)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and run in SQL Editor

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all pending migrations
supabase db push
```

## Current Migrations

### 20260127_add_impersonation_audit_log.sql

**Purpose:** Add audit logging for admin impersonation

**What it does:**
- Creates `impersonation_logs` table
- Stores: admin_id, tenant_id, started_at, ended_at, ip_address, user_agent
- Adds indexes for performance
- Sets up RLS policies (admins can view, service role can insert/update)

**Run this migration:**

```sql
-- Copy and paste the entire content of:
-- supabase/migrations/20260127_add_impersonation_audit_log.sql
-- into Supabase SQL Editor and run
```

**Verify migration:**

```sql
-- Check if table was created
SELECT * FROM impersonation_logs LIMIT 1;

-- Check if indexes exist
SELECT indexname FROM pg_indexes WHERE tablename = 'impersonation_logs';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'impersonation_logs';
```

## Migration Status

- ✅ `20260127_add_impersonation_audit_log.sql` - Ready to run
- ⏳ No other migrations pending

## Notes

- Always test migrations in a development environment first
- Backup your database before running migrations in production
- RLS policies ensure only admins can view audit logs
- Service role (backend) can write to audit logs

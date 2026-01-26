# Supabase Database Setup

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for MVP)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/20260126000000_initial_schema.sql`
4. Paste and run the SQL

### Option 2: Using Supabase CLI (For production)
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Database Schema Overview

### Tables
- **tenants**: Customer companies/organizations
- **profiles**: User profiles (extends auth.users)
- **jobs**: Job postings
- **candidates**: Candidate information
- **job_candidates**: Junction table linking candidates to jobs with stage info

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Allow admins to access all data across all tenants
- Restrict customers to only their tenant's data
- Enforce tenant isolation at the database level

### Helper Functions
- `current_user_id()`: Returns the authenticated user's ID
- `current_tenant_id()`: Returns the current user's tenant ID
- `is_admin()`: Checks if the current user has admin role

## Creating the First Admin User

After running the migration, you need to create an admin user manually:

1. **Create auth user** via Supabase Dashboard (Authentication > Users)
2. **Create profile** via SQL Editor:

```sql
-- Replace with actual user ID from auth.users
INSERT INTO profiles (id, tenant_id, role, full_name, email)
VALUES (
  'USER_ID_FROM_AUTH',
  NULL,  -- Admin users don't belong to a tenant
  'admin',
  'Admin Name',
  'admin@example.com'
);
```

## Verifying RLS Policies

Test that tenant isolation works:

```sql
-- As customer user, should only see own tenant data
SELECT * FROM jobs;

-- As admin, should see all data
SELECT * FROM jobs;
```

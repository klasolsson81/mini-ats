# Mini ATS

A modern, multi-tenant Applicant Tracking System built for recruitment teams.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Live Demo:** [mini-ats-jade.vercel.app](https://mini-ats-jade.vercel.app)

---

## Overview

Mini ATS is a complete applicant tracking system designed for small to medium businesses. It features a modern glassmorphism UI, drag-and-drop Kanban board, multi-tenant architecture with complete data isolation, and comprehensive admin tools.

### Key Features

- **Kanban Pipeline** - Drag-and-drop candidates through 7 recruitment stages
- **Multi-tenant** - Complete data isolation between customers using Row-Level Security
- **Admin Portal** - Separate admin experience with tenant management and audit logging
- **Internationalization** - Swedish and English with easy extensibility
- **GDPR Compliant** - Privacy policy, cookie policy, audit logging

---

## Screenshots

| Dashboard | Kanban Board |
|-----------|--------------|
| Platform KPIs and quick actions | Drag-and-drop pipeline management |

| Admin Portal | Audit Logs |
|--------------|------------|
| Tenant and user management | Track all admin activity |

---

## Features

### For Customers

| Feature | Description |
|---------|-------------|
| **Dashboard** | KPI cards, quick actions, pipeline stats, recent activity |
| **Jobs Management** | Create, edit, delete job postings with status tracking |
| **Candidates** | Manage candidate profiles with LinkedIn integration |
| **Kanban Board** | Drag-and-drop pipeline with 7 stages and instant updates |
| **Search** | Full-text search across candidates with job/stage filters |
| **Filtering** | Filter by job and candidate name |

### For Admins

| Feature | Description |
|---------|-------------|
| **Admin Portal** | Dedicated admin dashboard with platform KPIs |
| **Tenant Management** | Create tenants, view stats, add users |
| **User Management** | View all users, bulk activate/deactivate |
| **Impersonation** | Act as any customer for support with full audit trail |
| **Audit Logging** | Track all impersonation sessions and admin actions |

### Technical

| Feature | Description |
|---------|-------------|
| **Multi-tenant RLS** | Row-Level Security with `is_admin()` and `current_tenant_id()` |
| **Optimistic Updates** | Instant UI feedback with background sync |
| **Type Safety** | Full TypeScript with Zod validation |
| **i18n** | next-intl with Swedish and English |
| **Glass UI** | Modern glassmorphism design system |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Styling | TailwindCSS |
| Validation | Zod |
| i18n | next-intl |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Toasts | Sonner |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account ([supabase.com](https://supabase.com))

### Installation

```bash
# Clone repository
git clone https://github.com/klasolsson81/mini-ats.git
cd mini-ats

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run migrations (see supabase/migrations/README.md)

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Create First Admin

1. Create user in Supabase Dashboard → Authentication → Users
2. Run SQL in Supabase SQL Editor:

```sql
INSERT INTO profiles (id, tenant_id, role, full_name, email)
VALUES ('USER_ID', NULL, 'admin', 'Admin Name', 'admin@example.com');
```

---

## Project Structure

```
mini-ats/
├── app/                    # Next.js App Router
│   ├── app/               # Protected routes
│   │   ├── admin/         # Admin portal
│   │   ├── jobs/          # Job management
│   │   ├── candidates/    # Candidate management
│   │   ├── kanban/        # Kanban board
│   │   ├── search/        # Candidate search
│   │   └── settings/      # User settings
│   └── api/               # API routes
├── components/            # Shared UI components
│   └── ui/               # Base components
├── features/             # Feature components
│   ├── admin/            # Admin forms
│   ├── candidates/       # Candidate components
│   ├── dashboard/        # Dashboard widgets
│   ├── jobs/             # Job components
│   ├── kanban/           # Kanban components
│   └── search/           # Search components
├── lib/                  # Core logic
│   ├── actions/          # Server Actions
│   ├── supabase/         # Database clients
│   └── utils/            # Helpers
├── messages/             # Translations (sv, en)
├── docs/                 # Documentation
└── supabase/             # Database migrations
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `tenants` | Customer organizations |
| `profiles` | User profiles with roles |
| `jobs` | Job postings |
| `candidates` | Candidate profiles |
| `job_candidates` | Pipeline assignments |

### Audit Tables

| Table | Description |
|-------|-------------|
| `impersonation_logs` | Admin impersonation sessions |
| `audit_logs` | User/tenant management events |

### Kanban Stages

1. **Sourced** - Initial outreach
2. **Applied** - Application received
3. **Screening** - Initial review
4. **Interview** - Interview process
5. **Offer** - Offer extended
6. **Hired** - Successfully hired
7. **Rejected** - Not proceeding

---

## Security

### Row-Level Security

All tables enforce RLS with helper functions:

- `current_user_id()` - Authenticated user ID
- `current_tenant_id()` - User's tenant ID
- `is_admin()` - Admin role check (SECURITY DEFINER)

### Authentication

- Email/password via Supabase Auth
- Force password change on first login
- Rate limiting (5 attempts / 15 min)
- Secure session management

### Audit Logging

**Impersonation Logs:**
- Admin ID, tenant ID, timestamps
- IP address and user agent
- Session duration

**Audit Logs:**
- User created/deleted/activated/deactivated
- Bulk user operations
- Tenant creation
- Password changes

### GDPR Compliance

- Privacy Policy with admin access disclosure
- Cookie Policy
- Minimal data collection
- EU data storage

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

### Smoke Test Checklist

- [ ] Login as admin works
- [ ] Login as customer works
- [ ] Create job works
- [ ] Create candidate works
- [ ] Kanban drag & drop works
- [ ] Admin impersonation works
- [ ] Audit logs visible
- [ ] Tenant isolation enforced

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Post-Deployment

1. Run all database migrations
2. Create first admin user
3. Test impersonation and audit logs
4. Verify RLS policies
5. Check translations load correctly

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

---

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | Build instructions |
| [docs/SECURITY.md](docs/SECURITY.md) | Security best practices |
| [docs/TODO.md](docs/TODO.md) | Feature roadmap |
| [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) | Known limitations |
| [docs/CODEREVIEW.md](docs/CODEREVIEW.md) | Code review summary |
| [docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md) | Pre-deployment checklist |

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@devotion.ventures | admin123 |
| Customer | customer@devco.se | customer123 |

---

## Author

**Klas Olsson**

- Portfolio: [klasolsson.se](https://klasolsson.se)
- GitHub: [@klasolsson81](https://github.com/klasolsson81)
- LinkedIn: [klasolsson81](https://www.linkedin.com/in/klasolsson81/)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Status

| Component | Status |
|-----------|--------|
| Core Features | ✅ Complete |
| Multi-tenant RLS | ✅ Production Ready |
| Admin Portal | ✅ Complete |
| Audit Logging | ✅ Level 1 & 2 |
| i18n (SV/EN) | ✅ Complete |
| Testing | ✅ Unit + E2E |
| Documentation | ✅ Complete |

**Version:** 1.0.0

---

*Built with [Claude Code](https://claude.ai/claude-code)*

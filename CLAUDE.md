# CLAUDE.md — Mini-ATS Build Instructions

You are Claude Code assisting with the Mini ATS (Applicant Tracking System) project.
Goal: Maintain and improve a production-ready multi-tenant ATS.

---

## Tech Stack

### Frontend
- **Next.js 16 (App Router) + TypeScript**
- **TailwindCSS** with glassmorphism design system
- **next-intl** for i18n (Swedish + English)
- Component pattern: `features/*` for feature-specific, `components/ui/*` for shared

### Backend
- **Supabase Auth + Postgres**
- **Row-Level Security (RLS)** for multi-tenant isolation
- Server Actions for all mutations (`lib/actions/`)

### Testing
- Unit tests: **Vitest** (`npm run test`)
- E2E tests: **Playwright** (`npm run test:e2e`)

### Deployment
- **Vercel** for frontend (auto-deploy from GitHub)
- **Supabase** hosted backend

---

## Architecture Rules

### Code Quality
- TypeScript strict mode - no `any` types
- Single responsibility principle - small focused functions/components
- Pure functions for logic, side-effects at boundaries
- Explicit names: `createJob`, `getCandidatesByJob`, `updateCandidateStage`
- No dead code, no commented-out code blocks

### Error Handling
- No silent failures
- Always show user feedback: loading, success, error states
- Validate forms on client + enforce constraints server-side

### Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Use RLS to enforce tenant boundaries
- All admin operations server-side only

---

## Internationalization (Critical)

**NEVER hardcode user-facing text.** All text must come from translation files.

```tsx
// BAD
<h1>Kandidater</h1>
toast.success('Skapad!');

// GOOD
<h1>{t('candidates.title')}</h1>
toast.success(t('candidates.candidateCreated'));
```

Translation files: `messages/sv.json` and `messages/en.json`

---

## UI/UX Standards

### Color Contrast (WCAG AA)
- Labels: `text-gray-900 font-semibold`
- Body text: `text-gray-700` minimum
- Subtitles: `text-gray-600`

### Visual Hierarchy
- H1: `text-4xl font-bold` with gradient text
- Section headers: `text-lg font-semibold text-gray-900`
- Form labels: `text-sm font-semibold text-gray-900`

### Design System
- Glass cards: `glass`, `glass-blue`, `glass-emerald`, `glass-cyan`, `glass-purple`
- Rounded corners: `rounded-2xl` for cards, `rounded-xl` for buttons
- Borders: `border-white/30` for glass panels

---

## Project Structure

```
mini-ats/
├── app/                    # Next.js App Router
│   ├── app/               # Protected routes (/app/*)
│   │   ├── admin/         # Admin portal (tenants, users, logs)
│   │   ├── jobs/          # Customer job management
│   │   ├── candidates/    # Customer candidate management
│   │   ├── kanban/        # Kanban board
│   │   └── search/        # Candidate search
│   └── api/               # API routes (admin operations)
├── components/            # Shared UI components
├── features/             # Feature-specific components
├── lib/                  # Shared logic
│   ├── actions/          # Server Actions
│   ├── supabase/         # DB client
│   └── utils/            # Helpers
├── messages/             # i18n translations (sv.json, en.json)
└── docs/                 # Documentation
```

---

## Database Schema

### Core Tables
- `tenants` - Multi-tenant isolation root
- `profiles` - User metadata + role (admin/customer)
- `jobs` - Tenant-scoped job postings
- `candidates` - Tenant-scoped candidate pool
- `job_candidates` - M2M join with stage tracking

### Audit Tables
- `impersonation_logs` - Admin impersonation sessions
- `audit_logs` - User/tenant management events

### Kanban Stages
`sourced` → `applied` → `screening` → `interview` → `offer` → `hired` / `rejected`

---

## Admin vs Customer Portal

The app has separate navigation for admin and customer users:

**Admin Portal** (when not impersonating):
- Dashboard with platform stats
- Tenant management
- User management
- Audit logs

**Customer Portal** (customers + impersonating admins):
- Dashboard with tenant stats
- Kanban board
- Jobs management
- Candidates management
- Search

---

## Demo Accounts

- **Admin:** admin@devotion.ventures / admin123
- **Customer:** customer@devco.se / customer123

---

## Documentation

Additional documentation in `docs/` folder:
- `CODEREVIEW.md` - Code review findings
- `FINAL_CHECKLIST.md` - Pre-deployment checklist
- `KNOWN_ISSUES.md` - Known limitations
- `SECURITY.md` - Security best practices
- `TODO.md` - Feature roadmap

---

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
```

---

## Making Changes

1. Follow existing patterns in the codebase
2. Add translations before using text
3. Use Server Actions for mutations
4. Test RLS policies with both admin and customer users
5. Run `npm run lint` before committing

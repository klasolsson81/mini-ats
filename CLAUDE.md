# CLAUDE.md — Mini-ATS (Devotion Ventures) — Build Instructions

You are Claude Code assisting with building a production-ready MVP "mini-ATS" (Applicant Tracking System).
Goal: ship a usable first version fast, then iterate. Prioritize correctness, security, maintainability, and product polish.

---

## 0) Prime Directive (Most Important)
**Ship a working, stable MVP in 48 hours**, deployed and testable by a real customer, then improve it throughout the week.
If a decision is unclear, make a reasonable assumption, document it in `README.md` under **Assumptions**, and proceed.

---

## 1) Product Brief (Original Assignment)
Build a mini-ATS that can be live for a first customer ASAP.

### Core features
- As **Admin**, I can create accounts (admin accounts & customer accounts)
- As **Customer**, I can log in
- As **Customer**, I can post jobs I’m hiring for
- As **Customer**, I can add candidates with profile info (e.g., LinkedIn link)
- As **Customer**, I can see a compact Kanban view of all candidates
- As **Customer**, I can filter the Kanban view by job & candidate name
- As **Admin**, I can do everything a customer can do, on their behalf

### Guidelines
- Use **Supabase** as backend (auth + DB)
- Develop as much as possible with AI tools (Claude Code/Cursor/Lovable etc.)
- Make reasonable assumptions about customers / needs
- If time remains, add extra ATS features

### Delivery
- Share **admin login** with Gabriel (+ CC)
- Record a **~5 min Loom demo**
- Email assumptions / scope decisions
- Ship often (multiple deliveries OK)

### Deadline
- 1 week

---

## 2) Tech Stack (Recommended)
Use what is fastest to ship while staying professional.

### Frontend
- **Next.js (App Router) + TypeScript**
- TailwindCSS for quick UI (optional but recommended)
- Component pattern: `features/*` + shared UI components

### Backend
- **Supabase Auth + Postgres**
- **Row-Level Security (RLS)** for multi-tenant isolation
- Supabase Storage (optional, e.g., resume uploads later)

### Testing
- Unit tests: **Vitest**
- E2E tests: **Playwright**
- Lint/format: **ESLint + Prettier**

### Deployment
- **Vercel** for frontend
- Supabase hosted backend

---

## 3) Architecture Rules (Non-negotiable)
### Clean Code & Maintainability
- Use **single responsibility principle (SRP)**: small focused functions/components.
- Prefer **pure functions** for logic and keep side-effects at boundaries.
- Keep files small and readable. Refactor early.
- Use explicit names: `createJob`, `getCandidatesByJob`, `updateCandidateStage`.
- Avoid “magic strings”. Use enums/consts for stages/roles.
- No dead code. No commented-out code blocks.

### Code Comments (Important)
Write comments that explain **why** or clarify behavior, not conversation history.
✅ Good: `// Validates that the candidate belongs to the current tenant before updating stage`
❌ Bad: `// Added this because you said so`

### Error Handling & UX
- No silent failures.
- Always show user feedback: loading, success, error states.
- Validate forms on client + enforce constraints server-side.

### Security
- Never expose Supabase **service role key** to the client.
- Use **RLS** to enforce tenant boundaries.
- Enforce role-based access: customer vs admin.
- Prevent insecure direct object references (IDOR) using RLS + scoped queries.

---

## 4) Core Domain Model (Data Design)
This is a B2B multi-tenant system: each customer is a **tenant**.

### Roles
- `admin` (can act on behalf of any tenant)
- `customer` (restricted to own tenant)

### Suggested tables (Supabase Postgres)
Use UUID PKs and `created_at`, `updated_at`.

#### `tenants`
- `id` (uuid, pk)
- `name` (text)
- `created_at`

#### `profiles`
- `id` (uuid, pk, same as auth.users.id)
- `tenant_id` (uuid, fk tenants.id, nullable for platform admins if needed)
- `role` (text enum: 'admin' | 'customer')
- `full_name` (text)
- `email` (text)
- `created_at`

#### `jobs`
- `id` (uuid, pk)
- `tenant_id` (uuid, fk tenants.id)
- `title` (text)
- `description` (text)
- `status` (text: 'open' | 'closed')
- `created_at`

#### `candidates`
- `id` (uuid, pk)
- `tenant_id` (uuid)
- `full_name` (text)
- `email` (text, nullable)
- `phone` (text, nullable)
- `linkedin_url` (text, nullable)
- `notes` (text, nullable)
- `created_at`

#### `job_candidates`
Join table connecting candidates to a job + stage.
- `id` (uuid, pk)
- `tenant_id` (uuid)
- `job_id` (uuid, fk jobs.id)
- `candidate_id` (uuid, fk candidates.id)
- `stage` (text enum; see Kanban stages below)
- `created_at`

### Kanban Stages (MVP)
Use a fixed set for simplicity:
- `sourced`
- `applied`
- `screening`
- `interview`
- `offer`
- `hired`
- `rejected`

---

## 5) Auth + Permissions (Supabase)
### Supabase Auth
- Email/password auth is enough for MVP.
- Create accounts for customers via **admin-only server endpoint** or **Supabase Edge Function** using service role (server-side only).

### RLS Policies (Mandatory)
All tenant-owned tables must enforce:
- Customers: access rows where `tenant_id = profile.tenant_id`
- Admin: can access all tenants

Preferred approach:
- Create a Postgres function `is_admin()` reading `profiles.role`.
- Policies:
  - `SELECT/INSERT/UPDATE/DELETE` allowed if `is_admin()` OR `tenant_id = current_tenant_id()`

Implement helper SQL functions:
- `current_user_id()` from auth
- `current_tenant_id()` from `profiles.tenant_id`
- `is_admin()` from `profiles.role`

Document RLS in `README.md`.

---

## 6) App Pages & UX (MVP Scope)
### Public
- `/login` (SV/EN)

### Customer area (protected)
- `/app` (dashboard overview)
- `/app/jobs` list + create/edit
- `/app/candidates` list + create/edit
- `/app/kanban` compact Kanban (default view)

### Admin area (protected)
- `/admin/users` create customer accounts (tenant + login)
- `/admin/impersonate` choose tenant to act as (optional but good)
- Admin can access the same customer pages while impersonating a tenant

### Kanban UI (Compact)
- Columns by stage
- Candidate cards show: name, job title, LinkedIn icon/link
- Quick move stage: drag & drop OR stage dropdown (dropdown is enough for MVP)
- Filters:
  - by job (`job_id`)
  - by candidate name search (contains match)

---

## 7) MVP Build Checklist (No Bugs / Customer-Ready)
**Definition of MVP Done (v0.1):**
- [ ] Login works (customer + admin)
- [ ] Customer can create a job
- [ ] Customer can create a candidate with LinkedIn link
- [ ] Customer can attach candidate to a job + stage
- [ ] Kanban displays all candidates grouped by stage
- [ ] Filtering works (job + name)
- [ ] Admin can create customer accounts (server-side secure)
- [ ] Multi-tenant isolation is enforced with RLS (critical)
- [ ] All forms validated (required fields)
- [ ] Empty states + loading states + error states everywhere
- [ ] No console errors in browser
- [ ] Deployed on Vercel and usable via live URL
- [ ] README contains setup + assumptions

**MVP smoke tests (manual + automated):**
- [ ] Customer A cannot see Customer B data
- [ ] Admin can see both
- [ ] Job creation -> candidate creation -> appears on kanban
- [ ] Filter works correctly
- [ ] Update stage works and persists

---

## 8) Extended Features (Only after MVP is stable)
Add features that increase product value quickly.

### “Impressive but realistic” extensions
- [ ] Drag & drop Kanban
- [ ] Candidate timeline / activity log
- [ ] Notes per candidate & per stage changes
- [ ] Job pipeline metrics (count per stage)
- [ ] Invite additional customer users under same tenant
- [ ] CSV import candidates
- [ ] Basic search page for candidates
- [ ] Audit log for admin actions (minimal)

### UI/UX polish
- [ ] Responsive layout for laptop/tablet
- [ ] Toast notifications
- [ ] Keyboard-friendly forms
- [ ] Better spacing/typography
- [ ] Dark mode (optional)

---

## 9) Internationalization (Multi-language)
The product must support at least:
- Swedish (`sv`)
- English (`en`)
And be structured to add more languages easily.

### Requirements
- All user-facing text MUST come from translation files.
- Provide a simple language switcher in the UI.
- Default language: Swedish.
- Use a proven library (recommended: `next-intl`).

### Optional (future language placeholder)
Add folder structure for more languages (e.g. `tr` or `ar`) even if translations are partial.

---

## 10) GDPR, Cookies & Privacy (EU/Sweden)
We must be privacy-first. Keep compliance lightweight but correct.

### Principles
- Store only necessary data (data minimization).
- No tracking/analytics by default.
- Provide clear privacy information and user rights guidance.

### Must-have pages (MVP)
- `/privacy` (Privacy Policy)
- `/cookies` (Cookie Policy)
- Link them in footer.

### Cookie Consent
- If NO non-essential cookies are used: display a minimal notice or no banner.
- If analytics or marketing cookies are added: implement a consent banner with **Accept / Reject** and a preferences page.

### Data Subject Rights (MVP-ready)
Provide instructions in Privacy Policy for:
- Access request
- Data export
- Deletion request (account/candidate data)
Even if automated flows are not implemented, document the process.

### Security practices
- Use RLS for access control.
- Avoid storing sensitive personal data.
- Use HTTPS (Vercel default).
- Sanitize user-generated content where needed.

> Note: This is not legal advice, but implement best-practice compliance.

---

## 11) Testing Strategy (Professional Minimum)
### Unit tests (Vitest)
- [ ] Candidate stage transitions validation
- [ ] Filtering logic (job + name)
- [ ] Access control helpers (role checks)

### E2E tests (Playwright)
- [ ] Login as customer
- [ ] Create job
- [ ] Create candidate
- [ ] Candidate appears in kanban
- [ ] Filter works
- [ ] Customer isolation (Customer B cannot see A’s data)

### CI (optional)
- GitHub Actions: run lint + tests on push

---

## 12) Build Process (How You Should Work)
### Step 1 — Scaffold + Auth (1–2 hours)
- Create Next.js app
- Setup Supabase client
- Create auth pages
- Protect routes

### Step 2 — Database + RLS (2–4 hours)
- Create tables
- Setup RLS policies
- Ensure tenant isolation works

### Step 3 — Core CRUD (4–8 hours)
- Jobs CRUD
- Candidates CRUD
- JobCandidates + stage updates

### Step 4 — Kanban + Filters (2–6 hours)
- Compact view
- Filters
- Update stage

### Step 5 — Admin Create Accounts (2–6 hours)
- Secure server function to create user + tenant + profile

### Step 6 — Polish + Tests + Docs (rest of week)
- Fix edge cases
- Add tests
- Improve UX
- Add privacy/cookie pages
- i18n finalize

---

## 13) Deliverables (Must be easy to evaluate)
Prepare final delivery package:

### Links
- Live URL (Vercel)
- GitHub repo
- Loom demo link (~5 minutes)

### Admin login
- Provide email + password OR instruct “reset password”
- Include 1–2 customer demo accounts too

### Email content
- Assumptions + scope tradeoffs
- What you would build next

---

## 14) Output Quality Requirements
When generating code, always ensure:
- TypeScript strict and no `any` unless justified.
- No TODOs left without explanation.
- Functions are small and named clearly.
- Components are readable and split by responsibility.
- Comments explain behavior, not chat history.
- Run formatting and tests before considering a task done.

**Before finalizing any feature:**
1) Run `npm run lint`
2) Run `npm test` (unit)
3) Run Playwright tests (if available)
4) Manual smoke test in browser

---

## 15) Assumptions Template (Add to README)
When you make assumptions, record them like this:

- Tenant model: One company = one tenant
- One candidate can belong to multiple jobs (supported via join table)
- Stages are fixed in MVP
- Email invites are out-of-scope for MVP
- No analytics cookies in MVP

---

## 16) “If You’re Unsure” Rule
If a requirement is ambiguous:
- Decide quickly
- Implement the simplest viable solution
- Document in README
- Keep code flexible for later changes

---

## 17) Definition of Done (Final)
A feature is done only if:
- It works end-to-end
- It respects tenant access rules
- It has error handling + validation
- It’s tested (unit or e2e where appropriate)
- It’s translated (sv/en)
- It’s deployed and demoable

---

**Now build the MVP. Ship it fast. Then iterate.**

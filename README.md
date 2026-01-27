# Mini ATS - Applicant Tracking System

A modern, multi-tenant Applicant Tracking System built with Next.js, TypeScript, Supabase, and TailwindCSS.

![Mini ATS](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📦 MVP v0.1 – First Delivery

### Purpose

A functional MVP demonstrating end-to-end flow for a simple ATS: manage jobs, candidates, and pipeline (Kanban), with multi-tenant architecture and admin capabilities.

### Included in Delivery (Complete & Working)

#### ✅ Authentication & Roles
- Admin users and customer users with role-based access control
- Secure session management with Supabase Auth

#### ✅ Multi-tenant Data Model
- Tenant concept (customer/organization) with user ↔ tenant relationships
- Row Level Security (RLS) for complete data isolation between customers
- Helper functions: `current_user_id()`, `current_tenant_id()`, `is_admin()`

#### ✅ Kanban / Recruitment Pipeline
- Move candidates between stages (7 stages: Sourced → Hired/Rejected)
- **Drag & drop functionality** with visual feedback
- Filter by job + search field for candidates
- Responsive grid layout (1-7 columns)

#### ✅ Jobs
- List and manage jobs (create/update/delete with UI support)
- Status tracking (open/closed)
- Full CRUD operations

#### ✅ Candidates
- List and manage candidates (create/update/delete with UI support)
- Attach candidates to jobs/pipeline
- LinkedIn profile links, contact info, notes

#### ✅ Admin Panel
- **Create admins** and **create new customers + first user**
- **"Impersonation"** - Act as customer for testing/support
  - Visual banner when impersonating
  - Hidden admin panel (true customer view)
  - Automatic audit logging
- **Tenant management**
  - Clickable tenant cards with detail pages
  - View tenant statistics (jobs, candidates, pipeline)
  - Add additional users to existing tenants
- **User management**
  - View all users (admins + customers)
  - Filter by tenant
- **Audit logs UI**
  - View all impersonation sessions
  - Track who, when, which customer, IP address
  - Active session indicators

#### ✅ Security & Compliance
- **Audit logging (Level 1)** - Production-ready
  - Automatic logging of admin impersonation
  - Database table: `impersonation_logs`
  - RLS policies (only admins can view)
  - Admin UI at `/app/admin/audit-logs`
- **Operation restrictions**
  - Framework to prevent sensitive operations during impersonation
  - Documentation: `lib/utils/RESTRICTIONS_README.md`
- **GDPR compliance**
  - Privacy Policy with admin access disclosure
  - Cookie Policy
  - Minimal data collection
  - EU data storage

#### ✅ International Interface
- Swedish/English UI support (switch in sidebar)
- next-intl implementation
- All UI text translated (zero hardcoded strings)

### Known Limitations in v0.1 (Intentional MVP Choices)

**Design & Polish:**
- UI is functional but not final-polished (layout/spacing refined in next iteration)
- Focus on working flow and correct data handling

**User Management:**
- No user activation/deactivation yet
- No user deletion UI yet
- No last login tracking yet

**Audit Logging:**
- Level 1 (impersonation) complete
- Level 2 (user/tenant management) planned for production

### Demo / Quick Verification (Smoke Test)

1. **Log in as admin**
2. Go to **Admin** → Create customer + user (or use existing demo customer)
3. Go to **Jobs** → Create/manage a job
4. Go to **Candidates** → Create candidate and attach to job
5. Go to **Kanban** → Drag candidate between stages and verify status updates
6. **Admin**: Click "Act as" on a tenant → Verify customer view
7. **Admin**: Go to **Audit Logs** → Verify impersonation was logged

### Next Prioritized Steps (v0.2)

**User Lifecycle:**
- Implement user activation/deactivation
- Add user deletion with confirmation
- Show last login time

**Audit Logging:**
- Level 2: User and tenant management events
- Authentication events (password changes, failed logins)

**UX Improvements:**
- Better confirmation dialogs for destructive actions
- Enhanced error handling with recovery options
- Client + server validation improvements

**Quality:**
- E2E smoke tests in CI for main flow
- Performance optimization for large datasets

---

## 🌟 Features

### Core Functionality
- **Multi-tenant Architecture**: Secure tenant isolation with Row-Level Security (RLS)
- **Job Management**: Create, edit, and manage job postings
- **Candidate Management**: Track candidates with LinkedIn profiles, contact info, and notes
- **Kanban Board**: Visual pipeline with drag & drop and 7 customizable stages
- **Advanced Filtering**: Filter by job and search candidates by name
- **Admin Panel**: Comprehensive tenant and user management

### Admin Features
- **Tenant Impersonation**: Act as any customer for support/testing
- **Audit Logging**: Track all impersonation sessions with IP addresses
- **Tenant Management**: View details, statistics, and users per tenant
- **User Management**: View and manage all users (admins + customers)
- **Multi-level Access**: Create both admin and customer accounts

### Technical Features
- **Authentication**: Supabase Auth with secure session management
- **Internationalization**: Swedish and English support with next-intl
- **GDPR Compliance**: Privacy and Cookie policies with admin access disclosure
- **Real-time Updates**: Optimistic UI with server actions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Drag & Drop**: Smooth drag & drop with @dnd-kit

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/klasolsson81/mini-ats.git
cd mini-ats
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run migrations in order:
   - `supabase/migrations/20260126000000_initial_schema.sql`
   - `supabase/migrations/20260127_add_impersonation_audit_log.sql`

See `supabase/migrations/README.md` for detailed instructions.

### 4. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get your keys from Supabase Dashboard → Settings → API.

### 5. Create First Admin User

In Supabase Dashboard:

1. Go to **Authentication → Users**
2. Create a new user with email/password
3. Copy the User ID
4. Run this SQL in **SQL Editor**:

```sql
INSERT INTO profiles (id, tenant_id, role, full_name, email)
VALUES (
  'PASTE_USER_ID_HERE',
  NULL,
  'admin',
  'Your Name',
  'your-email@example.com'
);
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

---

## 📁 Project Structure

```
mini-ats/
├── app/                      # Next.js App Router pages
│   ├── app/                  # Protected app area
│   │   ├── admin/           # Admin panel
│   │   │   ├── audit-logs/  # Impersonation audit logs
│   │   │   ├── tenants/     # Tenant management
│   │   │   └── users/       # User management
│   │   ├── candidates/      # Candidate management
│   │   ├── jobs/            # Job management
│   │   └── kanban/          # Kanban board
│   ├── api/                 # API routes
│   │   └── admin/           # Admin-only endpoints
│   ├── login/               # Auth pages
│   ├── privacy/             # GDPR pages
│   └── cookies/
├── components/              # Reusable UI components
│   └── ui/                  # Base components (Button, Input, etc.)
├── features/                # Feature-specific components
│   ├── admin/               # Admin forms and components
│   ├── auth/
│   ├── candidates/
│   ├── jobs/
│   └── kanban/
├── lib/                     # Utilities and configs
│   ├── actions/             # Server actions
│   │   ├── auth.ts
│   │   ├── candidates.ts
│   │   ├── impersonate.ts   # Impersonation logic
│   │   └── jobs.ts
│   ├── constants/           # App constants
│   ├── supabase/            # Supabase clients
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   │   ├── restrictions.ts  # Operation restrictions
│   │   └── tenant.ts        # Tenant helpers
│   └── validations/         # Zod schemas
├── messages/                # i18n translations
│   ├── en.json
│   └── sv.json
├── supabase/                # Database migrations
│   └── migrations/
│       ├── 20260126000000_initial_schema.sql
│       ├── 20260127_add_impersonation_audit_log.sql
│       └── README.md
├── CLAUDE.md                # Build instructions for AI
├── SECURITY.md              # Security best practices
└── TODO.md                  # Feature roadmap
```

---

## 🗄️ Database Schema

### Tables
- **tenants**: Customer organizations
- **profiles**: User profiles (extends auth.users)
- **jobs**: Job postings
- **candidates**: Candidate information
- **job_candidates**: Junction table (candidate + job + stage)
- **impersonation_logs**: Audit log for admin impersonation

### Kanban Stages
1. **Sourced** (Hittad) - Initial outreach
2. **Applied** (Ansökan) - Application received
3. **Screening** (Urval) - Initial review
4. **Interview** (Intervju) - Interview process
5. **Offer** (Erbjudande) - Offer extended
6. **Hired** (Anställd) - Successfully hired
7. **Rejected** (Avslagen) - Not moving forward

All stages are customizable in `lib/constants/stages.ts`.

---

## 🔐 Security

### Row-Level Security (RLS)
All tables enforce RLS policies:
- **Customers**: Can only access their own tenant data
- **Admins**: Can access all tenant data
- **Impersonation**: Admins use effective tenant ID when impersonating

Helper functions in SQL:
- `current_user_id()` - Get authenticated user ID
- `current_tenant_id()` - Get user's tenant ID
- `is_admin()` - Check if user has admin role

### Audit Logging

**Level 1 (Production-Ready):**
- Automatic logging of all admin impersonation sessions
- Tracks: admin, tenant, start/end time, IP address, user agent
- Admin UI at `/app/admin/audit-logs`
- RLS: Only admins can view logs

**Level 2 (TODO for Production):**
- User management events (create/delete/role changes)
- Tenant management events
- Authentication events (password changes, failed logins)

See `TODO.md` for detailed audit logging roadmap.

### Operation Restrictions

Framework to prevent sensitive operations during impersonation:
- User deletion
- Password changes
- Billing updates
- Admin user management

See `lib/utils/RESTRICTIONS_README.md` for implementation guide.

### Authentication
- Supabase Auth with secure session management
- Server-side validation on all mutations
- CSRF protection via Next.js
- Impersonation uses secure httpOnly cookies

### Data Privacy
- GDPR-compliant with Privacy and Cookie policies
- Admin access disclosed in privacy policy (legitimate interest basis)
- Minimal cookie usage (authentication + impersonation)
- EU data storage (Supabase EU region)

---

## 🌍 Internationalization

Supports Swedish (default) and English. Easily add more languages:

1. Add translation file: `messages/your-locale.json`
2. Update `i18n.ts`: `export const locales = ['sv', 'en', 'your-locale']`
3. Translations update automatically

**Translation best practices:**
- Never hardcode strings in components
- Use parameterized translations for dynamic content
- Test language switcher with full page reload

---

## 🧪 Testing

### Manual Smoke Test
See "Demo / Quick Verification" section above.

### Unit Tests (Vitest)
```bash
npm test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Lint & Format
```bash
npm run lint
npm run format
```

---

## 📦 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables (Production)
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Post-Deployment Checklist
- [ ] Run all SQL migrations
- [ ] Create first admin user
- [ ] Test impersonation and verify audit log
- [ ] Verify RLS policies work correctly
- [ ] Check that all translations load
- [ ] Test privacy/cookie policy pages

---

## 🎯 Usage Guide

### As Admin
1. Log in at `/login`
2. Go to **Admin** panel
3. **Create tenant** + first customer user
4. **View Audit Logs** to track impersonation
5. **Act as tenant** to test customer experience
6. **View all users** across all tenants
7. Repeat for each customer organization

### As Customer
1. Log in at `/login`
2. **Dashboard**: View metrics and quick links
3. **Jobs**: Create and manage job postings
4. **Candidates**: Add candidates with LinkedIn profiles
5. **Kanban**: Drag candidates through stages or use dropdown
6. Use filters to focus on specific jobs

---

## 📝 Assumptions & Design Decisions

### Multi-tenancy Model
- One tenant = one customer organization
- Tenant-level data isolation via RLS
- Candidates can be attached to multiple jobs
- Admins have `tenant_id = NULL`

### Stage Management
- Fixed 7 stages for MVP (customizable in code)
- Stage changes tracked in `job_candidates` table
- Both drag & drop and dropdown supported

### Admin Impersonation
- Cookie-based (8-hour timeout)
- Automatically logged to `impersonation_logs`
- Visual banner always shown
- Admin panel hidden during impersonation
- Used for support and troubleshooting

### Authentication
- Email/password only for MVP
- Magic links and OAuth can be added later
- Service role key used server-side only (never exposed)

### Audit Logging Strategy
- **Level 1 (MVP)**: Impersonation only - Production ready
- **Level 2 (Production)**: User/tenant management - Planned
- **Level 3 (Not recommended)**: Granular CRUD - Too much data

### Future Enhancements
- User lifecycle management (activate/deactivate/delete)
- Level 2 audit logging (user/tenant events)
- Email notifications for stage changes
- Resume uploads (Supabase Storage)
- Advanced analytics dashboard
- Bulk candidate import (CSV)
- Interview scheduling with calendar integration
- Email templates
- Custom pipeline stages per tenant
- Candidate notes/comments timeline

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS
- **Database**: Supabase (Postgres)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **i18n**: next-intl
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Drag & Drop**: @dnd-kit

---

## 📄 License

MIT License - feel free to use this project however you like!

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

## 📚 Documentation

- **CLAUDE.md** - Complete build instructions and architecture
- **SECURITY.md** - Security best practices and production checklist
- **TODO.md** - Feature roadmap and audit logging levels
- **lib/utils/RESTRICTIONS_README.md** - Operation restrictions guide
- **supabase/migrations/README.md** - Database migration instructions

---

## 👨‍💻 Author

**Klas Olsson**

- 🌐 Portfolio: [klasolsson.se](https://klasolsson.se)
- 📧 Email: klasolsson81@gmail.com
- 💼 LinkedIn: [linkedin.com/in/klasolsson81](https://www.linkedin.com/in/klasolsson81/)
- 🐙 GitHub: [@klasolsson81](https://github.com/klasolsson81)

---

**Built with ❤️ using Claude Code**

Co-Authored-By: Claude Sonnet 4.5

---

## 🎉 Status

- **MVP v0.1**: ✅ Complete & Deployed
- **Security**: ✅ Production-Ready
- **Audit Logging Level 1**: ✅ Complete
- **Multi-tenant**: ✅ Fully Isolated
- **GDPR Compliance**: ✅ Documented

**Live Demo**: [https://mini-ats-jade.vercel.app](https://mini-ats-jade.vercel.app)

**GitHub**: [https://github.com/klasolsson81/mini-ats](https://github.com/klasolsson81/mini-ats)

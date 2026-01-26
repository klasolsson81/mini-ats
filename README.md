# Mini ATS - Applicant Tracking System

A modern, multi-tenant Applicant Tracking System built with Next.js, TypeScript, Supabase, and TailwindCSS.

![Mini ATS](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### Core Functionality
- **Multi-tenant Architecture**: Secure tenant isolation with Row-Level Security (RLS)
- **Job Management**: Create, edit, and manage job postings
- **Candidate Management**: Track candidates with LinkedIn profiles, contact info, and notes
- **Kanban Board**: Visual pipeline with customizable stages
- **Advanced Filtering**: Filter by job and search candidates by name
- **Admin Panel**: Manage tenants and create customer accounts

### Technical Features
- **Authentication**: Supabase Auth with email/password
- **Internationalization**: Swedish and English support with next-intl
- **GDPR Compliance**: Privacy and Cookie policies
- **Real-time Updates**: Optimistic UI with server actions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Type Safety**: Full TypeScript coverage

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
3. Copy the contents of `supabase/migrations/20260126000000_initial_schema.sql`
4. Run the SQL migration

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

## 📁 Project Structure

```
mini-ats/
├── app/                      # Next.js App Router pages
│   ├── app/                  # Protected app area
│   │   ├── admin/           # Admin panel
│   │   ├── candidates/      # Candidate management
│   │   ├── jobs/            # Job management
│   │   └── kanban/          # Kanban board
│   ├── api/                 # API routes
│   ├── login/               # Auth pages
│   ├── privacy/             # GDPR pages
│   └── cookies/
├── components/              # Reusable UI components
│   └── ui/                  # Base components (Button, Input, etc.)
├── features/                # Feature-specific components
│   ├── admin/
│   ├── auth/
│   ├── candidates/
│   ├── jobs/
│   └── kanban/
├── lib/                     # Utilities and configs
│   ├── actions/             # Server actions
│   ├── constants/           # App constants
│   ├── supabase/            # Supabase clients
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   └── validations/         # Zod schemas
├── messages/                # i18n translations
│   ├── en.json
│   └── sv.json
└── supabase/                # Database migrations
    └── migrations/
```

## 🗄️ Database Schema

### Tables
- **tenants**: Customer organizations
- **profiles**: User profiles (extends auth.users)
- **jobs**: Job postings
- **candidates**: Candidate information
- **job_candidates**: Junction table (candidate + job + stage)

### Kanban Stages
1. **Sourced** - Initial outreach
2. **Applied** - Application received
3. **Screening** - Initial review
4. **Interview** - Interview process
5. **Offer** - Offer extended
6. **Hired** - Successfully hired
7. **Rejected** - Not moving forward

All stages are customizable in `lib/constants/stages.ts`.

## 🔐 Security

### Row-Level Security (RLS)
All tables enforce RLS policies:
- **Customers**: Can only access their own tenant data
- **Admins**: Can access all tenant data

### Authentication
- Supabase Auth with secure session management
- Server-side validation on all mutations
- CSRF protection via Next.js

### Data Privacy
- GDPR-compliant with Privacy and Cookie policies
- Minimal cookie usage (authentication only)
- EU data storage (Supabase EU region)

## 🌍 Internationalization

Supports Swedish (default) and English. Easily add more languages:

1. Add translation file: `messages/your-locale.json`
2. Update `i18n.ts`: `export const locales = ['sv', 'en', 'your-locale']`
3. Translations update automatically

## 🧪 Testing

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

## 🎯 Usage Guide

### As Admin
1. Log in at `/login`
2. Go to **Admin** panel
3. Create tenant + first customer user
4. Repeat for each customer organization

### As Customer
1. Log in at `/login`
2. **Dashboard**: View metrics and quick links
3. **Jobs**: Create and manage job postings
4. **Candidates**: Add candidates with details
5. **Kanban**: Move candidates through stages
6. Use filters to focus on specific jobs

## 📝 Assumptions & Design Decisions

### Multi-tenancy Model
- One tenant = one customer organization
- Tenant-level data isolation via RLS
- Candidates can be attached to multiple jobs

### Stage Management
- Fixed stages for MVP (customizable in code)
- Stage changes tracked in database
- Simple dropdown for stage updates (drag & drop is future enhancement)

### Authentication
- Email/password only for MVP
- Magic links and OAuth can be added later
- Admin users have `tenant_id = NULL`

### Future Enhancements
- Drag & drop Kanban
- Email notifications
- Resume uploads (Supabase Storage)
- Advanced analytics dashboard
- Bulk candidate import (CSV)
- Interview scheduling
- Email templates
- Custom pipeline stages per tenant

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

## 📄 License

MIT License - feel free to use this project however you like!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 👨‍💻 Author

**Klas Olsson**

- 🌐 Portfolio: [klasolsson.se](https://klasolsson.se)
- 📧 Email: klasolsson81@gmail.com
- 💼 LinkedIn: [linkedin.com/in/klasolsson81](https://www.linkedin.com/in/klasolsson81/)
- 🐙 GitHub: [@klasolsson81](https://github.com/klasolsson81)

---

**Built with ❤️ using Claude Code**

Co-Authored-By: Claude Sonnet 4.5

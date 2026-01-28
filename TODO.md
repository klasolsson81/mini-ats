# TODO - Mini ATS

---

## 🚨 Pre-Delivery Fixes (Code Review 2026-01-27)

### P0 - MÅSTE fixas innan leverans ✅ KLART (2026-01-28)

#### 1. TypeScript `any` Types ✅
**Status:** FIXAT - Alla 13+ `any` types ersatta med proper interfaces
- `error: unknown` med instanceof check
- Custom interfaces för Supabase-data
- `useSyncExternalStore` för locale state

#### 2. React Hooks Anti-patterns ✅
**Status:** FIXAT - Refaktorerat till `useSyncExternalStore`
- Eliminerar setState-in-effect varningar
- Proper SSR/hydration support

#### 3. HTML Escape Sequences ✅
**Status:** FIXAT - Använder `&ldquo;` och `&rdquo;`

#### 4. .env Security ✅
**Status:** VERIFIERAT - `.env*` på rad 34 i .gitignore

**Build Status:** ✅ 0 errors, 6 warnings (intentional `_` vars)

---

### P1 - Bör fixas inom 1 vecka

#### 5. E2E Test: Login Flow ✅ KLART (2026-01-28)
**Status:** IMPLEMENTERAT
**Filer:** `e2e/login.spec.ts`, `playwright.config.ts`

**Tester implementerade:**
- [x] Test för successful login (customer + admin)
- [x] Test för failed login (visar felmeddelande)
- [x] Test för rate limiting (visar försök kvar)
- [x] Test för logout flow
- [x] Test för forgot password länk

**Kör tester:** `npm run test:e2e`

---

#### 6. E2E Test: Tenant Isolation ✅ KLART (2026-01-28)
**Status:** IMPLEMENTERAT
**Filer:** `e2e/tenant-isolation.spec.ts`

**Tester implementerade:**
- [x] Customer kan endast se egna jobb
- [x] Customer kan endast se egna kandidater
- [x] Customer kan inte se admin panel
- [x] Admin kan se admin panel
- [x] Admin kan impersonera tenant

**Kör tester:** `npm run test:e2e`

---

#### 7. Fix Black Screen During Redirects ✅ KLART (2026-01-28)
**Status:** FIXAT
**Filer:** `lib/actions/auth.ts`, `features/auth/login-form.tsx`, `components/sidebar.tsx`

**Lösning:**
- Server actions returnerar nu `{ success: true, redirectTo: '/app' }` istället för att anropa `redirect()`
- Client-side navigation med `router.push()` och `router.refresh()`
- Loading overlay förblir synlig under navigation
- Logout använder också client-side navigation med spinner

**Fixat:**
- [x] Smooth transition utan black screen
- [x] Loading indicator under redirect
- [x] Fungerar i alla browsers

---

#### 8. Rate Limiting on Login ✅ KLART (2026-01-28)
**Status:** FIXAT
**Filer:** `lib/utils/rate-limit.ts`, `lib/actions/auth.ts`

**Lösning:**
- In-memory rate limiter med 5 försök per 15 minuter
- Visar antal återstående försök efter misslyckad inloggning
- Visar minuter kvar vid rate limit
- Rensar rate limit vid lyckad inloggning
- Extra lager ovanpå Supabase's inbyggda rate limiting

**Fixat:**
- [x] Max 5 attempts per 15 min
- [x] Clear error message to user ("X försök kvar", "Försök igen om Y minuter")
- [x] Tracks failed attempts per IP

---

#### 9. Accessibility: aria-labels ✅ KLART (2026-01-28)
**Status:** FIXAT
**Filer:** sidebar.tsx, language-switcher.tsx, policy-modal.tsx, candidates-list.tsx, kanban-card.tsx

**Fixat:**
- [x] Alla icon-only knappar har aria-label
- [x] User menu har aria-expanded och aria-haspopup
- [x] Decorative icons har aria-hidden="true"
- [x] Översättningsnycklar för accessibility

---

### P2 - Nice to have (Post-MVP)

#### 10. Unit Tests: Filter Logic ✅ KLART (2026-01-28)
**Status:** IMPLEMENTERAT
**Filer:** `lib/utils/kanban-filters.ts`, `lib/utils/__tests__/kanban-filters.test.ts`, `vitest.config.ts`

**Lösning:**
- Extraherat filter-logik till testbar utility-funktion
- 21 unit tests för filterJobCandidates, groupByStage, countByStage
- Fixat bug: sökfrågan trimmas nu korrekt
- Uppdaterat kanban-board.tsx att använda utility

**Kör tester:** `npm run test`

---

#### 11. User Lifecycle Management ✅ KLART (2026-01-28)
**Status:** IMPLEMENTERAT
**Filer:** `lib/actions/users.ts`, `features/admin/user-actions.tsx`, `app/app/admin/users/page.tsx`

**Lösning:**
- Database migration: `is_active`, `last_login_at` kolumner
- Server actions: toggleUserActive, deleteUser
- UI: Status-ikoner, senast inloggad, aktivera/inaktivera knappar
- Login uppdaterar last_login_at automatiskt
- Inaktiva användare kan inte logga in

**Implementerat:**
- [x] Deactivate/Activate user (toggle)
- [x] Delete user (soft delete via deactivate)
- [x] View last login timestamp
- [x] Skydd mot att ta bort sig själv eller sista admin

---

#### 12. Bulk Actions
**Varför:** Admin efficiency
**Estimat:** 2-3 timmar
**Område:** Admin panel

---

#### 13. Candidate Search Page ✅ KLART (2026-01-28)
**Status:** IMPLEMENTERAT
**Filer:** `app/app/search/page.tsx`, `features/search/candidate-search.tsx`

**Funktioner:**
- Sökning på namn, e-post, telefon, anteckningar
- Filtrera efter jobb och stage
- Visar kandidatkort med all info
- Länk till Kanban för varje kandidat
- Stöder impersonation (visar rätt tenant)

**Ny navigation:**
- Sök-länk i sidebaren

---

#### 14. Level 2 Audit Logging
**Varför:** Compliance, full audit trail
**Estimat:** 4-6 timmar
**Område:** Database + UI

---

---

## Admin Panel - Kritiska Förbättringar

Baserat på kundkrav och nuvarande gaps i funktionalitet.

### 🔴 KRITISKA (Krav från kund)

#### 1. Skapa Admin-Konton ✅ KLART
- [x] Lägg till roll-väljare i formuläret (admin/customer)
- [x] Admin ska kunna skapa nya admin-användare (inte bara customer)
- [ ] Validera att minst en admin alltid finns i systemet

**Status:** IMPLEMENTERAT (2026-01-27)

**Krav:** "Som admin kan jag skapa konton (både admin-konton & kund-konton)" ✅

**Lösning:**
- Ny API endpoint: `/api/admin/create-admin`
- Ny komponent: `CreateAdminForm`
- Admin-sidan visar nu två formulär:
  1. Skapa Admin-Användare (utan tenant)
  2. Skapa Kund + Användare (med tenant)

---

#### 2. Impersonation (Agera Som Kund) ✅ KLART
- [x] Implementera "Agera som denna kund" funktion
- [x] Lägg till "Agera som" knapp på varje kund i listan
- [x] Visa banner när admin agerar som kund ("Du agerar som DevCo AB")
- [x] Lägg till "Sluta agera som" knapp i bannern
- [x] Admin kan se kundens jobb när impersonerar
- [x] Admin kan se kundens kandidater när impersonerar
- [x] Admin kan skapa/redigera åt kunden

**Status:** IMPLEMENTERAT (2026-01-27)

**Krav:** "Som admin kan jag göra allt som kunder kan göra åt dem" ✅

**Lösning:**
- Server actions: `impersonateTenant()`, `stopImpersonation()`
- Helper: `getEffectiveTenantId()` - returnerar impersonated eller own tenant
- Banner: Gul banner visas överallt när impersonerar
- Alla pages uppdaterade: jobs, candidates, kanban, dashboard
- Alla server actions uppdaterade: createJob, createCandidate, attachToJob
- Cookie-baserad implementation (8h session)

**Teknisk implementation:**
```typescript
// Cookie/session approach
- Sätt impersonated_tenant_id i cookie/session
- Middleware läser detta och använder det istället för admin's tenant_id
- RLS fungerar automatiskt med current_tenant_id()
```

---

### 🟡 VIKTIGA (Användarupplevelse)

#### 3. Befintliga Kunder - Mer Interaktiv ✅ KLART
- [x] Gör kundkort klickbara
- [x] Visa detaljvy med alla användare för kunden
- [x] Lägg till "Lägg till användare" till befintlig kund
- [x] Visa kundstatistik (antal jobb, kandidater, aktiva processer)

**Status:** IMPLEMENTERAT (2026-01-27)

**Lösning:**
- Ny sida: `/app/admin/tenants/[id]`
- Visar kundstatistik (jobb, kandidater, aktiva processer)
- Listar alla användare för kunden
- Dialog för att lägga till nya användare till befintlig kund
- Kundkort på admin-sidan är nu klickbara med hover-effekt

---

#### 4. Användarhantering ✅ DELVIS KLART
- [x] Lista alla användare (både admins och customers)
- [x] Filtrera användare per kund (genom tenant detail page)
- [ ] Aktivera/inaktivera användare
- [ ] Radera användare (med bekräftelse)
- [ ] Visa senaste inloggning

**Status:** DELVIS IMPLEMENTERAT (2026-01-27)

**Lösning:**
- Ny sida: `/app/admin/users`
- Visar alla användare i systemet
- Separata sektioner för admins och customers
- Statistik: totalt antal användare, admin-användare, kundanvändare
- Länkar till kundsidor från kundanvändare
- "Visa alla användare" knapp på admin-panelen

**Återstår:**
- Aktivera/inaktivera användare (behöver auth.users update)
- Radera användare (behöver cascade delete + auth cleanup)
- Visa senaste inloggning (behöver auth.users.last_sign_in_at)

---

## Föreslagen Admin Panel Struktur

```
/app/admin
├── page.tsx (översikt)
├── users/
│   ├── page.tsx (lista alla användare)
│   ├── create/page.tsx (skapa admin eller customer)
│   └── [id]/page.tsx (user details)
└── tenants/
    ├── page.tsx (lista kunder - nuvarande)
    └── [id]/page.tsx (tenant details + users)
```

---

## Impersonation Implementation Plan

### 1. Server Action (lib/actions/admin.ts)
```typescript
export async function impersonateTenant(tenantId: string) {
  // Set cookie with impersonated_tenant_id
  // Return success
}

export async function stopImpersonation() {
  // Clear impersonation cookie
  // Return success
}
```

### 2. Middleware Update (middleware.ts)
```typescript
// Check for impersonation cookie
// If admin + impersonating:
//   - Use impersonated_tenant_id for RLS
//   - Add header for banner component
```

### 3. Banner Component
```typescript
// components/impersonation-banner.tsx
// Show when admin is impersonating
// "Du agerar som [Tenant Name] | [Sluta agera som]"
```

### 4. Update Admin Page
```typescript
// Add "Agera som" button to each tenant card
// onClick -> impersonateTenant(tenant.id) -> router.push('/app')
```

---

## Current Admin Capabilities

✅ **Kan göra:**
- Skapa ny kund + EN customer-användare
- Skapa admin-konton
- Agera som kund (impersonate)
- Se kunders jobb/kandidater när impersonerar
- Skapa/redigera jobb och kandidater åt kunder
- Visa lista över befintliga kunder (interaktiv)
- Klicka på kundkort för att se detaljer
- Visa kundstatistik (jobb, kandidater, aktiva processer)
- Lägga till fler användare till befintlig kund
- Se alla användare i systemet (admins + customers)
- Filtrera användare per kund

❌ **Kan INTE göra (ännu):**
- Aktivera/inaktivera användare
- Radera användare
- Se senaste inloggning för användare

---

## 🔐 Audit Logging & Security

### ✅ Level 1: Impersonation Logging (KLART)

**Status:** IMPLEMENTERAT (2026-01-27)

**Vad som loggas:**
- [x] Admin impersonation start (vem, vilken kund, IP, user agent)
- [x] Admin impersonation slut (session duration)
- [x] Visas i Admin UI på `/app/admin/audit-logs`

**Implementation:**
- Tabell: `impersonation_logs`
- Backend: Automatisk logging i `lib/actions/impersonate.ts`
- Frontend: `app/app/admin/audit-logs/page.tsx`
- Privacy Policy: Dokumenterat i `app/privacy/page.tsx`
- Restrictions: `lib/utils/restrictions.ts` förhindrar känsliga ops under impersonation

**RLS:**
- Endast admins kan läsa logs
- Service role kan skriva logs

---

### 🔜 Level 2: User & Tenant Management Logging (TODO - Production)

**Prioritet:** Medium (för production launch)

**Vad som bör loggas:**

#### User Management Events
- [ ] `user.created` - När admin skapar ny användare
- [ ] `user.deleted` - När admin raderar användare (irreversibel)
- [ ] `user.role_changed` - När roll ändras (customer ↔ admin)
- [ ] `user.deactivated` - När användare inaktiveras
- [ ] `user.activated` - När användare aktiveras

#### Tenant Management Events
- [ ] `tenant.created` - När ny kund skapas
- [ ] `tenant.deleted` - När kund raderas (irreversibel)
- [ ] `tenant.updated` - När kundinfo ändras

#### Authentication Events
- [ ] `auth.password_changed` - När lösenord ändras
- [ ] `auth.login_failed` - Misslyckade inloggningsförsök (brute force detection)
- [ ] `auth.password_reset` - När lösenord återställs

**Implementation Plan:**

```sql
-- Ny generell audit log tabell
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'user.created', 'tenant.deleted', etc
  actor_id UUID REFERENCES profiles(id),
  target_type TEXT, -- 'user', 'tenant', 'auth'
  target_id UUID,
  metadata JSONB, -- Extra context
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI:**
- Lägg till `audit_logs` på samma sida som `impersonation_logs`
- Filtrera per event type
- Sök efter användare/kund

**När implementera:**
- Innan production launch
- När user deletion implementeras
- När tenant deletion implementeras

---

### ❌ Level 3: Granular Activity Logging (INTE rekommenderat)

**Följande bör INTE loggas:**
- ❌ `job.created` - För många events
- ❌ `candidate.created` - För många events
- ❌ `candidate.updated` - För många events
- ❌ `kanban.moved` - För många events
- ❌ View operations - Övervakning, inte audit

**Varför inte:**
- För stor datamängd
- Performance-problem
- Svårt att hitta viktiga events
- Inte bransch-standard för audit logging

---

## Testing Checklist

När impersonation är implementerad:

- [x] Admin kan klicka "Agera som" på en kund
- [x] Banner visas med kundens namn
- [x] /app/jobs visar kundens jobb (inte admins)
- [x] /app/candidates visar kundens kandidater
- [x] /app/kanban visar kundens kanban
- [x] Admin kan skapa jobb åt kunden
- [x] Admin kan skapa kandidater åt kunden
- [x] "Sluta agera som" återställer till admin-vy
- [x] RLS fungerar korrekt (ingen datableed)
- [x] Admin Panel döljs när impersonerar
- [x] Audit logs sparas automatiskt
- [x] Admin kan se audit logs i UI

---

## Notes

- All RLS är redan implementerad korrekt med `current_tenant_id()` och `is_admin()`
- Impersonation implementerad med cookie/session approach
- Audit logging Level 1 (impersonation) är production-ready
- Audit logging Level 2 (user/tenant) rekommenderas för production
- Security documentation finns i SECURITY.md
- Operation restrictions finns i lib/utils/restrictions.ts

---

## 🔧 Known Issues (MVP v0.1)

### UI/UX - Black Screen During Redirects

**Status:** Tracked for v0.2
**Severity:** Minor (cosmetic only)

**Description:**
- Brief (1-3 seconds) black screen visible during authentication redirects
- Occurs after login and after password change
- Functionality works correctly, only visual experience affected

**Affected Flows:**
1. After clicking "Logga in" → redirect to /app or /change-password
2. After changing password → redirect to /app

**Technical Cause:**
- `window.location.href` full page reload shows blank state
- Fullscreen overlays attempt to cover but timing varies by browser
- Next.js server-side redirects faster than client can render overlay

**Planned Fix (v0.2):**
- Server-side session refresh without full page reload
- React Suspense boundaries for smoother transitions
- Investigate Next.js router.refresh() with proper session handling

**Current Workaround:**
- Users experience brief blank screen but transitions complete successfully
- All functionality works correctly
- Data loads properly after transition

**See:** KNOWN_ISSUES.md for full details

---

## 🎯 Completed Features (MVP v0.1)

### ✅ Force Password Change on First Login
**Status:** IMPLEMENTERAT (2026-01-27)

**Features:**
- [x] Admin-created accounts must change password on first login
- [x] Professional password change UI with strength indicators
- [x] Password requirements: min 8 chars, letters + numbers
- [x] Visual feedback: show/hide toggles, strength checks
- [x] Middleware redirect logic
- [x] Database column: must_change_password
- [x] All admin APIs set flag on user creation
- [x] Swedish error message translations

**Implementation:**
- Migration: `20260127_add_must_change_password.sql`
- Page: `/change-password`
- Component: `ChangePasswordForm`
- Action: `lib/actions/change-password.ts`
- Middleware: Updated to allow /change-password route

---

### ✅ Infinite Recursion Fix (CRITICAL)
**Status:** FIXED (2026-01-27)

**Problem:**
- RLS policies called `is_admin()` which read profiles table
- Reading profiles triggered RLS policies again
- Caused infinite loop: "stack depth limit exceeded"
- Admin users couldn't see any data

**Solution:**
- Added `SECURITY DEFINER` to `is_admin()` and `current_tenant_id()`
- Functions now bypass RLS when checking permissions
- Prevents circular dependency

**Migration:**
- `20260127_fix_infinite_recursion.sql`

**Impact:**
- Admin users can now see all data correctly
- No more stack overflow errors
- RLS still enforces security correctly

---

### ✅ Swedish Error Messages
**Status:** IMPLEMENTERAT (2026-01-27)

**Translations:**
- "Invalid login credentials" → "Felaktigt användarnamn eller lösenord"
- "Too many requests" → "För många inloggningsförsök..."
- "Email not confirmed" → "E-postadressen är inte bekräftad"
- Password change errors also translated

**Implementation:**
- `translateAuthError()` helper in `lib/actions/auth.ts`
- `translateAuthError()` helper in `lib/actions/change-password.ts`

---

### ✅ Candidates Page - Show Job Assignments
**Status:** IMPLEMENTERAT (2026-01-27)

**Features:**
- [x] Shows which jobs candidate is attached to
- [x] Displays current stage for each job
- [x] Color-coded stage badges (matches Kanban colors)
- [x] Visual hierarchy: job info at top of card

**Implementation:**
- Extended query with job_candidates relation
- New interface: CandidateWithJobs
- Stage color mapping function

---

**Skapad:** 2026-01-27
**Senast uppdaterad:** 2026-01-27
**Status:** MVP v0.1 KLART ✅
**Prioritet:** Hög (kundkrav) - UPPFYLLT ✅

**Known Issues:** Se KNOWN_ISSUES.md för detaljer

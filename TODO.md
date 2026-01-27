# TODO - Mini ATS

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

**Skapad:** 2026-01-27
**Senast uppdaterad:** 2026-01-27
**Status:** Admin panel & impersonation KLART ✅
**Prioritet:** Hög (kundkrav) - UPPFYLLT ✅

# TODO - Mini ATS

## Admin Panel - Kritiska Förbättringar

Baserat på kundkrav och nuvarande gaps i funktionalitet.

### 🔴 KRITISKA (Krav från kund)

#### 1. Skapa Admin-Konton
- [ ] Lägg till roll-väljare i formuläret (admin/customer)
- [ ] Admin ska kunna skapa nya admin-användare (inte bara customer)
- [ ] Validera att minst en admin alltid finns i systemet

**Nuvarande problem:** Formuläret skapar alltid en "customer" användare. Ingen möjlighet att skapa nya admins.

**Krav:** "Som admin kan jag skapa konton (både admin-konton & kund-konton)"

---

#### 2. Impersonation (Agera Som Kund)
- [ ] Implementera "Agera som denna kund" funktion
- [ ] Lägg till "Agera som" knapp på varje kund i listan
- [ ] Visa banner när admin agerar som kund ("Du agerar som DevCo AB")
- [ ] Lägg till "Sluta agera som" knapp i bannern
- [ ] Test: Admin kan se kundens jobb när impersonerar
- [ ] Test: Admin kan se kundens kandidater när impersonerar
- [ ] Test: Admin kan skapa/redigera åt kunden

**Nuvarande problem:** Admin kan inte se eller hantera kunders data. Ingen impersonation-funktion finns.

**Krav:** "Som admin kan jag göra allt som kunder kan göra åt dem"

**Teknisk implementation:**
```typescript
// Cookie/session approach
- Sätt impersonated_tenant_id i cookie/session
- Middleware läser detta och använder det istället för admin's tenant_id
- RLS fungerar automatiskt med current_tenant_id()
```

---

### 🟡 VIKTIGA (Användarupplevelse)

#### 3. Befintliga Kunder - Mer Interaktiv
- [ ] Gör kundkort klickbara
- [ ] Visa detaljvy med alla användare för kunden
- [ ] Lägg till "Lägg till användare" till befintlig kund
- [ ] Visa kundstatistik (antal jobb, kandidater, aktiva processer)

**Nuvarande problem:** Kund-listan visar bara namn och antal användare. Ingen interaktion möjlig.

---

#### 4. Användarhantering
- [ ] Lista alla användare (både admins och customers)
- [ ] Filtrera användare per kund
- [ ] Aktivera/inaktivera användare
- [ ] Radera användare (med bekräftelse)
- [ ] Visa senaste inloggning

**Nuvarande problem:** Ingen översikt över alla användare. Kan inte hantera befintliga användare.

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
- Visa lista över befintliga kunder (passiv)

❌ **Kan INTE göra:**
- Skapa admin-konton
- Agera som kund (impersonate)
- Se kunders jobb/kandidater
- Lägga till fler användare till befintlig kund
- Hantera användare (aktivera/inaktivera/radera)
- Se användarlista

---

## Testing Checklist

När impersonation är implementerad:

- [ ] Admin kan klicka "Agera som" på en kund
- [ ] Banner visas med kundens namn
- [ ] /app/jobs visar kundens jobb (inte admins)
- [ ] /app/candidates visar kundens kandidater
- [ ] /app/kanban visar kundens kanban
- [ ] Admin kan skapa jobb åt kunden
- [ ] Admin kan skapa kandidater åt kunden
- [ ] "Sluta agera som" återställer till admin-vy
- [ ] RLS fungerar korrekt (ingen datableed)

---

## Notes

- All RLS är redan implementerad korrekt med `current_tenant_id()` och `is_admin()`
- Impersonation kräver bara cookie/session + middleware-uppdatering
- Inga databas-ändringar behövs
- UI-ändringar är huvudsakligen admin-panelen

---

**Skapad:** 2026-01-27
**Status:** Planering klar, implementation återstår
**Prioritet:** Hög (kundkrav)

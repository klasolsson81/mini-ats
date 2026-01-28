# FINAL_CHECKLIST.md - Pre-Delivery Verification

**Project:** Mini ATS MVP v0.1
**Date:** 2026-01-27
**Target:** Final delivery to customer

---

## Instructions

Complete ALL checkboxes before pushing to GitHub for final deployment.
Mark items with `[x]` when verified. Do not skip any P0 items.

---

## 🔴 P0 - MANDATORY (Block Deployment)

### Code Quality
- [ ] Fix TypeScript `any` in `app/api/admin/create-tenant/route.ts:106`
- [ ] Fix TypeScript `any` in `app/api/admin/create-admin/route.ts:99`
- [ ] Fix TypeScript `any` in `app/app/admin/audit-logs/page.tsx:141`
- [ ] Fix TypeScript `any` in `app/app/admin/page.tsx:142`
- [ ] Fix TypeScript `any` in `app/app/page.tsx` (5 instances: lines 45,46,47,138,157)
- [ ] Fix React useEffect pattern in `components/language-switcher.tsx:18`
- [ ] Fix React useEffect pattern in `components/sidebar.tsx:61`
- [ ] Fix HTML escapes in `app/privacy/page.tsx`
- [ ] Fix HTML escapes in `components/policy-modal.tsx`

### Security
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` not exposed in client code
- [ ] Run `npm run lint` - no errors (warnings OK)
- [ ] Run `npm run build` - passes without errors

### Database
- [ ] Migrations applied to production Supabase
- [ ] RLS policies verified (test tenant isolation)

---

## 🟡 P1 - IMPORTANT (Pre-Demo Recommended)

### Smoke Tests (Manual)
- [ ] Login as admin@devotion.ventures works
- [ ] Login as customer@devco.se works
- [ ] New user first-login password change works
- [ ] Create job (as customer) works
- [ ] Create candidate (as customer) works
- [ ] Attach candidate to job works
- [ ] Kanban displays candidates correctly
- [ ] Drag & drop updates stage
- [ ] Filter by job works
- [ ] Filter by name works
- [ ] Admin impersonation works
- [ ] Impersonation banner shows
- [ ] Stop impersonation returns to admin view
- [ ] Audit logs visible at /app/admin/audit-logs
- [ ] Tenant isolation: Customer A cannot see Customer B data

### i18n
- [ ] All pages display in Swedish by default
- [ ] Language switcher changes to English
- [ ] No hardcoded Swedish/English text visible

### UX
- [ ] No console errors in browser
- [ ] Loading states visible on form submissions
- [ ] Error messages display on failures
- [ ] Empty states show helpful text

---

## 🟢 P2 - NICE TO HAVE (Post-Delivery)

### Documentation
- [ ] README.md up to date
- [ ] Demo accounts documented
- [ ] Known issues documented
- [ ] Loom demo recorded

### Future Improvements
- [ ] E2E tests for critical paths
- [ ] Unit tests for business logic
- [ ] Accessibility audit
- [ ] Performance profiling

---

## Summary

| Priority | Total | Completed |
|----------|-------|-----------|
| P0 (Mandatory) | 15 | ___ / 15 |
| P1 (Recommended) | 19 | ___ / 19 |
| P2 (Nice to have) | 6 | ___ / 6 |

**Ship Status:**
- [ ] All P0 items completed
- [ ] Smoke tests passed
- [ ] Ready for final push to GitHub

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Reviewer | | | |

---

*Last updated: 2026-01-27*

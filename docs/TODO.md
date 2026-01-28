# TODO - Mini ATS

## Current Status: MVP v0.1 Complete

All P0 and P1 items from the code review have been completed.

---

## Completed Features

### Core MVP
- [x] Multi-tenant architecture with RLS
- [x] Jobs CRUD
- [x] Candidates CRUD with LinkedIn integration
- [x] Kanban board with drag & drop
- [x] Filtering by job and candidate name
- [x] Admin panel for tenant/user management
- [x] Admin impersonation with audit logging
- [x] Force password change on first login
- [x] Swedish and English translations

### Code Quality (P0)
- [x] TypeScript strict - all `any` types fixed
- [x] React hooks patterns fixed
- [x] HTML escape sequences fixed
- [x] .env security verified

### Testing (P1)
- [x] E2E tests for login flow
- [x] E2E tests for tenant isolation
- [x] Unit tests for filter logic

### Security (P1)
- [x] Rate limiting on login (5 attempts / 15 min)
- [x] Accessibility improvements (aria-labels)
- [x] Level 2 audit logging (user/tenant events)

### UX (P1)
- [x] Fixed black screen during redirects
- [x] User lifecycle management (activate/deactivate)
- [x] Bulk user actions
- [x] Candidate search page

---

## Future Enhancements (P2+)

### Planned Features
- [ ] Candidate timeline / activity log
- [ ] Notes per stage change
- [ ] Job pipeline metrics dashboard
- [ ] CSV import for bulk candidates
- [ ] Email notifications for candidates
- [ ] Calendar integration for interviews
- [ ] Dark mode (optional)

### Infrastructure
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Performance profiling for large datasets
- [ ] CDN for static assets

### Security
- [ ] MFA for admin users
- [ ] CSP headers for XSS protection
- [ ] IP whitelisting for admin

---

## Audit Event Types

The system logs the following events in `audit_logs`:

| Event Type | Description |
|------------|-------------|
| `user.created` | New user created |
| `user.deleted` | User soft deleted |
| `user.activated` | User activated |
| `user.deactivated` | User deactivated |
| `user.bulk_activated` | Bulk user activation |
| `user.bulk_deactivated` | Bulk user deactivation |
| `tenant.created` | New tenant created |
| `auth.password_changed` | Password changed |

Impersonation sessions are logged separately in `impersonation_logs`.

---

**Last Updated:** 2026-01-28

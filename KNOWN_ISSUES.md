# Known Issues - Mini ATS MVP v0.1

This document tracks known issues and limitations in the current MVP release.

---

## 🟡 UI/UX Issues

### 1. Black Screen During Authentication Redirects

**Severity:** Minor (Cosmetic)
**Status:** Tracked for v0.2
**Affected Flows:**
- After clicking "Logga in" button → redirect to /app or /change-password
- After changing password on first login → redirect to /app

**Description:**
Users may see a brief (1-3 seconds) black screen during page transitions when:
1. Logging in for the first time (before password change)
2. Completing the password change and being redirected to the dashboard

**Technical Cause:**
`window.location.href` full page reload causes the browser to show a blank state between page unload and new page load. Fullscreen overlays attempt to cover this but timing varies by browser and connection speed.

**User Impact:**
- Low - Functionality is not affected
- Authentication works correctly
- Data loads properly after transition
- Only visual experience is briefly impacted

**Workaround:**
None needed - transitions complete successfully within 1-3 seconds.

**Planned Fix (v0.2):**
- Implement server-side session refresh to eliminate `window.location.href`
- Use Next.js `router.refresh()` with proper session management
- Add smoother transitions with React Suspense boundaries
- Consider SPA-style authentication flow

**References:**
- Feature implementation: Force password change (2026-01-27)
- Related commits: bf5c8cd, 444cbd5, ca50afb

---

## 🔧 Functional Limitations (By Design in MVP)

### 2. User Lifecycle Management

**Status:** Planned for v0.2

**Current Limitations:**
- Cannot deactivate/activate users
- Cannot delete users through UI
- No "last login" tracking

**Workaround:**
Use Supabase Dashboard → Authentication → Users for manual user management.

**Planned for v0.2:**
- User activation/deactivation toggle
- Safe user deletion with confirmation
- Display last login timestamp

---

### 3. Audit Logging Level 2

**Status:** Planned for production

**Current Coverage:**
- ✅ Level 1: Impersonation logging (complete)
- ⏳ Level 2: User/tenant management events (planned)
- ❌ Level 3: Granular CRUD logging (not recommended)

**What's Missing:**
- User creation/deletion events
- Tenant creation/deletion events
- Password change events
- Failed login attempts

**Workaround:**
Current impersonation logging covers the most critical security requirement (admin access to customer data).

**Planned Implementation:**
- Before production launch
- Combined with user lifecycle features
- New audit_logs table for all administrative actions

---

## 📋 Browser Compatibility

### Tested Browsers:
- ✅ Chrome/Edge (Chromium) - Latest
- ✅ Firefox - Latest
- ⚠️ Safari - Not extensively tested
- ❌ Internet Explorer - Not supported

**Note:** Application uses modern web features (ES2020+, CSS Grid, Flexbox). IE11 and older browsers are not supported.

---

## 🔐 Security Notes

### Current Security Status: Production-Ready ✅

**Implemented:**
- Row-Level Security (RLS) with multi-tenant isolation
- Force password change on first login
- Impersonation audit logging
- GDPR-compliant privacy policy
- Secure session management
- SECURITY DEFINER functions to prevent recursion

**Known Security Considerations:**
1. **Service role key** - Must be kept secret (never exposed to client)
2. **Impersonation sessions** - 8-hour timeout (configurable)
3. **Password requirements** - Currently: min 8 chars, letters + numbers (consider adding special chars requirement in production)

---

## 📱 Responsive Design

**Tested Screen Sizes:**
- ✅ Desktop (1920×1080, 2560×1440)
- ✅ Laptop (1366×768, 1440×900)
- ✅ Tablet landscape (1024×768)
- ⚠️ Tablet portrait (768×1024) - Works but could be optimized
- ⚠️ Mobile (< 640px) - Works but primarily desktop-focused

**Note:** Application is designed for desktop-first recruitment workflows. Mobile optimization planned for future releases.

---

## 🌍 Internationalization

**Current Languages:**
- ✅ Swedish (sv) - Primary, fully translated
- ✅ English (en) - Fully translated

**Known Limitations:**
- Date formatting uses default locale (could be improved)
- Some Supabase error messages remain in English (translated via mapping)
- Language switcher requires page reload (expected behavior)

---

## 📊 Performance

**Current Status:** Good for MVP scale

**Known Considerations:**
1. **Large datasets** - Not extensively tested with 1000+ candidates
2. **Kanban drag & drop** - Optimized with useOptimistic but may slow with 100+ cards per stage
3. **Image uploads** - Not implemented yet (planned feature)

**Recommended Scale (MVP):**
- Tenants: < 100
- Users per tenant: < 50
- Jobs per tenant: < 100
- Candidates per tenant: < 500
- Total system load: < 5000 candidates

For larger scales, consider implementing:
- Pagination
- Virtual scrolling for long lists
- Database query optimization
- CDN for static assets

---

## 📝 Documentation

**Current Documentation:**
- ✅ README.md - Setup and usage guide
- ✅ CLAUDE.md - Build instructions and architecture
- ✅ SECURITY.md - Security best practices
- ✅ TODO.md - Feature roadmap
- ✅ KNOWN_ISSUES.md (this file)

**Missing Documentation:**
- API documentation (not needed for MVP)
- Deployment troubleshooting guide
- Database backup/restore procedures

---

## 🐛 How to Report Issues

For production deployment, track issues using:
1. GitHub Issues: https://github.com/klasolsson81/mini-ats/issues
2. Email: klasolsson81@gmail.com
3. Include:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

---

## ✅ What Works Perfectly

To provide balance, here's what's been thoroughly tested and works reliably:

- ✅ Authentication and authorization
- ✅ Multi-tenant data isolation (RLS)
- ✅ Force password change on first login
- ✅ Jobs CRUD operations
- ✅ Candidates CRUD operations
- ✅ Kanban board with drag & drop
- ✅ Admin impersonation with audit logging
- ✅ Swedish and English translations
- ✅ Responsive layout (desktop/laptop)
- ✅ Form validation (client + server)
- ✅ Error handling and user feedback
- ✅ GDPR compliance documentation

---

**Document Created:** 2026-01-27
**Last Updated:** 2026-01-27
**Version:** MVP v0.1
**Next Review:** Before v0.2 release

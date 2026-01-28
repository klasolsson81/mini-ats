# Known Issues - Mini ATS MVP v0.1

This document tracks known limitations in the current release.

---

## Resolved Issues

### Black Screen During Redirects - FIXED (2026-01-28)
Changed from server-side `redirect()` to client-side `router.push()` for smooth transitions.

---

## Functional Limitations (By Design)

### Mobile Experience
- Responsive design implemented for all screen sizes
- Sidebar narrows on mobile (64px vs 112px on desktop)
- Page titles scale down on smaller screens
- Kanban columns stack on mobile, expand on larger screens
- Dialogs have proper mobile padding and max-width

### Large Datasets
- Not tested with 1000+ candidates per tenant
- May need pagination for very large datasets

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome/Edge (Chromium) | Fully Supported |
| Firefox | Fully Supported |
| Safari | Works, less tested |
| Internet Explorer | Not Supported |

---

## Recommended Scale (MVP)

- Tenants: < 100
- Users per tenant: < 50
- Jobs per tenant: < 100
- Candidates per tenant: < 500

For larger scales, implement pagination and virtual scrolling.

---

## Reporting Issues

1. GitHub Issues: https://github.com/klasolsson81/mini-ats/issues
2. Include: browser, steps to reproduce, expected vs actual behavior

---

**Last Updated:** 2026-01-28

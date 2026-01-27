# Security & Impersonation Best Practices

## Admin Impersonation

### What is it?
Impersonation allows admin users to "act as" a customer tenant, seeing exactly what the customer sees. This is useful for:
- Customer support and troubleshooting
- Debugging customer-specific issues
- Testing features from customer perspective

### Current Implementation (MVP)

✅ **Implemented:**
- Secure cookie-based session (8-hour timeout)
- Visual banner showing impersonation status
- Hides admin panel when impersonating (customer-only view)
- Uses effective tenant ID for all data queries
- RLS policies still enforce all access rules

❌ **Not yet implemented (recommended for production):**
- Audit logging (who impersonated which tenant, when)
- MFA requirement before impersonation
- Restrict sensitive operations (e.g., password changes)
- Customer notification (optional)
- Privacy policy documentation

### Is Impersonation OK in Real Projects?

**YES**, but with proper safeguards. Many B2B SaaS products use impersonation:
- Stripe Dashboard
- Shopify Admin
- Salesforce
- Intercom
- HubSpot

### Production Requirements

#### 1. Audit Logging (REQUIRED)
Log every impersonation event:
```sql
CREATE TABLE impersonation_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  tenant_id UUID REFERENCES tenants(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  actions_performed JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Privacy Policy (REQUIRED)
Document in `/privacy` page:
- Admins can access customer data for support purposes
- All access is logged
- Contact info for privacy concerns

#### 3. Restricted Operations (RECOMMENDED)
Certain actions should be blocked during impersonation:
- ❌ Change customer passwords
- ❌ Delete customer account
- ❌ Modify billing settings
- ✅ View data
- ✅ Create/edit jobs and candidates (for support)

#### 4. Enhanced Security (OPTIONAL)
- Require MFA before impersonation
- Shorter session timeout (2-4 hours instead of 8)
- IP whitelisting for admin users
- Real-time alerts on impersonation events

### Implementation Example (Future)

```typescript
// lib/actions/impersonate.ts
export async function impersonateTenant(tenantId: string) {
  // ... existing code ...

  // Add audit log
  await supabase.from('impersonation_logs').insert({
    admin_id: user.id,
    tenant_id: tenantId,
    started_at: new Date().toISOString(),
  });

  // ... rest of code ...
}

export async function stopImpersonation() {
  // ... existing code ...

  // Update audit log
  const logId = cookieStore.get('IMPERSONATE_LOG_ID')?.value;
  if (logId) {
    await supabase.from('impersonation_logs').update({
      ended_at: new Date().toISOString(),
    }).eq('id', logId);
  }

  // ... rest of code ...
}
```

### Security Checklist for Production

- [ ] Add impersonation audit logging table
- [ ] Log all impersonation start/stop events
- [ ] Document impersonation in Privacy Policy
- [ ] Add restricted operations check
- [ ] Consider MFA requirement
- [ ] Add impersonation to Terms of Service
- [ ] Notify customers of admin access (optional)
- [ ] Regular security audits of logs
- [ ] Automated alerts for unusual patterns

### Legal Considerations

**GDPR Compliance:**
- ✅ Lawful basis: Legitimate interest (customer support)
- ✅ Transparency: Documented in privacy policy
- ⚠️ Data minimization: Only access when necessary
- ⚠️ Accountability: Audit logs required

**User Trust:**
- Be transparent about admin capabilities
- Only use for legitimate support reasons
- Train admin staff on data privacy
- Have clear internal policies

### Alternatives to Impersonation

If you prefer not to use impersonation:

1. **View-Only Mode**: Admin can view customer data but not edit
2. **Screen Sharing**: Customer shares screen during support calls
3. **Debug Mode**: Extra logging/diagnostics customers can enable
4. **Export Reports**: Customers send reports to support

### Recommendation

For **MVP/Beta**: Current implementation is acceptable.

For **Production**: Add audit logging before public launch.

For **Enterprise customers**: Implement all security measures above.

# Operation Restrictions During Impersonation

## Overview

The `restrictions.ts` module provides security controls to prevent admins from performing sensitive operations while impersonating a tenant.

## Purpose

When an admin "acts as" a tenant, they should have **view and edit access** but not **destructive or sensitive operations**. This prevents:
- Accidental data loss
- Security breaches
- Abuse of impersonation privileges

## Restricted Operations

The following operations are blocked during impersonation:

| Operation | Description | Why Restricted |
|-----------|-------------|----------------|
| `DELETE_TENANT` | Delete organization | Irreversible, high impact |
| `DELETE_USER` | Delete user accounts | Irreversible, high impact |
| `CHANGE_PASSWORD` | Change user password | Security risk |
| `UPDATE_BILLING` | Update billing settings | Financial risk |
| `TRANSFER_OWNERSHIP` | Transfer org ownership | High impact |
| `MANAGE_ADMIN_USERS` | Create/delete admins | Security risk |

## How to Use

### Option 1: Check if operation is allowed

```typescript
import { checkOperationAllowed, RESTRICTED_OPERATIONS } from '@/lib/utils/restrictions';

export async function deleteUser(userId: string) {
  // Check if operation is allowed
  const error = await checkOperationAllowed(RESTRICTED_OPERATIONS.DELETE_USER);

  if (error) {
    return { error }; // Return error to user
  }

  // Proceed with deletion
  // ...
}
```

### Option 2: Enforce restriction (throws error)

```typescript
import { enforceOperationRestriction, RESTRICTED_OPERATIONS } from '@/lib/utils/restrictions';

export async function changePassword(userId: string, newPassword: string) {
  // This will throw an error if impersonating
  await enforceOperationRestriction(RESTRICTED_OPERATIONS.CHANGE_PASSWORD);

  // Proceed with password change
  // ...
}
```

### Option 3: Check impersonation status

```typescript
import { isImpersonating } from '@/lib/utils/restrictions';

export async function someAction() {
  const impersonating = await isImpersonating();

  if (impersonating) {
    // Show warning or disable button
    return { error: 'Not allowed during impersonation' };
  }

  // Proceed normally
  // ...
}
```

## Implementation Examples

### Example 1: User Deletion (Future)

```typescript
// lib/actions/admin.ts
import { checkOperationAllowed, RESTRICTED_OPERATIONS } from '@/lib/utils/restrictions';

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // Check restriction
  const restrictionError = await checkOperationAllowed(
    RESTRICTED_OPERATIONS.DELETE_USER
  );

  if (restrictionError) {
    return { error: restrictionError };
  }

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Only admins can delete users' };
  }

  // Delete user
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) return { error: error.message };

  return { success: true };
}
```

### Example 2: Password Change (Future)

```typescript
// lib/actions/auth.ts
import { enforceOperationRestriction, RESTRICTED_OPERATIONS } from '@/lib/utils/restrictions';

export async function changePassword(newPassword: string) {
  // This throws error if impersonating - user sees error message
  await enforceOperationRestriction(RESTRICTED_OPERATIONS.CHANGE_PASSWORD);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) return { error: error.message };
  return { success: true };
}
```

### Example 3: UI Conditional Rendering

```typescript
// components/delete-user-button.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function DeleteUserButton({ userId }: { userId: string }) {
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // Check if impersonating (read from cookie)
    const impersonating = document.cookie.includes('IMPERSONATE_TENANT_ID');
    setIsImpersonating(impersonating);
  }, []);

  if (isImpersonating) {
    return (
      <Button disabled title="Not allowed during impersonation">
        Delete User (Disabled)
      </Button>
    );
  }

  return <Button onClick={() => handleDelete(userId)}>Delete User</Button>;
}
```

## Current Status

### ✅ Implemented
- Restriction helper functions
- Impersonation detection
- Error messages in Swedish

### ⏳ Not Yet Needed (No such operations exist yet)
- User deletion protection
- Password change protection
- Tenant deletion protection
- Billing update protection

### 📋 Future Implementation

When you add these operations, protect them:

1. **User Management**
   - `deleteUser()` - Add restriction check
   - `deactivateUser()` - Add restriction check
   - `changeUserPassword()` - Add restriction check

2. **Tenant Management**
   - `deleteTenant()` - Add restriction check
   - `transferOwnership()` - Add restriction check

3. **Billing (if added)**
   - `updatePaymentMethod()` - Add restriction check
   - `changePlan()` - Consider restriction

## Testing

To test restrictions:

1. Log in as admin
2. Click "Agera som" on a tenant
3. Try to perform restricted operation
4. Should see error: "Denna operation (X) är inte tillåten när du agerar som en annan organisation."

## Security Note

These restrictions are **defense in depth** - they complement (not replace):
- RLS policies in Supabase
- Role-based access control
- Audit logging

Even if restrictions fail, RLS policies prevent unauthorized access.

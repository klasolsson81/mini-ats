import { cookies } from 'next/headers';

/**
 * Restricted operations that admins cannot perform while impersonating
 */
export const RESTRICTED_OPERATIONS = {
  DELETE_TENANT: 'delete_tenant',
  DELETE_USER: 'delete_user',
  CHANGE_PASSWORD: 'change_password',
  UPDATE_BILLING: 'update_billing',
  TRANSFER_OWNERSHIP: 'transfer_ownership',
  MANAGE_ADMIN_USERS: 'manage_admin_users',
} as const;

export type RestrictedOperation =
  (typeof RESTRICTED_OPERATIONS)[keyof typeof RESTRICTED_OPERATIONS];

/**
 * Check if admin is currently impersonating
 */
export async function isImpersonating(): Promise<boolean> {
  const cookieStore = await cookies();
  const impersonateTenantId = cookieStore.get('IMPERSONATE_TENANT_ID')?.value;
  return !!impersonateTenantId;
}

/**
 * Check if a specific operation is allowed during impersonation
 * Returns error message if blocked, null if allowed
 */
export async function checkOperationAllowed(
  operation: RestrictedOperation
): Promise<string | null> {
  const impersonating = await isImpersonating();

  if (!impersonating) {
    return null; // Not impersonating, all operations allowed
  }

  // All restricted operations are blocked during impersonation
  const operationNames: Record<RestrictedOperation, string> = {
    [RESTRICTED_OPERATIONS.DELETE_TENANT]:
      'radera organisationer',
    [RESTRICTED_OPERATIONS.DELETE_USER]: 'radera användare',
    [RESTRICTED_OPERATIONS.CHANGE_PASSWORD]: 'ändra lösenord',
    [RESTRICTED_OPERATIONS.UPDATE_BILLING]:
      'uppdatera faktureringsinställningar',
    [RESTRICTED_OPERATIONS.TRANSFER_OWNERSHIP]:
      'överföra äganderätt',
    [RESTRICTED_OPERATIONS.MANAGE_ADMIN_USERS]:
      'hantera admin-användare',
  };

  return `Denna operation (${operationNames[operation]}) är inte tillåten när du agerar som en annan organisation. Sluta agera som kund först.`;
}

/**
 * Throw error if operation is restricted during impersonation
 * Use this in server actions to enforce restrictions
 */
export async function enforceOperationRestriction(
  operation: RestrictedOperation
): Promise<void> {
  const errorMessage = await checkOperationAllowed(operation);
  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

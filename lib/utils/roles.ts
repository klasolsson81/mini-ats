/**
 * Role hierarchy and permissions
 *
 * Roles (highest to lowest):
 * - super_admin: Owner/master - cannot be deleted by anyone
 * - admin: Can manage tenants, users, impersonate
 * - customer: Regular tenant user
 */

export type Role = 'super_admin' | 'admin' | 'customer';

/**
 * Check if a role has admin privileges (admin or super_admin)
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Check if a role is super_admin
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === 'super_admin';
}

/**
 * Check if actor can modify target based on roles
 * super_admin can modify anyone except other super_admins
 * admin can only modify customers
 */
export function canModifyUser(actorRole: string, targetRole: string): boolean {
  // Super admins can modify admins and customers, but not other super_admins
  if (actorRole === 'super_admin') {
    return targetRole !== 'super_admin';
  }

  // Regular admins can only modify customers
  if (actorRole === 'admin') {
    return targetRole === 'customer';
  }

  // Customers cannot modify anyone
  return false;
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role: string, locale: string = 'sv'): string {
  const names: Record<string, Record<string, string>> = {
    super_admin: { sv: 'Super Admin', en: 'Super Admin' },
    admin: { sv: 'Admin', en: 'Admin' },
    customer: { sv: 'Kund', en: 'Customer' },
  };

  return names[role]?.[locale] || role;
}

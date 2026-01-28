import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export type AuditEventType =
  // User Management
  | 'user.created'
  | 'user.deleted'
  | 'user.permanently_deleted'
  | 'user.activated'
  | 'user.deactivated'
  | 'user.role_changed'
  | 'user.bulk_activated'
  | 'user.bulk_deactivated'
  // Tenant Management
  | 'tenant.created'
  | 'tenant.deleted'
  | 'tenant.updated'
  // Authentication
  | 'auth.password_changed'
  | 'auth.password_reset'
  | 'auth.login_failed';

export type TargetType = 'user' | 'tenant' | 'auth';

interface AuditLogParams {
  eventType: AuditEventType;
  targetType: TargetType;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event
 * Should be called from server actions after admin operations
 */
export async function logAuditEvent({
  eventType,
  targetType,
  targetId,
  targetName,
  metadata = {},
}: AuditLogParams): Promise<void> {
  try {
    const supabase = await createClient();

    // Get current user (actor)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn('Audit log: No user found');
      return;
    }

    // Get IP and user agent from headers
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Insert audit log
    const { error } = await supabase.from('audit_logs').insert({
      event_type: eventType,
      actor_id: user.id,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error('Audit log insert error:', error);
    }
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    console.error('Audit log error:', error);
  }
}

/**
 * Get human-readable event description
 */
export function getEventDescription(
  eventType: AuditEventType,
  targetName?: string | null,
  metadata?: Record<string, unknown> | null
): string {
  const name = targetName || 'Okänd';

  switch (eventType) {
    case 'user.created':
      return `Skapade användare: ${name}`;
    case 'user.deleted':
      return `Tog bort användare: ${name}`;
    case 'user.activated':
      return `Aktiverade användare: ${name}`;
    case 'user.deactivated':
      return `Inaktiverade användare: ${name}`;
    case 'user.role_changed':
      const newRole = metadata?.newRole || 'okänd';
      return `Ändrade roll för ${name} till ${newRole}`;
    case 'user.bulk_activated':
      const activatedCount = metadata?.count || 0;
      return `Bulk-aktiverade ${activatedCount} användare`;
    case 'user.bulk_deactivated':
      const deactivatedCount = metadata?.count || 0;
      return `Bulk-inaktiverade ${deactivatedCount} användare`;
    case 'tenant.created':
      return `Skapade kund: ${name}`;
    case 'tenant.deleted':
      return `Tog bort kund: ${name}`;
    case 'tenant.updated':
      return `Uppdaterade kund: ${name}`;
    case 'auth.password_changed':
      return `Ändrade lösenord för: ${name}`;
    case 'auth.password_reset':
      return `Begärde lösenordsåterställning för: ${name}`;
    case 'auth.login_failed':
      return `Misslyckad inloggning: ${metadata?.email || 'okänd'}`;
    default:
      return `Okänd händelse: ${eventType}`;
  }
}

/**
 * Get event type color for UI
 */
export function getEventTypeColor(eventType: AuditEventType): string {
  if (eventType.startsWith('user.created') || eventType.startsWith('tenant.created')) {
    return 'bg-green-100 text-green-800';
  }
  if (eventType.includes('deleted')) {
    return 'bg-red-100 text-red-800';
  }
  if (eventType.includes('activated')) {
    return 'bg-blue-100 text-blue-800';
  }
  if (eventType.includes('deactivated')) {
    return 'bg-amber-100 text-amber-800';
  }
  if (eventType.startsWith('auth.')) {
    return 'bg-purple-100 text-purple-800';
  }
  return 'bg-gray-100 text-gray-800';
}

/**
 * Get event type label for UI
 */
export function getEventTypeLabel(eventType: AuditEventType): string {
  const labels: Record<AuditEventType, string> = {
    'user.created': 'Användare skapad',
    'user.deleted': 'Användare borttagen',
    'user.permanently_deleted': 'Användare permanent borttagen',
    'user.activated': 'Användare aktiverad',
    'user.deactivated': 'Användare inaktiverad',
    'user.role_changed': 'Roll ändrad',
    'user.bulk_activated': 'Bulk aktivering',
    'user.bulk_deactivated': 'Bulk inaktivering',
    'tenant.created': 'Kund skapad',
    'tenant.deleted': 'Kund borttagen',
    'tenant.updated': 'Kund uppdaterad',
    'auth.password_changed': 'Lösenord ändrat',
    'auth.password_reset': 'Lösenordsåterställning',
    'auth.login_failed': 'Misslyckad inloggning',
  };
  return labels[eventType] || eventType;
}

/**
 * Simple in-memory rate limiter for login attempts
 *
 * Note: In-memory rate limiting has limitations in serverless environments
 * where instances are ephemeral. However, it provides an additional layer
 * on top of Supabase's built-in rate limiting (30 requests/min per IP).
 *
 * For production at scale, consider using Upstash Redis or a database-backed solution.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
}

// In-memory store for rate limiting
const loginAttempts = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up every 5 minutes

// Cleanup old entries periodically
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of loginAttempts.entries()) {
      if (now - entry.firstAttempt > WINDOW_MS) {
        loginAttempts.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Don't prevent Node from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Check if an IP is rate limited
 * @param ip - The IP address to check
 * @returns Object with isLimited flag and remaining time in seconds
 */
export function checkRateLimit(ip: string): {
  isLimited: boolean;
  remainingAttempts: number;
  resetInSeconds: number;
} {
  startCleanup();

  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) {
    return {
      isLimited: false,
      remainingAttempts: MAX_ATTEMPTS,
      resetInSeconds: 0
    };
  }

  // Check if window has expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return {
      isLimited: false,
      remainingAttempts: MAX_ATTEMPTS,
      resetInSeconds: 0
    };
  }

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - entry.attempts);
  const resetInSeconds = Math.ceil((WINDOW_MS - (now - entry.firstAttempt)) / 1000);

  return {
    isLimited: entry.attempts >= MAX_ATTEMPTS,
    remainingAttempts,
    resetInSeconds
  };
}

/**
 * Record a failed login attempt
 * @param ip - The IP address to record
 */
export function recordFailedAttempt(ip: string): void {
  startCleanup();

  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    // Start a new window
    loginAttempts.set(ip, {
      attempts: 1,
      firstAttempt: now
    });
  } else {
    // Increment attempts in current window
    entry.attempts++;
  }
}

/**
 * Clear rate limit for an IP (e.g., after successful login)
 * @param ip - The IP address to clear
 */
export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig(): { maxAttempts: number; windowMinutes: number } {
  return {
    maxAttempts: MAX_ATTEMPTS,
    windowMinutes: WINDOW_MS / 60000
  };
}

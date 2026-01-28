'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UseIdleTimeoutOptions {
  /** Timeout in minutes before showing warning (default: 25) */
  warningMinutes?: number;
  /** Timeout in minutes before logout (default: 30) */
  logoutMinutes?: number;
  /** Callback when warning is shown */
  onWarning?: () => void;
  /** Callback when logout happens */
  onLogout?: () => void;
}

export function useIdleTimeout({
  warningMinutes = 25,
  logoutMinutes = 30,
  onWarning,
  onLogout,
}: UseIdleTimeoutOptions = {}) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const warningMs = warningMinutes * 60 * 1000;
  const logoutMs = logoutMinutes * 60 * 1000;

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onLogout?.();
    router.push('/login?reason=timeout');
    router.refresh();
  }, [router, onLogout]);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);

    // Clear existing timers
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.floor((logoutMs - warningMs) / 1000));
      onWarning?.();

      // Start countdown
      countdownRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningMs);

    // Set logout timer
    logoutTimeoutRef.current = setTimeout(() => {
      handleLogout();
    }, logoutMs);
  }, [warningMs, logoutMs, handleLogout, onWarning]);

  const stayLoggedIn = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    // Activity events to track
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];

    // Throttle activity tracking to avoid excessive resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        // Only reset if warning is not showing (user must click to stay)
        if (!showWarning) {
          resetTimers();
        }
      }, 1000);
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimers();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [resetTimers, showWarning]);

  return {
    showWarning,
    remainingSeconds,
    stayLoggedIn,
    logout: handleLogout,
  };
}

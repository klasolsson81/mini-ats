'use client';

import { IdleTimeoutWarning } from './idle-timeout-warning';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <IdleTimeoutWarning />
    </>
  );
}

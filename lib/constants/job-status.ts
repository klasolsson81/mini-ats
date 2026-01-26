export const JOB_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

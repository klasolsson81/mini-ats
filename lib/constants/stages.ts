export const STAGES = {
  SOURCED: 'sourced',
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
} as const;

export type Stage = (typeof STAGES)[keyof typeof STAGES];

export const STAGE_ORDER: Stage[] = [
  STAGES.SOURCED,
  STAGES.APPLIED,
  STAGES.SCREENING,
  STAGES.INTERVIEW,
  STAGES.OFFER,
  STAGES.HIRED,
  STAGES.REJECTED,
];

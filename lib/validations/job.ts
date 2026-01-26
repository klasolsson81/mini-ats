import { z } from 'zod';
import { JOB_STATUS } from '../constants/job-status';

export const jobSchema = z.object({
  title: z.string().min(1, 'Titel krävs').max(200),
  description: z.string().min(1, 'Beskrivning krävs'),
  status: z.enum([JOB_STATUS.OPEN, JOB_STATUS.CLOSED]),
});

export type JobFormData = z.infer<typeof jobSchema>;

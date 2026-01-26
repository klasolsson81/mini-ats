import { z } from 'zod';

export const candidateSchema = z.object({
  full_name: z.string().min(1, 'Namn krävs').max(200),
  email: z.string().email('Ogiltig e-postadress').optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedin_url: z.string().url('Ogiltig URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;

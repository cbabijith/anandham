import { z } from 'zod';

export const dharmamPassageInput = z.object({
  verses: z.string().trim().min(1).max(50000),
  explanation: z.string().trim().min(1).max(50000),
});
export const dharmamInput = z.object({
  title: z.string().trim().min(1).max(200),
  transliteration: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  passages: z
    .array(dharmamPassageInput)
    .min(1)
    .max(100)
    .refine(
      (rows) => rows.reduce((n, p) => n + p.verses.length + p.explanation.length, 0) <= 500000,
      'Chapter text is too long',
    ),
  editorialNote: z.string().trim().max(2000).default(''),
  status: z.enum(['draft', 'published', 'archived']),
  sortOrder: z.number().int().min(0).max(10000),
  revision: z.number().int().positive().optional(),
});
export type DharmamInput = z.infer<typeof dharmamInput>;

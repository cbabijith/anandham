import { z } from 'zod';
import { categories } from './catalogue';
export const krithiInput = z.object({
  title: z.string().trim().min(1).max(200),
  transliteration: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().refine((v) => categories.some((c) => c.id === v), 'Choose a valid category'),
  body: z.string().trim().min(20).max(500000),
  status: z.enum(['draft', 'published', 'archived']),
  sortOrder: z.number().int().min(0).max(10000),
  revision: z.number().int().positive().optional(),
});
export type KrithiInput = z.infer<typeof krithiInput>;
export const listInput = z.object({
  q: z.string().max(150).default(''),
  category: z.string().max(40).default(''),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(60),
});

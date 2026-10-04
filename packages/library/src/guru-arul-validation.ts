import { z } from 'zod';
const status = z.enum(['draft', 'published', 'archived']);
export const guruArulInput = z
  .object({
    title: z.string().trim().min(1).max(250),
    english: z.string().trim().max(250),
    sortOrder: z.number().int().min(0).max(10000),
    status,
    revision: z.number().int().positive().optional(),
    quotes: z
      .array(
        z.object({
          id: z.string().min(1).max(150).optional(),
          text: z.string().trim().min(1).max(20000),
          attribution: z.string().trim().min(1).max(250),
          status,
        }),
      )
      .max(500),
  })
  .superRefine((topic, ctx) => {
    const ids = topic.quotes.flatMap((quote) => (quote.id ? [quote.id] : []));
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: 'custom',
        path: ['quotes'],
        message: 'Quote identifiers must be unique.',
      });
    if (topic.status === 'published' && !topic.quotes.some((quote) => quote.status === 'published'))
      ctx.addIssue({
        code: 'custom',
        path: ['quotes'],
        message: 'Add at least one published quote before publishing this topic.',
      });
  });
export const guruArulDeleteInput = z.object({ revision: z.number().int().positive() });
export type GuruArulInput = z.infer<typeof guruArulInput>;

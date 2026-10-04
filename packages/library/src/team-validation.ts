import { z } from 'zod';

export const teamPassword = z.string().min(12, 'Use at least 12 characters.').max(256);
export const teamMemberInput = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    password: teamPassword,
  })
  .strict();
export const teamMemberUpdate = z.discriminatedUnion('action', [
  z.object({ action: z.literal('reset-password'), password: teamPassword }).strict(),
  z.object({ action: z.literal('disable') }).strict(),
  z.object({ action: z.literal('enable') }).strict(),
]);

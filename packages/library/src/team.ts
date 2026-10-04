import { randomUUID, createHash } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { getDb } from './db';
import { admins, sessions, loginLimits } from './schema';
import { hashPassword } from './auth';
import { LibraryError } from './repository';
import { teamMemberInput, teamMemberUpdate } from './team-validation';

const publicFields = {
  id: admins.id,
  email: admins.email,
  role: admins.role,
  disabledAt: admins.disabledAt,
  createdAt: admins.createdAt,
};
export async function listTeamMembers() {
  return getDb().select(publicFields).from(admins).orderBy(asc(admins.createdAt));
}
export async function createTeamMember(raw: unknown) {
  const input = teamMemberInput.parse(raw);
  const [member] = await getDb()
    .insert(admins)
    .values({
      id: randomUUID(),
      email: input.email,
      passwordHash: hashPassword(input.password),
      role: 'editor',
    })
    .onConflictDoNothing({ target: admins.email })
    .returning(publicFields);
  if (!member) throw new LibraryError('An account with this email already exists.', 409);
  return member;
}
export async function updateTeamMember(id: string, raw: unknown) {
  const input = teamMemberUpdate.parse(raw);
  return getDb().transaction(async (tx) => {
    const [member] = await tx
      .select(publicFields)
      .from(admins)
      .where(eq(admins.id, id))
      .for('update');
    if (!member) throw new LibraryError('Team member not found.', 404);
    if (member.role === 'owner')
      throw new LibraryError('Owner accounts cannot be changed from the Team page.', 403);
    const changes =
      input.action === 'reset-password'
        ? { passwordHash: hashPassword(input.password) }
        : { disabledAt: input.action === 'disable' ? new Date() : null };
    const [updated] = await tx
      .update(admins)
      .set(changes)
      .where(eq(admins.id, id))
      .returning(publicFields);
    // Revoke sessions under the same row lock used by sign-in, including concurrent sign-ins.
    await tx.delete(sessions).where(eq(sessions.adminId, id));
    if (input.action !== 'disable') {
      const key = createHash('sha256').update(member.email).digest('hex');
      await tx.delete(loginLimits).where(eq(loginLimits.key, key));
    }
    return updated;
  });
}

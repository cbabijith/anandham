import { randomBytes, scryptSync, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { getDb } from './db';
import { admins, sessions, loginLimits } from './schema';
import { LibraryError } from './repository';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password: string, encoded: string) {
  const [salt, key] = encoded.split(':');
  if (!salt || !key || key.length !== 128) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(key, 'hex'));
}
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const dummyPassword = hashPassword(randomBytes(32).toString('hex'));
export async function authenticate(email: string, password: string) {
  const db = getDb();
  const key = digest(email.toLowerCase().trim());
  const [limit] = await db
    .insert(loginLimits)
    .values({ key, attempts: 1, resetsAt: new Date(Date.now() + 15 * 60 * 1000) })
    .onConflictDoUpdate({
      target: loginLimits.key,
      set: {
        attempts: sql`case when ${loginLimits.resetsAt} < now() then 1 else ${loginLimits.attempts} + 1 end`,
        resetsAt: sql`case when ${loginLimits.resetsAt} < now() then now() + interval '15 minutes' else ${loginLimits.resetsAt} end`,
      },
    })
    .returning();
  if (limit.attempts > 10)
    throw new LibraryError('Too many attempts. Please try again in 15 minutes.', 429);
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email.toLowerCase().trim()))
    .limit(1);
  const valid = verifyPassword(password, admin?.passwordHash ?? dummyPassword);
  if (!admin || !valid) throw new LibraryError('Incorrect email or password.', 401);
  const token = randomBytes(32).toString('hex');
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  await db.insert(sessions).values({
    tokenHash: digest(token),
    adminId: admin.id,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  });
  await db.delete(loginLimits).where(eq(loginLimits.key, key));
  return token;
}
export async function getAdmin(token?: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const [session] = await getDb()
    .select({ id: admins.id, email: admins.email })
    .from(sessions)
    .innerJoin(admins, eq(admins.id, sessions.adminId))
    .where(and(eq(sessions.tokenHash, digest(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return session ?? null;
}
export async function revokeSession(token: string) {
  await getDb()
    .delete(sessions)
    .where(eq(sessions.tokenHash, digest(token)));
}
export async function bootstrapAdmin(email: string, password: string) {
  if (password.length < 16)
    throw new Error('Bootstrap password must contain at least 16 characters.');
  await getDb()
    .insert(admins)
    .values({
      id: randomUUID(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
    })
    .onConflictDoNothing({ target: admins.email });
}

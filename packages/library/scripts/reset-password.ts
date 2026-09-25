import { eq } from 'drizzle-orm';
import { getDb, getSql } from '../src/db';
import { admins, sessions } from '../src/schema';
import { hashPassword } from '../src/auth';
// Run with a trusted server environment; the new password comes from an environment
// variable rather than a command argument so it is not put in shell history.
try {
  const email = process.env.LIBRARY_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.LIBRARY_NEW_PASSWORD;
  if (!email || !password || password.length < 16)
    throw new Error('Set LIBRARY_ADMIN_EMAIL and LIBRARY_NEW_PASSWORD (16+ characters).');
  await getDb().transaction(async (tx) => {
    const [admin] = await tx
      .update(admins)
      .set({ passwordHash: hashPassword(password) })
      .where(eq(admins.email, email))
      .returning({ id: admins.id });
    if (!admin) throw new Error('Administrator not found.');
    await tx.delete(sessions).where(eq(sessions.adminId, admin.id));
  });
  console.log('Password changed. All sessions for this administrator have been revoked.');
} finally {
  await getSql().end();
}

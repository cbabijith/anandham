import { eq, sql } from 'drizzle-orm';
import { getDb } from './db';
import { guruArulTopics, imports } from './schema';
import { guruArulInput } from './guru-arul-validation';
import type { GuruArulEntry } from './guru-arul';
import topics from '../data/guru-arul-topics.json';

export async function seedGuruArul() {
  return getDb().transaction(async (tx) => {
    // Import once, including after editorial deletions, even if services start together.
    await tx.execute(sql`select pg_advisory_xact_lock(74182904)`);
    const importId = 'guru-arul-2026-10-04';
    const [done] = await tx.select().from(imports).where(eq(imports.id, importId));
    if (done) return 0;
    const rows = topics.map((topic) => ({
      ...guruArulInput.parse(topic),
      id: topic.id,
      quotes: topic.quotes as GuruArulEntry[],
    }));
    const added = await tx
      .insert(guruArulTopics)
      .values(rows)
      .onConflictDoNothing()
      .returning({ id: guruArulTopics.id });
    await tx
      .insert(imports)
      .values({
        id: importId,
        sourceUrl: 'editorial:guru-arul-2026-10-04',
        sourceCount: 182,
        insertedCount: added.length,
        manifest: {
          topics: 21,
          quotes: 182,
          sourceFile: 'data/sources/guru-arul-2026-10-04.txt',
          sha256: 'd22d4960fac8173b03cfd372b68ddf6e8b7f7c584280f63cd980890350b36501',
        },
      });
    return added.length;
  });
}

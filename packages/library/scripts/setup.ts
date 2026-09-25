import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { getDb, getSql } from '../src/db';
import { bootstrapAdmin } from '../src/auth';
import { krithis, imports } from '../src/schema';

try {
  const db = getDb();
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) });
  const rows = JSON.parse(await readFile(new URL('../data/krithis.json', import.meta.url), 'utf8'));
  const manifest = JSON.parse(
    await readFile(new URL('../data/import-manifest.json', import.meta.url), 'utf8'),
  );
  if (rows.length !== manifest.catalogueCount || manifest.failedCount !== 0)
    throw new Error('Incomplete source import.');
  const inserted = await db.transaction(async (tx) => {
    const added = await tx
      .insert(krithis)
      .values(
        rows.map((row: typeof krithis.$inferInsert) => ({
          ...row,
          id: `sivagiri-${row.sourceId}`,
          sourceBody: row.body,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: krithis.id });
    if (added.length)
      await tx
        .insert(imports)
        .values({
          id: randomUUID(),
          sourceUrl: manifest.sourceUrl,
          sourceCount: rows.length,
          insertedCount: added.length,
          manifest,
        });
    return added.length;
  });
  if (process.env.LIBRARY_ADMIN_EMAIL && process.env.LIBRARY_ADMIN_PASSWORD)
    await bootstrapAdmin(process.env.LIBRARY_ADMIN_EMAIL, process.env.LIBRARY_ADMIN_PASSWORD);
  console.log(
    `Database migrated. ${inserted} source entries inserted; existing editorial changes preserved.`,
  );
} finally {
  await getSql().end();
}

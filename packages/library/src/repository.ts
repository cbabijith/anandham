import { and, eq, asc, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import { krithis, auditLog, imports, type Krithi, type KrithiSummary } from './schema';
import { categories, normalizeSearch } from './catalogue';
import { krithiInput } from './validation';

export class LibraryError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function summarize(k: Krithi): KrithiSummary {
  const { body, sourceBody: _sourceBody, ...rest } = k;
  void _sourceBody;
  return {
    ...rest,
    excerpt: body.split('\n').filter(Boolean).slice(1, 3).join(' ').slice(0, 160),
    characters: body.length,
  };
}
export async function listKrithis(admin = false) {
  return getDb()
    .select()
    .from(krithis)
    .where(admin ? undefined : eq(krithis.status, 'published'))
    .orderBy(asc(krithis.sortOrder), asc(krithis.title));
}
export async function getKrithi(slug: string, admin = false) {
  const [record] = await getDb()
    .select()
    .from(krithis)
    .where(and(eq(krithis.slug, slug), admin ? undefined : eq(krithis.status, 'published')))
    .limit(1);
  return record;
}
export function filterKrithis<
  T extends { title: string; transliteration: string; category: string; body?: string },
>(rows: T[], q = '', category = '') {
  const search = normalizeSearch(q);
  return rows.filter(
    (k) =>
      (!category || k.category === category) &&
      (!search ||
        normalizeSearch(`${k.title} ${k.transliteration} ${k.body ?? ''}`).includes(search)),
  );
}
export async function saveKrithi(raw: unknown, adminId: string, id?: string) {
  const input = krithiInput.parse(raw);
  const category = categories.find((c) => c.id === input.category)!;
  const { revision, ...content } = input;
  if (id && !revision) throw new LibraryError('Revision is required when editing.');
  return getDb().transaction(async (tx) => {
    const fields = {
      ...content,
      categoryName: category.name,
      categoryMalayalam: category.malayalam,
      updatedAt: new Date(),
    };
    let record: Krithi;
    if (id) {
      const [updated] = await tx
        .update(krithis)
        .set({ ...fields, revision: sql`${krithis.revision} + 1` })
        .where(and(eq(krithis.id, id), eq(krithis.revision, revision!)))
        .returning();
      if (!updated)
        throw new LibraryError(
          'This work has changed since you opened it. Reload before saving.',
          409,
        );
      record = updated;
    } else {
      [record] = await tx
        .insert(krithis)
        .values({ id: randomUUID(), ...fields })
        .returning();
    }
    await tx.insert(auditLog).values({
      id: randomUUID(),
      adminId,
      krithiId: record.id,
      action: id ? 'updated' : 'created',
      snapshot: record,
    });
    return record;
  });
}
export async function getLibraryStats() {
  const records = await listKrithis(true);
  const [lastImport] = await getDb()
    .select()
    .from(imports)
    .orderBy(desc(imports.createdAt))
    .limit(1);
  const recentChanges = await getDb()
    .select({
      id: auditLog.id,
      action: auditLog.action,
      createdAt: auditLog.createdAt,
      title: krithis.title,
    })
    .from(auditLog)
    .leftJoin(krithis, eq(auditLog.krithiId, krithis.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(12);
  return {
    total: records.length,
    published: records.filter((x) => x.status === 'published').length,
    drafts: records.filter((x) => x.status === 'draft').length,
    archived: records.filter((x) => x.status === 'archived').length,
    sourced: records.filter((x) => x.sourceId !== null).length,
    lastImport,
    recentChanges,
  };
}

import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import { dharmamChapters, dharmamAuditLog, type DharmamChapter } from './schema';
import { dharmamInput } from './dharmam-validation';
import { normalizeSearch } from './catalogue';
import { LibraryError } from './repository';

export function publicDharmam(chapter: DharmamChapter) {
  const { sourcePassages, editorialNote, ...publicFields } = chapter;
  void sourcePassages;
  void editorialNote;
  return publicFields;
}
export function summarizeDharmam(chapter: DharmamChapter) {
  const { passages, ...fields } = publicDharmam(chapter);
  return {
    ...fields,
    excerpt: passages[0]?.verses.slice(0, 140) ?? '',
    passageCount: passages.length,
  };
}
export type DharmamSummary = ReturnType<typeof summarizeDharmam>;
export async function listDharmam(admin = false) {
  return getDb()
    .select()
    .from(dharmamChapters)
    .where(admin ? undefined : eq(dharmamChapters.status, 'published'))
    .orderBy(asc(dharmamChapters.sortOrder), asc(dharmamChapters.title));
}
export async function getDharmam(slug: string, admin = false) {
  const [chapter] = await getDb()
    .select()
    .from(dharmamChapters)
    .where(
      and(
        eq(dharmamChapters.slug, slug),
        admin ? undefined : eq(dharmamChapters.status, 'published'),
      ),
    )
    .limit(1);
  return chapter;
}
export async function getDharmamById(id: string) {
  const [chapter] = await getDb()
    .select()
    .from(dharmamChapters)
    .where(eq(dharmamChapters.id, id))
    .limit(1);
  return chapter;
}
export function filterDharmam(rows: DharmamChapter[], query: string) {
  const q = normalizeSearch(query);
  return rows.filter(
    (c) =>
      !q ||
      normalizeSearch(
        `${c.title} ${c.transliteration} ${c.passages.map((p) => `${p.verses} ${p.explanation}`).join(' ')}`,
      ).includes(q),
  );
}
export async function dharmamHistory(id: string) {
  return getDb()
    .select({
      id: dharmamAuditLog.id,
      action: dharmamAuditLog.action,
      createdAt: dharmamAuditLog.createdAt,
    })
    .from(dharmamAuditLog)
    .where(eq(dharmamAuditLog.chapterId, id))
    .orderBy(desc(dharmamAuditLog.createdAt))
    .limit(30);
}
export async function saveDharmam(raw: unknown, adminId: string, id?: string) {
  const { revision, ...content } = dharmamInput.parse(raw);
  if (id && !revision) throw new LibraryError('Revision is required when editing.');
  return getDb().transaction(async (tx) => {
    let record: DharmamChapter;
    if (id) {
      const [updated] = await tx
        .update(dharmamChapters)
        .set({ ...content, revision: sql`${dharmamChapters.revision} + 1`, updatedAt: new Date() })
        .where(and(eq(dharmamChapters.id, id), eq(dharmamChapters.revision, revision!)))
        .returning();
      if (!updated)
        throw new LibraryError(
          'This chapter has changed since you opened it. Reload before saving.',
          409,
        );
      record = updated;
    } else {
      [record] = await tx
        .insert(dharmamChapters)
        .values({ id: randomUUID(), ...content })
        .returning();
    }
    await tx
      .insert(dharmamAuditLog)
      .values({
        id: randomUUID(),
        adminId,
        chapterId: record.id,
        action: id ? 'updated' : 'created',
        snapshot: record,
      });
    return record;
  });
}

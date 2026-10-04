import { randomUUID } from 'node:crypto';
import { asc, desc, eq } from 'drizzle-orm';
import { getDb } from './db';
import { guruArulTopics, guruArulAuditLog } from './schema';
import { guruArulInput, guruArulDeleteInput } from './guru-arul-validation';
import { publicGuruArul } from './guru-arul';
import { LibraryError } from './repository';

export async function listGuruArulTopics() {
  return getDb()
    .select()
    .from(guruArulTopics)
    .orderBy(asc(guruArulTopics.sortOrder), asc(guruArulTopics.id));
}
export async function readGuruArul() {
  const topics = await getDb()
    .select()
    .from(guruArulTopics)
    .where(eq(guruArulTopics.status, 'published'))
    .orderBy(asc(guruArulTopics.sortOrder), asc(guruArulTopics.id));
  return publicGuruArul(topics);
}
export async function getGuruArulTopic(id: string) {
  const [topic] = await getDb()
    .select()
    .from(guruArulTopics)
    .where(eq(guruArulTopics.id, id))
    .limit(1);
  return topic;
}
export async function guruArulHistory(id: string) {
  return getDb()
    .select({
      id: guruArulAuditLog.id,
      action: guruArulAuditLog.action,
      createdAt: guruArulAuditLog.createdAt,
    })
    .from(guruArulAuditLog)
    .where(eq(guruArulAuditLog.topicId, id))
    .orderBy(desc(guruArulAuditLog.createdAt))
    .limit(30);
}
export async function saveGuruArulTopic(raw: unknown, adminId: string, id?: string) {
  const { revision, quotes, ...content } = guruArulInput.parse(raw);
  if (id && !revision) throw new LibraryError('Revision is required when editing.');
  return getDb().transaction(async (tx) => {
    const [previous] = id
      ? await tx.select().from(guruArulTopics).where(eq(guruArulTopics.id, id)).for('update')
      : [];
    if (id && !previous) throw new LibraryError('Topic not found.', 404);
    if (previous && previous.revision !== revision)
      throw new LibraryError(
        'This topic has changed. Reload before saving to avoid overwriting another editor.',
        409,
      );
    const existingIds = new Set(previous?.quotes.map((quote) => quote.id));
    if (quotes.some((quote) => quote.id && !existingIds.has(quote.id)))
      throw new LibraryError('A quote does not belong to this topic. Reload before saving.');
    const values = {
      ...content,
      quotes: quotes.map((quote) => ({ ...quote, id: quote.id ?? randomUUID() })),
    };
    const [record] = previous
      ? await tx
          .update(guruArulTopics)
          .set({ ...values, revision: previous.revision + 1, updatedAt: new Date() })
          .where(eq(guruArulTopics.id, previous.id))
          .returning()
      : await tx
          .insert(guruArulTopics)
          .values({ ...values, id: randomUUID() })
          .returning();
    await tx
      .insert(guruArulAuditLog)
      .values({
        id: randomUUID(),
        topicId: record.id,
        adminId,
        action: previous ? 'updated' : 'created',
        snapshot: record,
      });
    return record;
  });
}
export async function deleteGuruArulTopic(id: string, raw: unknown, adminId: string) {
  const { revision } = guruArulDeleteInput.parse(raw);
  await getDb().transaction(async (tx) => {
    const [record] = await tx
      .select()
      .from(guruArulTopics)
      .where(eq(guruArulTopics.id, id))
      .for('update');
    if (!record) throw new LibraryError('Topic not found.', 404);
    if (record.revision !== revision)
      throw new LibraryError('This topic has changed. Reload before deleting.', 409);
    await tx
      .insert(guruArulAuditLog)
      .values({ id: randomUUID(), topicId: id, adminId, action: 'deleted', snapshot: record });
    await tx.delete(guruArulTopics).where(eq(guruArulTopics.id, id));
  });
}

import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { getKrithi } from '@anandham/library/repository';
import { getDb } from '@anandham/library/db';
import { auditLog } from '@anandham/library/schema';
import { requireAdmin } from '@/features/library/server';
import { KrithiEditor } from '@/features/library/krithi-editor';
export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const work = await getKrithi((await params).slug, true);
  if (!work) notFound();
  const history = await getDb()
    .select({ id: auditLog.id, createdAt: auditLog.createdAt, action: auditLog.action })
    .from(auditLog)
    .where(eq(auditLog.krithiId, work.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(20);
  return (
    <>
      <KrithiEditor
        work={{
          id: work.id,
          title: work.title,
          transliteration: work.transliteration,
          slug: work.slug,
          category: work.category,
          body: work.body,
          status: work.status,
          sortOrder: work.sortOrder,
          revision: work.revision,
          sourceUrl: work.sourceUrl,
          sourceHash: work.sourceHash,
          sourceBody: work.sourceBody,
        }}
        readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
      />
      <section className="la-panel">
        <h2>Editorial history</h2>
        {history.length ? (
          <ul className="la-activity">
            {history.map((h) => (
              <li key={h.id}>
                <span>{h.action}</span>
                <time>{h.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="la-help-text">Original import. No editorial changes yet.</p>
        )}
      </section>
    </>
  );
}

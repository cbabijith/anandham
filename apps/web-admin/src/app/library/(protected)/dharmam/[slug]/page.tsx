import { notFound } from 'next/navigation';
import { getDharmam, dharmamHistory } from '@anandham/library/dharmam-repository';
import { requireAdmin } from '@/features/library/server';
import { DharmamEditor } from '@/features/dharmam/dharmam-editor';
export default async function EditChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const chapter = await getDharmam((await params).slug, true);
  if (!chapter) notFound();
  const history = await dharmamHistory(chapter.id);
  return (
    <>
      <DharmamEditor
        chapter={{
          id: chapter.id,
          title: chapter.title,
          transliteration: chapter.transliteration,
          slug: chapter.slug,
          passages: chapter.passages,
          editorialNote: chapter.editorialNote,
          sortOrder: chapter.sortOrder,
          status: chapter.status,
          revision: chapter.revision,
          sourceLabel: chapter.sourceLabel,
          sourcePassages: chapter.sourcePassages,
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
          <p className="la-help-text">Original contribution. No editorial changes yet.</p>
        )}
      </section>
    </>
  );
}

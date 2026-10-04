import { notFound } from 'next/navigation';
import { getGuruArulTopic, guruArulHistory } from '@anandham/library/guru-arul-repository';
import { requireAdmin } from '@/features/library/server';
import { GuruArulEditor } from '@/features/guru-arul/guru-arul-editor';
export default async function EditGuruArulPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const topic = await getGuruArulTopic((await params).id);
  if (!topic) notFound();
  const history = await guruArulHistory(topic.id);
  const { createdAt, updatedAt, ...content } = topic;
  void createdAt;
  void updatedAt;
  return (
    <>
      <GuruArulEditor
        key={topic.id}
        topic={content}
        readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
      />
      <section className="la-panel">
        <h2>Editorial history</h2>
        {history.length ? (
          <ul className="la-activity">
            {history.map((entry) => (
              <li key={entry.id}>
                <span>{entry.action}</span>
                <time>
                  {entry.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </time>
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

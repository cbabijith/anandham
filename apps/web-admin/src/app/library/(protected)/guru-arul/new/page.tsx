import { listGuruArulTopics } from '@anandham/library/guru-arul-repository';
import { requireAdmin } from '@/features/library/server';
import { GuruArulEditor } from '@/features/guru-arul/guru-arul-editor';
export default async function NewGuruArulPage() {
  await requireAdmin();
  const topics = await listGuruArulTopics();
  return (
    <GuruArulEditor
      nextOrder={Math.max(-1, ...topics.map((topic) => topic.sortOrder)) + 1}
      readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
    />
  );
}

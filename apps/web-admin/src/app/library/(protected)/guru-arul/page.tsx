import { listGuruArulTopics } from '@anandham/library/guru-arul-repository';
import { requireAdmin } from '@/features/library/server';
import { GuruArulTable } from '@/features/guru-arul/guru-arul-table';
export default async function GuruArulPage() {
  await requireAdmin();
  const topics = await listGuruArulTopics();
  return (
    <GuruArulTable
      topics={topics.map(({ createdAt, updatedAt, ...topic }) => {
        void createdAt;
        void updatedAt;
        return topic;
      })}
      readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
    />
  );
}

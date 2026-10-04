import { getSql } from '@anandham/library/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await getSql()`select 1 from library_guru_arul_topics limit 1`;
    const [row] =
      await getSql()`select count(*)::int as count from library_krithis where status = 'published'`;
    const [chapters] =
      await getSql()`select count(*)::int as count from library_dharmam_chapters where status = 'published'`;
    return Response.json({ status: 'ok', published: row.count, dharmamPublished: chapters.count });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}

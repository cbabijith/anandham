import { NextRequest, NextResponse } from 'next/server';
import { listDharmam, filterDharmam, summarizeDharmam } from '@anandham/library/dharmam-repository';
import { listInput } from '@anandham/library/validation';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const parsed = listInput
    .omit({ category: true })
    .safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
  try {
    const { q, page, limit } = parsed.data;
    const rows = filterDharmam(await listDharmam(), q);
    return NextResponse.json(
      {
        data: rows.slice((page - 1) * limit, page * limit).map(summarizeDharmam),
        total: rows.length,
        page,
        limit,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'The library is temporarily unavailable.' }, { status: 503 });
  }
}

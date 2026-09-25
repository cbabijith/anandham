import { NextRequest, NextResponse } from 'next/server';
import { listKrithis, filterKrithis, summarize } from '@anandham/library/repository';
import { listInput } from '@anandham/library/validation';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const parsed = listInput.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid search parameters', details: parsed.error.flatten() },
      { status: 400 },
    );
  try {
    const { q, category, page, limit } = parsed.data;
    const rows = filterKrithis(await listKrithis(), q, category);
    return NextResponse.json(
      {
        data: rows.slice((page - 1) * limit, page * limit).map(summarize),
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

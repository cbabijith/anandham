import { NextResponse } from 'next/server';
import { listDharmam, saveDharmam, summarizeDharmam } from '@anandham/library/dharmam-repository';
import { apiError, checkOrigin, readJson, requireApiAdmin } from '@/features/library/server';
export async function GET() {
  try {
    await requireApiAdmin();
    return NextResponse.json(
      { data: (await listDharmam(true)).map(summarizeDharmam) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const admin = await requireApiAdmin();
    return NextResponse.json(
      { data: await saveDharmam(await readJson(request), admin.id) },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

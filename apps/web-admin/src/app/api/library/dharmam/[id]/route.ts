import { NextResponse } from 'next/server';
import { getDharmamById, dharmamHistory, saveDharmam } from '@anandham/library/dharmam-repository';
import { apiError, checkOrigin, readJson, requireApiAdmin } from '@/features/library/server';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin();
    const { id } = await params;
    const data = await getDharmamById(id);
    if (!data) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    return NextResponse.json(
      { data, history: await dharmamHistory(id) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    const admin = await requireApiAdmin();
    return NextResponse.json({
      data: await saveDharmam(await readJson(request), admin.id, (await params).id),
    });
  } catch (error) {
    return apiError(error);
  }
}

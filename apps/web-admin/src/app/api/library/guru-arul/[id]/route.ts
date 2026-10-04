import { NextResponse } from 'next/server';
import {
  deleteGuruArulTopic,
  getGuruArulTopic,
  guruArulHistory,
  saveGuruArulTopic,
} from '@anandham/library/guru-arul-repository';
import { apiError, checkOrigin, readJson, requireApiAdmin } from '@/features/library/server';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireApiAdmin();
    const { id } = await params;
    const data = await getGuruArulTopic(id);
    if (!data) return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    return NextResponse.json(
      { data, history: await guruArulHistory(id) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    checkOrigin(request);
    const admin = await requireApiAdmin();
    return NextResponse.json({
      data: await saveGuruArulTopic(await readJson(request), admin.id, (await params).id),
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    checkOrigin(request);
    const admin = await requireApiAdmin();
    await deleteGuruArulTopic((await params).id, await readJson(request), admin.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authenticate, revokeSession } from '@anandham/library/auth';
import { apiError, checkOrigin, readJson, COOKIE } from '@/features/library/server';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const input = z
      .object({ email: z.email().max(254), password: z.string().min(1).max(256) })
      .parse(await readJson(request));
    const token = await authenticate(input.email, input.password);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const token = (await cookies()).get(COOKIE)?.value;
    if (token) await revokeSession(token);
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(COOKIE);
    return response;
  } catch (error) {
    return apiError(error);
  }
}

import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAdmin } from '@anandham/library/auth';
import { LibraryError } from '@anandham/library/repository';
export const COOKIE = 'anandham_library_session';
export async function currentAdmin() {
  return getAdmin((await cookies()).get(COOKIE)?.value);
}
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect('/library/login');
  return admin;
}
export async function requireApiAdmin() {
  const admin = await currentAdmin();
  if (!admin) throw new LibraryError('Please sign in to continue.', 401);
  return admin;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const allowed = process.env.LIBRARY_ADMIN_ORIGIN || new URL(request.url).origin;
  if (!origin || origin !== allowed) throw new LibraryError('Request origin is not allowed.', 403);
}
export async function readJson(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new LibraryError('Use application/json.', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new LibraryError('A request body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 2_000_000) {
      await reader.cancel();
      throw new LibraryError('Request is too large.', 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new LibraryError('Invalid JSON body.');
  }
}
export function apiError(error: unknown) {
  if (error instanceof LibraryError)
    return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  const code =
    (error as { code?: string; cause?: { code?: string } })?.cause?.code ??
    (error as { code?: string })?.code;
  if (code === '23505')
    return NextResponse.json(
      { error: 'This URL slug is already used by another work.' },
      { status: 409 },
    );
  console.error('Library API failed', error instanceof Error ? error.message : 'Unknown error');
  return NextResponse.json(
    { error: 'The library service is temporarily unavailable. Please try again.' },
    { status: 503 },
  );
}

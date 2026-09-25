import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Library pages and APIs verify PostgreSQL sessions on the server themselves.
  if (path === '/library' || path.startsWith('/library/') || path.startsWith('/api/library/'))
    return NextResponse.next();
  if (process.env.LIBRARY_MODE === 'true') {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.redirect(new URL('/library', request.url));
  }
  if (path.startsWith('/api/')) return NextResponse.next();
  return updateSession(request);
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|css|js|map)$).*)',
  ],
};

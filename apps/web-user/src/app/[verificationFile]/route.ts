// IndexNow verifies control of the public host by fetching this exact key file.
export const dynamic = 'force-dynamic';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ verificationFile: string }> },
) {
  const key = process.env.INDEXNOW_KEY;
  const { verificationFile } = await params;
  if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key) || verificationFile !== `${key}.txt`)
    return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

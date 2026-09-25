/** Read-only SEO smoke test, suitable for a local production build or the live site. */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const base = process.env.SEO_BASE_URL || 'https://anandham.online';
const canonical = 'https://anandham.online';
const bot = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
async function get(path) {
  const response = await fetch(`${base}${path}`, {
    headers: { 'User-Agent': bot },
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200, path);
  return response;
}
const robots = await (await get('/robots.txt')).text();
assert.ok(robots.includes(`Sitemap: ${canonical}/sitemap.xml`));
assert.ok(robots.includes('Allow: /'));
const xml = await (await get('/sitemap.xml')).text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.equal(new Set(urls).size, urls.length);
const [works, chapters] = await Promise.all(
  ['/api/krithis', '/api/dharmam'].map(async (path) => (await get(path)).json()),
);
assert.equal(urls.length, works.total + chapters.total + 6);
assert.ok(
  urls.every(
    (url) => url.startsWith(canonical + '/') && !url.includes('/api/') && !url.includes('/login'),
  ),
);
assert.ok(xml.includes('hreflang="ml"'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const titles = new Set();
  for (let i = 0; i < urls.length; i += 4) {
    const documents = await Promise.all(
      urls.slice(i, i + 4).map(async (url) => {
        const path = new URL(url).pathname;
        const response = await get(path);
        assert.equal(response.headers.get('x-powered-by'), null);
        return { path, html: await response.text() };
      }),
    );
    for (const { path, html } of documents) {
      const data = await page.evaluate((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return {
          title: doc.title,
          description: doc.querySelector('meta[name="description"]')?.getAttribute('content'),
          canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
          robots: doc.querySelector('meta[name="robots"]')?.getAttribute('content'),
          images: doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
          alternates: [...doc.querySelectorAll('link[hreflang]')].map((a) => [
            a.getAttribute('hreflang'),
            a.getAttribute('href'),
          ]),
          h1: doc.querySelector('h1')?.textContent,
          schemas: [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) =>
            JSON.parse(s.textContent),
          ),
        };
      }, html);
      assert.ok(data.title?.includes('Anandham'), path);
      assert.ok(!titles.has(data.title), `Duplicate title: ${path}`);
      titles.add(data.title);
      assert.ok(data.description?.length > 40, path);
      assert.equal(new URL(data.canonical).href, new URL(canonical + path).href);
      assert.ok(!data.robots?.includes('noindex'), path);
      assert.equal(data.images, `${canonical}/branding/library-social.png`);
      assert.ok(data.h1, `Missing crawlable h1: ${path}`);
      if (path !== '/about') assert.ok(data.schemas.length > 0, `Missing JSON-LD: ${path}`);
      if (path.endsWith('/sree-narayana-guru')) {
        assert.ok(
          data.alternates.some(
            ([language, url]) => language === 'ml' && url === canonical + '/ml/sree-narayana-guru',
          ),
        );
        assert.ok(
          data.alternates.some(
            ([language, url]) => language === 'en' && url === canonical + '/sree-narayana-guru',
          ),
        );
      }
    }
  }
} finally {
  await browser.close();
}
for (const path of [
  '/favicon.ico',
  '/branding/icon.svg',
  '/branding/icon-192.png',
  '/branding/icon-512.png',
  '/branding/apple-touch-icon.png',
  '/branding/library-social.png',
  '/manifest.webmanifest',
])
  await get(path);
for (const path of ['/next.svg', '/vercel.svg', '/krithis/not-a-work', '/dharmam/not-a-chapter']) {
  const response = await fetch(base + path, { headers: { 'User-Agent': bot } });
  assert.equal(response.status, 404, path);
}
console.log(
  `PASS: ${urls.length} canonical public pages, unique metadata, parseable JSON-LD, reciprocal language links, sitemap, robots, branding assets and real missing-page status.`,
);

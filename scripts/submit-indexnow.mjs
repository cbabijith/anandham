import assert from 'node:assert/strict';
const origin = 'https://anandham.online';
const key = process.env.INDEXNOW_KEY;
assert.ok(
  key && /^[a-zA-Z0-9-]{8,128}$/.test(key),
  'Set INDEXNOW_KEY to the deployed verification key.',
);
const keyLocation = `${origin}/${key}.txt`;
const proof = await fetch(keyLocation, { signal: AbortSignal.timeout(30000) });
assert.equal(proof.status, 200);
assert.equal((await proof.text()).trim(), key);
const sitemap = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(30000) });
assert.equal(sitemap.status, 200);
const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.ok(urls.length && urls.every((url) => new URL(url).origin === origin));
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(origin).hostname, key, keyLocation, urlList: urls }),
  signal: AbortSignal.timeout(30000),
});
assert.ok([200, 202].includes(response.status), `IndexNow returned HTTP ${response.status}`);
console.log(
  `IndexNow received ${urls.length} URLs (HTTP ${response.status}). ${response.status === 202 ? 'Key validation is pending. ' : ''}This does not confirm indexing or ranking.`,
);

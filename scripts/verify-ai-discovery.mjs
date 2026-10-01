/** Read-only retrieval checks. Simulated user agents do not prove a provider has indexed a site. */
import assert from 'node:assert/strict';
const base = process.env.SEO_BASE_URL || 'https://anandham.online';
const canonical = 'https://anandham.online';
const agents = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'Googlebot', 'bingbot'];
async function get(path, userAgent = 'AnandhamDiscoveryCheck/1.0') {
  return fetch(base + path, { headers: { 'User-Agent': userAgent }, signal: AbortSignal.timeout(30000) });
}
const robotResponse = await get('/robots.txt');
assert.equal(robotResponse.status, 200);
const robots = await robotResponse.text();
for (const agent of ['*', ...agents, 'Google-Extended']) {
  const group = robots.split(/\n\s*\n/).find((group) => group.toLowerCase().includes(`user-agent: ${agent.toLowerCase()}\n`));
  assert.ok(group, `Missing explicit robots group: ${agent}`);
  assert.ok(group.includes('Allow: /\n'), `Public crawl permission: ${agent}`);
  for (const exclusion of ['/api/', '/login', '/library/'])
    assert.ok(group.includes(`Disallow: ${exclusion}`), `Missing exclusion: ${agent} ${exclusion}`);
  assert.ok(!/^Disallow: \/$/m.test(group), `Blocked public crawling: ${agent}`);
}
const indexResponse = await get('/llms.txt');
assert.equal(indexResponse.status, 200);
assert.match(indexResponse.headers.get('content-type'), /text\/plain.*utf-8/);
const index = await indexResponse.text();
const textLinks = [...index.matchAll(/\[Plain text\]\(([^)]+)\)/g)].map((match) => match[1]);
assert.equal(textLinks.length, new Set(textLinks).size);
let expected = 0;
let firstChapter;
for (const collection of ['krithis', 'dharmam']) {
  const listResponse = await get(`/api/${collection}?limit=100`);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert.equal(list.total, list.data.length);
  expected += list.total;
  if (collection === 'dharmam') firstChapter = list.data[0];
  for (let i = 0; i < list.data.length; i += 4) {
    await Promise.all(list.data.slice(i, i + 4).map(async (entry) => {
      assert.equal(entry.status, 'published');
      const path = `/${collection}/${entry.slug}`;
      assert.ok(textLinks.includes(canonical + path + '/text'), `Missing text link: ${path}`);
      const [sourceResponse, response] = await Promise.all([get(`/api${path}`), get(path + '/text')]);
      assert.equal(sourceResponse.status, 200);
      assert.equal(response.status, 200, path);
      const { data } = await sourceResponse.json();
      const text = await response.text();
      assert.equal(response.headers.get('link'), `<${canonical}${path}>; rel="canonical"`);
      assert.match(response.headers.get('content-type'), /text\/plain.*utf-8/);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
      assert.ok(text.includes(data.title) && text.includes(data.transliteration));
      assert.ok(text.includes(new Date(data.updatedAt).toISOString()));
      if (collection === 'krithis') {
        assert.ok(text.includes(data.body), `Changed/missing body: ${path}`);
        if (data.sourceUrl) assert.ok(text.includes(data.sourceUrl), `Missing source: ${path}`);
      } else {
        data.passages.forEach((passage, p) => {
          assert.ok(text.includes(passage.verses), `Missing verses: ${path} ${p}`);
          assert.ok(text.includes(passage.explanation), `Missing meaning: ${path} ${p}`);
          assert.ok(text.includes(`${canonical}${path}#passage-${p + 1}`));
        });
        assert.ok(!text.includes('Author: Sree Narayana Guru'), 'Do not invent Dharmam authorship');
      }
    }));
  }
}
assert.equal(textLinks.length, expected, 'Index must contain only published records');
for (const agent of agents) {
  for (const path of ['/krithis/daiva-dasakam', `/dharmam/${firstChapter.slug}`]) {
    const response = await get(path, agent);
    assert.equal(response.status, 200, `${agent}: ${path}`);
    assert.equal(response.headers.get('x-vercel-mitigated'), null, `${agent}: challenge`);
    assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'));
    const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    assert.ok(html.includes('<article id="text"'), `${agent}: missing server-rendered reading text`);
    assert.ok(html.includes(`href="${canonical}${path}/text"`), `${agent}: missing alternate`);
    assert.ok(html.includes('type="text/plain"'), `${agent}: missing plain text link`);
    assert.ok(html.includes('Cite this'), `${agent}: missing citation`);
    if (path.startsWith('/dharmam/')) assert.ok(html.includes('id="passage-1"'));
  }
}
for (const collection of ['krithis', 'dharmam'])
  assert.equal((await get(`/${collection}/not-a-published-work/text`)).status, 404);
console.log(`PASS: ${expected} exact published text editions, catalogue, source attribution, canonical headers, 404s and ${agents.length} simulated crawler agents. This does not confirm actual crawling, indexing or ranking.`);

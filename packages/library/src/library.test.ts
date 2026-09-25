import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { categories, normalizeSearch } from './catalogue';
import { hashPassword, verifyPassword } from './auth';
import { krithiInput, listInput } from './validation';
import { filterKrithis } from './repository';
const corpus = JSON.parse(readFileSync(new URL('../data/krithis.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(
  readFileSync(new URL('../data/import-manifest.json', import.meta.url), 'utf8'),
);
test('Every Sivagiri source ID is imported once, in valid categories, with matching manifest hashes', () => {
  assert.equal(corpus.length, 60);
  assert.equal(manifest.catalogueCount, 60);
  assert.equal(manifest.failedCount, 0);
  assert.deepEqual(
    [...corpus.map((k: { sourceId: number }) => k.sourceId)].sort((a, b) => a - b),
    Array.from({ length: 60 }, (_, i) => i + 1),
  );
  assert.equal(new Set(corpus.map((k: { slug: string }) => k.slug)).size, 60);
  for (const k of corpus) {
    assert.ok(categories.some((c) => c.id === k.category));
    assert.ok(krithiInput.safeParse(k).success, k.slug);
    assert.ok(k.body.length > 30);
    assert.equal(createHash('sha256').update(k.body).digest('hex'), k.sourceHash);
    assert.equal(
      manifest.entries.find((m: { sourceId: number }) => m.sourceId === k.sourceId).sourceHash,
      k.sourceHash,
    );
    assert.match(k.sourceUrl, /^https:\/\/sivagiri.com\/krithikal-lyrics\?id=\d+$/);
    assert.ok(!k.body.includes('<script'));
  }
});
test('Atmopadesa Sathakam preserves all 100 numbered verses, and Daiva Dasakam all ten', () => {
  for (const [slug, count] of [
    ['atmopadesa-sathakam', 100],
    ['daiva-dasakam', 10],
  ] as const) {
    const work = corpus.find((k: { slug: string }) => k.slug === slug);
    const numbers = Array.from(
      work.body.matchAll(/^(\d{1,3})(?:\s|$)/gm),
      (m: unknown) => (m as RegExpMatchArray)[1],
    ).map(Number);
    assert.deepEqual(
      [...new Set(numbers)],
      Array.from({ length: count }, (_, i) => i + 1),
    );
  }
});
test('Malayalam normalization and English/category search retain correct works', () => {
  assert.equal(normalizeSearch('  ദര്\u200dശനം  '), 'ദര്ശനം');
  assert.equal(filterKrithis(corpus, 'DAIVA DASAKAM').length, 1);
  assert.equal(filterKrithis(corpus, 'ദൈവദശകം').length, 1);
  assert.equal(filterKrithis(corpus, '', 'philosophy').length, 11);
});
test('Validation rejects unsafe slugs, empty works, unknown statuses and abusive paging', () => {
  const row = corpus[0];
  for (const change of [
    { slug: '../escape' },
    { body: '' },
    { status: 'public' },
    { category: 'missing' },
    { revision: 0 },
  ])
    assert.equal(krithiInput.safeParse({ ...row, ...change }).success, false);
  assert.equal(listInput.safeParse({ limit: 100000 }).success, false);
  assert.equal(listInput.safeParse({ page: -1 }).success, false);
});
test('Passwords are salted, verified in constant time and never accepted on malformed hashes', () => {
  const password = 'a-secure-test-password';
  const hash = hashPassword(password);
  assert.notEqual(hash, hashPassword(password));
  assert.ok(verifyPassword(password, hash));
  assert.ok(!verifyPassword('wrong', hash));
  assert.ok(!verifyPassword(password, 'invalid'));
});

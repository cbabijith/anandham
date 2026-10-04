import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicGuruArul, type GuruArulEntry } from './guru-arul';
import { guruArulInput, guruArulDeleteInput } from './guru-arul-validation';
import topics from '../data/guru-arul-topics.json';
import quotes from '../data/guru-arul.json';

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const validTopics = topics.map((topic) => ({
  ...guruArulInput.parse(topic),
  id: topic.id,
  quotes: topic.quotes as GuruArulEntry[],
}));
test('all 182 quotes and 21 supplied headings retain their complete source text and order', () => {
  const source = readFileSync(
    new URL('../data/sources/guru-arul-2026-10-04.txt', import.meta.url),
    'utf8',
  );
  const reconstructed = topics
    .flatMap((topic) => [
      topic.title,
      ...topic.quotes.flatMap((quote) => [quote.text, `- ${quote.attribution}`]),
    ])
    .join('\n');
  assert.equal(normalize(reconstructed), normalize(source));
  assert.equal(topics.length, 21);
  assert.equal(quotes.length, 182);
  assert.equal(new Set(quotes.map((quote) => quote.id)).size, 182);
  assert.deepEqual(publicGuruArul(validTopics).quotes, quotes);
  assert.equal(publicGuruArul(validTopics).categories.length, 20);
  assert.equal(topics.at(-1)?.title, 'ത്യാഗം');
  assert.equal(topics.at(-1)?.status, 'draft');
});
test('the first 46 quotes preserve original bookmark IDs, text and attribution', () => {
  const previous = readFileSync(
    new URL('../data/sources/guru-arul-2026-10-01.txt', import.meta.url),
    'utf8',
  );
  const reconstructed = topics
    .slice(0, 2)
    .flatMap((topic) => [
      topic.title,
      ...topic.quotes.flatMap((quote) => [quote.text, `- ${quote.attribution}`]),
    ]);
  assert.equal(normalize([...reconstructed, 'ഹിന്ദുമതം'].join('\n')), normalize(previous));
  assert.deepEqual(
    quotes.slice(0, 46).map((q) => q.id),
    [
      ...Array.from({ length: 15 }, (_, i) => `jathi-${String(i + 1).padStart(2, '0')}`),
      ...Array.from({ length: 31 }, (_, i) => `matham-${String(i + 1).padStart(2, '0')}`),
    ],
  );
});
test('public projection excludes private topics, private quotes and empty topics', () => {
  const base = validTopics[0];
  const mixed = {
    ...base,
    quotes: base.quotes
      .slice(0, 3)
      .map((q, i) => ({
        ...q,
        status: ['published', 'draft', 'archived'][i] as GuruArulEntry['status'],
      })),
  };
  const result = publicGuruArul([
    mixed,
    { ...validTopics[1], status: 'draft' },
    { ...validTopics[2], status: 'archived' },
    { ...validTopics[3], quotes: [] },
  ]);
  assert.equal(result.categories.length, 1);
  assert.equal(result.quotes.length, 1);
  assert.equal(result.quotes[0].id, 'jathi-01');
  assert.equal('status' in result.quotes[0], false);
});
test('validation prevents empty published topics, blank quotes, duplicate IDs and unsafe revision deletion', () => {
  const base = validTopics[0];
  assert.equal(guruArulInput.safeParse({ ...base, quotes: [] }).success, false);
  assert.equal(guruArulInput.safeParse({ ...base, status: 'draft', quotes: [] }).success, true);
  assert.equal(
    guruArulInput.safeParse({ ...base, quotes: [{ ...base.quotes[0], text: '  ' }] }).success,
    false,
  );
  assert.equal(
    guruArulInput.safeParse({ ...base, quotes: [base.quotes[0], base.quotes[0]] }).success,
    false,
  );
  assert.equal(guruArulInput.safeParse({ ...base, sortOrder: -1 }).success, false);
  assert.equal(guruArulDeleteInput.safeParse({}).success, false);
  assert.equal(guruArulDeleteInput.safeParse({ revision: 0 }).success, false);
});

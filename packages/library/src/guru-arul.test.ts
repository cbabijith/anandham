import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { guruArulCategories, guruArulQuotes } from './guru-arul';

test('Guru Arul preserves every supplied quote, category and attribution', () => {
  const source = readFileSync(
    new URL('../data/sources/guru-arul-2026-10-01.txt', import.meta.url),
    'utf8',
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const reconstructed = guruArulCategories.flatMap((category) => [
    category.title,
    ...guruArulQuotes
      .filter((quote) => quote.category === category.id)
      .flatMap((quote) => [quote.text, `- ${quote.attribution}`]),
  ]);
  // The last supplied heading has no quotes beneath it.
  reconstructed.push('ഹിന്ദുമതം');
  assert.deepEqual(reconstructed, source);
  assert.equal(new Set(guruArulQuotes.map((quote) => quote.id)).size, guruArulQuotes.length);
  assert.ok(guruArulQuotes.every((quote) => quote.text && quote.attribution));
});

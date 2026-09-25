import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dharmamInput } from './dharmam-validation';
import { publicDharmam } from './dharmam-repository';
import type { DharmamChapter } from './schema';
const chapters = JSON.parse(readFileSync(new URL('../data/dharmam.json', import.meta.url), 'utf8'));
test('the supplied Dharmam titles preserve the expected verse groups and confirmed duplicate', () => {
  assert.equal(chapters.length, 10);
  assert.equal(new Set(chapters.map((c: DharmamChapter) => c.slug)).size, chapters.length);
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const expected = [
    [1],
    range(2, 6),
    range(7, 10),
    range(11, 13),
    range(11, 13),
    range(26, 32),
    [33],
    range(34, 43),
    range(44, 60),
    [61, 62, 62, 63, 64, 65, 66],
  ];
  chapters.forEach((c: DharmamChapter, index: number) => {
    assert.equal(dharmamInput.safeParse(c).success, true);
    assert.equal(c.sortOrder, index);
    assert.equal(c.status, 'published');
    assert.deepEqual(
      [
        ...c.passages
          .map((p) => p.verses)
          .join('\n')
          .matchAll(/(\d+)\s*$/gm),
      ].map((m) => Number(m[1])),
      expected[index],
    );
    assert.ok(c.passages.every((p) => p.explanation.length > 50));
  });
  assert.deepEqual(chapters[3].passages, chapters[4].passages);
  assert.match(chapters[4].editorialNote, /explicitly confirmed/);
  assert.deepEqual(
    chapters.slice(5).map((c: DharmamChapter) => c.passages.length),
    [7, 1, 10, 17, 7],
  );
  assert.deepEqual(chapters[9].passages[1], chapters[9].passages[2]);
});
test('Dharmam rejects incomplete passages and keeps editorial notes and source snapshots private', () => {
  const first = chapters[0];
  assert.equal(dharmamInput.safeParse({ ...first, passages: [] }).success, false);
  assert.equal(
    dharmamInput.safeParse({ ...first, passages: [{ verses: 'Original', explanation: '' }] })
      .success,
    false,
  );
  assert.equal(dharmamInput.safeParse({ ...first, slug: '../private' }).success, false);
  assert.equal(dharmamInput.safeParse({ ...first, revision: 0 }).success, false);
  const publicChapter = publicDharmam({
    ...first,
    editorialNote: 'private',
    sourcePassages: first.passages,
  });
  assert.ok(!('editorialNote' in publicChapter));
  assert.ok(!('sourcePassages' in publicChapter));
  assert.deepEqual(publicChapter.passages, first.passages);
});

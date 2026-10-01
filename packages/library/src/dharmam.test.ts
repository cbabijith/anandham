import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dharmamInput } from './dharmam-validation';
import { publicDharmam } from './dharmam-repository';
import type { DharmamChapter } from './schema';
const chapters = JSON.parse(readFileSync(new URL('../data/dharmam.json', import.meta.url), 'utf8'));
test('the supplied Dharmam titles preserve the expected verse groups and confirmed duplicate', () => {
  assert.equal(chapters.length, 21);
  assert.equal(new Set(chapters.map((c: DharmamChapter) => c.id)).size, chapters.length);
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
    range(67, 88),
    range(89, 99),
    range(100, 111),
    range(112, 116),
    range(117, 120),
    range(121, 138),
    range(139, 169),
    range(170, 185),
    range(186, 244),
    range(245, 255),
    range(256, 295),
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
    assert.ok(c.passages.every((p) => p.explanation.trim().length > 0));
  });
  assert.deepEqual(chapters[3].passages, chapters[4].passages);
  assert.match(chapters[4].editorialNote, /explicitly confirmed/);
  assert.deepEqual(
    chapters.slice(5).map((c: DharmamChapter) => c.passages.length),
    [7, 1, 10, 17, 7, 22, 9, 10, 4, 4, 18, 31, 15, 53, 11, 40],
  );
  assert.deepEqual(chapters[9].passages[1], chapters[9].passages[2]);
});
test('chapters 11–21 preserve every supplied verse and explanation under its source heading', () => {
  const source = readFileSync(
    new URL('../data/sources/dharmam-2026-10-01.txt', import.meta.url),
    'utf8',
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  assert.match(source.shift()!, /^\[Sooktham\]\(https:\/\/app\.notion\.com\//);
  const suppliedHeadings = [
    'സാമാന്യധർമ്മനിരൂപണം',
    'ശുദ്ധി പഞ്ചകം',
    'സൂക്തം, പ്രസവശ്രൂശ്രൂഷ',
    'ബാലോപചരണം',
    'വിദ്യാരംഭം',
    'ആശ്രമധർമ്മം',
    '(ബഹ്മചര്യം',
    'ഗാർഹസ്ഥ്യ ധർമ്മം',
    'പഞ്ചമഹാ യജ്ഞം',
    'അപരക്രിയ',
    'സന്യാസം',
  ];
  const reconstructed = chapters.slice(10).flatMap((chapter: DharmamChapter, i: number) => [
    suppliedHeadings[i],
    ...chapter.passages.flatMap((p) => [
      ...p.verses.split('\n'),
      ...p.explanation.split('\n'),
    ]),
  ]);
  assert.deepEqual(reconstructed, source);
  assert.equal(chapters[12].title, 'സൂക്തം, പ്രസവശുശ്രൂഷ');
  assert.equal(chapters[16].title, 'ബ്രഹ്മചര്യം');
  assert.equal(chapters[20].passages[0].explanation, chapters[20].passages[1].explanation);
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

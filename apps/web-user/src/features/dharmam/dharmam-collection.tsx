'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, BookOpen, Search, X } from 'lucide-react';
import { normalizeSearch } from '@anandham/library/catalogue';
import type { DharmamSummary } from '@anandham/library/dharmam-repository';
import { useBookmarks, usePreference } from '../preferences/preferences';

type Chapter = Omit<DharmamSummary, 'createdAt' | 'updatedAt'>;
export function DharmamCollection({ chapters }: { chapters: Chapter[] }) {
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const { bookmarks, toggle } = useBookmarks('anandham-dharmam-bookmarks');
  const [lastRead] = usePreference('anandham-dharmam-last-read', '');
  const recent = chapters.find((c) => c.slug === lastRead);
  const filtered = useMemo(
    () =>
      chapters.filter(
        (c) =>
          (!savedOnly || bookmarks.includes(c.slug)) &&
          normalizeSearch(`${c.title} ${c.transliteration}`).includes(normalizeSearch(query)),
      ),
    [chapters, savedOnly, bookmarks, query],
  );
  return (
    <main id="main-content" className="dharmam-collection section-container">
      <Link href="/#collection" className="text-link">
        <ArrowLeft size={16} /> Back to the library
      </Link>
      <header className="dharmam-intro">
        <span className="eyebrow">A LIFE GUIDED BY WISDOM</span>
        <h1 lang="ml">ശ്രീനാരായണ ധർമ്മം</h1>
        <p className="dharmam-subtitle">Sree Narayana Dharmam</p>
        <p>Read the verses, understand their meaning, and return to them at your own pace.</p>
        <span className="dharmam-chapter-count">
          <BookOpen size={17} /> {chapters.length} chapters available · Malayalam verses &
          explanations
        </span>
      </header>
      {recent && (
        <Link className="resume-bar" href={`/dharmam/${recent.slug}`}>
          <span>
            <BookOpen size={18} /> Continue reading <strong lang="ml">{recent.title}</strong>
          </span>
          <ArrowRight size={18} />
        </Link>
      )}
      <div className="collection-tools">
        <label className="search-field">
          <Search size={21} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search Dharmam chapters"
            placeholder="Search in Malayalam or English…"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              <X size={17} />
            </button>
          )}
        </label>
        <button
          className={`saved-button ${savedOnly ? 'active' : ''}`}
          aria-pressed={savedOnly}
          onClick={() => setSavedOnly(!savedOnly)}
        >
          <Bookmark size={17} fill={savedOnly ? 'currentColor' : 'none'} /> Saved{' '}
          <span>{chapters.filter((c) => bookmarks.includes(c.slug)).length}</span>
        </button>
      </div>
      <p className="dharmam-results" role="status">
        {filtered.length} {filtered.length === 1 ? 'chapter' : 'chapters'}
        {savedOnly ? ' saved on this device' : ' · In reading order'}
      </p>
      <div className="dharmam-grid">
        {filtered.map((chapter) => (
          <article className="work-card dharmam-card" key={chapter.id}>
            <div className="card-top">
              <span className="category-label">
                CHAPTER {String(chapter.sortOrder + 1).padStart(2, '0')}
              </span>
              <button
                className="bookmark-button"
                aria-pressed={bookmarks.includes(chapter.slug)}
                aria-label={`${bookmarks.includes(chapter.slug) ? 'Unsave' : 'Save'} ${chapter.transliteration}`}
                onClick={() => toggle(chapter.slug)}
              >
                <Bookmark
                  size={18}
                  fill={bookmarks.includes(chapter.slug) ? 'currentColor' : 'none'}
                />
              </button>
            </div>
            <Link className="work-title-link" href={`/dharmam/${chapter.slug}`}>
              <h2 lang="ml">{chapter.title}</h2>
              <p>{chapter.transliteration}</p>
            </Link>
            <p className="dharmam-excerpt" lang="ml">
              {chapter.excerpt}
            </p>
            <div className="card-bottom">
              <span>Verses & Malayalam meaning</span>
              <Link
                href={`/dharmam/${chapter.slug}`}
                aria-label={`Read ${chapter.transliteration}`}
              >
                <ArrowUpRight size={21} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={30} />
          <h2>No chapters found</h2>
          <button
            className="button button-primary"
            onClick={() => {
              setQuery('');
              setSavedOnly(false);
            }}
          >
            Show all chapters
          </button>
        </div>
      )}
      <p className="collection-note">The collection grows as further chapters are added.</p>
    </main>
  );
}

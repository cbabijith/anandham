'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, Search, X, BookOpen, ArrowRight } from 'lucide-react';
import type { KrithiSummary } from '@anandham/library/schema';
import { categories, normalizeSearch } from '@anandham/library/catalogue';
import { useBookmarks, usePreference } from '../preferences/preferences';
type Entry = Omit<KrithiSummary, 'createdAt' | 'updatedAt'>;
export function Collection({ works }: { works: Entry[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState('source');
  const { bookmarks, toggle } = useBookmarks();
  const [lastRead] = usePreference('anandham-last-read', '');
  const recent = works.find((k) => k.slug === lastRead);
  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    const result = works.filter(
      (k) =>
        (!category || k.category === category) &&
        (!savedOnly || bookmarks.includes(k.slug)) &&
        (!q || normalizeSearch(`${k.title} ${k.transliteration}`).includes(q)),
    );
    if (sort === 'az') result.sort((a, b) => a.transliteration.localeCompare(b.transliteration));
    return result;
  }, [works, query, category, savedOnly, bookmarks, sort]);
  return (
    <section id="collection" className="collection section-container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A LIFETIME OF WISDOM</span>
          <h2>
            Explore the krithis<span className="accent">.</span>
          </h2>
          <p>Poetry, philosophy, and prayers. Read at your own pace.</p>
        </div>
        <div className="collection-count">
          <BookOpen size={17} />
          {works.length} works to discover
        </div>
      </div>
      {recent && (
        <Link href={`/krithis/${recent.slug}`} className="resume-bar">
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
            placeholder="Search in Malayalam or English…"
            aria-label="Search krithis"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={17} />
            </button>
          )}
        </label>
        <button
          type="button"
          className={`saved-button ${savedOnly ? 'active' : ''}`}
          onClick={() => setSavedOnly(!savedOnly)}
          aria-pressed={savedOnly}
        >
          <Bookmark size={17} fill={savedOnly ? 'currentColor' : 'none'} /> Saved{' '}
          <span>{bookmarks.length}</span>
        </button>
      </div>
      <div className="category-tabs" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={!category ? 'active' : ''}
          aria-pressed={!category}
        >
          All works <span>{works.length}</span>
        </button>
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            className={category === c.id ? 'active' : ''}
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="results-bar">
        <p role="status">
          {filtered.length} {filtered.length === 1 ? 'work' : 'works'}
          {category ? ` in ${categories.find((c) => c.id === category)?.name}` : ''}
          {savedOnly ? ' saved on this device' : ''}
        </p>
        <label>
          Sort by{' '}
          <select aria-label="Sort works" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="source">Collection order</option>
            <option value="az">Title: A–Z</option>
          </select>
        </label>
      </div>
      <div className="work-grid">
        {filtered.map((k) => (
          <article className="work-card" key={k.id}>
            <div className="card-top">
              <span className={`category-label category-${k.category}`}>{k.categoryName}</span>
              <button
                type="button"
                className="bookmark-button"
                onClick={() => toggle(k.slug)}
                aria-label={`${bookmarks.includes(k.slug) ? 'Unsave' : 'Save'} ${k.transliteration}`}
                aria-pressed={bookmarks.includes(k.slug)}
              >
                <Bookmark size={18} fill={bookmarks.includes(k.slug) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <span className="work-number">{String(k.sortOrder + 1).padStart(2, '0')}</span>
            <Link href={`/krithis/${k.slug}`} className="work-title-link">
              <h3 lang="ml">{k.title}</h3>
              <p>{k.transliteration}</p>
            </Link>
            <div className="card-bottom">
              <span>Original text · Malayalam script</span>
              <Link href={`/krithis/${k.slug}`} aria-label={`Read ${k.transliteration}`}>
                <ArrowUpRight size={21} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={30} />
          <h3>No works found</h3>
          <p>Try a different title or reset your filters.</p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setQuery('');
              setCategory('');
              setSavedOnly(false);
            }}
          >
            Show all works
          </button>
        </div>
      )}
      <p className="collection-note">
        A living archive, rooted in the original words. Source:{' '}
        <a href="https://sivagiri.com/gurudevakrithikal" target="_blank" rel="noreferrer">
          Sivagiri Mutt <ArrowUpRight size={13} />
        </a>
      </p>
    </section>
  );
}

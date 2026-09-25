'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ArrowUpRight, Pencil, X } from 'lucide-react';
import { categories, normalizeSearch } from '@anandham/library/catalogue';
type Row = {
  id: string;
  title: string;
  transliteration: string;
  category: string;
  categoryName: string;
  slug: string;
  status: string;
  sourceId: number | null;
  characters: number;
  sortOrder: number;
};
export function KrithiTable({ works, readerUrl }: { works: Row[]; readerUrl: string }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const rows = works.filter(
    (k) =>
      (!status || k.status === status) &&
      (!category || k.category === category) &&
      normalizeSearch(`${k.title} ${k.transliteration}`).includes(normalizeSearch(query)),
  );
  return (
    <>
      <div className="la-page-heading">
        <div>
          <span className="la-eyebrow">THE WORDS OF SREE NARAYANA GURU</span>
          <h1>
            Krithis collection <span className="la-heading-count">{works.length}</span>
          </h1>
          <p>Review, edit, and publish every work in the library.</p>
        </div>
        <Link href="/library/krithis/new" className="la-button primary">
          <Plus size={17} /> Add a work
        </Link>
      </div>
      <div className="la-filter-bar">
        <label className="la-search">
          <Search size={18} />
          <input
            aria-label="Search krithis"
            placeholder="Search Malayalam or English titles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </label>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="la-table-panel">
        <div className="la-table-summary">
          <span role="status">{rows.length} works</span>
          <span>Original text · Malayalam script</span>
        </div>
        <div className="la-table-scroll">
          <table>
            <thead>
              <tr>
                <th>WORK</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>SOURCE</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((k) => (
                <tr key={k.id}>
                  <td>
                    <Link href={`/library/krithis/${k.slug}`} className="la-work-name">
                      <span className="la-work-index">
                        {String(k.sortOrder + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <strong lang="ml">{k.title}</strong>
                        <small>{k.transliteration}</small>
                      </span>
                    </Link>
                  </td>
                  <td>{k.categoryName}</td>
                  <td>
                    <span className={`la-badge ${k.status}`}>{k.status}</span>
                  </td>
                  <td>
                    <span className="la-source-label">
                      {k.sourceId ? 'Sivagiri Mutt' : 'Editorial'}
                    </span>
                    <small>{k.characters.toLocaleString()} characters</small>
                  </td>
                  <td>
                    <div className="la-row-actions">
                      {k.status === 'published' && (
                        <a
                          href={`${readerUrl}/krithis/${k.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${k.transliteration}`}
                        >
                          <ArrowUpRight size={17} />
                        </a>
                      )}
                      <Link
                        href={`/library/krithis/${k.slug}`}
                        aria-label={`Edit ${k.transliteration}`}
                      >
                        <Pencil size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="la-empty">
            <Search size={25} />
            <p>No works match these filters.</p>
            <button
              className="la-button"
              onClick={() => {
                setQuery('');
                setStatus('');
                setCategory('');
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
      <p className="la-help-text">
        Draft and archived works are private. Published works appear immediately on the reader
        website.
      </p>
    </>
  );
}

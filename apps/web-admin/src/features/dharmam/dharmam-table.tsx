'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, ExternalLink, BookOpen } from 'lucide-react';
import { normalizeSearch } from '@anandham/library/catalogue';
import type { DharmamSummary } from '@anandham/library/dharmam-repository';
type Chapter = Omit<DharmamSummary, 'createdAt' | 'updatedAt'>;
export function DharmamTable({ chapters, readerUrl }: { chapters: Chapter[]; readerUrl: string }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = chapters.filter(
    (c) =>
      (!status || c.status === status) &&
      normalizeSearch(`${c.title} ${c.transliteration}`).includes(normalizeSearch(query)),
  );
  return (
    <>
      <div className="la-page-heading">
        <div>
          <span className="la-eyebrow">VERSES & MALAYALAM EXPLANATIONS</span>
          <h1>Sree Narayana Dharmam</h1>
          <p>{chapters.length} chapters · Add further chapters as their text becomes available.</p>
        </div>
        <Link className="la-button primary" href="/library/dharmam/new">
          <Plus size={17} /> Add chapter
        </Link>
      </div>
      <div className="la-filter-bar">
        <label className="la-search">
          <Search size={18} />
          <input
            aria-label="Search Dharmam chapters"
            placeholder="Search Malayalam or English titles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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
      </div>
      <div className="la-panel la-table-panel">
        <div className="la-table-summary">
          <span>{rows.length} chapters</span>
          <span>In reading order</span>
        </div>
        <div className="la-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Chapter</th>
                <th>Passages</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{String(c.sortOrder + 1).padStart(2, '0')}</td>
                  <td>
                    <Link className="la-work-title" href={`/library/dharmam/${c.slug}`}>
                      <strong lang="ml">{c.title}</strong>
                      <small>{c.transliteration}</small>
                    </Link>
                  </td>
                  <td>{c.passageCount}</td>
                  <td>
                    <span className={`la-badge ${c.status}`}>{c.status}</span>
                  </td>
                  <td>
                    <div className="la-row-actions">
                      <Link
                        className="la-icon"
                        href={`/library/dharmam/${c.slug}`}
                        aria-label={`Edit ${c.transliteration}`}
                      >
                        <Pencil size={16} />
                      </Link>
                      {c.status === 'published' && (
                        <a
                          className="la-icon"
                          href={`${readerUrl}/dharmam/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Read ${c.transliteration}`}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="la-empty">
            <BookOpen size={26} />
            <p>No chapters match your search.</p>
          </div>
        )}
      </div>
      <p className="la-help-text">
        Draft and archived chapters stay private. Publishing makes a chapter available on the reader
        website.
      </p>
    </>
  );
}

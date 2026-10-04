'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, ExternalLink, Quote } from 'lucide-react';
import { normalizeSearch } from '@anandham/library/catalogue';
import type { GuruArulTopic } from '@anandham/library/schema';
export type Topic = Omit<GuruArulTopic, 'createdAt' | 'updatedAt'>;
export function GuruArulTable({ topics, readerUrl }: { topics: Topic[]; readerUrl: string }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = topics.filter(
    (topic) =>
      (!status || topic.status === status) &&
      normalizeSearch(
        `${topic.title} ${topic.english} ${topic.quotes.map((q) => q.text).join(' ')}`,
      ).includes(normalizeSearch(query)),
  );
  const total = topics.reduce((sum, topic) => sum + topic.quotes.length, 0);
  return (
    <>
      <div className="la-page-heading">
        <div>
          <span className="la-eyebrow">WORDS FOR REFLECTION</span>
          <h1>Guru Arul</h1>
          <p>
            {topics.length} topics · {total} quotes. Manage headings and all the quotes beneath
            them.
          </p>
        </div>
        <Link className="la-button primary" href="/library/guru-arul/new">
          <Plus size={17} /> Add topic
        </Link>
      </div>
      <div className="la-filter-bar">
        <label className="la-search">
          <Search size={18} />
          <input
            aria-label="Search Guru Arul topics"
            placeholder="Search titles or quote text…"
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
          <span>{rows.length} topics</span>
          <span>In reading order</span>
        </div>
        <div className="la-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Topic</th>
                <th>Quotes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((topic) => (
                <tr key={topic.id}>
                  <td>{topic.sortOrder + 1}</td>
                  <td>
                    <Link className="la-work-title" href={`/library/guru-arul/${topic.id}`}>
                      <strong lang="ml">{topic.title}</strong>
                      <small>{topic.english || 'Guru Arul'}</small>
                    </Link>
                  </td>
                  <td>
                    {topic.quotes.length}
                    <small className="la-arul-count">
                      {topic.quotes.filter((q) => q.status === 'published').length} ready to publish
                    </small>
                  </td>
                  <td>
                    <span className={`la-badge ${topic.status}`}>{topic.status}</span>
                  </td>
                  <td>
                    <div className="la-row-actions">
                      <Link
                        className="la-icon"
                        href={`/library/guru-arul/${topic.id}`}
                        aria-label={`Edit ${topic.english || topic.title}`}
                      >
                        <Pencil size={16} />
                      </Link>
                      {topic.status === 'published' && (
                        <a
                          className="la-icon"
                          href={`${readerUrl}/guru-arul#topic-${topic.id}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Read ${topic.english || topic.title}`}
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
            <Quote size={26} />
            <p>No topics match your search.</p>
          </div>
        )}
      </div>
      <p className="la-help-text">
        Open a topic to edit its title, add or delete quotes, change their order, and publish. Draft
        and archived topics or quotes stay private.
      </p>
    </>
  );
}

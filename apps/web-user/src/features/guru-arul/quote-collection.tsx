'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ReadingTabs } from '../library/reading-tabs';
import { ArrowLeft, Bookmark, Copy, Search, X } from 'lucide-react';
import { guruArulCategories, guruArulQuotes } from '@anandham/library/guru-arul';
import { normalizeSearch } from '@anandham/library/catalogue';
import { useBookmarks } from '../preferences/preferences';

export function QuoteCollection() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [message, setMessage] = useState('');
  const { bookmarks, toggle } = useBookmarks('anandham-guru-arul-bookmarks');
  const filtered = guruArulQuotes.filter((quote) => {
    const topic = guruArulCategories.find((entry) => entry.id === quote.category)!;
    return (
      (!category || quote.category === category) &&
      (!savedOnly || bookmarks.includes(quote.id)) &&
      normalizeSearch(`${quote.text} ${topic.title} ${topic.english}`).includes(
        normalizeSearch(query),
      )
    );
  });
  async function copyQuote(text: string, attribution: string) {
    try {
      await navigator.clipboard.writeText(`${text}\n— ${attribution}`);
      setMessage('Quote copied.');
    } catch {
      setMessage('Could not copy. You can select and copy the quote text.');
    }
  }
  return (
    <main id="main-content" className="arul-page app-container">
      <ReadingTabs />
      <header className="reading-section-heading arul-intro">
        <div>
          <p className="section-kicker">GURU ARUL · {guruArulQuotes.length} QUOTES</p>
          <h1 lang="ml">ഗുരു അരുൾ</h1>
          <p lang="ml">വായിക്കാനും ചിന്തിക്കാനും ഗുരുവിന്റെ വാക്കുകൾ.</p>
          <p className="section-english">
            Read by topic, save a favourite, or copy a quote to keep.
          </p>
        </div>
      </header>
      <div className="collection-tools">
        <label className="search-field">
          <Search size={22} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search Guru Arul"
            placeholder="വാക്കുകൾ / Search…"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={20} />
            </button>
          )}
        </label>
        <button
          type="button"
          className={`saved-button ${savedOnly ? 'active' : ''}`}
          aria-pressed={savedOnly}
          onClick={() => setSavedOnly(!savedOnly)}
        >
          <Bookmark size={20} /> Saved <span>{bookmarks.length}</span>
        </button>
      </div>
      <div className="arul-topics" aria-label="Filter quotes by topic">
        <button type="button" aria-pressed={!category} onClick={() => setCategory('')}>
          All quotes · {guruArulQuotes.length}
        </button>
        {guruArulCategories.map((topic) => (
          <button
            type="button"
            key={topic.id}
            aria-pressed={category === topic.id}
            onClick={() => setCategory(topic.id)}
          >
            <span lang="ml">{topic.title}</span> · {topic.english}
            <span>{guruArulQuotes.filter((quote) => quote.category === topic.id).length}</span>
          </button>
        ))}
      </div>
      <p className="arul-results" role="status">
        {filtered.length} {filtered.length === 1 ? 'quote' : 'quotes'}
        {savedOnly ? ' saved on this device' : ''}
      </p>
      <p className="copy-status" role="status">
        {message}
      </p>
      <div className="arul-quote-list">
        {filtered.map((quote) => (
          <article id={quote.id} className="arul-quote" key={quote.id}>
            <div className="quote-meta">
              <span lang="ml">
                {guruArulCategories.find((topic) => topic.id === quote.category)!.title}
              </span>
              <a href={`#${quote.id}`} aria-label={`Link to quote ${quote.id}`}>
                #{String(guruArulQuotes.indexOf(quote) + 1).padStart(2, '0')}
              </a>
            </div>
            <blockquote lang="ml">{quote.text}</blockquote>
            <p className="quote-attribution" lang="ml">
              — {quote.attribution}
            </p>
            <div className="quote-actions">
              <button
                type="button"
                aria-pressed={bookmarks.includes(quote.id)}
                onClick={() => toggle(quote.id)}
                aria-label={`${bookmarks.includes(quote.id) ? 'Unsave' : 'Save'} quote ${quote.id}`}
              >
                <Bookmark size={19} fill={bookmarks.includes(quote.id) ? 'currentColor' : 'none'} />
                {bookmarks.includes(quote.id) ? 'Saved' : 'Save quote'}
              </button>
              <button
                type="button"
                onClick={() => copyQuote(quote.text, quote.attribution)}
                aria-label={`Copy quote ${quote.id}`}
              >
                <Copy size={18} /> Copy quote
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h2>No quotes found</h2>
          <p>Try another word or show all quotes.</p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setQuery('');
              setCategory('');
              setSavedOnly(false);
            }}
          >
            Show all quotes
          </button>
        </div>
      )}
      <Link href="/krithis" className="section-reading-link">
        <ArrowLeft size={18} /> Explore the Krithis
      </Link>
    </main>
  );
}

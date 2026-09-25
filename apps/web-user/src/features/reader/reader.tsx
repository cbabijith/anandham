'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Printer,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { sourceNotes } from '@anandham/library/catalogue';
import { useBookmarks, usePreference } from '../preferences/preferences';
export function Reader({
  work,
  previous,
  next,
}: {
  work: {
    slug: string;
    title: string;
    transliteration: string;
    body: string;
    categoryName: string;
    sourceUrl: string;
  };
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
  const [rawSize, setSize] = usePreference('anandham-font-size', '22');
  const size = Math.max(16, Math.min(40, Number(rawSize) || 22));
  const { bookmarks, toggle } = useBookmarks();
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    try {
      localStorage.setItem('anandham-last-read', work.slug);
    } catch {}
    function onScroll() {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (window.scrollY / height) * 100 : 100);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [work.slug]);
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setShareError('');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareError('Copy this page’s address from your browser to share it.');
    }
  }
  return (
    <main id="main-content" className="reader-page">
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <div className="reader-top section-container">
        <Link href="/#collection" className="text-link">
          <ArrowLeft size={17} /> All krithis
        </Link>
        <span>{work.categoryName}</span>
      </div>
      <header className="reader-heading">
        <span className="eyebrow">SREE NARAYANA GURU · ORIGINAL TEXT</span>
        <h1 lang="ml">{work.title}</h1>
        <p>{work.transliteration}</p>
        <div className="reader-ornament">✳</div>
      </header>
      <div className="reader-toolbar" aria-label="Reading tools">
        <div className="zoom-tools">
          <button
            type="button"
            aria-label="Decrease text size"
            disabled={size <= 16}
            onClick={() => setSize(String(size - 2))}
          >
            <Minus size={18} />
          </button>
          <span aria-live="polite">
            Aa <small>{Math.round((size / 22) * 100)}%</small>
          </span>
          <button
            type="button"
            aria-label="Increase text size"
            disabled={size >= 40}
            onClick={() => setSize(String(size + 2))}
          >
            <Plus size={18} />
          </button>
          <button type="button" aria-label="Reset text size" onClick={() => setSize('22')}>
            <RotateCcw size={15} />
          </button>
        </div>
        <span className="toolbar-divider" />
        <button
          type="button"
          onClick={() => toggle(work.slug)}
          aria-label={bookmarks.includes(work.slug) ? 'Unsave this work' : 'Save this work'}
          aria-pressed={bookmarks.includes(work.slug)}
        >
          <Bookmark size={19} fill={bookmarks.includes(work.slug) ? 'currentColor' : 'none'} />
          <span className="tool-label">{bookmarks.includes(work.slug) ? 'Saved' : 'Save'}</span>
        </button>
        <button type="button" onClick={share} aria-label="Copy link to this work">
          {copied ? <Check size={19} /> : <Share2 size={19} />}
          <span className="tool-label">{copied ? 'Copied' : 'Share'}</span>
        </button>
        <button type="button" onClick={() => window.print()} aria-label="Print this work">
          <Printer size={19} />
        </button>
      </div>
      {shareError && (
        <p className="reader-notice" role="status">
          {shareError}
        </p>
      )}
      {sourceNotes[work.slug] && (
        <details className="source-note">
          <summary>Note on this source text</summary>
          <p>{sourceNotes[work.slug]}</p>
        </details>
      )}
      <article className="reading-text" lang="ml" style={{ fontSize: `${size}px` }}>
        {work.body}
      </article>
      <div className="reader-ending">
        <span>✳</span>
        <p>Take a moment. Let the words settle.</p>
        {work.sourceUrl && (
          <a href={work.sourceUrl} target="_blank" rel="noreferrer">
            Original text from Sivagiri Mutt <ArrowUpRight size={14} />
          </a>
        )}
        <small>
          Transcribed as published by the source; source spellings and textual variants are
          retained.
        </small>
      </div>
      <nav className="reader-pagination" aria-label="Other krithis">
        {previous ? (
          <Link href={`/krithis/${previous.slug}`}>
            <small>
              <ArrowLeft size={15} /> Previous work
            </small>
            <span lang="ml">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/krithis/${next.slug}`}>
            <small>
              Next work <ArrowRight size={15} />
            </small>
            <span lang="ml">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}

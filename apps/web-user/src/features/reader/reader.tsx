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
  Copy,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { sourceNotes } from '@anandham/library/catalogue';
import type { DharmamPassage } from '@anandham/library/schema';
import { useBookmarks, usePreference } from '../preferences/preferences';
export function Reader({
  work,
  previous,
  next,
  collection = 'krithis',
}: {
  work: {
    slug: string;
    title: string;
    transliteration: string;
    body: string;
    categoryName: string;
    sourceUrl: string;
    passages?: DharmamPassage[];
  };
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  collection?: 'krithis' | 'dharmam';
}) {
  const [rawSize, setSize] = usePreference('anandham-font-size', '22');
  const size = Math.max(16, Math.min(40, Number(rawSize) || 22));
  const isDharmam = collection === 'dharmam';
  const { bookmarks, toggle } = useBookmarks(
    isDharmam ? 'anandham-dharmam-bookmarks' : 'anandham-bookmarks',
  );
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (copyStatus !== 'copied') return;
    const timeout = setTimeout(() => setCopyStatus('idle'), 2500);
    return () => clearTimeout(timeout);
  }, [copyStatus]);
  useEffect(() => {
    try {
      localStorage.setItem(
        isDharmam ? 'anandham-dharmam-last-read' : 'anandham-last-read',
        work.slug,
      );
    } catch {}
    function onScroll() {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (window.scrollY / height) * 100 : 100);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [work.slug, isDharmam]);
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
  async function copyKrithi() {
    setCopyStatus('idle');
    try {
      await navigator.clipboard.writeText(`${work.title}\n\n${work.body}`);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }
  return (
    <main id="main-content" className="reader-page">
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <div className="reader-top section-container">
        <Link href={isDharmam ? '/dharmam' : '/#collection'} className="text-link">
          <ArrowLeft size={17} /> {isDharmam ? 'All Dharmam chapters' : 'All krithis'}
        </Link>
        <span>{work.categoryName}</span>
      </div>
      <header className="reader-heading">
        <span className="eyebrow">
          {isDharmam
            ? 'SREE NARAYANA DHARMAM · VERSES & MEANING'
            : 'SREE NARAYANA GURU · ORIGINAL TEXT'}
        </span>
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
        <button
          type="button"
          onClick={copyKrithi}
          aria-label="Copy krithi title and full text"
          title="Copy krithi title and full text"
        >
          {copyStatus === 'copied' ? <Check size={19} /> : <Copy size={19} />}
          <span className="tool-label">{copyStatus === 'copied' ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      {copyStatus !== 'idle' && (
        <p className="reader-notice" role="status">
          {copyStatus === 'copied'
            ? 'Krithi title and full text copied.'
            : 'Unable to copy the krithi. Please select and copy the text manually.'}
        </p>
      )}
      {shareError && (
        <p className="reader-notice" role="status">
          {shareError}
        </p>
      )}
      {!isDharmam && sourceNotes[work.slug] && (
        <details className="source-note">
          <summary>Note on this source text</summary>
          <p>{sourceNotes[work.slug]}</p>
        </details>
      )}
      <article
        className={`reading-text ${isDharmam ? 'dharmam-reading' : ''}`}
        lang="ml"
        style={{ fontSize: `${size}px` }}
      >
        {isDharmam && work.passages
          ? work.passages.map((passage, index) => (
              <section className="dharmam-passage" key={index}>
                <h2 className="passage-label">ശ്ലോകം</h2>
                <div className="dharmam-verses">{passage.verses}</div>
                <div className="dharmam-explanation">
                  <h2 className="passage-label">അർത്ഥം</h2>
                  <p>{passage.explanation}</p>
                </div>
              </section>
            ))
          : work.body}
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
          {isDharmam
            ? 'Verses and Malayalam explanations provided by the library editor.'
            : 'Transcribed as published by the source; source spellings and textual variants are retained.'}
        </small>
      </div>
      <nav
        className="reader-pagination"
        aria-label={isDharmam ? 'Other Dharmam chapters' : 'Other krithis'}
      >
        {previous ? (
          <Link href={`/${collection}/${previous.slug}`}>
            <small>
              <ArrowLeft size={15} /> {isDharmam ? 'Previous chapter' : 'Previous work'}
            </small>
            <span lang="ml">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/${collection}/${next.slug}`}>
            <small>
              {isDharmam ? 'Next chapter' : 'Next work'} <ArrowRight size={15} />
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

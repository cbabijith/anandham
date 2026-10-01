'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Compass, ListOrdered, Quote, Search, X } from 'lucide-react';
import type { KrithiSummary } from '@anandham/library/schema';
import type { DharmamSummary } from '@anandham/library/dharmam-repository';
import { guruArulQuotes } from '@anandham/library/guru-arul';
import { normalizeSearch } from '@anandham/library/catalogue';
import { usePreference } from '../preferences/preferences';

type Work = Omit<KrithiSummary, 'createdAt' | 'updatedAt'>;
type Chapter = Omit<DharmamSummary, 'createdAt' | 'updatedAt'>;

export function HomeLibrary({ works, chapters }: { works: Work[]; chapters: Chapter[] }) {
  const [query, setQuery] = useState('');
  const [lastRead] = usePreference('anandham-last-read', '');
  const recent = works.find((work) => work.slug === lastRead);
  const featured = ['daiva-dasakam', 'atmopadesa-sathakam', 'jathi-nirnayam'].flatMap(
    (slug) => works.find((work) => work.slug === slug) ?? [],
  );
  const results = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return [];
    return [
      ...works
        .filter((work) => normalizeSearch(`${work.title} ${work.transliteration}`).includes(q))
        .map((work) => ({
          id: work.id,
          title: work.title,
          subtitle: `Krithis · ${work.transliteration}`,
          href: `/krithis/${work.slug}`,
        })),
      ...chapters
        .filter((chapter) =>
          normalizeSearch(`${chapter.title} ${chapter.transliteration}`).includes(q),
        )
        .map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          subtitle: `Dharmam · ${chapter.transliteration}`,
          href: `/dharmam/${chapter.slug}`,
        })),
      ...guruArulQuotes
        .filter((quote) => normalizeSearch(quote.text).includes(q))
        .map((quote) => ({
          id: quote.id,
          title: quote.text,
          subtitle: 'Guru Arul · Quote',
          href: `/guru-arul#${quote.id}`,
        })),
    ];
  }, [query, works, chapters]);
  const quote = guruArulQuotes.find((item) => item.id === 'jathi-13')!;
  return (
    <main id="main-content" className="home-page app-container">
      <section className="home-welcome">
        <div>
          <p className="home-eyebrow">SREE NARAYANA GURU</p>
          <h1 lang="ml">വായന തുടങ്ങാം.</h1>
          <p>Read. Reflect. Discover.</p>
        </div>
        <Image
          src="/images/sree-narayana-guru-original.png"
          alt="Sree Narayana Guru"
          width={162}
          height={299}
          preload
          unoptimized
        />
      </section>
      <form className="home-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <Search size={21} aria-hidden="true" />
        <input
          aria-label="Search the library"
          placeholder="കൃതി, ധർമ്മം, വാക്കുകൾ തിരയൂ…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('');
          }}
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
            <X size={19} />
          </button>
        )}
      </form>
      {query.trim() ? (
        <section className="home-search-results" aria-label="Search results">
          <p role="status">{results.length} results</p>
          <div className="reading-list">
            {results.map((result) => (
              <Link key={result.id} href={result.href} className="reading-row">
                <div>
                  <h2 lang="ml">{result.title}</h2>
                  <p>{result.subtitle}</p>
                </div>
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            ))}
          </div>
          {!results.length && (
            <div className="empty-state">
              <h2>No results found</h2>
              <p>Try a Malayalam word or an English title.</p>
              <button className="button button-primary" onClick={() => setQuery('')}>
                Clear search
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          <nav className="home-reading-shortcuts" aria-label="Reading collections">
            <Link href="/krithis">
              <span className="shortcut-icon">
                <BookOpen size={23} />
              </span>
              <strong lang="ml">കൃതികൾ</strong>
              <small>{works.length} Krithis</small>
            </Link>
            <Link href="/dharmam" aria-label="Sree Narayana Dharmam">
              <span className="shortcut-icon">
                <ListOrdered size={23} />
              </span>
              <strong lang="ml">ധർമ്മം</strong>
              <small>{chapters.length} chapters</small>
            </Link>
            <Link href="/guru-arul" aria-label="Guru Arul quotes">
              <span className="shortcut-icon">
                <Quote size={23} />
              </span>
              <strong lang="ml">അരുൾ</strong>
              <small>{guruArulQuotes.length} quotes</small>
            </Link>
          </nav>
          {recent && (
            <Link href={`/krithis/${recent.slug}`} className="continue-reading">
              <BookOpen size={20} />
              <div>
                <small>Continue reading</small>
                <strong lang="ml">{recent.title}</strong>
              </div>
              <ArrowRight size={19} />
            </Link>
          )}
          <div className="home-content-grid">
            <section id="collection" className="home-section">
              <div className="app-section-title">
                <div>
                  <h2 lang="ml">ഗുരുദേവ കൃതികൾ</h2>
                  <p>Start with a familiar work</p>
                </div>
                <Link href="/krithis">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="reading-list">
                {featured.map((work, index) => (
                  <Link key={work.id} href={`/krithis/${work.slug}`} className="reading-row">
                    <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 lang="ml">{work.title}</h3>
                      <p>{work.transliteration}</p>
                    </div>
                    <ArrowRight size={19} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
            <section id="dharmam" className="home-section">
              <div className="app-section-title">
                <div>
                  <h2 lang="ml">ശ്രീനാരായണ ധർമ്മം</h2>
                  <p>Verses with Malayalam meanings</p>
                </div>
                <Link href="/dharmam">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="reading-list">
                {chapters.slice(0, 3).map((chapter) => (
                  <Link key={chapter.id} href={`/dharmam/${chapter.slug}`} className="reading-row">
                    <span className="row-number">
                      {String(chapter.sortOrder + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 lang="ml">{chapter.title}</h3>
                      <p>{chapter.transliteration}</p>
                    </div>
                    <ArrowRight size={19} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
            <section id="guru-arul" className="home-section home-quote-section">
              <div className="app-section-title">
                <div>
                  <h2 lang="ml">ഗുരു അരുൾ</h2>
                  <p>A moment for reflection</p>
                </div>
                <Link href="/guru-arul">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <Link href={`/guru-arul#${quote.id}`} className="home-quote">
                <Quote size={24} aria-hidden="true" />
                <blockquote lang="ml">{quote.text}</blockquote>
                <p lang="ml">— {quote.attribution}</p>
              </Link>
            </section>
            <section className="home-section home-discover">
              <Compass size={28} aria-hidden="true" />
              <h2>Beyond the library</h2>
              <p>
                A place for Guru’s heritage and community. News, institutions, temples, people and
                more will join the library here.
              </p>
              <Link href="/explore">
                Explore Anandham <ArrowRight size={18} />
              </Link>
            </section>
          </div>
          <p className="home-endnote">
            Free to read. A tribute to Sree Narayana Guru. <Link href="/about">About Anandham</Link>
          </p>
        </>
      )}
    </main>
  );
}

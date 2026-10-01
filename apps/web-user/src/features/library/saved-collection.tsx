'use client';
import Link from 'next/link';
import { Bookmark, X } from 'lucide-react';
import type { KrithiSummary } from '@anandham/library/schema';
import type { DharmamSummary } from '@anandham/library/dharmam-repository';
import { guruArulQuotes } from '@anandham/library/guru-arul';
import { useBookmarks } from '../preferences/preferences';
type Work = Omit<KrithiSummary, 'createdAt' | 'updatedAt'>;
type Chapter = Omit<DharmamSummary, 'createdAt' | 'updatedAt'>;
export function SavedCollection({ works, chapters }: { works: Work[]; chapters: Chapter[] }) {
  const krithis = useBookmarks();
  const dharmam = useBookmarks('anandham-dharmam-bookmarks');
  const arul = useBookmarks('anandham-guru-arul-bookmarks');
  const groups = [
    {
      title: 'Krithis',
      entries: works
        .filter((item) => krithis.bookmarks.includes(item.slug))
        .map((item) => ({
          id: item.slug,
          title: item.title,
          subtitle: item.transliteration,
          href: `/krithis/${item.slug}`,
        })),
      remove: krithis.toggle,
    },
    {
      title: 'Dharmam',
      entries: chapters
        .filter((item) => dharmam.bookmarks.includes(item.slug))
        .map((item) => ({
          id: item.slug,
          title: item.title,
          subtitle: item.transliteration,
          href: `/dharmam/${item.slug}`,
        })),
      remove: dharmam.toggle,
    },
    {
      title: 'Guru Arul',
      entries: guruArulQuotes
        .filter((item) => arul.bookmarks.includes(item.id))
        .map((item) => ({
          id: item.id,
          title: item.text,
          subtitle: item.attribution,
          href: `/guru-arul#${item.id}`,
        })),
      remove: arul.toggle,
    },
  ];
  const count = groups.reduce((total, group) => total + group.entries.length, 0);
  return (
    <main id="main-content" className="saved-page app-container">
      <header className="app-page-title">
        <h1>Saved</h1>
        <p>Your favourite readings, kept on this device.</p>
      </header>
      {count ? (
        groups
          .filter((group) => group.entries.length)
          .map((group) => (
            <section className="saved-group" key={group.title}>
              <h2 className="small-section-title">
                {group.title} <span>{group.entries.length}</span>
              </h2>
              <div className="reading-list">
                {group.entries.map((item) => (
                  <div className="saved-row" key={item.id}>
                    <Link href={item.href}>
                      <h3 lang="ml">{item.title}</h3>
                      <p>{item.subtitle}</p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => group.remove(item.id)}
                      aria-label={`Remove ${item.id} from saved`}
                    >
                      <X size={19} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))
      ) : (
        <div className="empty-state">
          <Bookmark size={36} />
          <h2>Keep a favourite here</h2>
          <p>Tap the bookmark beside a work, chapter or quote to find it here later.</p>
          <Link href="/krithis" className="button button-primary">
            Browse the library
          </Link>
        </div>
      )}
    </main>
  );
}

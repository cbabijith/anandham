import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/features/library/site-header';
import { readingSections, upcomingSections } from '@/features/library/navigation';
export const metadata: Metadata = { title: 'Explore Anandham' };
export default function ExplorePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="explore-page app-container">
        <header className="app-page-title">
          <h1>Explore</h1>
          <p>The words, heritage and community of Sree Narayana Guru.</p>
        </header>
        <section>
          <h2 className="small-section-title">Read now</h2>
          <div className="reading-list">
            {readingSections.map(({ href, title, english, icon: Icon }) => (
              <Link className="reading-row" href={href} key={href}>
                <Icon size={22} />
                <div>
                  <h3 lang="ml">{title}</h3>
                  <p>{english}</p>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </section>
        <section className="upcoming-section">
          <h2 className="small-section-title">Coming to Anandham</h2>
          <p>
            These collections are being planned. They will appear here when they are ready to
            explore.
          </p>
          <ul className="upcoming-grid">
            {upcomingSections.map(({ id, title, description, icon: Icon }) => (
              <li key={id}>
                <Icon size={22} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import { listKrithis } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { Collection } from '@/features/library/collection';
import { pageMetadata, siteDescription } from '@/features/seo/metadata';
import { JsonLd, siteGraph } from '@/features/seo/structured-data';
import { LibraryQuestions } from '@/features/seo/library-questions';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({
  title: 'Sree Narayana Guru Krithis & Dharmam · ശ്രീനാരായണ ഗുരു',
  description: siteDescription,
  path: '/',
});
export default async function Home() {
  const works = (await listKrithis()).map(
    ({ createdAt: _created, updatedAt: _updated, ...work }) => {
      void _created;
      void _updated;
      return work;
    },
  );
  const categoryCount = new Set(works.map((k) => k.category)).size;
  return (
    <>
      <SiteHeader />
      <JsonLd data={siteGraph()} />
      <main id="main-content">
        <section className="hero section-container">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-sun">✳</span> A DIGITAL LIBRARY FOR EVERYONE
            </span>
            <h1>
              Sree Narayana Guru.
              <br />
              <em>Timeless words.</em>
            </h1>
            <p className="hero-subtitle" lang="ml">
              ശ്രീനാരായണ ഗുരുവിന്റെ കൃതികൾ
            </p>
            <p className="hero-description">
              Discover the collected writings of Sree Narayana Guru.
              <br className="desktop-break" /> A quiet space to read, reflect, and find your own
              meaning.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#collection">
                Explore the collection <ArrowDown size={17} />
              </a>
              <Link className="text-link" href="/krithis/daiva-dasakam">
                Begin with Daiva Dasakam <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-stats">
              <span>
                <strong>{works.length}</strong> Original works
              </span>
              <i />
              <span>
                <strong>{categoryCount}</strong> Collections
              </span>
              <i />
              <span>
                <BookOpen size={17} /> Free to read
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="portrait-ring ring-one" />
            <div className="portrait-ring ring-two" />
            <span className="art-caption">KNOWLEDGE · COMPASSION · ONENESS</span>
            <div className="portrait-shell">
              <Image
                src="/images/sree-narayana-guru-original.png"
                alt="Original photograph of Sree Narayana Guru seated in a chair, wearing white robes"
                width={162}
                height={299}
                preload
                unoptimized
                className="guru-portrait"
              />
            </div>
            <div className="portrait-label">
              <span>Sree Narayana Guru</span>
              <small>1855 — 1928</small>
            </div>
            <span className="art-flower">✳</span>
          </div>
        </section>
        <div className="wisdom-strip">
          <span>“</span>
          <p lang="ml">ഒരു ജാതി, ഒരു മതം, ഒരു ദൈവം മനുഷ്യന്.</p>
          <small>ONE CASTE, ONE RELIGION, ONE GOD FOR HUMANITY</small>
        </div>
        <div className="dharmam-invitation section-container">
          <div>
            <span className="eyebrow">CONTINUE YOUR READING</span>
            <h2 lang="ml">ശ്രീനാരായണ ധർമ്മം</h2>
            <p>Explore the chapters with verses and Malayalam explanations.</p>
          </div>
          <Link href="/dharmam" className="button button-primary">
            Read Sree Narayana Dharmam <ArrowUpRight size={17} />
          </Link>
        </div>
        <Collection works={works} />
        <section id="about" className="about-section section-container">
          <div>
            <span className="eyebrow">THE TEACHER. THE VISION.</span>
            <h2>
              Wisdom that
              <br />
              belongs to everyone.
            </h2>
          </div>
          <div>
            <Sparkles className="accent" size={26} />
            <p>
              Sree Narayana Guru was a poet, philosopher, and social reformer from Kerala. His
              writings invite us to look beyond divisions and live with knowledge, compassion, and
              human dignity.
            </p>
            <p>
              This library brings together every entry in Sivagiri Mutt’s Gurudeva Krithikal
              catalogue, with the original text and a source link for each work. English titles help
              you find a work; the writings are presented in the source’s Malayalam script.
            </p>
            <a
              className="text-link"
              href="https://sivagiri.com/gurudevakrithikal"
              target="_blank"
              rel="noreferrer"
            >
              Visit the source collection <ArrowUpRight size={16} />
            </a>
            <p>
              <Link className="text-link" href="/sree-narayana-guru">
                Read about Sree Narayana Guru <ArrowUpRight size={16} />
              </Link>
            </p>
            <p>
              <Link className="text-link" href="/ml/sree-narayana-guru" lang="ml">
                ശ്രീനാരായണ ഗുരുവിനെക്കുറിച്ച് വായിക്കാം
              </Link>
            </p>
          </div>
        </section>
        <LibraryQuestions />
      </main>
      <footer className="site-footer section-container">
        <Link href="/" className="footer-brand" aria-label="Anandham home">
          <Image
            src="/images/anandham-brand.png"
            alt="Anandham Channel"
            width={2063}
            height={688}
            sizes="210px"
          />
        </Link>
        <p>
          <Link href="/about">About & sources</Link> · <Link href="/krithis">All krithis</Link>
        </p>
        <span>A tribute to the wisdom of Sree Narayana Guru</span>
      </footer>
    </>
  );
}

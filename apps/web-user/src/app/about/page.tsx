import Link from 'next/link';
import { SiteHeader } from '@/features/library/site-header';
import { pageMetadata } from '@/features/seo/metadata';
export const metadata = pageMetadata({
  title: 'About Anandham — Sources & Editorial Approach',
  description:
    'How Anandham presents Sree Narayana Guru’s krithis and Sree Narayana Dharmam, with source attribution and preserved original text.',
  path: '/about',
});
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="guide-page section-container">
        <h1>About the Anandham library</h1>
        <p lang="ml">ആനന്ദം — ശ്രീനാരായണ ഗുരുവിന്റെ കൃതികളും ധർമ്മവും വായിക്കാനുള്ള ഇടം.</p>
        <section>
          <h2>Sources and attribution</h2>
          <p>
            The krithi collection follows the entries in{' '}
            <a href="https://sivagiri.com/gurudevakrithikal">
              Sivagiri Mutt’s Gurudeva Krithikal catalogue
            </a>
            . Each work links to its source. Source spellings and textual variants are preserved; an
            English search title is not an English translation.
          </p>
          <p>
            The Sree Narayana Dharmam verses and Malayalam explanations were supplied by the library
            owner. Chapters are added progressively. This is a growing collection, not a claim that
            every Dharmam chapter has already been published.
          </p>
        </section>
        <section>
          <h2>Reading and editorial care</h2>
          <p>
            Reading is free and requires no account. You can change text size, use a light or dark
            theme, and save works on your device. Editors retain the original contribution alongside
            revisions so changes can be reviewed.
          </p>
          <p>
            Anandham is an independent reading resource. Source links identify the material used;
            they do not imply endorsement by Sivagiri Mutt.
          </p>
          <p>
            Each reading page offers a plain-text edition, a citation and the date its text was last
            updated. Dharmam passages have individual links for sharing a specific passage. The{' '}
            <a href="/llms.txt">plain-text catalogue</a> lists the currently published works and chapters.
          </p>
        </section>
        <div className="guide-links">
          <Link href="/sree-narayana-guru">About Sree Narayana Guru</Link>
          <Link href="/krithis">Read the krithis</Link>
          <Link href="/dharmam">Read Dharmam</Link>
        </div>
      </main>
    </>
  );
}

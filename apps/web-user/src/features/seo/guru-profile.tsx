import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/features/library/site-header';
import { absoluteUrl } from './metadata';
import { breadcrumbs, guruEntity, JsonLd } from './structured-data';

export function GuruProfile({ language }: { language: 'en' | 'ml' }) {
  const ml = language === 'ml';
  const path = ml ? '/ml/sree-narayana-guru' : '/sree-narayana-guru';
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="guide-page section-container" lang={language}>
        <nav className="guide-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Anandham</Link>
          <span>/</span>
          <span>{ml ? 'ശ്രീനാരായണ ഗുരു' : 'Sree Narayana Guru'}</span>
        </nav>
        <div className="guide-heading">
          <div>
            <span className="eyebrow">
              {ml ? 'ജീവിതം · ചിന്ത · കൃതികൾ' : 'LIFE · THOUGHT · WRITINGS'}
            </span>
            <h1>{ml ? 'ശ്രീനാരായണ ഗുരു' : 'Sree Narayana Guru'}</h1>
            <p className="guide-subtitle" lang={ml ? 'en' : 'ml'}>
              {ml ? 'Sree Narayana Guru' : 'ശ്രീനാരായണ ഗുരു'}
            </p>
            <Link
              href={ml ? '/sree-narayana-guru' : '/ml/sree-narayana-guru'}
              hrefLang={ml ? 'en' : 'ml'}
              lang={ml ? 'en' : 'ml'}
            >
              {ml ? 'Read in English' : 'മലയാളത്തിൽ വായിക്കുക'}
            </Link>
          </div>
          <Image
            src="/images/sree-narayana-guru-original.png"
            alt={
              ml
                ? 'ശ്രീനാരായണ ഗുരുവിന്റെ യഥാർത്ഥ ചിത്രം'
                : 'Original photograph of Sree Narayana Guru'
            }
            width={162}
            height={299}
            unoptimized
          />
        </div>
        <section>
          <h2>{ml ? 'ആരാണ് ശ്രീനാരായണ ഗുരു?' : 'Who was Sree Narayana Guru?'}</h2>
          <p>
            {ml
              ? 'കേരളത്തിലെ ആത്മീയ ഗുരുവും ദാർശനികനും കവിയും സാമൂഹിക പരിഷ്കർത്താവുമായിരുന്നു ശ്രീനാരായണ ഗുരു. ജാതിവിവേചനത്തിനെതിരെ നിലകൊണ്ട അദ്ദേഹം മനുഷ്യരുടെ സമത്വത്തിനും വിദ്യാഭ്യാസത്തിനും ആത്മീയ വളർച്ചയ്ക്കും പ്രാധാന്യം നൽകി.'
              : 'Sree Narayana Guru was a spiritual teacher, philosopher, poet and social reformer from Kerala, India. He challenged discrimination based on caste and emphasized human equality, education and spiritual understanding.'}
          </p>
          <p>
            {ml
              ? 'തിരുവനന്തപുരത്തിനടുത്തുള്ള ചെമ്പഴന്തിയിലാണ് ഗുരു ജനിച്ചത്. വർക്കലയിലെ ശിവഗിരി അദ്ദേഹത്തിന്റെ ജീവിതത്തോടും പ്രവർത്തനങ്ങളോടും അടുത്ത ബന്ധമുള്ള സ്ഥലമാണ്.'
              : 'Guru was born in Chempazhanthy, near Thiruvananthapuram. Sivagiri in Varkala became closely associated with his life, teaching and work.'}{' '}
            <a href="https://sivagiri.com/history-of-guru">
              {ml ? 'ശിവഗിരി: ഗുരുവിന്റെ ജീവചരിത്രം' : 'Source: Sivagiri biography'}
            </a>
            .
          </p>
        </section>
        <section>
          <h2>{ml ? 'ഗുരുവിന്റെ ചിന്തകൾ' : 'What did Guru teach?'}</h2>
          <p>
            {ml
              ? 'അദ്വൈതചിന്തയും മനുഷ്യസാഹോദര്യവും ഗുരുവിന്റെ ദർശനത്തിൽ പ്രധാനമാണ്. ജാതിയുടെയും മതത്തിന്റെയും പേരിലുള്ള വിഭജനങ്ങൾക്കപ്പുറം മനുഷ്യരെ കാണാൻ അദ്ദേഹത്തിന്റെ ചിന്തകൾ പ്രചോദിപ്പിക്കുന്നു.'
              : 'Guru’s philosophy connects Advaita, or non-duality, with human fellowship. His teaching encourages people to look beyond divisions of caste and religion.'}{' '}
            <a href="https://www.keralatourism.org/varkala/sree-narayana-guru--philosophy.php">
              {ml ? 'കേരള ടൂറിസം: ഗുരുദർശനം' : 'Source: Kerala Tourism'}
            </a>
            .
          </p>
          <blockquote lang="ml">ഒരു ജാതി, ഒരു മതം, ഒരു ദൈവം മനുഷ്യന്.</blockquote>
        </section>
        <section>
          <h2>{ml ? 'ഗുരുദേവകൃതികൾ വായിക്കാം' : 'Read the krithis of Sree Narayana Guru'}</h2>
          <p>
            {ml
              ? 'കവിതകളും പ്രാർത്ഥനകളും ദാർശനിക കൃതികളും ഈ ഗ്രന്ഥശാലയിൽ വായിക്കാം. മൂലസ്രോതസ്സിലെ പാഠം മലയാളലിപിയിൽ നൽകിയിരിക്കുന്നു. ഇംഗ്ലീഷ് പേരുകൾ കൃതികൾ കണ്ടെത്താൻ സഹായിക്കുന്നു.'
              : 'Explore poetry, prayers and philosophical works in the krithi collection. Texts appear in the source’s Malayalam script, with English transliterations to help you find each work.'}
          </p>
          <div className="guide-links">
            <Link href="/krithis/daiva-dasakam">ദൈവദശകം · Daiva Dasakam</Link>
            <Link href="/krithis/atmopadesa-sathakam">ആത്മോപദേശശതകം · Atmopadesa Sathakam</Link>
            <Link href="/krithis">{ml ? 'എല്ലാ കൃതികളും' : 'Browse all krithis'}</Link>
          </div>
        </section>
        <section>
          <h2>{ml ? 'ശ്രീനാരായണ ധർമ്മം' : 'Explore Sree Narayana Dharmam'}</h2>
          <p>
            {ml
              ? 'ശ്രീനാരായണ ധർമ്മത്തിലെ പ്രസിദ്ധീകരിച്ച അധ്യായങ്ങൾ ശ്ലോകങ്ങളും മലയാളത്തിലുള്ള അർത്ഥവും സഹിതം വായിക്കാം. ധർമ്മം, ജാതി, മതം, ദൈവം തുടങ്ങിയ വിഷയങ്ങളുള്ള അധ്യായങ്ങൾ ലഭ്യമാണ്.'
              : 'Read the published chapters of Sree Narayana Dharmam with verses and Malayalam explanations. Available chapters discuss dharma, caste, religion and the divine.'}
          </p>
          <Link className="button button-primary" href="/dharmam">
            {ml ? 'ധർമ്മം വായിക്കുക' : 'Read Sree Narayana Dharmam'}
          </Link>
        </section>
        <p className="guide-note">
          <Link href="/about">
            {ml
              ? 'ഗ്രന്ഥശാലയുടെ സ്രോതസ്സുകളും പ്രസാധനരീതിയും'
              : 'About the library, sources and editorial approach'}
          </Link>
        </p>
      </main>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          url: absoluteUrl(path),
          name: ml ? 'ശ്രീനാരായണ ഗുരു' : 'Sree Narayana Guru',
          inLanguage: language,
          mainEntity: guruEntity,
          isPartOf: { '@id': absoluteUrl('/#website') },
        }}
      />
      <JsonLd
        data={breadcrumbs([
          { name: 'Anandham', path: '/' },
          { name: ml ? 'ശ്രീനാരായണ ഗുരു' : 'Sree Narayana Guru', path },
        ])}
      />
    </>
  );
}

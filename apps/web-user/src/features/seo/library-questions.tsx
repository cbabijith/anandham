import Link from 'next/link';
import { JsonLd } from './structured-data';
const questions = [
  {
    language: 'en',
    question: 'Where can I read Sree Narayana Guru’s krithis?',
    answer:
      'Anandham provides free access to the works listed in Sivagiri Mutt’s Gurudeva Krithikal catalogue. Browse the krithis by Malayalam title or English transliteration, then open a work to read its source text.',
  },
  {
    language: 'ml',
    question: 'ശ്രീനാരായണ ഗുരുവിന്റെ കൃതികൾ എവിടെ വായിക്കാം?',
    answer:
      'ശിവഗിരി മഠത്തിന്റെ ഗുരുദേവകൃതികൾ പട്ടികയിലെ കൃതികൾ ആനന്ദത്തിൽ സൗജന്യമായി വായിക്കാം. മലയാളത്തിലോ ഇംഗ്ലീഷിലോ പേര് തിരഞ്ഞ് കൃതി തുറക്കാം. ഓരോ കൃതിയിലും മൂലസ്രോതസ്സിലേക്കുള്ള ലിങ്കുണ്ട്.',
  },
  {
    language: 'en',
    question: 'Does Sree Narayana Dharmam include Malayalam explanations?',
    answer:
      'Yes. The published Dharmam chapters present the supplied verses and Malayalam explanations separately. More chapters are added as their text is supplied to the library.',
  },
  {
    language: 'ml',
    question: 'ശ്രീനാരായണ ധർമ്മത്തിന് മലയാളത്തിൽ അർത്ഥം ലഭ്യമാണോ?',
    answer:
      'അതെ. പ്രസിദ്ധീകരിച്ച ധർമ്മം അധ്യായങ്ങളിൽ ശ്ലോകങ്ങളും മലയാളത്തിലുള്ള അർത്ഥവും പ്രത്യേകം വായിക്കാം. പുതിയ അധ്യായങ്ങളുടെ പാഠം ലഭിക്കുന്നതനുസരിച്ച് അവ ചേർക്കുന്നു.',
  },
  {
    language: 'en',
    question: 'Are the krithis available in English translation?',
    answer:
      'English titles help you find the works. The krithi texts are presented in Malayalam script as supplied by the source; this library does not currently provide English translations of every work.',
  },
];
export function LibraryQuestions() {
  return (
    <section className="search-questions section-container" aria-labelledby="reading-questions">
      <h2 id="reading-questions">About reading the library</h2>
      <p lang="ml">കൃതികളും ധർമ്മവും വായിക്കാൻ</p>
      {questions.map((q) => (
        <details key={q.question} lang={q.language}>
          <summary>{q.question}</summary>
          <p>{q.answer}</p>
        </details>
      ))}
      <p>
        <Link href="/krithis">Browse all krithis</Link> · <Link href="/dharmam">Read Dharmam</Link>{' '}
        · <Link href="/about">Sources & editorial approach</Link>
      </p>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: { '@type': 'Answer', text: q.answer },
          })),
        }}
      />
    </section>
  );
}

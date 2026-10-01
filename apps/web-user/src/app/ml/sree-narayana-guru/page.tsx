import { GuruProfile } from '@/features/seo/guru-profile';
import { pageMetadata } from '@/features/seo/metadata';
export const metadata = pageMetadata({
  title: 'ശ്രീനാരായണ ഗുരു — ജീവിതം, ദർശനം, കൃതികൾ',
  description:
    'ശ്രീനാരായണ ഗുരുവിന്റെ ജീവിതവും ദർശനവും അറിയാം. ഗുരുദേവകൃതികളും മലയാളത്തിലുള്ള അർത്ഥം സഹിതം ശ്രീനാരായണ ധർമ്മവും വായിക്കാം.',
  path: '/ml/sree-narayana-guru',
  language: 'ml',
  translated: true,
});
export default function Page() {
  return <GuruProfile language="ml" />;
}

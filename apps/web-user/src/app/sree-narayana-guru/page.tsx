import { GuruProfile } from '@/features/seo/guru-profile';
import { pageMetadata } from '@/features/seo/metadata';
export const metadata = pageMetadata({
  title: 'Sree Narayana Guru — Life, Teachings & Krithis',
  description:
    'Learn about Sree Narayana Guru, the philosopher and social reformer from Kerala. Read his krithis and explore Sree Narayana Dharmam.',
  path: '/sree-narayana-guru',
  translated: true,
});
export default function Page() {
  return <GuruProfile language="en" />;
}

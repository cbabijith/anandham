import type { Metadata } from 'next';

const configuredUrl = process.env.LIBRARY_SITE_URL || 'https://anandham.online';
const origin = new URL(configuredUrl);
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password)
  throw new Error('LIBRARY_SITE_URL must be a public HTTP(S) origin.');
export const siteUrl = origin.origin;
export const absoluteUrl = (path = '/') => new URL(path, `${siteUrl}/`).toString();
export const siteName = 'Anandham';
export const siteDescription =
  'Read Sree Narayana Guru’s krithis and Sree Narayana Dharmam online. ശ്രീനാരായണ ഗുരുവിന്റെ കൃതികളും ശ്രീനാരായണ ധർമ്മവും വായിക്കാം.';
export const socialImage = {
  url: absoluteUrl('/branding/library-social.png'),
  width: 1200,
  height: 630,
  alt: 'Anandham — Sree Narayana Guru digital library: Krithis and Dharmam',
};
export const profileLanguages = {
  en: absoluteUrl('/sree-narayana-guru'),
  ml: absoluteUrl('/ml/sree-narayana-guru'),
  'x-default': absoluteUrl('/sree-narayana-guru'),
};

export function pageMetadata({
  title,
  description,
  path,
  language = 'en',
  translated = false,
  plainText = false,
}: {
  title: string;
  description: string;
  path: string;
  language?: 'en' | 'ml';
  translated?: boolean;
  plainText?: boolean;
}): Metadata {
  return {
    title: { absolute: `${title} | ${siteName}` },
    description,
    alternates: {
      canonical: absoluteUrl(path),
      ...(translated ? { languages: profileLanguages } : {}),
      ...(plainText ? { types: { 'text/plain': absoluteUrl(`${path}/text`) } } : {}),
    },
    openGraph: {
      type: 'website',
      url: absoluteUrl(path),
      siteName,
      title: `${title} | ${siteName}`,
      description,
      locale: language === 'ml' ? 'ml_IN' : 'en_IN',
      ...(translated ? { alternateLocale: [language === 'ml' ? 'en_IN' : 'ml_IN'] } : {}),
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description,
      images: [socialImage.url],
    },
  };
}

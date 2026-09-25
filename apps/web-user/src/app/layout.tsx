import type { Metadata } from 'next';
import { Manrope, Noto_Sans_Malayalam, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import '@/features/seo/seo.css';
import { absoluteUrl, siteDescription, siteUrl } from '@/features/seo/metadata';
const sans = Manrope({ variable: '--font-sans', subsets: ['latin'] });
const malayalam = Noto_Sans_Malayalam({
  variable: '--font-malayalam',
  subsets: ['malayalam'],
  weight: ['400', '500', '600', '700'],
});
const serif = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Sree Narayana Guru Krithis & Dharmam | Anandham', template: '%s | Anandham' },
  description: siteDescription,
  applicationName: 'Anandham',
  category: 'literature',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/branding/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/branding/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  other: { 'og:see_also': absoluteUrl('/sree-narayana-guru') },
};
const themeScript = `(function(){try{var t=localStorage.getItem('anandham-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}})()`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sans.variable} ${malayalam.variable} ${serif.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

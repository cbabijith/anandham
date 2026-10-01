import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import '@/features/seo/seo.css';
import { absoluteUrl, siteDescription, siteUrl } from '@/features/seo/metadata';
// Bundled fonts keep deployments independent of Google's font service.
const sans = localFont({
  src: './fonts/manrope-latin.woff2',
  variable: '--font-sans',
  weight: '200 800',
  display: 'swap',
});
const malayalam = localFont({
  src: './fonts/noto-sans-malayalam.woff2',
  variable: '--font-malayalam',
  weight: '100 900',
  display: 'swap',
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sree Narayana Guru Krithis, Dharmam & Guru Arul | Anandham',
    template: '%s | Anandham',
  },
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
      <body className={`${sans.variable} ${malayalam.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

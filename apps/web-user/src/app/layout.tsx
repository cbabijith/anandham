import type { Metadata } from 'next';
import { Manrope, Noto_Sans_Malayalam, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
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
  title: 'Anandham — The writings of Sree Narayana Guru',
  description:
    'Explore the 60 krithis in Sivagiri’s Gurudeva Krithikal catalogue. Read Sree Narayana Guru’s original writings with adjustable text and light or dark themes.',
  icons: { icon: '/images/sree-narayana-guru-original.png' },
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

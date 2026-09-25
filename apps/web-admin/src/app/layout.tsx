import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import NavigationProgress from '@/components/ui/navigation-progress';
import { Suspense } from 'react';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AMA - Anandham Management Admin',
  description: 'Admin dashboard for managing the Anandham platform',
};

// Inline script to prevent flash of wrong theme
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('ama-theme');
    if (!theme) theme = 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Suspense>
            <NavigationProgress />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

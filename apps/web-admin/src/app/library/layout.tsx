import type { Metadata } from 'next';
import '@/features/library/library.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Anandham Library Studio',
  robots: { index: false, follow: false },
};
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

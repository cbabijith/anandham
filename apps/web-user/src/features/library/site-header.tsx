import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ThemeToggle } from '../preferences/preferences';
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Anandham home">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            Anandham<small>THE WISDOM OF SREE NARAYANA GURU</small>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#collection" className="nav-link">
            The collection
          </Link>
          <Link href="/#about" className="nav-link">
            About Guru <ArrowUpRight size={13} />
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

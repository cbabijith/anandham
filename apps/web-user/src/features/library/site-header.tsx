'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, BookOpen, Compass, Home } from 'lucide-react';
import { ThemeToggle } from '../preferences/preferences';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/krithis', label: 'Library', icon: BookOpen },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/saved', label: 'Saved', icon: Bookmark },
];
export function SiteHeader() {
  const pathname = usePathname();
  const active =
    pathname.startsWith('/dharmam') ||
    pathname.startsWith('/guru-arul') ||
    pathname.startsWith('/krithis')
      ? '/krithis'
      : ['/about', '/sree-narayana-guru', '/ml/sree-narayana-guru'].includes(pathname)
        ? '/explore'
        : pathname;
  return (
    <>
      <header className="site-header library-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Anandham home">
            <span className="brand-mark" aria-hidden="true" />
            <span>Anandham</span>
          </Link>
          <nav className="desktop-navigation" aria-label="Main navigation">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={active === href ? 'page' : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <nav className="bottom-navigation" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={active === href ? 'page' : undefined}>
            <Icon size={22} strokeWidth={active === href ? 2.2 : 1.7} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

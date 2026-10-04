'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  LibraryBig,
  BookOpen,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Users,
  Quote,
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
export function AdminShell({
  children,
  email,
  readerUrl,
  role,
}: {
  children: React.ReactNode;
  email: string;
  readerUrl: string;
  role: 'owner' | 'editor';
}) {
  const path = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    const res = await fetch('/api/library/session', { method: 'DELETE' });
    if (res.ok) {
      router.replace('/library/login');
      router.refresh();
    } else setError('Could not sign out. Please try again.');
  }
  return (
    <div className="library-admin">
      <aside className={`la-sidebar ${open ? 'is-open' : ''}`}>
        <Link href="/library" className="la-brand">
          <span className="la-brand-symbol" aria-hidden="true" />
          <span>
            Anandham<small>LIBRARY STUDIO</small>
          </span>
        </Link>
        <button
          className="la-mobile-close"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <p className="la-nav-label">WORKSPACE</p>
        <nav>
          <Link
            href="/library"
            onClick={() => setOpen(false)}
            className={path === '/library' ? 'active' : ''}
          >
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link
            href="/library/krithis"
            onClick={() => setOpen(false)}
            className={path.startsWith('/library/krithis') ? 'active' : ''}
          >
            <LibraryBig size={18} /> Krithis collection
          </Link>
          <Link
            href="/library/dharmam"
            onClick={() => setOpen(false)}
            className={path.startsWith('/library/dharmam') ? 'active' : ''}
          >
            <BookOpen size={18} /> Sree Narayana Dharmam
          </Link>
          <Link
            href="/library/guru-arul"
            onClick={() => setOpen(false)}
            className={path.startsWith('/library/guru-arul') ? 'active' : ''}
          >
            <Quote size={18} /> Guru Arul
          </Link>
          {role === 'owner' && (
            <Link
              href="/library/team"
              onClick={() => setOpen(false)}
              className={path.startsWith('/library/team') ? 'active' : ''}
            >
              <Users size={18} /> Team members
            </Link>
          )}
          <a href={readerUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={18} /> Open reader website
          </a>
        </nav>
        <div className="la-sidebar-bottom">
          <span className="la-avatar">A</span>
          <div>
            <strong>{role === 'owner' ? 'Library owner' : 'Library editor'}</strong>
            <small>{email}</small>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="la-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="la-main">
        <header className="la-topbar">
          <button
            className="la-mobile-menu"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span>
            Library workspace <span className="la-topbar-divider">/</span>{' '}
            <strong>
              {path === '/library'
                ? 'Overview'
                : path.startsWith('/library/guru-arul')
                  ? 'Guru Arul'
                  : path.startsWith('/library/team')
                    ? 'Team'
                    : path.startsWith('/library/dharmam')
                      ? 'Dharmam'
                      : 'Krithis'}
            </strong>
          </span>
          <div>
            <button
              onClick={toggleTheme}
              className="la-icon"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className="la-logout" aria-label="Sign out">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </header>
        {error && (
          <p className="la-message error" role="alert">
            {error}
          </p>
        )}
        <main className="la-content" id="main-content">
          {children}
        </main>
        <footer className="la-footer">
          Anandham Library Studio <span>Preserving words. Sharing wisdom.</span>
        </footer>
      </div>
    </div>
  );
}

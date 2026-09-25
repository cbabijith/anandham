'use client';
import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
const subscribe = (cb: () => void) => {
  window.addEventListener('anandham-preference', cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('anandham-preference', cb);
    window.removeEventListener('storage', cb);
  };
};
export function usePreference(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );
  const set = (next: string) => {
    try {
      localStorage.setItem(key, next);
    } catch {}
    window.dispatchEvent(new Event('anandham-preference'));
  };
  return [value, set] as const;
}
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme ?? 'light',
    () => 'light',
  );
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('anandham-theme', next);
    } catch {}
    window.dispatchEvent(new Event('anandham-preference'));
  }
  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title="Change theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
export function useBookmarks() {
  const [raw, set] = usePreference('anandham-bookmarks', '[]');
  let bookmarks: string[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) bookmarks = parsed.filter((s): s is string => typeof s === 'string');
  } catch {}
  function toggle(slug: string) {
    set(
      JSON.stringify(
        bookmarks.includes(slug) ? bookmarks.filter((x) => x !== slug) : [...bookmarks, slug],
      ),
    );
  }
  return { bookmarks, toggle };
}

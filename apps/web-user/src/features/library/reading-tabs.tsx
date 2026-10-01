'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { readingSections } from './navigation';

export function ReadingTabs() {
  const pathname = usePathname();
  return (
    <nav className="reading-tabs" aria-label="Reading collections">
      {readingSections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          aria-current={pathname === section.href ? 'page' : undefined}
        >
          <span lang="ml">{section.english === 'Guru Arul' ? 'അരുൾ' : section.title}</span>
          <small>{section.english}</small>
        </Link>
      ))}
    </nav>
  );
}

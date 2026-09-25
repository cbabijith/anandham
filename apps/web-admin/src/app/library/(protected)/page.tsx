import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getLibraryStats } from '@anandham/library/repository';
import { requireAdmin } from '@/features/library/server';
export default async function Overview() {
  await requireAdmin();
  const stats = await getLibraryStats();
  return (
    <>
      <div className="la-page-heading">
        <div>
          <span className="la-eyebrow">THE COLLECTION AT A GLANCE</span>
          <h1>Welcome to the library.</h1>
          <p>A thoughtful home for Sree Narayana Guru’s writings.</p>
        </div>
        <Link className="la-button primary" href="/library/krithis">
          Manage krithis <ArrowRight size={16} />
        </Link>
      </div>
      <div className="la-stats">
        {[
          { label: 'Total works', value: stats.total, icon: BookOpen },
          { label: 'Published', value: stats.published, icon: CircleCheck },
          { label: 'Drafts', value: stats.drafts, icon: FileText },
          { label: 'Source entries', value: stats.sourced, icon: ShieldCheck },
        ].map((s) => (
          <article key={s.label}>
            <div>
              <span>{s.label}</span>
              <s.icon size={19} />
            </div>
            <strong>{s.value}</strong>
            <small>
              {s.label === 'Published'
                ? 'Visible on the reader website'
                : s.label === 'Source entries'
                  ? `of ${stats.lastImport?.sourceCount ?? 60} Sivagiri catalogue entries`
                  : s.label === 'Drafts'
                    ? 'Private until published'
                    : `${stats.archived} archived`}
            </small>
          </article>
        ))}
      </div>
      <div className="la-overview-grid">
        <section className="la-panel">
          <div className="la-panel-heading">
            <h2>Source collection</h2>
            <span className="la-badge published">
              {stats.sourced === stats.lastImport?.sourceCount
                ? 'Import complete'
                : 'Review needed'}
            </span>
          </div>
          <p>Gurudeva Krithikal · Sivagiri Mutt</p>
          <div className="la-source-progress">
            <span
              style={{
                width: `${Math.min(100, (stats.sourced / (stats.lastImport?.sourceCount ?? 60)) * 100)}%`,
              }}
            />
          </div>
          <strong>
            {stats.sourced} / {stats.lastImport?.sourceCount ?? 60} original entries imported
          </strong>
          <p>
            Each source entry retains its original text, source URL, and checksum. Re-running the
            seed preserves editorial changes.
          </p>
          <a
            href="https://sivagiri.com/gurudevakrithikal"
            target="_blank"
            rel="noreferrer"
            className="la-text-link"
          >
            View the source catalogue <ExternalLink size={14} />
          </a>
          {stats.lastImport && (
            <small>
              Last seed:{' '}
              {stats.lastImport.createdAt.toLocaleDateString('en-IN', {
                dateStyle: 'medium',
                timeZone: 'Asia/Kolkata',
              })}
            </small>
          )}
        </section>
        <section className="la-panel">
          <h2>Your publishing workflow</h2>
          <ol className="la-workflow">
            <li>
              <span>01</span>
              <div>
                <strong>Care for the original</strong>
                <p>Edit titles, categories, or the complete text in the collection.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Preview and prepare</strong>
                <p>Keep unfinished work as a private draft. Check the reading preview.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Share the wisdom</strong>
                <p>Publish to make a work immediately available on the reader website.</p>
              </div>
            </li>
          </ol>
        </section>
      </div>
      <section className="la-panel">
        <h2>Recent editorial activity</h2>
        {stats.recentChanges.length ? (
          <ul className="la-activity">
            {stats.recentChanges.map((c) => (
              <li key={c.id}>
                <span>
                  <strong lang="ml">{c.title}</strong>
                  <small>{c.action}</small>
                </span>
                <time>{c.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</time>
              </li>
            ))}
          </ul>
        ) : (
          <div className="la-empty">
            <FileText size={27} />
            <p>No editorial changes yet. The imported collection is ready to review.</p>
          </div>
        )}
      </section>
    </>
  );
}

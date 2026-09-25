'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
const subscribe = () => () => {};
const ready = () => true;
const serverReady = () => false;
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Pencil, ExternalLink, CheckCircle2 } from 'lucide-react';
import { categories } from '@anandham/library/catalogue';
import type { KrithiInput } from '@anandham/library/validation';
type Work = KrithiInput & { id: string; sourceUrl: string; sourceHash: string; sourceBody: string };
const empty: KrithiInput = {
  title: '',
  transliteration: '',
  slug: '',
  category: 'philosophy',
  body: '',
  status: 'draft',
  sortOrder: 60,
};
export function KrithiEditor({ work, readerUrl }: { work?: Work; readerUrl: string }) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribe, ready, serverReady);
  const [form, setForm] = useState<KrithiInput>(
    work
      ? {
          title: work.title,
          transliteration: work.transliteration,
          slug: work.slug,
          category: work.category,
          body: work.body,
          status: work.status,
          sortOrder: work.sortOrder,
          revision: work.revision,
        }
      : empty,
  );
  const [baseline, setBaseline] = useState(JSON.stringify(form));
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dirty = JSON.stringify(form) !== baseline;
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty) event.preventDefault();
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function field<K extends keyof KrithiInput>(name: K, value: KrithiInput[K]) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(
        work ? `/api/library/krithis/${work.id}` : '/api/library/krithis',
        {
          method: work ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const saved = { ...form, revision: result.data.revision };
      setForm(saved);
      setBaseline(JSON.stringify(saved));
      setMessage(
        saved.status === 'published'
          ? 'Saved and published. Readers can see this version now.'
          : 'Saved. This work is private.',
      );
      if (!work || work.slug !== saved.slug) router.replace(`/library/krithis/${saved.slug}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Please try again.');
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Link
        href="/library/krithis"
        className="la-back"
        onClick={(e) => {
          if (dirty && !confirm('Leave without saving your changes?')) e.preventDefault();
        }}
      >
        <ArrowLeft size={16} /> Back to collection
      </Link>
      <form method="post" onSubmit={save}>
        <div className="la-page-heading">
          <div>
            <span className="la-eyebrow">
              {work ? 'CARE FOR THE ORIGINAL' : 'GROW THE COLLECTION'}
            </span>
            <h1>{work ? 'Edit krithi' : 'Add a work'}</h1>
            <p>
              {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
              {work ? ` · Revision ${form.revision}` : ''}
            </p>
          </div>
          <button className="la-button primary" disabled={pending || !hydrated}>
            <Save size={17} />
            {pending ? 'Saving…' : form.status === 'published' ? 'Save & publish' : 'Save changes'}
          </button>
        </div>
        {error && (
          <p className="la-message error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="la-message success" role="status">
            <CheckCircle2 size={18} />
            {message}
          </p>
        )}
        <div className="la-editor-grid">
          <div>
            <section className="la-panel la-editor-fields">
              <h2>About this work</h2>
              <label>
                Original title
                <input
                  lang="ml"
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => field('title', e.target.value)}
                />
              </label>
              <label>
                English search title
                <input
                  required
                  maxLength={200}
                  value={form.transliteration}
                  onChange={(e) => field('transliteration', e.target.value)}
                />
                <small>A transliterated title to help readers find the work.</small>
              </label>
              <label>
                URL slug
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  minLength={2}
                  maxLength={120}
                  value={form.slug}
                  onChange={(e) => field('slug', e.target.value)}
                />
                <small>Lowercase English letters, numbers, and hyphens.</small>
              </label>
            </section>
            <section className="la-panel la-editor-fields">
              <div className="la-panel-heading">
                <h2>Complete text</h2>
                <button
                  type="button"
                  className="la-button small"
                  onClick={() => setPreview(!preview)}
                >
                  {preview ? <Pencil size={15} /> : <Eye size={15} />}{' '}
                  {preview ? 'Edit text' : 'Reading preview'}
                </button>
              </div>
              {preview ? (
                <article className="la-reading-preview" lang="ml">
                  {form.body || 'Add the original text to preview it here.'}
                </article>
              ) : (
                <label className="la-body-label">
                  <span className="sr-only">Complete original text</span>
                  <textarea
                    lang="ml"
                    required
                    minLength={20}
                    maxLength={500000}
                    rows={24}
                    value={form.body}
                    onChange={(e) => field('body', e.target.value)}
                    placeholder="Enter the complete original text, preserving line breaks…"
                  />
                </label>
              )}
              <div className="la-text-count">
                <span>Plain text · Line breaks are preserved</span>
                <span>{form.body.length.toLocaleString()} characters</span>
              </div>
            </section>
          </div>
          <aside>
            <section className="la-panel la-editor-fields">
              <h2>Publication</h2>
              <label>
                Status
                <select
                  aria-label="Status"
                  value={form.status}
                  onChange={(e) => field('status', e.target.value as KrithiInput['status'])}
                >
                  <option value="draft">Draft — private</option>
                  <option value="published">Published — visible to readers</option>
                  <option value="archived">Archived — hidden from readers</option>
                </select>
              </label>
              <p className="la-help-text">
                Save after changing the status. Published changes appear immediately.
              </p>
              <label>
                Category
                <select
                  aria-label="Category"
                  value={form.category}
                  onChange={(e) => field('category', e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Collection order
                <input
                  type="number"
                  min={0}
                  max={10000}
                  required
                  value={form.sortOrder}
                  onChange={(e) => field('sortOrder', Number(e.target.value))}
                />
                <small>Starts at 0. Lower values appear first.</small>
              </label>
              {work && form.status === 'published' && (
                <a
                  className="la-text-link"
                  href={`${readerUrl}/krithis/${work.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open published version <ExternalLink size={14} />
                </a>
              )}
            </section>
            <section className="la-panel la-source-panel">
              <h2>Source & provenance</h2>
              {work?.sourceUrl ? (
                <>
                  <p>Imported from Sivagiri Mutt’s Gurudeva Krithikal collection.</p>
                  <a
                    className="la-text-link"
                    href={work.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Compare with the source <ExternalLink size={14} />
                  </a>
                  <details>
                    <summary>Original imported text</summary>
                    <pre lang="ml">{work.sourceBody}</pre>
                  </details>
                  <details>
                    <summary>Source checksum (SHA-256)</summary>
                    <code>{work.sourceHash}</code>
                  </details>
                </>
              ) : (
                <p>This is an editorial addition. Verify the original text before publishing.</p>
              )}
              <small>
                Every saved change is recorded in the editorial history. The original source
                snapshot remains intact.
              </small>
            </section>
          </aside>
        </div>
      </form>
    </>
  );
}

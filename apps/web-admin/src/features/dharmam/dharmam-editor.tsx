'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import type { DharmamInput } from '@anandham/library/dharmam-validation';
import type { DharmamPassage } from '@anandham/library/schema';
const subscribe = () => () => {};
const ready = () => true;
const serverReady = () => false;
type Work = DharmamInput & { id: string; sourceLabel: string; sourcePassages: DharmamPassage[] };
const initial: DharmamInput = {
  title: '',
  transliteration: '',
  slug: '',
  passages: [{ verses: '', explanation: '' }],
  editorialNote: '',
  sortOrder: 5,
  status: 'draft',
};
export function DharmamEditor({
  chapter,
  readerUrl,
  nextOrder = 5,
}: {
  chapter?: Work;
  readerUrl: string;
  nextOrder?: number;
}) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribe, ready, serverReady);
  const [form, setForm] = useState<DharmamInput>(
    chapter
      ? {
          title: chapter.title,
          transliteration: chapter.transliteration,
          slug: chapter.slug,
          passages: chapter.passages,
          editorialNote: chapter.editorialNote,
          sortOrder: chapter.sortOrder,
          status: chapter.status,
          revision: chapter.revision,
        }
      : { ...initial, sortOrder: nextOrder },
  );
  const [baseline, setBaseline] = useState(JSON.stringify(form));
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const dirty = JSON.stringify(form) !== baseline;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function field<K extends keyof DharmamInput>(name: K, value: DharmamInput[K]) {
    setForm((old) => ({ ...old, [name]: value }));
    setMessage('');
  }
  function passage(index: number, key: keyof DharmamPassage, value: string) {
    field(
      'passages',
      form.passages.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    );
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(
        chapter ? `/api/library/dharmam/${chapter.id}` : '/api/library/dharmam',
        {
          method: chapter ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      const saved = { ...form, revision: result.data.revision };
      setForm(saved);
      setBaseline(JSON.stringify(saved));
      setMessage(
        saved.status === 'published'
          ? 'Saved and published. Readers can see this chapter now.'
          : 'Saved. This chapter is private.',
      );
      if (!chapter || chapter.slug !== saved.slug) router.replace(`/library/dharmam/${saved.slug}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this chapter.');
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Link
        href="/library/dharmam"
        className="la-back"
        onClick={(e) => {
          if (dirty && !confirm('Leave without saving your changes?')) e.preventDefault();
        }}
      >
        <ArrowLeft size={16} /> Back to Dharmam chapters
      </Link>
      <form method="post" onSubmit={save}>
        <div className="la-page-heading">
          <div>
            <span className="la-eyebrow">SREE NARAYANA DHARMAM</span>
            <h1>{chapter ? 'Edit chapter' : 'Add chapter'}</h1>
            <p>
              {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
              {chapter ? ` · Revision ${form.revision}` : ''}
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
              <h2>About this chapter</h2>
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
              </label>
              <label>
                URL slug
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  value={form.slug}
                  onChange={(e) => field('slug', e.target.value)}
                />
              </label>
            </section>
            <section className="la-panel la-editor-fields">
              <div className="la-panel-heading">
                <h2>Verses & meaning</h2>
                <button
                  type="button"
                  className="la-button small"
                  onClick={() => setPreview(!preview)}
                >
                  {preview ? <Pencil size={15} /> : <Eye size={15} />}
                  {preview ? 'Edit text' : 'Reading preview'}
                </button>
              </div>
              {form.passages.map((p, index) => (
                <div className="la-dharmam-passage" key={index}>
                  <div className="la-panel-heading">
                    <h3>Passage {index + 1}</h3>
                    {!preview && form.passages.length > 1 && (
                      <button
                        type="button"
                        className="la-button small"
                        aria-label={`Remove passage ${index + 1}`}
                        onClick={() => {
                          if (
                            (!p.verses && !p.explanation) ||
                            confirm('Remove this passage and its explanation?')
                          )
                            field(
                              'passages',
                              form.passages.filter((_, i) => i !== index),
                            );
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                  {preview ? (
                    <article className="la-reading-preview" lang="ml">
                      <h4>ശ്ലോകം</h4>
                      <div>{p.verses}</div>
                      <h4>അർത്ഥം</h4>
                      <div>{p.explanation}</div>
                    </article>
                  ) : (
                    <>
                      <label>
                        Verses {index + 1}
                        <textarea
                          aria-label={`Verses ${index + 1}`}
                          lang="ml"
                          required
                          rows={8}
                          maxLength={50000}
                          value={p.verses}
                          onChange={(e) => passage(index, 'verses', e.target.value)}
                        />
                      </label>
                      <label>
                        Malayalam explanation {index + 1}
                        <textarea
                          aria-label={`Malayalam explanation ${index + 1}`}
                          lang="ml"
                          required
                          rows={6}
                          maxLength={50000}
                          value={p.explanation}
                          onChange={(e) => passage(index, 'explanation', e.target.value)}
                        />
                      </label>
                    </>
                  )}
                </div>
              ))}
              {!preview && (
                <button
                  type="button"
                  className="la-button"
                  disabled={form.passages.length >= 100}
                  onClick={() =>
                    field('passages', [...form.passages, { verses: '', explanation: '' }])
                  }
                >
                  <Plus size={16} /> Add passage
                </button>
              )}
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
                  onChange={(e) => field('status', e.target.value as DharmamInput['status'])}
                >
                  <option value="draft">Draft — private</option>
                  <option value="published">Published — visible to readers</option>
                  <option value="archived">Archived — hidden from readers</option>
                </select>
              </label>
              <label>
                Chapter number
                <input
                  type="number"
                  required
                  min={1}
                  max={10001}
                  value={form.sortOrder + 1}
                  onChange={(e) => field('sortOrder', Number(e.target.value) - 1)}
                />
              </label>
              <p className="la-help-text">
                Save after changing the status. Chapters appear in this reading order.
              </p>
              {chapter && chapter.status === 'published' && (
                <a
                  className="la-text-link"
                  href={`${readerUrl}/dharmam/${chapter.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open published chapter <ExternalLink size={14} />
                </a>
              )}
            </section>
            <section className="la-panel la-editor-fields">
              <h2>Editorial notes</h2>
              <label>
                Private note
                <textarea
                  rows={5}
                  maxLength={2000}
                  value={form.editorialNote}
                  onChange={(e) => field('editorialNote', e.target.value)}
                />
              </label>
              <small>Visible only to administrators.</small>
            </section>
            <section className="la-panel la-source-panel">
              <h2>Original contribution</h2>
              <p>{chapter?.sourceLabel ?? 'Library editorial contribution'}</p>
              {!!chapter?.sourcePassages.length && (
                <details>
                  <summary>View the supplied text</summary>
                  {chapter.sourcePassages.map((p, i) => (
                    <pre lang="ml" key={i}>
                      {p.verses}
                      {'\n\n'}
                      {p.explanation}
                    </pre>
                  ))}
                </details>
              )}
              <small>Saving preserves the original contribution and records a revision.</small>
            </section>
          </aside>
        </div>
      </form>
    </>
  );
}

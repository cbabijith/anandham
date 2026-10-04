'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Save,
  Trash2,
  Eye,
  Pencil,
  ExternalLink,
} from 'lucide-react';
import type { GuruArulInput } from '@anandham/library/guru-arul-validation';
import type { Topic } from './guru-arul-table';
const subscribe = () => () => {};
const ready = () => true;
const serverReady = () => false;
function fields(topic: Topic): GuruArulInput {
  return {
    title: topic.title,
    english: topic.english,
    sortOrder: topic.sortOrder,
    status: topic.status,
    quotes: topic.quotes,
    revision: topic.revision,
  };
}
export function GuruArulEditor({
  topic,
  nextOrder = 0,
  readerUrl,
}: {
  topic?: Topic;
  nextOrder?: number;
  readerUrl: string;
}) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribe, ready, serverReady);
  const [form, setForm] = useState<GuruArulInput>(
    topic
      ? fields(topic)
      : { title: '', english: '', sortOrder: nextOrder, status: 'draft', quotes: [] },
  );
  const [baseline, setBaseline] = useState(JSON.stringify(form));
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(false);
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
  function field<K extends keyof GuruArulInput>(key: K, value: GuruArulInput[K]) {
    setForm((old) => ({ ...old, [key]: value }));
    setMessage('');
  }
  function quote(index: number, changes: Partial<GuruArulInput['quotes'][number]>) {
    field(
      'quotes',
      form.quotes.map((q, i) => (i === index ? { ...q, ...changes } : q)),
    );
  }
  function move(index: number, direction: number) {
    const next = [...form.quotes];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    field('quotes', next);
  }
  function addQuote() {
    field('quotes', [
      ...form.quotes,
      { text: '', attribution: 'ശ്രീ നാരായണഗുരു', status: 'published' },
    ]);
    setPreview(false);
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLTextAreaElement>(
        `#quote-text-${form.quotes.length}`,
      );
      input?.focus();
    });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(
        topic ? `/api/library/guru-arul/${topic.id}` : '/api/library/guru-arul',
        {
          method: topic ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save this topic.');
      const saved = fields(result.data);
      setForm(saved);
      setBaseline(JSON.stringify(saved));
      setMessage(
        saved.status === 'published'
          ? 'Saved and published. Readers will see the updated quotes when they open or refresh the page.'
          : 'Saved. This topic is private.',
      );
      if (!topic) router.replace(`/library/guru-arul/${result.data.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this topic.');
    } finally {
      setPending(false);
    }
  }
  async function removeTopic() {
    if (
      !topic ||
      !confirm(
        `Delete “${form.title}” and all ${form.quotes.length} quotes? This removes them from the reader website.`,
      )
    )
      return;
    setPending(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/library/guru-arul/${topic.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision: form.revision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete this topic.');
      setBaseline(JSON.stringify(form));
      router.replace('/library/guru-arul');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this topic.');
      setPending(false);
    }
  }
  return (
    <>
      <Link
        href="/library/guru-arul"
        className="la-back"
        onClick={(e) => {
          if (dirty && !confirm('Leave without saving your changes?')) e.preventDefault();
        }}
      >
        <ArrowLeft size={16} /> Back to Guru Arul
      </Link>
      <form method="post" onSubmit={save}>
        <div className="la-page-heading">
          <div>
            <span className="la-eyebrow">GURU ARUL</span>
            <h1>{topic ? 'Edit topic & quotes' : 'Add topic'}</h1>
            <p>{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
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
            {message}
          </p>
        )}
        <fieldset disabled={pending} className="la-fieldset">
          <div className="la-editor-grid">
            <section className="la-panel la-editor-fields">
              <h2>Topic heading</h2>
              <label>
                Malayalam title
                <input
                  lang="ml"
                  required
                  maxLength={250}
                  value={form.title}
                  onChange={(e) => field('title', e.target.value)}
                />
              </label>
              <label>
                English title
                <input
                  maxLength={250}
                  value={form.english}
                  onChange={(e) => field('english', e.target.value)}
                />
                <small>Optional; helps readers search for this topic.</small>
              </label>
            </section>
            <aside className="la-panel la-editor-fields">
              <h2>Publication</h2>
              <label>
                Topic status
                <select
                  value={form.status}
                  onChange={(e) => field('status', e.target.value as GuruArulInput['status'])}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                Display order
                <input
                  type="number"
                  min={1}
                  max={10001}
                  required
                  value={form.sortOrder + 1}
                  onChange={(e) => field('sortOrder', Number(e.target.value) - 1)}
                />
                <small>Lower numbers appear first.</small>
              </label>
              {topic && (
                <a
                  className="la-button"
                  href={`${readerUrl}/guru-arul#topic-${topic.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} /> Open reader
                </a>
              )}
            </aside>
          </div>
          <section className="la-arul-quotes">
            <div className="la-panel-heading">
              <div>
                <h2>Quotes under this topic · {form.quotes.length}</h2>
                <p className="la-help-text">
                  Keep the complete text. Use the arrows to change reading order.
                </p>
              </div>
              <button type="button" className="la-button" onClick={() => setPreview(!preview)}>
                {preview ? <Pencil size={16} /> : <Eye size={16} />}
                {preview ? 'Edit quotes' : 'Reading preview'}
              </button>
            </div>
            {!form.quotes.length && (
              <div className="la-panel la-empty">
                <p>No quotes yet. Add a quote when its text is ready.</p>
              </div>
            )}
            {form.quotes.map((q, index) => (
              <article className="la-panel la-arul-quote" key={q.id ?? `new-${index}`}>
                <div className="la-panel-heading">
                  <h3>Quote {index + 1}</h3>
                  <div className="la-row-actions">
                    <button
                      type="button"
                      className="la-icon"
                      aria-label={`Move quote ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      type="button"
                      className="la-icon"
                      aria-label={`Move quote ${index + 1} down`}
                      disabled={index === form.quotes.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button
                      type="button"
                      className="la-icon la-danger"
                      aria-label={`Delete quote ${index + 1}`}
                      onClick={() => {
                        if (
                          (!q.text && !q.id) ||
                          confirm(
                            `Remove quote ${index + 1}? The deletion takes effect when you save this topic.`,
                          )
                        )
                          field(
                            'quotes',
                            form.quotes.filter((_, i) => i !== index),
                          );
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {preview ? (
                  <div className="la-arul-preview">
                    <blockquote lang="ml">{q.text}</blockquote>
                    <p lang="ml">— {q.attribution}</p>
                    <span className={`la-badge ${q.status}`}>{q.status}</span>
                  </div>
                ) : (
                  <div className="la-editor-fields">
                    <label htmlFor={`quote-text-${index}`}>Quote {index + 1} text</label>
                    <textarea
                      id={`quote-text-${index}`}
                      lang="ml"
                      required
                      maxLength={20000}
                      rows={5}
                      value={q.text}
                      onChange={(e) => quote(index, { text: e.target.value })}
                    />
                    <div className="la-arul-quote-fields">
                      <label>
                        Quote {index + 1} attribution
                        <input
                          lang="ml"
                          required
                          maxLength={250}
                          value={q.attribution}
                          onChange={(e) => quote(index, { attribution: e.target.value })}
                        />
                      </label>
                      <label>
                        Quote {index + 1} status
                        <select
                          value={q.status}
                          onChange={(e) =>
                            quote(index, { status: e.target.value as GuruArulInput['status'] })
                          }
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                    </div>
                  </div>
                )}
              </article>
            ))}
            <button
              className="la-button"
              type="button"
              onClick={addQuote}
              disabled={form.quotes.length >= 500}
            >
              <Plus size={17} /> Add quote
            </button>
          </section>
        </fieldset>
        <div className="la-editor-savebar">
          <p>
            {form.status === 'published'
              ? 'Published quotes appear on the reader website.'
              : 'This topic stays private until published.'}
          </p>
          <button className="la-button primary" disabled={pending || !hydrated}>
            <Save size={17} />
            {pending ? 'Saving…' : form.status === 'published' ? 'Save & publish' : 'Save changes'}
          </button>
        </div>
      </form>
      {topic && (
        <section className="la-panel la-arul-delete">
          <div>
            <h2>Delete topic</h2>
            <p>
              Remove this heading and every quote under it. To keep the content privately, choose
              Archived instead.
            </p>
          </div>
          <button
            type="button"
            className="la-button la-danger"
            disabled={pending || !hydrated}
            onClick={removeTopic}
          >
            <Trash2 size={16} /> Delete topic
          </button>
        </section>
      )}
    </>
  );
}

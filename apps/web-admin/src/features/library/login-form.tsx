'use client';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
const subscribe = () => () => {};
const ready = () => true;
const serverReady = () => false;
import { ArrowRight } from 'lucide-react';
export function LoginForm() {
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribe, ready, serverReady);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const res = await fetch('/api/library/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      router.replace('/library');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.');
      setPending(false);
    }
  }
  return (
    <div className="library-admin la-login">
      <div className="la-login-card">
        <span className="la-login-symbol la-brand-symbol" aria-hidden="true" />
        <span className="la-eyebrow">ANANDHAM · LIBRARY STUDIO</span>
        <h1>
          A space for the
          <br />
          keepers of wisdom.
        </h1>
        <p>Sign in to care for the collection.</p>
        <form method="post" action="/api/library/session" onSubmit={submit}>
          <noscript>Enable JavaScript to sign in to the library studio.</noscript>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              required
              maxLength={254}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
            />
          </label>
          {error && (
            <p role="alert" className="la-message error">
              {error}
            </p>
          )}
          <button className="la-button primary" disabled={pending || !hydrated}>
            {pending ? 'Signing in…' : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>
        <small>Access is reserved for library administrators.</small>
      </div>
    </div>
  );
}

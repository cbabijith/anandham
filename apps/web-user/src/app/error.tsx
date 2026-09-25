'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="empty-state">
      <h1>The library is taking a moment.</h1>
      <p>We couldn’t load the collection. Please try again.</p>
      <button type="button" className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}

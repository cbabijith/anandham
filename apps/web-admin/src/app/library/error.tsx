'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="library-admin la-login">
      <div className="la-login-card">
        <h1>We couldn’t open the library.</h1>
        <p>Please try again in a moment.</p>
        <button className="la-button primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}

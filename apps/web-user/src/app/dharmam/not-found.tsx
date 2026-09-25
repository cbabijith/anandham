import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="empty-state" id="main-content">
      <h1>This chapter isn’t available.</h1>
      <p>It may not have been published yet.</p>
      <Link className="button button-primary" href="/dharmam">
        Browse Dharmam chapters
      </Link>
    </main>
  );
}

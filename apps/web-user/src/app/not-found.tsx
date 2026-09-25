import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main-content" className="empty-state">
      <span className="eyebrow">ANANDHAM LIBRARY</span>
      <h1>This work isn’t available.</h1>
      <p>It may have been moved or is still being prepared.</p>
      <Link href="/#collection" className="button button-primary">
        Return to the collection
      </Link>
    </main>
  );
}

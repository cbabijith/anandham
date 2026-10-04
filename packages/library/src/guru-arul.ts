export type GuruArulStatus = 'draft' | 'published' | 'archived';
export type GuruArulEntry = {
  id: string;
  text: string;
  attribution: string;
  status: GuruArulStatus;
};
export type GuruArulQuote = Omit<GuruArulEntry, 'status'> & { category: string };
export type GuruArulCategory = { id: string; title: string; english: string; sortOrder: number };
export type GuruArulCollection = { categories: GuruArulCategory[]; quotes: GuruArulQuote[] };

// Every public surface uses this projection; private quotes never enter the client bundle.
export function publicGuruArul(
  topics: (GuruArulCategory & {
    status: GuruArulStatus;
    quotes: GuruArulEntry[];
  })[],
): GuruArulCollection {
  const categories: GuruArulCategory[] = [];
  const quotes: GuruArulQuote[] = [];
  for (const topic of topics) {
    if (topic.status !== 'published') continue;
    const published = topic.quotes.filter((quote) => quote.status === 'published');
    if (!published.length) continue;
    categories.push({
      id: topic.id,
      title: topic.title,
      english: topic.english,
      sortOrder: topic.sortOrder,
    });
    quotes.push(
      ...published.map(({ id, text, attribution }) => ({
        id,
        text,
        attribution,
        category: topic.id,
      })),
    );
  }
  return { categories, quotes };
}

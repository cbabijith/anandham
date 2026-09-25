import 'server-only';
import { cache } from 'react';
import type { DharmamChapter, Krithi, KrithiSummary } from '@anandham/library/schema';
import type { DharmamSummary } from '@anandham/library/dharmam-repository';

type Serialized<T> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
type PublicKrithi = Serialized<Omit<Krithi, 'sourceBody'>>;
type PublicChapter = Serialized<Omit<DharmamChapter, 'sourcePassages' | 'editorialNote'>>;

function serializeDates<T extends { createdAt: Date; updatedAt: Date }>(record: T): Serialized<T> {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function backendUrl() {
  return process.env.LIBRARY_API_URL?.replace(/\/+$/, '');
}

async function fetchLibrary(path: string) {
  return fetch(`${backendUrl()}${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
}

async function listFromBackend<T>(collection: string): Promise<T[]> {
  const records: T[] = [];
  for (let page = 1; ; page++) {
    const response = await fetchLibrary(`/${collection}?page=${page}&limit=100`);
    if (!response.ok) throw new Error('The library backend is unavailable.');
    const result = (await response.json()) as { data: T[]; total: number };
    records.push(...result.data);
    if (records.length >= result.total) return records;
    if (result.data.length === 0)
      throw new Error('The library backend returned an incomplete list.');
  }
}

async function getFromBackend<T>(collection: string, slug: string): Promise<T | undefined> {
  const response = await fetchLibrary(`/${collection}/${encodeURIComponent(slug)}`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error('The library backend is unavailable.');
  const result = (await response.json()) as { data: T };
  return result.data;
}

export const listKrithis = cache(async (): Promise<Serialized<KrithiSummary>[]> => {
  if (backendUrl()) return listFromBackend('krithis');
  const repository = await import('@anandham/library/repository');
  return (await repository.listKrithis()).map(repository.summarize).map(serializeDates);
});

export const getKrithi = cache(async (slug: string): Promise<PublicKrithi | undefined> => {
  if (backendUrl()) return getFromBackend('krithis', slug);
  const repository = await import('@anandham/library/repository');
  const record = await repository.getKrithi(slug);
  if (!record) return undefined;
  const { sourceBody, ...publicRecord } = record;
  void sourceBody;
  return serializeDates(publicRecord);
});

export const listDharmam = cache(async (): Promise<Serialized<DharmamSummary>[]> => {
  if (backendUrl()) return listFromBackend('dharmam');
  const repository = await import('@anandham/library/dharmam-repository');
  return (await repository.listDharmam()).map(repository.summarizeDharmam).map(serializeDates);
});

export const getDharmam = cache(async (slug: string): Promise<PublicChapter | undefined> => {
  if (backendUrl()) return getFromBackend('dharmam', slug);
  const repository = await import('@anandham/library/dharmam-repository');
  const record = await repository.getDharmam(slug);
  return record ? serializeDates(repository.publicDharmam(record)) : undefined;
});

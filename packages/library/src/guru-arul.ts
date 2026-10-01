import quotes from '../data/guru-arul.json';

export const guruArulCategories = [
  { id: 'jathi', title: 'ജാതി', english: 'Caste' },
  { id: 'matham', title: 'മതം', english: 'Religion' },
] as const;

export const guruArulQuotes = quotes;
export type GuruArulQuote = (typeof quotes)[number];

export const categories = [
  { id: 'ganapathy', name: 'Ganapathy', malayalam: 'ഗണപതി' },
  { id: 'devi', name: 'Devi', malayalam: 'ദേവി' },
  { id: 'subrahmanya', name: 'Subrahmanya', malayalam: 'സുബ്രഹ്മണ്യൻ' },
  { id: 'siva', name: 'Siva', malayalam: 'ശിവൻ' },
  { id: 'vishnu', name: 'Vishnu', malayalam: 'വിഷ്ണു' },
  { id: 'ethical', name: 'Ethics & compassion', malayalam: 'പ്രബോധനാത്മകം' },
  { id: 'philosophy', name: 'Philosophy', malayalam: 'ദാർശനികം' },
  { id: 'translations', name: 'Translations', malayalam: 'തർജമകൾ' },
  { id: 'prose', name: 'Prose', malayalam: 'ഗദ്യം' },
  { id: 'appendix', name: 'Other writings', malayalam: 'അനുബന്ധം' },
] as const;
export function normalizeSearch(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .toLocaleLowerCase()
    .trim();
}

export const sourceNotes: Record<string, string> = {
  'atmopadesa-sathakam':
    'The Sivagiri source repeats part of verse 88 and labels it 89 before the next verse 89. This transcription preserves the source exactly; all verse numbers 1–100 are present.',
};

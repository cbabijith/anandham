import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Anandham — Sree Narayana Guru Library',
    short_name: 'Anandham',
    description: 'Krithis and Sree Narayana Dharmam in Malayalam.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8ff',
    theme_color: '#6942c6',
    icons: [
      { src: '/branding/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/branding/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

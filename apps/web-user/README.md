# Anandham reader

The public library at https://anandham.online presents Sree Narayana Guru's
krithis and Sree Narayana Dharmam in Malayalam, with English search titles.

From the repository root:

```sh
npm ci
npm run dev -w @anandham/web-user
npm run build -w @anandham/web-user
```

Set `DATABASE_URL` for direct PostgreSQL access, or `LIBRARY_API_URL` to the
existing public library API. Do not expose database credentials as public
environment variables. `LIBRARY_SITE_URL` controls the canonical public origin.

The app includes light/dark themes, text zoom, local bookmarks, source links,
English and Malayalam Guru guides, a published-content sitemap and Anandham icons.

See [the library guide](../../docs/DIGITAL_LIBRARY.md) and
[search visibility](../../docs/SEARCH_VISIBILITY.md) for deployment and verification.

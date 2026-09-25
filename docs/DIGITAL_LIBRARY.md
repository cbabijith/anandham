# Anandham digital library

The public reader in `apps/web-user` and the library studio in `apps/web-admin`
share `packages/library`, a Drizzle ORM / PostgreSQL feature package. Next.js is
16.3.6 and React is 19.3.0. The dedicated library does not require Supabase or
Appwrite. Existing unrelated admin modules remain in the repository; Railway
runs `LIBRARY_MODE=true`, which routes entry to the library and disables their
API routes in that deployment.

## Source coverage

The source is <https://sivagiri.com/gurudevakrithikal>. All **60 catalogue entries**
in **10 categories** have a complete fetched text in
`packages/library/data/krithis.json`. Source IDs, URLs, timestamps, character
counts and SHA-256 checksums are recorded in `import-manifest.json`. Original
texts are rendered as escaped plain text; modern commentary and audio recordings
are not copied. English titles are editorial search aliases, not translations.

This is completeness against the named catalogue, not a claim that the source is
a critical edition of Guru's complete works. Atmopadesa Sathakam has a source
anomaly: text from verse 88 is repeated with number 89, then another verse 89
follows. The original is retained and the reader includes a note. Source spelling
and character variants are intentionally retained. Editorial corrections can be
made in the admin without overwriting the preserved source snapshot.

Regenerate the source import with `uv run scripts/import-sivagiri.py`. The
importer verifies source IDs, rejects missing/non-empty text failures, and writes
only after all 60 requests succeed. English aliases are bound to stable source
IDs, not list positions. Review any source changes before committing the new
snapshot. It does not scrape on web requests or silently refresh live text.

## Local development

1. Run PostgreSQL and create an empty `anandham` database.
2. Run `npm ci` from the repository root.
3. Copy `.env.example` to `.env.local`, `apps/web-user/.env.local`, and
   `apps/web-admin/.env.local`; configure `DATABASE_URL` in all three. Set a random
   admin password of at least 16 characters. Never commit these files.
4. Run `node --env-file=.env.local --import tsx packages/library/scripts/setup.ts`.
5. Run `npm run dev -w @anandham/web-user -- --port 3000` and
   `npm run dev -w @anandham/web-admin -- --port 3001`.
6. Open the reader at `http://localhost:3000` and studio at
   `http://localhost:3001/library`. The studio's configured origin must match the
   browser URL exactly.

`npm run db:generate` creates reviewed Drizzle migrations. `npm run db:setup`
applies checked-in migrations and inserts source entries that do not exist.
Existing editorial text, publication state and administrator passwords are
preserved. Both apps must connect to the same database.

## Feature locations

- `packages/library/src/schema.ts`: library, source snapshots, sessions, admins,
  rate limits, import records and editorial audit history.
- `packages/library/src/repository.ts`: publication visibility, validation,
  transactions and optimistic revision control.
- `apps/web-user/src/features/library`: discovery and category/title search.
- `apps/web-user/src/features/reader`: complete-text reader, zoom, print and share.
- `apps/web-user/src/features/preferences`: theme, saved works and reading history.
- `apps/web-admin/src/features/library`: protected studio, editor and API guards.

Saved works, last-read work, text size and theme are stored in the current
browser. No reader account is required. Text zoom spans 16–40 pixels and the
browser's normal zoom remains enabled. Light and dark theme preferences persist.

## Admin workflow and security

Sign in, open **Krithis collection**, search or filter, and edit a work. The editor
supports title, English alias, URL slug, category, order, full text, preview and
publication status. **Draft** and **Archived** entries are excluded from every
public query and API. **Published** entries are read directly from PostgreSQL,
so no rebuild is necessary. Save operations require the current revision; stale
edits return `409` instead of overwriting another editor's work. Each save and its
complete snapshot are recorded atomically in the audit table. Original source
snapshots remain available for comparison.

Passwords use salted scrypt hashes. Sessions use random 256-bit tokens, hashed in
the database, with eight-hour HttpOnly/SameSite=Strict cookies (Secure in
production). Every private page and API checks the session on the server.
Sign-in uses a POST form and stays disabled until client initialization, so
credentials cannot be submitted in URL query strings. Mutation routes reject
foreign or absent Origin headers. Login attempts are
limited in PostgreSQL, shared across replicas. JSON payloads and text lengths
are bounded. There is no unauthenticated registration or default password.

Bootstrap credentials are read only when creating an administrator. To rotate a
password, set `LIBRARY_ADMIN_EMAIL` and `LIBRARY_NEW_PASSWORD` in a trusted
server environment, then execute:

```sh
npx tsx packages/library/scripts/reset-password.ts
```

This revokes that administrator's existing sessions. Do not put passwords in Git,
command arguments, issue bodies, or screenshots.

## HTTP API

| Route                                     | Access              | Behavior                                                      |
| ----------------------------------------- | ------------------- | ------------------------------------------------------------- |
| `GET /api/krithis` (reader)               | Public              | Published summaries; `q`, `category`, `page`, `limit` (1–100) |
| `GET /api/krithis/:slug` (reader)         | Public              | Complete published text; unknown/private entries return 404   |
| `GET /api/health` (reader)                | Public              | Database health and published count                           |
| `POST /api/library/session` (studio)      | Public, same-origin | `{email,password}`; rate-limited sign-in                      |
| `DELETE /api/library/session` (studio)    | Same-origin         | Revokes session and clears cookie                             |
| `GET /api/library/krithis` (studio)       | Admin               | All statuses, summaries                                       |
| `POST /api/library/krithis` (studio)      | Admin, same-origin  | Creates a validated work                                      |
| `GET /api/library/krithis/:id` (studio)   | Admin               | Full entry and editorial history                              |
| `PATCH /api/library/krithis/:id` (studio) | Admin, same-origin  | Validated full update; requires `revision`                    |
| `GET /api/library/health` (studio)        | Public              | Database readiness without secrets                            |

Public success envelopes use `{data,total,page,limit}` or `{data}`. Errors use
`{error}` with 400/401/403/404/409/413/415/429/503 as appropriate. A save payload
contains `title`, `transliteration`, `slug`, `category`, `body`, `status`,
`sortOrder`, and `revision` for updates. APIs use same-origin cookies; no browser
CORS access to the studio is required by the reader.

Next.js streamed not-found HTML pages use a `noindex` tag and the not-found
screen; the corresponding JSON API returns an actual 404.

## Railway deployment

Project: **Anandham Digital Library**, Code201 account.

- Project: `53f510a3-ec02-44fe-9309-b64ba5354ca7`
- Environment: `9be4cd86-0fa9-47d2-a6db-1bcdf9d31fb9` (production)
- Postgres: `664ddd05-558e-481d-90a7-b5191226a178`, persistent volume
- Reader: `c082b9f2-5934-42c6-baf9-c52fec6f137f`
- Studio: `041c876c-324c-4cce-9b5c-3a0897e11c7a`

Both services use `Dockerfile.library`, Node 24, `PORT=3000`, and
`DATABASE_URL=${{Postgres.DATABASE_URL}}` over Railway's private network. The
`LIBRARY_APP` build argument is `web-user` or `web-admin`. Only the selected app
and its shared package are installed for each image. The container runs as the
unprivileged Node user. The studio runs `npm run db:setup` as its pre-deploy
command. Deploy studio first so the database is initialized before reader health
checks. The Docker and Railway ignore files exclude credentials, unrelated
mobile artifacts and build caches.

Studio-specific variables: `LIBRARY_MODE=true`, `LIBRARY_ADMIN_ORIGIN`,
`LIBRARY_READER_URL`, and initial `LIBRARY_ADMIN_EMAIL` /
`LIBRARY_ADMIN_PASSWORD`. Neither database credentials nor admin passwords use a
`NEXT_PUBLIC_` prefix.

The production source is `cbabijith/anandham`, branch
`codex/guru-digital-library`. Both services use the repository root and
`Dockerfile.library`. Connect or restore the sources with the Railway CLI:

```sh
railway service source connect --repo cbabijith/anandham --branch codex/guru-digital-library --service web-admin --environment production
railway service source connect --repo cbabijith/anandham --branch codex/guru-digital-library --service web-user --environment production
```

Automatic push deployment is not enabled: the connected Railway account can
build the public repository but cannot create its GitHub deployment triggers;
Railway also denies production token creation for a GitHub Actions workflow.
Authorize this repository in the Railway account's GitHub integration to enable
push triggers. Until then, commit and push the library branch, then deploy the
reviewed GitHub commit through the authenticated Railway CLI:

```sh
railway api 'mutation { serviceInstanceDeploy(environmentId: "9be4cd86-0fa9-47d2-a6db-1bcdf9d31fb9", serviceId: "041c876c-324c-4cce-9b5c-3a0897e11c7a", commitSha: "REVIEWED_GIT_COMMIT_SHA") }'
railway api 'mutation { serviceInstanceDeploy(environmentId: "9be4cd86-0fa9-47d2-a6db-1bcdf9d31fb9", serviceId: "c082b9f2-5934-42c6-baf9-c52fec6f137f", commitSha: "REVIEWED_GIT_COMMIT_SHA") }'
```

Replace the placeholder with `git rev-parse HEAD` from the pushed branch. Deploy
the studio first and wait for its health check before deploying the reader.
Application variables, database connections, health checks and the studio
migration command remain configured in Railway. Do not change the source to the
legacy `main` branch until this library branch has been merged there.

For emergency local uploads:

```sh
railway up --project 53f510a3-ec02-44fe-9309-b64ba5354ca7 --environment production --service web-admin --detach
railway up --project 53f510a3-ec02-44fe-9309-b64ba5354ca7 --environment production --service web-user --detach
```

Check deployment logs and both health endpoints after each release. The GitHub
commit SHA in the deployment metadata identifies the release being served.

## Verification

- `npm run test:library`: 60-entry coverage, checksums, expected verse numbering,
  Malayalam search, validation and password hashing.
- `npm run test:library:e2e`: all 60 public API texts match their source checksums;
  mobile reading, zoom, themes, bookmarks, filters; admin authentication,
  source isolation, draft/publish/archive lifecycle, stale revisions, CSRF,
  audit, logout and pre-hydration form safety.
- `npm run build -w @anandham/web-user` and
  `npm run build -w @anandham/web-admin` include TypeScript validation.

The browser suite uses ports 3100/3101 and configures those origins for its
servers. It refuses to start against a database outside `127.0.0.1`. It creates
a temporary work and cleans it up afterward. Use a dedicated local test database.
If those ports are occupied, set `LIBRARY_TEST_READER_PORT` and/or
`LIBRARY_TEST_ADMIN_PORT` to unused ports before running the suite.

## Live verification — 24 September 2026

The deployed PostgreSQL database contains all 60 published source entries. The
read-only `node scripts/verify-live-library.mjs` check confirms every production
text against its source checksum, both health endpoints, and private API access
control. Live browser checks also verified mobile search, text zoom, dark theme
persistence, administrator sign-in, secure session cookies, original-text preview
and logout. A pre-hydration form submission issue found in the first deployment
was corrected, the initial credential was rotated, and earlier sessions were
revoked before handover. Current credentials are stored only in the ignored local
`.private/production-access.txt` file and the server credential store.

## Violet identity — 26 September 2026

Both library interfaces use the supplied Anandham artwork, with violet and blue
accents, lavender light surfaces and deep violet dark surfaces. The original
artwork is preserved as `public/images/anandham-brand.png` in both apps; CSS
frames its circular emblem in the navigation and login screen. The reader footer
displays the complete artwork.

The hero uses the user-supplied original photograph as
`apps/web-user/public/images/sree-narayana-guru-original.png`. Its original
162×299 pixels, colours and full portrait are retained without AI alterations,
colour blending, or cropping. Rendering preserves its aspect ratio.

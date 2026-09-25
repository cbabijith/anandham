# Search visibility for Anandham

The public canonical domain is **https://anandham.online**. Set `LIBRARY_SITE_URL`
to change it when moving the public site. The production reader uses the existing
`LIBRARY_API_URL` adapter to load published records from Railway. The provider is
still Vercel; default template icons and visible template branding are removed.

## Included

- Bilingual page titles and descriptions, self-referencing canonical URLs, and
  Open Graph/Twitter previews on the home, catalogue, chapter and guide pages.
- An English guide at `/sree-narayana-guru` and a corresponding Malayalam guide
  at `/ml/sree-narayana-guru`, with reciprocal `hreflang` links. The mixed-language
  reading pages do not claim separate English translations that do not exist.
- A database-backed `/sitemap.xml` containing only published works and chapters,
  real modification dates, guide pages, and the canonical public host.
- `/robots.txt` allows public crawling and advertises the sitemap. Public APIs
  and login have noindex headers. The separately deployed admin library already
  has noindex metadata. These directives are not access controls.
- Safe JSON-LD for WebSite/Organization/Person, collections, works and breadcrumbs.
  The visible reading questions have matching FAQPage data; no FAQ rich-result
  entitlement or AI-search placement is claimed.
- Source-linked biographical summaries, an editorial/source page, English and
  Malayalam questions, and crawlable links to the reading collections.
- Custom Anandham favicons, touch icons, web manifest and social-sharing image.

## Search Console and Bing

### Verified release status — 26 September 2026

- Application commit `5cbba38` is deployed on `anandham.online` and the Railway reader.
- Both verification scripts passed in production: 76 canonical HTML pages and 70
  exact published text editions, with six simulated crawler user agents.
- The verified Google Search Console domain property `sc-domain:anandham.online`
  processed `https://anandham.online/sitemap.xml` with **Success, 76 discovered pages**.
- Google's live homepage test returned **URL is available to Google / Page can be
  indexed**. Indexing requests were accepted for `/`, `/sree-narayana-guru` and
  `/ml/sree-narayana-guru`. These URLs were not yet indexed at inspection time.
- IndexNow received the 76-URL batch with **HTTP 200** after key verification
  initially returned 403. Receipt is not proof of indexing or ranking.
- Hosting firewall status reported **AI Bots: Allow**. No firewall settings were
  weakened or changed.

### Account setup and subsequent checks

Ownership verification and sitemap submission require the owner's account.
Google: https://search.google.com/search-console
Bing: https://www.bing.com/webmasters/

For HTML-tag verification, set `GOOGLE_SITE_VERIFICATION` or
`BING_SITE_VERIFICATION` to the exact supplied token and redeploy. Verify the
`https://anandham.online/` URL-prefix property (or verify the domain using the
provider's DNS instructions), then submit `https://anandham.online/sitemap.xml`.
Use URL inspection for the home page, both Guru guides, `/krithis`, and `/dharmam`.
Monitor indexing, queries in both languages, clicks and Core Web Vitals.
No credentials or verification codes are invented or committed.

IndexNow can notify participating search engines of the published URLs without a
Search Console login. `INDEXNOW_KEY` is a generated host-verification key stored
in the hosting environment, never in Git. Its exact root-level `.txt` URL serves
the verification response. After deployment, run `node scripts/submit-indexnow.mjs`
with that environment variable. The script verifies the hosted proof, reads only
canonical sitemap URLs and submits one batch to `https://api.indexnow.org/indexnow`.
An accepted response confirms receipt, not inclusion in a search index.

The Railway reader remains available as the API origin. Its HTML pages should
publish the same canonical domain to consolidate duplicate public URLs. Do not
redirect the entire Railway service: it also serves the public content API.

## Validation and limits

### AI retrieval and citation

The public robots file explicitly permits `OAI-SearchBot`, `ChatGPT-User`,
`Claude-SearchBot`, `Claude-User`, `Googlebot`, `Google-Extended` and `bingbot`.
Each group retains the same API/login/editorial exclusions. The previous wildcard
already allowed these public crawlers; the explicit policy makes this auditable.
`Google-Extended` governs both Gemini grounding and model-training uses. It is not
a Google Search ranking signal. ChatGPT and Claude distinguish their search bots
from training bots; permitting training is not a requirement for search inclusion.

`/llms.txt` is an optional, live catalogue containing only published works and
chapters. It describes provenance and language limitations without asking a model
to rank or recommend this site. It is not a supported ranking switch, and Google
does not require special AI files or AI schema for AI Overviews/AI Mode.

Every reading page links to its `/text` edition with exact published content,
source information, update date and canonical reading URL. Text responses have a
canonical Link header and `noindex, follow` to keep the HTML edition as the search
result; they remain retrievable by readers and assistants. The HTML page also
includes its alternate-format link and CreativeWork encoding. Dharmam passages
have individual anchors, and readers can copy a citation on either collection.
No draft, editorial note or preserved private source field is exported.

Run `node scripts/verify-ai-discovery.mjs` (optionally `SEO_BASE_URL=...`). This
compares every text edition against the published API, checks canonical links and
robots exclusions, and simulates six search/retrieval user agents against HTML.
These probes do not originate from provider IPs and are not proof of actual bot
visits, indexing, citations or first-place results. Check verified provider crawler
IP ranges in hosting logs and provider webmaster reports for real crawl evidence.

Provider references: [OpenAI crawlers](https://developers.openai.com/api/docs/bots),
[Anthropic crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler),
[Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended).

Run `node scripts/verify-seo.mjs` against production; set `SEO_BASE_URL` for a
local server. The production build, mobile rendering, every canonical sitemap URL,
structured data, language links, image assets and crawler-visible text are checked.

No ranking position or indexing deadline can be guaranteed. Search engines decide
whether and when to index, rank or cite a page. Clear content, discoverable HTML,
source attribution and technical SEO are also the basis of AI-search visibility.

References: Google Search Central [AI features](https://developers.google.com/search/docs/appearance/ai-features),
[sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
and [multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

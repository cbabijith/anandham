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

Run `node scripts/verify-seo.mjs` against production; set `SEO_BASE_URL` for a
local server. The production build, mobile rendering, every canonical sitemap URL,
structured data, language links, image assets and crawler-visible text are checked.

No ranking position or indexing deadline can be guaranteed. Search engines decide
whether and when to index, rank or cite a page. Clear content, discoverable HTML,
source attribution and technical SEO are also the basis of AI-search visibility.

References: Google Search Central [AI features](https://developers.google.com/search/docs/appearance/ai-features),
[sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
and [multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

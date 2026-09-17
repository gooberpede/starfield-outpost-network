# Production hosting readiness benchmark

**Date:** 17 September 2026

**Target:** static Vite/React site on Cloudflare Pages Free; no Functions, Workers, database, or other recurring infrastructure charge. A custom domain is conditional on registration **and renewal** costing at most AUD$30/year. No domain has been selected or priced in this audit.

## Executive summary

The current app is fundamentally suitable for static Cloudflare Pages hosting. `npm run build` produced 19 files in `dist/`, with no server runtime, source maps, or routing dependency. The output is far below current Pages Free file-count and individual-file limits. Cloudflare says static asset requests are free and unlimited; this conclusion assumes the project remains purely static. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Pages static-request pricing](https://developers.cloudflare.com/pages/functions/pricing/).

**No current release-blocking hosting incompatibility was found.** Pre-release work is deployment policy and verification: test the deployed response headers and CSP, preserve reference-data coherence across updates, check cache behavior, verify the custom-domain origin plan, and document trusted-LAN-only use of the development server. The practical startup costs are one 523,594-byte minified JavaScript bundle and 13 eager same-origin JSON requests. The JSON is much larger on disk (2,762,769 bytes) but compresses well (105,698 bytes with local Brotli). External Google Fonts add a stylesheet and, on the observed empty starting screen, three font requests. No change is justified solely by Vite's large-chunk advisory.

This is evidence gathering only. No Cloudflare project, domain, production code, configuration, cache rule, header, font, or runtime validator was changed.

## Method and limits

- Read current architecture, backlog, the [whole-product security audit](../audits/codex-whole-product-security-audit.md), [import capacity benchmark](IMPORT-CAPACITY-BENCHMARK.md), [import browser validation](IMPORT-CAPACITY-BROWSER-VALIDATION.md), [browser storage benchmark](BROWSER-STORAGE-CAPACITY-BENCHMARK.md), [history benchmark](../HISTORY-BENCHMARK.md), and [accessibility audit](../audits/codex-whole-product-accessibility-audit.md), then checked current source and output. Older audits contain historical findings; current source and their correction-status sections control this report.
- Ran `npm run build` on Windows in the synced repository, then measured each emitted file's bytes with Node `fs` and local `zlib.gzipSync`/`brotliCompressSync`. Compression figures are **local estimates**, not negotiated HTTP transfer measurements. Vite's printed gzip number uses its own calculation and differs slightly from Node's default gzip measurement.
- Served `dist/` with `npm run preview -- --host 127.0.0.1` and opened it in the Codex in-app browser. Inspected the settled resource inventory on an initial tab and after reload, plus the visible working UI. The browser surface did not expose reliable Navigation/Resource Timing or decoded/wire transfer sizes. Browser engine/version, cache-disable controls, paint timing, and main-thread profile were unavailable. The tab was fresh, but browser cache was **not proven empty**, so the request inventory is a startup surface, not a controlled cold-cache timing run. Localhost observations are not CDN latency estimates.
- The Google Fonts CSS response was obtainable as a 7,993-byte local copy. Three observed font files could not be exported by the asset tool, so their sizes and actual transferred bytes are not measured. No network-throttled, mobile, WebKit, or deployed Pages test was performed.

## Current production build profile

Build command: `npm run build` (localization provenance/overlay verification, `tsc -b`, then Vite 8.2.1). **Passed.** Vite transformed 134 modules and emitted its one advisory for a chunk over 500 kB after minification. No other build warning was observed.

| Category | Files | Raw bytes | Local gzip bytes | Local Brotli bytes | Naming |
| --- | ---: | ---: | ---: | ---: | --- |
| JavaScript | 1 | 523,594 | 137,478 | 113,007 | Hashed |
| CSS | 1 | 52,145 | 8,694 | 7,563 | Hashed |
| Reference JSON | 13 | 2,762,769 | 158,438 | 105,698 | Stable names |
| HTML, icons, favicons | 4 | 7,083 | 3,958 | 3,579 | Stable names |
| **Entire `dist/`** | **19** | **3,345,591** | **308,568** | **229,847** | Mixed |

These compressed totals add individually compressed files, not one compressed archive. The 19 files include `icons.svg` and both favicons, although those are not all requested at startup. No fonts are shipped in `dist/`.

| Largest output file | Raw bytes | Gzip bytes | Brotli bytes |
| --- | ---: | ---: | ---: |
| `reference-data/inorganic-occurrences.json` | 1,115,923 | 46,657 | 33,045 |
| `assets/index-CNt51fzb.js` | 523,594 | 137,478 | 113,007 |
| `reference-data/bodies.json` | 397,777 | 18,566 | 11,523 |
| `reference-data/body-biomes.json` | 340,369 | 30,831 | 17,563 |
| `reference-data/organic-occurrences.json` | 269,853 | 17,108 | 8,550 |
| `reference-data/planet-species.json` | 261,306 | 13,624 | 10,157 |
| `reference-data/body-resources.json` | 217,230 | 13,466 | 10,574 |
| `assets/index-Tj8eYOeo.css` | 52,145 | 8,694 | 7,563 |

The remaining JSON files are `species.json` (95,893 bytes), `biomes.json` (23,941), `resources.json` (16,466), `product-recipes.json` (13,642), `systems.json` (6,285), `products.json` (3,546), and `organic-farming-profiles.json` (538). The only JS chunk is also the largest. Vite printed **523.59 kB / 139.01 kB gzip** for it; local Node gzip gave 137,478 bytes. The warning identifies a threshold, not a measured usability failure.

Source inspection identifies React/React DOM and the application as the runtime graph. `csv-parse` is used by generation scripts, not imported by `src/`; `npm ls` shows one deduplicated React/React DOM installation and Scheduler under React DOM. The static imports of `en-US`, `en-GB`, `ja-JP`, and the generated Japanese reference-name overlay put localization into the initial bundle. The overlay source file is 151,852 bytes; this is **source size, not its isolated minified contribution**. `App.tsx` is 73,235 source bytes. No source map or chunk analysis manifest was emitted, so exact per-module bundle attribution and duplicate-code percentages were not measurable. The development-only dynamic `historyBenchmark` import is guarded by `import.meta.env.DEV`; no corresponding production chunk appeared.

## Cold-start request profile

On a settled production-preview load, the browser's resource inventory contained **20 assets plus the HTML document: 21 observed request entries**. It showed one request per JSON path, with no duplicate catalogue request. On the first quick inventory, font requests had not yet appeared; after settling/reload, three Barlow font entries were present. Reload reproduced the same request surface. Cache hits, 304 responses, exact chronology, wire bytes, and timings were not exposed.

| Request group | Count | Paths/origins | Startup role |
| --- | ---: | --- | --- |
| HTML | 1 | `/` / `index.html` | Shell; starts JS/CSS discovery |
| JS | 1 | `/assets/index-CNt51fzb.js` | Required for React, storage restoration, and reference fetches |
| CSS | 1 | `/assets/index-Tj8eYOeo.css` | Layout and font import |
| Reference JSON | 13 | `/reference-data/{biomes,body-biomes,inorganic-occurrences,species,planet-species,organic-occurrences,organic-farming-profiles,systems,bodies,resources,products,body-resources,product-recipes}.json` | All fetched eagerly and concurrently by `loadReferenceData`; full reference-dependent UI waits for `Promise.all` |
| Favicon | 1 | `/favicon-32x32.png` | Browser chrome; not a usability gate |
| Google stylesheet | 1 | `https://fonts.googleapis.com/css2?...` | CSS `@import`; can influence styled rendering |
| Font binaries | 3 | `https://fonts.gstatic.com/s/barlowsemicondensed/...woff2` | Barlow 400, 500, 600 on the observed English empty-network screen |

The **17 same-origin startup entries** (including HTML) account for 3,340,092 raw output bytes and approximately 227,489 bytes by summing local Brotli estimates, before protocol overhead. Add the Google stylesheet (7,993 raw bytes; local Brotli estimate 669 bytes) and three font responses of unmeasured size. This is **not** actual transfer volume: compression and cache status were not captured. `icons.svg` and the 16-pixel favicon exist in `dist/` but were not observed as startup requests. IBM Plex Mono is declared but was not observed on this empty network; its request may occur later when mono-styled UI is rendered. Localization is bundled, with no locale fetch.

The shell controls rendered and were usable while catalogue-dependent areas awaited data. The network editor's full reference-aware state is gated on all 13 JSON responses. All fetches are fixed paths and same-origin, so the pattern fits static CDN delivery. The main JS parse/evaluation and all-catalogue `Promise.all` are the likely startup gates; relative main-thread cost was **not profiled**. The earlier [browser storage benchmark](BROWSER-STORAGE-CAPACITY-BENCHMARK.md) measured warm first-control times for large imported fixtures, but those are a different profile and cannot substitute for this clean startup measurement.

## External-origin inventory

| Origin | Purpose / observed runtime behavior | V1 need and CSP consequence | Alternative |
| --- | --- | --- | --- |
| `https://fonts.googleapis.com` | One Google Fonts stylesheet request from `src/index.css` | Visual preference; allow as a stylesheet source if retained | Self-host or remove font import |
| `https://fonts.gstatic.com` | Three Barlow WOFF2 entries observed at startup; IBM Plex Mono may load on later screens | Allow as a font source if retained | Self-host needed subsets/weights or use fallbacks |

**Google Fonts is the only automatic external network dependency found.** The fixed `https://www.flaticon.com/free-icons/cosmos` About-dialog attribution is a user-activated navigation link, not an automatic resource request or API dependency. Searches found no runtime CDN script, API, analytics, telemetry, remote image, WebSocket, worker, service worker, or production source-map reference.

## Cloudflare Pages compatibility

- **Build/output:** `npm run build` emits `dist/`; this matches Pages' documented Vite build command/output pattern. No runtime environment variable, server API, Node API, backend route, or Function is needed by the browser. [Cloudflare Vite guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/).
- **Limits/cost:** 19 files versus Pages Free's 20,000-file site limit; largest file 1.12 MB versus 25 MiB per asset. Current 10-second local build is far below the documented 20-minute build timeout, though Cloudflare build duration is untested. Static-only requests meet the zero-recurring-hosting-cost constraint under current Pages pricing. [Limits](https://developers.cloudflare.com/pages/platform/limits/), [pricing](https://developers.cloudflare.com/pages/functions/pricing/).
- **Paths/routing:** Vite's default root base and the source's root-relative `/assets` and `/reference-data` paths suit an apex or subdomain at `/`; a subpath deployment would need design changes. No React router or deep-link routes exist, so no custom SPA rewrite is currently required. Pages provides root SPA fallback when no top-level `404.html` exists. Verify that missing asset/JSON requests yield an identifiable failure rather than misleading fallback HTML after deployment. [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).
- **Custom domain:** both apex and subdomain are supported. Apex requires the zone on the Cloudflare account and Cloudflare nameservers; a subdomain can use a CNAME. No domain price or TLD is selected here. [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).
- **Development server:** `server.host: true` is intentional for the two-PC trusted-LAN workflow. Serve `dist/` on Pages; document that `npm run dev` is never the public production host.

No deployed Pages URL was available, so deploy success, MIME types, TLS, real response headers, edge propagation, and custom-domain DNS remain future verification items. `dist/` contains no `_headers`, `_redirects`, service worker, or PWA manifest.

## Caching analysis and update coherence

| Asset class | Current shape | Appropriate later policy / risk |
| --- | --- | --- |
| Hashed JS/CSS | Content-fingerprinted `/assets/index-*.{js,css}` | Technically suitable for long browser immutable caching **if** an old HTML or open tab can still obtain the referenced old files. Pages' defaults may already suffice; prove any stronger rule against deployment/rollback behavior first. |
| HTML shell | Stable `/index.html` | Revalidate on navigation so a new build's chunk names are discovered. Do not give it long immutable caching. |
| Reference JSON | 13 stable `/reference-data/*.json` paths, generated independently of Vite hashing | Revalidate; long immutable caching is unsafe as bytes can change under the same URL. Versioned/hash names or a build manifest could improve coherence, but require app/build changes. |
| Favicons/`icons.svg` | Stable names | Low-impact staleness; revalidation is adequate unless deliberately versioned. |

Cloudflare's Pages documentation says it normally sends `Etag` and, on cacheable responses, `Cache-Control: public, max-age=0, must-revalidate`; it recommends avoiding custom caching in most cases and says Pages' static assets are already served from Tiered Cache. It can send Gzip/Brotli. A custom-domain Cache Rule could instead keep stale files after deployment. **Start with Pages defaults and inspect real deployed headers before adding custom cache rules.** [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).

The same documentation says previously deployed assets may remain at an edge for up to a week but may also disappear at any time. Therefore, old HTML pointing to removed hashed chunks is a possible failure, especially after long-lived browser HTML caching or an old tab requesting a future lazy chunk. This build has only one eager JS chunk, reducing the latter case today. Stable JSON is the larger coherence concern: old browser-cached JSON could be combined with a new bundle, or files could be fetched across an update. With default revalidation and controlled deployments this is likely uncommon, but there is no app-level version handshake. [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Reference-data trust assessment

`scripts/build-reference-data.mjs` and the build's localization verification provide a strong build-time integrity boundary. Runtime `referenceDataLoader.ts` fetches each fixed JSON path, checks HTTP `ok`, then casts `response.json()` to a TypeScript type. It does not check top-level shape, relationship coherence, catalogue version, or whether all files belong to the running app build. A non-OK response or invalid JSON reaches the recoverable load-error path; valid JSON with the wrong shape can fail later in UI/domain consumers. User saves contain stable IDs rather than copied reference records, and unresolved IDs can be reported, but there is no persisted-state/reference-build compatibility version check.

**Recommendation: a lightweight shape/version check is useful, not a release blocker on current evidence.** Stable URLs and 13 independent requests create a realistic accidental stale/malformed/partial-deploy robustness case. A small manifest or build identifier plus essential shape assertions could fail as a recoverable reference-data error before consumers run. Design it with normal reference updates and unknown persisted IDs in mind. It would **not** protect against full same-origin compromise, because the same host could replace JavaScript too. Keep build-time validation primary; validate a real Pages deployment/rollback path before deciding how much runtime checking is warranted.

## CSP and security-header preparation

The current request and source inventory supports a **candidate directive inventory**, not a finished policy:

| Directive/header | Current need or decision |
| --- | --- |
| `default-src` | Start from `'self'`; explicitly constrain specialized directives. |
| `script-src` | Hashed external JS file on self; no observed inline script, eval, remote script, or worker. Test without `unsafe-inline`/`unsafe-eval`. |
| `style-src-elem` / `style-src` | Self CSS plus `https://fonts.googleapis.com` while external fonts remain. Several React components set dynamic inline `style` properties, so test `style-src-attr` behavior on those actual interactions; do not guess a blanket exception. |
| `font-src` | `https://fonts.gstatic.com` if external fonts remain; self-hosting would permit self only. |
| `img-src` | Self for favicons/icons. No `data:` image need was found in current source; test active UI states before adding it. |
| `connect-src` | Self for the 13 JSON fetches; no API origin identified. |
| `worker-src` | No worker exists; deny if explicitly set. |
| `frame-ancestors` | Deny embedding unless a later product requirement introduces it. |
| `object-src`, `base-uri`, `form-action` | Consider `none`, `self`, and `self` respectively; confirm import/export and browser interactions under the candidate CSP. |
| Other headers | Confirm `X-Content-Type-Options: nosniff`, referrer policy, restrictive `Permissions-Policy`, and frame policy (`frame-ancestors`, optionally `X-Frame-Options: DENY`). Consider HSTS only after HTTPS, canonical host, subdomain scope, and rollback implications are settled. |

Cloudflare Pages documents default `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` along with `Content-Type`, `Etag`, and other delivery headers; it does not list a default CSP, Permissions-Policy, or HSTS in that inventory. The later parcel should verify actual responses and add only missing requirements. Static Pages `_headers` supports custom response headers. [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/), [Headers](https://developers.cloudflare.com/pages/configuration/headers/). Eliminating the Google dependency would remove both external CSP allowances and third-party font requests.

## Font assessment

`src/index.css` requests **Barlow Semi Condensed 400/500/600** and **IBM Plex Mono 400/500**, with `display=swap`. The observed Google CSS response is 7,993 bytes raw (775 local gzip; 669 local Brotli) and includes Unicode-subset font-face rules. On the observed English empty-network screen, the browser recorded three Barlow WOFF2 requests and no IBM Plex Mono request. Font-binary transfer sizes and successful decoded delivery were not exposed. Other screens and character sets can change the count. Google CSS uses `font-display: swap`, so system/local fallbacks can render first, with a possible later font swap. Current CSS already supplies `Arial Narrow`/system sans and `ui-monospace`/Consolas fallbacks; Japanese UI uses local Japanese fallback families. Barlow is visibly part of the intended shell type treatment, but font failure need not block app functionality.

Keeping Google Fonts external is **reasonable for a first release if deployed CSP and visual fallback tests pass**, with a modest privacy/performance cost: the browser contacts Google-operated origins, adds an external stylesheet dependency, and may swap glyph metrics after initial paint. Self-hosting later would need license/source review, exact weight/subset selection, local WOFF2 assets and preload/cache testing; removing the fonts would change the visual design. Neither change is justified by measured timings here, because reliable font timing/transfer data was unavailable.

## Custom-domain and local-data implications

There is no hard-coded production hostname, absolute app API URL, canonical link, or runtime CORS dependency. Root-relative assets work unchanged at a chosen apex or subdomain. The fixed attribution link is unrelated to app origin. Browser `localStorage` holds the saved network collection and locale preference under the current origin; it is not a cross-host account or sync store.

**`https://project.pages.dev` and `https://chosen-domain` are different browser origins.** Moving the public entry point later does **not** move users' saved networks or locale preference. The new host will appear as a fresh installation unless users export JSON from the old origin and import it on the new one (or a later migration is deliberately designed). Prefer launching real users directly on the final domain, and avoid presenting a temporary `pages.dev` hostname as the durable data home. A redirect alone cannot transfer `localStorage`. Domain renewal within AUD$30/year must be verified for the exact name/TLD before launch; this audit makes no price claim.

## Performance observations and possible improvements

**Measured facts:** 523,594 raw / 113,007 local Brotli bytes for the only JS chunk; 2,762,769 raw / 105,698 local Brotli bytes for all 13 eager JSON files; 21 observed startup request entries including HTML and four Google-origin entries. The production preview rendered a working empty-network shell and reloaded successfully. No duplicate reference request was seen in the settled inventory. No controlled first-paint, fully usable, warm/cold wall-clock, browser transfer, or main-thread timing was obtained.

**Interpretation:** The JS bundle and catalogue group are comparable compressed byte totals, but JS must parse/execute while JSON must arrive and parse before reference-aware UI is complete. Eager `Promise.all` makes the slowest catalogue response matter. Many small JSON requests are acceptable for HTTP/2 or HTTP/3 CDN delivery; the measured evidence does not show request-count latency as a defect. Localhost timing would not establish Cloudflare edge performance even if captured.

**Candidate work, classified by evidence:**

- **Likely worth doing before release:** deployed-network smoke measurement on the final Pages URL (cold/warm with cache status, transfer and font behavior); verify JSON coherence and error recovery; test CSP on active controls and import/export.
- **Optional optimization:** profile JS startup and JSON parsing on a representative network; only then consider deferring a catalogue, narrowing the initial locale payload, or splitting a rarely used UI surface. The static Japanese name overlay is a plausible bundle contributor, but exact savings and user impact are unmeasured.
- **Not justified by current evidence:** splitting the one JS chunk merely to suppress Vite's warning, adding a service worker/offline layer, adding a backend, or changing the font system without visual/performance measurement.

## Deployment/update failure modes

| Failure mode | Current likely result | Planning classification |
| --- | --- | --- |
| Temporary stale HTML references an old hashed JS/CSS URL | Page may fail if old asset has disappeared; fresh navigation normally revalidates under Pages defaults | **PRE-RELEASE:** test deploy/rollback and avoid long HTML cache |
| Stable JSON is stale or mixed with a new build | No version check; UI may use inconsistent facts or fail | **PRE-RELEASE:** verify deployed caching/coherence; consider small manifest/shape check |
| A JSON file is missing, HTML-fallback content, or malformed | Fetch/status or JSON parse error clears reference snapshot and shows load failure; wrong-shape valid JSON may fail later | **PRE-RELEASE:** deploy smoke and runtime-check decision |
| User keeps an already loaded tab open during deploy | Existing JS/reference snapshot and local edits continue; reload is needed to adopt a new build | **Worth documenting;** no auto-update mechanism exists |
| Network goes offline after complete startup | Existing in-memory app may remain usable, but reload/reference fetches have no offline guarantee | **DEFER:** no service worker requested |
| Google stylesheet/font unavailable | Local/system fallbacks are declared; appearance may change | **OPTIONAL:** test fallback and choose keep/self-host/remove |
| Cloudflare edge update/rollback propagation | Pages has default revalidation and edge caching; exact transition was not tested here | **PRE-RELEASE:** smoke real deployments, avoid custom cache rules initially |

## Findings and later implementation parcel

- **RELEASE BLOCKER:** none found in the current static output. A failed real Pages deploy, broken reference load, or failed CSP smoke would become a blocker when observed.
- **PRE-RELEASE:** configure the static Pages build (`npm run build`, `dist`) and final domain within the cost ceiling; document trusted-LAN dev use and origin-local data; verify HTTPS/canonical host, real cache/MIME/404 behavior and deploy/rollback; define/test CSP plus only missing security headers; decide and, if justified, add lightweight reference shape/version coherence handling. Keep all of this out of the present read-only audit.
- **OPTIONAL:** profile representative cold/warm loads with real browser network and main-thread tooling; evaluate font hosting and locale/catalogue loading only if that evidence shows material delay.
- **DEFER:** service worker/offline support, backend services, metered features, and speculative chunk splitting.

The later production-hosting brief should contain a deployable static Pages configuration, a tested header/CSP policy for current request and inline-style surfaces, a deliberate cache/coherence policy for hashed assets versus stable HTML/JSON, final-domain data-continuity guidance, and deployed smoke checks for initial load, reload, import/export, reference failure, font fallback, and update/rollback. It should preserve the free static-only hosting model and the intentional LAN development workflow.

## Verification

`npm run build` passed with the one large-chunk advisory. `npm test` passed (183/183). The production preview loaded and reloaded in the Codex in-app browser; resource inventory and visible shell were inspected. `git diff --check` passed. No source, test, or production config change is part of this report.

# Deployed Bandwidth and Locale Loading Review

## Outcome

**Decision E — further measurement is required before an implementation
decision.** Production evidence shows a worthwhile candidate optimization, but
the audit cannot satisfy both deployment comparisons or produce an exact
browser `Transfer Size` total:

- the production application eagerly bundles every semantic catalogue and all
  eight generated non-English reference-name overlays in one JavaScript file;
- a new English user therefore downloads all non-English localization data;
- a diagnostic build attributes 142,452 locally Brotli-compressed bytes of the
  main bundle to the non-English catalogues and overlays together;
- scaling that measured build delta by the observed production/local Brotli
  ratio gives an **estimated** 187,424-byte production reduction for an English
  cold load if both groups moved on demand;
- overlays are the larger opportunity: an **estimated** 135,537 deployed bytes
  for English versus 51,581 bytes for semantic catalogues;
- locale switching is currently synchronous and adds no request; and
- production reference data is deliberately fetched with `cache: 'no-store'`,
  so its 150,229-byte Brotli payload is a separate repeat-load cost and must not
  be misattributed to localization.

The current evidence makes **Option B, load reference-name overlays on demand,**
the leading candidate if a later measurement pass confirms the result. It is
not recommended for implementation yet. The staging alias redirected to a
Cloudflare Access login and no authenticated staging session was available.
The controlled browser also exposed its resource inventory but masked Resource
Timing and cache-source fields. Those are explicit stop conditions in the audit
brief, so this report does not convert the candidate into an implementation
recommendation.

## Scope and measurement environment

Audit date: **23 September 2026** (Australia/Sydney).

Repository state:

- branch: `staging`;
- commit: `57e17c67222fe72b46ba692c7a32436c2e38e477`;
- `main`, `origin/main`, and `origin/staging` also pointed to that commit at the
  time of inspection;
- the user-supplied audit brief was already present as an untracked file and was
  not modified.

Measurement tools and boundaries:

- Codex in-app Chromium for fresh deployed navigation, resource inventory,
  normal reload, effective-language checks, and manual locale switching;
- `curl 8.13.0` for read-only response-body byte counts and response headers;
- explicit `Accept-Encoding: br` requests for Brotli payload sizes because the
  installed curl build does not decode Brotli;
- curl's native `--compressed` negotiation for gzip payload sizes;
- `Accept-Encoding: identity` for decoded/resource body sizes;
- Node 24.21.0 `zlib` for local diagnostic gzip/Brotli attribution;
- Vite 8.2.1 temporary builds under ignored `.local-work/` for bundle-delta
  attribution; and
- Cloudflare responses came through the Sydney edge (`CF-RAY` suffix `SYD`).

`curl size_download` is the encoded HTTP response body, not browser DevTools'
header-inclusive `Transfer Size`. HTTP request/response headers, TLS, and
HTTP/2 or HTTP/3 framing are therefore not included in the totals below. The
browser control exposed observed URLs but not Resource Timing, response headers,
memory-cache/disk-cache labels, or precise transfer bytes. All totals are
labeled accordingly.

## Deployment identities

### Production

Target: `https://starfieldoutposts.com/`

Production served:

- JavaScript: `assets/index-Fbe9siwU.js`, 1,488,032 decoded bytes;
- CSS: `assets/index-bg-6XHbi.css`, 59,526 decoded bytes; and
- reference dataset ID:
  `sha256:11c108f3828f471d3f45153571d38a587f1fb503ddcc22968888b7a9e9cf43a4`.

The current committed build produced the same hashed JS/CSS filenames, exact
decoded sizes, and reference dataset identity. This is strong evidence that
production serves commit `57e17c6`, but no Cloudflare deployment UUID was
available in the public response; the commit identity is therefore **inferred,
not directly reported by Cloudflare**.

### Staging / preproduction

Target: `https://staging.starfield-outpost-network.pages.dev/`

The public probe returned `302 Found` to Cloudflare Access with private,
no-store login-response caching. The browser reached the Cloudflare Access
email-code screen. Authentication was not available within this audit, so the
staging asset build, deployment UUID, compression, browser caching, and transfer
totals could not be measured. The repository's `staging` branch was at
`57e17c6`, but that does not prove which build the protected origin served.

Production and staging findings are not conflated below.

## Production cold-load request inventory

The browser observed the app JS, app CSS, Google Fonts CSS, the manifest and all
13 reference-data JSON files. A later reload inventory exposed the three active
Latin Barlow font resources and the favicon. Together these form a 22-request
default-English inventory including HTML.

The byte columns below are **measured HTTP response bodies** from explicit
Brotli/identity probes of the browser-observed URLs. They are not an exact
browser header-inclusive transfer total.

| Resource | Type | Status | Brotli/body bytes | Decoded bytes | Encoding | Cache policy | Validator / edge result |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| `/` | HTML | 200 | 272 | 572 | `br` | `max-age=0, must-revalidate` | no ETag/Last-Modified; `DYNAMIC` |
| `/assets/index-Fbe9siwU.js` | JS | 200 | 312,341 | 1,488,032 | `br` | `max-age=14400, must-revalidate` | weak ETag; `MISS` then `REVALIDATED` |
| `/assets/index-bg-6XHbi.css` | CSS | 200 | 10,562 | 59,526 | `br` | `max-age=14400, must-revalidate` | weak ETag; `MISS` |
| Google Fonts `css2` | CSS | 200 | 7,993 | 7,993 | identity | private `max-age=86400`, SWR 7 days | Last-Modified |
| `/reference-data/manifest.json` | JSON | 200 | 748 | 1,841 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/biomes.json` | JSON | 200 | 1,902 | 23,941 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/body-biomes.json` | JSON | 200 | 24,663 | 340,369 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/species.json` | JSON | 200 | 11,330 | 95,893 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/inorganic-occurrences.json` | JSON | 200 | 45,672 | 1,115,923 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/organic-occurrences.json` | JSON | 200 | 11,787 | 269,853 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/planet-species.json` | JSON | 200 | 14,563 | 261,306 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/organic-farming-profiles.json` | JSON | 200 | 149 | 538 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/systems.json` | JSON | 200 | 1,332 | 6,285 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/bodies.json` | JSON | 200 | 18,389 | 397,777 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/resources.json` | JSON | 200 | 1,830 | 16,466 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/body-resources.json` | JSON | 200 | 15,905 | 217,230 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/products.json` | JSON | 200 | 795 | 3,546 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| `/reference-data/product-recipes.json` | JSON | 200 | 1,164 | 13,642 | `br` | `max-age=0, must-revalidate` | weak ETag; `DYNAMIC` |
| Barlow 400 Latin WOFF2 | font | 200 | 22,300 | 22,300 | identity | public `max-age=31536000` | Last-Modified; positive Age |
| Barlow 500 Latin WOFF2 | font | 200 | 22,428 | 22,428 | identity | public `max-age=31536000` | Last-Modified; positive Age |
| Barlow 600 Latin WOFF2 | font | 200 | 22,984 | 22,984 | identity | public `max-age=31536000` | Last-Modified; positive Age |
| `/favicon-32x32.png` | image | 200 | 1,012 | 1,012 | identity | `max-age=14400, must-revalidate` | strong ETag; `REVALIDATED` |

Measured/derived category totals:

| Category | Requests | Encoded body bytes | Decoded body bytes |
| --- | ---: | ---: | ---: |
| HTML | 1 | 272 | 572 |
| Main JS | 1 | 312,341 | 1,488,032 |
| Main CSS | 1 | 10,562 | 59,526 |
| Google Fonts CSS | 1 | 7,993 | 7,993 |
| Reference manifest + 13 JSON assets | 14 | 150,229 | 2,764,610 |
| Three observed default-load fonts | 3 | 67,712 | 67,712 |
| Favicon | 1 | 1,012 | 1,012 |
| **Total** | **22** | **550,121** | **4,389,457** |

The 550,121-byte total is the measured sum of encoded response bodies for the
observed cold-load URL set. It is not labeled as an exact browser transfer total
because the browser's response-header/framing contribution was unavailable.

Largest encoded responses were the main JS (312,341 bytes), inorganic
occurrences (45,672), body biomes (24,663), the three fonts (22,300–22,984
each), bodies (18,389), body resources (15,905), and planet species (14,563).
There were no separately requested localization files: all localization bytes
were inside the main JS.

## Warm-load and repeat-visit behavior

A normal browser reload completed successfully with the effective language
restored to `en-US`. The browser inventory showed the same app bundle, CSS,
font stylesheet, three fonts, and favicon; it did not expose whether each came
from memory cache, disk cache, revalidation, or a fresh body. Exact warm browser
transfer bytes are therefore unavailable.

Repository tracing establishes one important exception to ordinary caching:
`src/data/referenceDataLoader.ts` requests both the manifest and every listed
asset with `cache: 'no-store'`. Those 14 responses bypass browser reuse on every
startup even though the server also returns ETags. Combining their measured
150,229-byte Brotli body with the 272-byte HTML body yields a **derived warm
fresh-body floor of 150,501 bytes across 15 requests** while the remaining
fresh assets are browser-cached. Header/framing bytes and any browser reload
revalidation of other assets are additional and unmeasured.

Cache lifetime findings:

| Asset class | Browser/CDN policy and consequence |
| --- | --- |
| HTML | Always stale (`max-age=0`) and served `CF-Cache-Status: DYNAMIC`; a reload obtains a fresh small body. |
| Hashed JS/CSS | Content-hashed names but only four-hour freshness, `must-revalidate`, and ETags; not `immutable`. Normal navigation can reuse a fresh browser copy. Edge probes returned `MISS`/`REVALIDATED`, with no useful Age. |
| Reference JSON | Stable filenames, `max-age=0`, weak ETags, and `DYNAMIC`; runtime `cache: 'no-store'` forces full bodies rather than browser-cache reuse. This is a deliberate integrity/bootstrap behavior, not a localization asset behavior. |
| Google Fonts CSS | Private one-day freshness with seven-day stale-while-revalidate. |
| WOFF2 fonts | Public one-year freshness and positive intermediary Age; strong repeat-visit reuse. |
| Favicon | Four-hour freshness with a strong ETag. |

After the first visit, **localization-specific response-body bandwidth is zero
while the hashed main JS remains reusable**. After freshness expires, an
unchanged ETag may permit bodyless revalidation; a new deployment/hash or cache
eviction downloads the whole main JS again. The 150,229-byte repeated reference
payload is not localization data.

The large stable-name reference data is the clearest repeated-transfer finding,
but cache-policy changes were outside this audit and no such change was made.

## Compression behavior

Production honored explicit modern-browser Brotli negotiation for same-origin
HTML, JS, CSS, and JSON. Gzip and identity probes were also measured:

| Asset class | Brotli bytes | Gzip bytes | Identity bytes |
| --- | ---: | ---: | ---: |
| HTML | 272 | 328 | 572 |
| Main JS | 312,341 | 360,779 | 1,488,032 |
| Main CSS | 10,562 | 9,751 | 59,526 |
| Reference manifest + JSON | 150,229 | 138,856 | 2,764,610 |

Cloudflare's Brotli response was smaller than gzip for the dominant JS, but
larger than gzip for CSS and the reference JSON collection. The Brotli same-
origin text total still remained smaller overall because of the JS saving.
Google Fonts CSS, WOFF2, and PNG were served without an additional content
encoding.

The current local build's default Node Brotli sizes were 237,395 bytes for JS
and 8,560 for CSS. Production delivered 312,341 and 10,562 respectively.
Reference JSON was 106,372 bytes in the earlier local estimate and 150,229
deployed. Thus the earlier local Brotli numbers materially understated the
actual Cloudflare Brotli bodies. Conversely, production gzip for JS was
360,779 bytes versus 368,378 from the current local Node calculation. Local
compression estimates are not presented as deployed measurements.

The audit could not directly read `Content-Encoding` from the controlled
Chromium response. The Brotli result is measured from the same public URLs with
an explicit `Accept-Encoding: br` request and is the expected modern Chromium
response, but that browser-header limitation remains part of Decision E.

## Current localization loading architecture

### Semantic catalogues

`src/localization/registry.ts` statically imports all ten catalogue modules and
constructs a synchronous registry. `src/localization/catalog.ts` statically
imports `en-US` again as the type/runtime fallback. Vite emits one JS chunk and
no locale chunks. All catalogues are evaluated and available before the first
meaningful render; tree shaking cannot remove registry entries that are
reachable by locale selection.

`MessageKey` derives from the complete `en-US` object. Complete-locale tests
enforce key and placeholder parity. `translate()` is synchronous and falls back
to `en-US`. `LocalizationProvider` synchronously reads the local preference and
browser language, resolves the effective locale, and supplies synchronous
translation during rendering.

### Reference-name overlays

`src/localization/referenceNames.ts` statically imports all eight generated
non-English overlay modules and places them in an in-memory locale map. They
are not part of `/reference-data`, not fetched from the manifest, and not
requested separately. English names come from canonical reference JSON plus
the tiny aluminum/aluminium override.

The production browser made no locale catalogue or overlay request. Switching
English → German → Japanese added no observed URL, and both German and Japanese
reload scenarios used the same JS/CSS/font/favicon URLs with no locale-specific
asset. Locale switching is currently zero-network because every catalogue and
overlay is already resident.

## Locale scenarios

| Scenario | Browser observation | Localization transfer consequence |
| --- | --- | --- |
| New/default English (`en-US`) | Automatic resolved to `en-US`; one JS chunk, no locale URL | All non-English catalogues and overlays are paid up front inside the 312,341-byte JS body. |
| German first render | Persisted `de-DE` before reload; document rendered with `lang=de-DE`; same deployed asset URLs | Same localization transfer as English; no German-specific request. |
| Japanese first render | Persisted `ja-JP` before reload; document rendered with `lang=ja-JP`; same deployed asset URLs | Same localization transfer as English; no Japanese-specific request. |
| English → German → Japanese switch | Selector changed language immediately; asset inventory gained no URL | Zero network for both switches. |

The German/Japanese reloads exercise a preselected locale, not a fresh browser
whose `navigator.languages` was overridden; the controlled browser did not
expose a locale override. Static import tracing proves that browser-language
detection cannot change which localization modules are transferred.

## Byte attribution by locale

The following is **local source-file attribution**, compressed independently
with Node's default Brotli settings. It is useful for relative ownership but is
not deployed transfer measurement because minification and cross-module
compression share bytes.

| Locale | Semantic raw | Semantic Brotli | Overlay raw | Overlay Brotli |
| --- | ---: | ---: | ---: | ---: |
| `en-US` | 28,654 | 5,675 | — | — |
| `en-GB` | 179 | 113 | — | — |
| `fr-FR` | 33,487 | 7,084 | 125,836 | 19,361 |
| `de-DE` | 32,337 | 7,155 | 121,764 | 19,054 |
| `it-IT` | 31,798 | 6,789 | 124,294 | 19,065 |
| `ja-JP` | 33,615 | 6,687 | 151,849 | 20,584 |
| `pl-PL` | 32,484 | 7,252 | 122,766 | 19,454 |
| `pt-BR` | 31,514 | 6,679 | 124,714 | 19,165 |
| `zh-Hans` | 27,969 | 6,112 | 125,990 | 19,515 |
| `es-ES` | 31,736 | 6,584 | 125,595 | 19,330 |
| **Total** | **283,773** | **60,130** | **1,022,808** | **155,528** |

The source files used by shared runtime localization infrastructure total about
18,547 raw / 4,285 independently Brotli-compressed bytes. That estimate
includes registry and overlay wiring and cannot be isolated exactly from the
application bundle without assigning shared minified symbols arbitrarily.

Temporary diagnostic Vite builds provide a stronger aggregate attribution.
They replaced specified modules with empty virtual modules without editing
tracked source:

| Diagnostic build | JS raw | Local Brotli | Local Brotli reduction |
| --- | ---: | ---: | ---: |
| Current build | 1,488,032 | 237,395 | — |
| No eight non-English semantic catalogues | 1,247,369 | 198,191 | 39,204 |
| No eight generated overlays | 638,050 | 134,380 | 103,015 |
| Neither group | 397,387 | 94,943 | 142,452 |

Accordingly, the best available estimate for an English first load is:

- synchronous English baseline (`en-US` + sparse `en-GB`) remains in the main
  bundle;
- all eight non-English semantic catalogues contribute 39,204 local Brotli
  bytes to the built chunk;
- all eight overlays contribute 103,015 local Brotli bytes; and
- their combined avoidable contribution is 142,452 local Brotli bytes.

Scaling those measured build deltas by the observed deployed/local main-JS
Brotli ratio (312,341 / 237,395 = 1.3157) is an **estimate**, not a CDN
measurement of hypothetical chunks.

## Candidate architectures and estimated savings

| Option | Estimated cold English reduction | Estimated cold German reduction | Estimated cold Japanese reduction | New cold requests | Locale-switch cost | Complexity / regression surface |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| A — semantic catalogues on demand | 51,581 B | 42,167 B | 42,783 B | 0 English; 1 non-English | ~8–10 KB estimated for a first uncached non-English catalogue | High relative to saving: async translation readiness, detected-locale preload, selector loading/error state, fallback, completeness tooling. |
| B — reference overlays on demand | 135,537 B | 110,470 B | 108,453 B | 0 English; 1 non-English | ~25–27 KB estimated for a first uncached overlay | Moderate: keep semantic UI synchronous; add overlay bootstrap, fallback, integrity/build identity, and cache/error behavior. |
| C — both on demand | 187,424 B | 152,943 B | 151,542 B | 0 English; 1–2 non-English | ~33–36 KB estimated for first uncached locale data | Highest: combines both state machines and failure surfaces. |
| D — keep eager | 0 B | 0 B | 0 B | 0 | 0 B; immediate | Lowest; preserves synchronous first render, offline switching, and current tests. |

The German/Japanese active-locale additions are estimated from each source
module's independently compressed size with the same production/local ratio.
Actual Vite dynamic chunks would include module wrappers and could compress
differently. Request headers and first-request latency are also excluded.

### Option A — semantic catalogues only

Keep `en-US` and probably the negligible `en-GB` override synchronously bundled.
The detected or persisted non-English catalogue would need to load during
bootstrap before meaningful first render to avoid an English flash. The
selector would become asynchronous. Catalogue completeness can remain a
build/test concern by statically importing all catalogues in verification code,
even if runtime uses dynamic imports.

This option changes the central synchronous `translate()` expectation for an
estimated ~52 KB English saving, substantially less than overlays. It is not
the first candidate.

### Option B — reference overlays only

Keep semantic catalogues eager and synchronous. Load only the effective
non-English reference overlay during bootstrap; English needs no generated
overlay. Canonical reference names remain the fallback if no override exists.

This captures the larger estimated ~136 KB English saving without making all UI
translation asynchronous. It still needs explicit integrity and deployment
design: a locale asset must be bounded, content-type checked, tied to the build
or an overlay manifest, verified before use, and fail safely without weakening
the current reference-data gate. This is the leading candidate after the
missing deployed measurements are supplied.

### Option C — both

This has the largest estimated saving but adds two kinds of asynchronous state,
two failure paths, and more bootstrap coordination. It should not be the first
implementation unless later measurements show that the extra ~52 KB catalogue
benefit is material enough to justify those costs.

### Option D — keep eager

Eager loading remains defensible: the app is static, the absolute first-load
body is about 550 KB, localization is reused with the main bundle, startup was
already 149–167 ms in the prior local review, switching is instant, and offline
switches do not need a new asset. A confirmed staging/browser measurement may
still support this option if the estimated savings do not translate into real
user benefit.

## English baseline, preload, and switch UX

If any on-demand design is accepted later, `en-US` should remain the always
available synchronous baseline:

- `MessageKey` derives from it;
- it defines complete-catalogue and placeholder guarantees;
- it is the runtime fallback;
- fatal/reference bootstrap copy and ordinary render paths currently expect
  synchronous translation; and
- removing it would increase failure complexity for little saving.

For a detected French/German/Japanese/etc. browser or a stored override, resolve
the desired locale synchronously, request its on-demand asset during bootstrap,
and delay meaningful app render until either it loads or a defined fallback is
chosen. Do not render English first and visibly swap.

For a manual switch, the simplest robust behavior is:

1. keep the current locale fully visible and usable;
2. show loading/disabled state on the locale selector;
3. commit the new locale only after its required asset verifies;
4. on failure, retain the previous locale and show a concise inline/status
   error; and
5. retain successfully loaded locales in memory and rely on normal browser
   caching for later sessions.

## Offline, integrity, and deployment implications

The current eager bundle permits any locale switch once the app JS is resident.
On-demand loading would preserve offline use only for the baseline and locale
assets already cached. Switching offline to a never-loaded locale must fail
without disrupting the current locale. There is no service worker, so this
audit does not propose one.

Vite dynamic imports would normally emit hashed, same-origin files. The current
CSP permits same-origin scripts/connect requests, and hashed names avoid
cross-version cache aliasing. However, the deployed header gives hashed assets
only four hours plus revalidation, not immutable lifetime. First use adds CDN
latency, and old HTML/JS referring to a removed chunk across a deployment must
be tested rather than assumed safe.

The reference-data loader currently enforces:

- exact manifest schema and ordered asset list;
- bundled expected dataset identity;
- response status and JSON content type;
- bounded byte streaming;
- SHA-256 per asset;
- UTF-8/JSON/schema validation; and
- fatal stop before `App` mounts on failure.

Generated overlays currently receive strong build-time provenance verification
and are protected operationally by being part of the hashed JS. Moving them to
standalone data must not silently rely on a successful HTTP status. The smallest
safe design needs an overlay manifest or equivalent build-bound mapping with
hash, byte limit, content-type check, locale identity, and safe canonical-name
fallback. It must not weaken the existing reference dataset gate or let a stale
overlay claim a different build/dataset identity.

## Startup and memory

No new deployed startup decomposition was available because Resource Timing was
masked. The prior 149–167 ms local warm-start observation remains evidence that
runtime/render speed alone does not justify architecture work. The production
cold path clearly includes network wait for about 550 KB of encoded bodies and
reference-data verification/parse of 2.76 MB decoded JSON; that is different
from React rendering or JavaScript parse cost.

The audit did not perform a memory profile. Eager catalogues and overlays remain
resident through the main module graph, but no reliable heap attribution was
available and memory was secondary to bandwidth.

## Decision and phased path

**Decision E — further measurement is required before a decision.** The next
measurement pass should:

1. use an authenticated staging session and record its actual deployment UUID,
   asset hashes, cold/warm browser Network table, compression, and cache source;
2. use Chromium DevTools or an equivalent interface that exposes exact
   `Transfer Size`, `Resource Size`, content encoding, memory/disk cache, 304s,
   and response headers;
3. repeat the same exact method on production;
4. verify default English plus browser-detected German and Japanese/Chinese
   sessions from isolated storage/cache; and
5. validate the diagnostic savings with a separately approved prototype only
   if those deployed results agree.

If that pass confirms roughly the measured production proportions, pursue a
separate design/implementation brief for **Option B first**. Re-measure after
overlay splitting. Consider semantic-catalogue splitting only if the remaining
~52 KB estimated English saving is still material. If staging/browser evidence
does not reproduce the value, retain Option D.

This threshold is contextual rather than universal. About 136 KB avoided on a
cold English visit is meaningful on mobile or slow links and is a large fraction
of the JS body, but first load occurs less often than cached revisits and the
application remains small overall. Async loading adds maintenance,
accessibility, offline, error-state, and integrity costs. Those costs justify a
phased decision rather than optimizing solely because localization is a large
fraction of source bytes.

## Limitations and stop conditions

- Staging was protected by Cloudflare Access and could not be authenticated;
  staging deployment identity and all staging transfer/cache results are
  unknown.
- The controlled browser masked Resource Timing, response headers, and
  memory/disk cache labels. Exact cold and warm browser transfer totals are
  unknown.
- Production deployment commit is inferred from exact build artifacts and
  dataset identity; no public deployment UUID was exposed.
- The Brotli response is measured with explicit HTTP negotiation and expected
  for modern Chromium, but not read from the controlled browser's response
  inspector.
- German/Japanese first-render checks used persisted locale selection rather
  than overriding `navigator.languages` in a fresh browser profile.
- Hypothetical on-demand savings are derived estimates. No lazy-loading code,
  dynamic imports, or deployable prototype was created.
- Header/framing/TLS bytes and memory use were not measured.

These limitations directly satisfy the brief's stop conditions for Decision E.

## Verification

- `npm run build` — passed on the audited commit; produced the exact production
  JS/CSS hashes and sizes and repeated the existing large-chunk advisory.
- Production browser load/reload — passed; default English, persisted German,
  persisted Japanese, and manual English → German → Japanese switching were
  exercised; the automatic preference was restored afterward.
- Production HTTP probes — completed for Brotli, gzip, identity, cache headers,
  validators, and edge-cache status.
- Staging HTTP/browser probe — reached Cloudflare Access only; no protected
  application measurement claimed.
- `git diff --check` — required at final handoff after this report was written.
- Git status review — required at final handoff to confirm no runtime,
  configuration, localization, test, backlog, architecture, or UX file changed.

No production or staging state was modified. No runtime, configuration,
localization, cache policy, test, backlog, architecture, or UX change is part of
this audit.

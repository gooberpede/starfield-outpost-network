# Cloudflare Pages first-deployment smoke test

**Date:** 17 September 2026

**Target:** `https://starfield-outpost-network.pages.dev/`

**Historical filename:** This report began as a proposed private `staging` preview test. The first deployed smoke target became the Cloudflare-designated production `pages.dev` hostname built from `main`. The `staging` branch remains available for future previews; it was not the target of this pass.

## Executive summary

| Question | Result |
| --- | --- |
| Current deployment succeeded? | **PASS.** Cloudflare lists a successful production-environment deployment of commit `7fb50ca40c84838eade385787de6ad3f220e97a0` from `main`. |
| Access protection active? | **Not used.** Cloudflare Zero Trust / Access is outside the project's payment-details constraint. The site is anonymously reachable, intentionally unadvertised, and non-indexed during pre-release. |
| Indexing controls confirmed? | **PASS.** Live HTML has `X-Robots-Tag: noindex, nofollow`; live `/robots.txt` contains `User-agent: *` and `Disallow: /`. The user had manually verified both, and this pass independently confirmed them. |
| Tracker works on Pages? | **PASS for the tested paths.** The shell loads and reloads; all 13 catalogues return parseable JSON; a disposable collection persisted and completed export/import. |
| Release-blocking deployment issue found? | **No blocker in the tested paths.** A missing reference JSON path returns the SPA's `200 text/html` fallback, which should be considered during later reference-data error/coherence work. |

This is a pre-release deployment on a publicly reachable `pages.dev` origin, not a durable public launch. `noindex` and `robots.txt` are crawler guidance, not access control. The future custom domain will have separate `localStorage`; data does not migrate automatically between origins.

## Deployment configuration and evidence

| Item | Verified state |
| --- | --- |
| Pages project | `starfield-outpost-network` |
| GitHub source | `gooberpede/starfield-outpost-network` |
| Cloudflare-designated production branch | `main` |
| Current successful deployment | `9b356e75-dae1-4308-8ea7-c33d935cb616`, from GitHub push of `7fb50ca` |
| Current production hostname | `https://starfield-outpost-network.pages.dev/` |
| Versioned deployment URL | `https://9b356e75.starfield-outpost-network.pages.dev/` (listed by Cloudflare; not separately smoke-tested) |
| Build | `npm run build`, repository root `/`, output `dist` |
| Branch controls | Automatic production deployments disabled in the saved project configuration; custom preview includes only `staging`. The observed `main` GitHub-push deployment is recorded as fact; no branch setting was changed during this pass. |
| Custom domain | None configured; project domains list contains only its `pages.dev` hostname. |
| Access | Intentionally not configured because of the stated payment-details constraint. No Access challenge is expected on this URL. |
| Application/runtime | Static Vite/React build; no application backend, Worker, or Pages Function was added in this pass. |
| Indexing files | `public/_headers` supplies `X-Robots-Tag: noindex, nofollow` site-wide; `public/robots.txt` supplies the two crawler directives. |

Cloudflare's project API showed no Web Analytics tag or token. This pass made no Cloudflare configuration change and did not request or enable a paid feature. Account billing status was not inspected.

## Representative live response headers

These are actual GET observations on 17 September 2026. `Content-Encoding: br` was observed with the Node HTTP client's compression negotiation; it may differ for other clients. `ETag` values are shown by presence/type because the exact hashes are deployment-specific.

| Resource | Status and `Content-Type` | `Cache-Control` | `ETag` | `Content-Encoding` | `X-Robots-Tag` |
| --- | --- | --- | --- | --- | --- |
| `/` | `200 text/html; charset=utf-8` | `public, max-age=0, must-revalidate` | Not present in sampled response | `br` | `noindex, nofollow` |
| `/assets/index-CNt51fzb.js` | `200 application/javascript` | Same | Weak ETag | `br` | `noindex, nofollow` |
| `/assets/index-Tj8eYOeo.css` | `200 text/css; charset=utf-8` | Same | Weak ETag | `br` | `noindex, nofollow` |
| `/reference-data/inorganic-occurrences.json` (large) | `200 application/json` | Same | Weak ETag | `br` | `noindex, nofollow` |
| `/reference-data/organic-farming-profiles.json` (small) | `200 application/json` | Same | Weak ETag | `br` | `noindex, nofollow` |
| `/favicon-32x32.png` | `200 image/png` | Same | Strong ETag | Not present | `noindex, nofollow` |
| `/robots.txt` | `200 text/plain; charset=utf-8` | Same | Strong ETag | Not present | `noindex, nofollow` |

The sampled responses also had `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. `Age`, `CF-Cache-Status`, and `Vary` were absent from these sampled responses; their absence does not establish an edge cache hit or miss. A separate HTML request showed `Server: cloudflare`, a `CF-RAY` header, `Access-Control-Allow-Origin: *`, and `alt-svc` advertising HTTP/3. No custom cache policy was added or inferred from these observations.

## Smoke-test results

| Check | Status | Observation |
| --- | --- | --- |
| Basic load and console | **PASS** | In-app browser rendered the title, controls, and empty network shell at the live root. No console warnings or errors were returned by the available browser log tool. |
| Reload and direct root navigation | **PASS** | Reload rendered the same usable shell; direct root navigation succeeded. |
| Static JS/CSS/favicons | **PASS** | Hashed JS and CSS and a favicon returned `200` with the expected MIME types. The loaded HTML referenced the same hashed JS/CSS paths. |
| All 13 reference catalogues | **PASS** | Every fixed `/reference-data/*.json` path returned `200 application/json`, parsed as an array, and contained records. The outpost system selector populated when a disposable outpost was created. See catalogue detail below. |
| Missing reference response | **PRE-RELEASE finding** | `/reference-data/__codex_smoke_missing__.json` returned `200 text/html` containing the 572-byte app shell. This is a Pages SPA fallback, not a catalogue. The app's JSON parse would reject it, but the status alone is misleading. |
| JSON export | **PASS** | Browser Export produced a local 1,083-byte JSON file. It parsed as collection schema 1 with one network and one disposable outpost named `New Outpost`. |
| JSON import | **PASS** | After changing that outpost name to `Temporary Smoke`, importing the saved export restored `New Outpost`. Undo labelled the operation as one import. |
| Collection `localStorage` | **PASS** | The disposable outpost survived reload before export; imported state also survived reload. The original empty collection was restored from an earlier export and its zero-outpost state survived reload. |
| Locale preference | **PASS** | Japanese remained selected after reload; the preference was returned to Automatic (EN-US). |
| Google Fonts endpoint | **PASS for availability** | The current Google Fonts CSS URL returned `200 text/css`, and one referenced font file returned `200 font/ttf`. No browser console font error was observed. |
| Actual browser font request / visual fallback | **MANUAL CHECK REQUIRED** | The available browser tooling did not expose the individual font network requests or support blocking them to inspect fallback typography. |
| `/robots.txt` | **PASS** | Independent live GET returned `200 text/plain` with exactly `User-agent: *\nDisallow: /\n`. The user also reported a manual check. |
| HTML `X-Robots-Tag` | **PASS** | Independent live GET observed exactly `noindex, nofollow`. The user also reported a manual check. Sampled JS, CSS, JSON, favicon, and robots responses carried the same header. |
| Unauthorized/authorized Access sessions | **Not applicable** | Access is deliberately not used. The URL is reachable without authentication. |
| Deployment update / rollback coherence | **MANUAL CHECK REQUIRED** | The current build and its 13 catalogues were checked together, but no controlled transition between two builds or rollback was performed. |
| Versioned deployment URL / future preview branch | **MANUAL CHECK REQUIRED** | Cloudflare lists a versioned URL and the remote `staging` branch exists; neither was exercised in this smoke pass. |

## Independent manual browser verification (reported by the user)

- The tracker looked normal.
- Collection changes persisted after reload.
- Export and import both worked as expected.
- Private browsing loaded the anonymously reachable site with a fresh empty network, as expected without Access.

The 13 catalogue checks returned these parsed array lengths (an availability/parse check, not runtime schema validation): `biomes` 428, `bodies` 1,776, `body-biomes` 3,211, `body-resources` 1,445, `inorganic-occurrences` 7,780, `organic-farming-profiles` 3, `organic-occurrences` 3,855, `planet-species` 1,738, `product-recipes` 30, `products` 30, `resources` 76, `species` 1,121, and `systems` 123. The app still trusts parsed catalogue shapes as described in the architecture/security audit; this check does not add runtime shape validation.

The browser import/export check used a disposable one-outpost collection on this `pages.dev` origin. It did not use valuable player data. The initial empty collection and automatic locale preference were restored after the check. A failed-import preservation test and a font-blocking test were not performed; those remain **MANUAL CHECK REQUIRED** if they are needed for release acceptance.

## Differences from local production preview

The current [deployment guide](../DEPLOYMENT.md) owns production-hosting policy. The earlier local production preview and this Pages pass both rendered and reloaded, with no functional difference observed in those actions. Pages supplied the live HTTPS hostname and the response headers measured above, including the repository's deployed noindex rule. No concurrent side-by-side local header or timing measurement was made, so no cache or performance difference is claimed.

## Findings

| Class | Finding |
| --- | --- |
| BLOCKER | None found in the tested live load, catalogue, import/export, or persistence paths. |
| PRE-RELEASE | The site remains anonymously reachable. Its crawler directives are confirmed, but they do not make it private. This is the chosen constraint while Access requires payment details. |
| PRE-RELEASE | Missing reference JSON receives `200 text/html` via SPA fallback. Keep the loader's parse-error path visible and decide whether response-shape/coherence handling is justified before public launch. |
| PRE-RELEASE | Validate a future deployment transition/rollback for stable-name JSON and hashed asset coherence. |
| OPTIONAL | Check font failure/fallback visually and collect browser-level font request evidence if typography becomes a concern. |
| DEFER | CSP and other custom security headers, custom cache policy, custom domain, bundle optimization, and runtime reference-data versioning remain separate work. |

## Manual checks and next hosting parcel

No manual Pages setup step is needed to make this current `main` deployment load. Remaining smoke checks requiring a different browser/network setup are browser font-request/fallback inspection, failed-import preservation if desired, and a controlled second deployment/rollback comparison. A future `staging` preview can be tested separately; the presence of `staging` did not make this `main` hostname a preview.

The next hosting parcel should use this measured response baseline to decide CSP and any additional security headers, then perform a controlled update/rollback test before deciding whether stable-name reference JSON needs a coherence mechanism. Custom-domain selection remains separate and subject to the AUD$30/year registration-and-renewal ceiling. Test data on `pages.dev` will not migrate automatically to that later origin.

## Verification and scope

| Check | Result |
| --- | --- |
| `npm run build` | **PASS** |
| `npm test` | **PASS**, 183/183 |
| `git diff --check` | **PASS** |

The live HTTP responses, Cloudflare project/deployment API, and in-app browser supplied the evidence above. This pass changes only this report. No production code, Cloudflare configuration, cache rule, CSP, fonts, domain, branch setting, Worker, Function, analytics, or paid feature was changed. No commit or push was performed.

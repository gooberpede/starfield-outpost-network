# Cloudflare Pages reference-data 404 feasibility audit

Date: 18 September 2026

Scope: repository inspection, current Cloudflare documentation, and existing local tests. No hosting configuration or application code was changed.

## Executive conclusion

**Outcome D — a narrow static candidate exists, but its interaction with SPA fallback needs a Pages staging check.** A `public/reference-data/404.html` would become `dist/reference-data/404.html`. Cloudflare [documents nearest-directory 404 lookup](https://developers.cloudflare.com/pages/configuration/serving-pages/#not-found-behavior) and [root SPA fallback when there is no top-level `404.html`](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering). Those two statements suggest that a missing `/reference-data/*` file could receive a real 404 while unrelated paths still receive the SPA shell. However, the published page does **not explicitly specify precedence** when a nested `404.html` exists and the top-level one does not. [An open issue in Cloudflare's documentation repository](https://github.com/cloudflare/cloudflare-docs/issues/29676) reports exactly this combination working, but it is a user report awaiting documentation, not a platform guarantee or a test of this project.

Thus, a static path-scoped 404 is **plausible, not yet verified for this deployment**. Do not implement it or change release criteria on this audit alone. If HTTP 404 semantics are still desired, make a separate, small implementation parcel and verify its deployed response matrix on staging before promotion. The existing browser gate is already the primary fail-closed control. No Worker, Function, or dashboard rule is justified for this defense-in-depth goal.

## Current behavior and protection

- `docs/DEPLOYMENT.md` specifies a Vite static build (`npm run build`, output `dist`) on Cloudflare Pages Free. The repository has `public/_headers`, but no `public/_redirects`, top-level or nested `404.html`, Wrangler configuration, Pages Functions, `_worker.js`, or `_routes.json`. `vite.config.ts` has no routing override. `package.json` has build verification and no Pages runtime dependency. The current app has no client-side router, though preserving fallback avoids constraining future routes.
- Cloudflare says that a site without a top-level `404.html` gets [SPA fallback to `/`](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering). The project's [earlier staging smoke test](../benchmarks/CLOUDFLARE-STAGING-SMOKE-TEST.md) observed a nonexistent `/reference-data/__codex_smoke_missing__.json` returning **`200 text/html`** with the app shell. This is point-in-time observed behavior; this audit did not issue a new deployed request.
- `src/main.tsx` mounts `ReferenceStartupGate` before `App`. `src/data/referenceDataLoader.ts` fetches the manifest and 13 fixed JSON assets with `cache: 'no-store'`, checks non-2xx status, JSON MIME, size bounds, manifest schema and exact inventory, canonical dataset ID against the bundle, SHA-256 of each asset, JSON parsing, and lightweight row shape. The production build verifies committed reference bytes and the copied `dist` inventory. `ReferenceStartupGate` renders `App` only after the complete load succeeds; pending and failed states do not initialize the editor or its normal browser persistence. The fatal state offers retry and a user-initiated technical report.
- A missing JSON URL that returns **`200 text/html`** is caught specifically by `isJsonMediaType()` in `fetchAsset`, producing `REF_ASSET_CONTENT_TYPE`; a missing manifest with the same fallback produces `REF_MANIFEST_INVALID` at its MIME check. An actual 404 produces `REF_ASSET_FETCH` or `REF_MANIFEST_FETCH`. Invalid JSON, wrong hash, and manifest mismatches have separate failure paths. The existing `tests/referenceIntegrity.test.tsx` covers these cases and verifies that failure leaves the editor unmounted and makes no storage write. Its 23 tests passed in this audit. Therefore the misleading HTTP 200 does not let incomplete reference data into the editable app or overwrite saved network data. The gate is an integrity/coherence check, not an authenticated defense against a host that can also replace the JavaScript bundle.

## Options considered

### `_redirects` and `_headers`

Cloudflare's [Pages `_redirects` reference](https://developers.cloudflare.com/pages/configuration/redirects/) supports a wildcard source such as `/reference-data/*`, and documents 301/302/303/307/308 redirects plus relative-path `200` proxying. It expressly marks rewrites with other codes, including an example ending in `404`, unsupported. A redirect changes the requested URL and sends a 3xx; it cannot itself make the original missing URL return 404. A `200` proxy serves another resource at a 200 status. Rules also apply regardless of whether the incoming asset exists, so a broad rule risks intercepting the 13 valid JSON assets. `_headers` sets response headers, [not response status](https://developers.cloudflare.com/pages/configuration/headers/). Neither is the requested solution.

### Top-level and nested `404.html`

A top-level `public/404.html` would cause Pages to use its documented custom not-found behavior. It would also remove the documented condition for automatic SPA rendering: absence of a top-level 404. That is global behavior and could break direct loads of future client-side routes. Do not add one for a reference-data-only concern. [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) supports finding the closest `404.html` up the requested path's directory tree. A **nested** `public/reference-data/404.html`, with no root `404.html`, is therefore the only repository-controlled static candidate. It should apply only after a file under that directory is absent, leaving existing JSON files served normally. Its coexistence with root SPA fallback is an **inference** from separately documented rules, corroborated by the [open documentation issue](https://github.com/cloudflare/cloudflare-docs/issues/29676), and must be checked on actual Pages output. The nested file is not a special API or status-code directive; it is a custom not-found page selected by static asset routing. No documented mechanism distinguishes a JSON fetch from a navigation request beyond path and asset existence.

### Dashboard and zone rules

No reviewed Pages dashboard setting documents a path-prefix exception to its SPA fallback. [Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/) send 3xx responses. [URL Rewrite Rules](https://developers.cloudflare.com/rules/transform/url-rewrite/) change request paths, not the missing-asset response status, and a prefix rule cannot spare existing JSON files based on asset existence. [Custom Error Rules](https://developers.cloudflare.com/rules/custom-errors/) operate on responses already at 400 or above, so they cannot repair the observed 200; they are also unavailable on Free. Free [WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/) can match request paths but a block would also catch valid assets. A [custom WAF block response/status](https://developers.cloudflare.com/waf/custom-rules/create-dashboard/) requires Pro or above. [Snippets](https://developers.cloudflare.com/rules/snippets/) run JavaScript at the edge and are unavailable on Free. Dashboard-only rules would also hide behavior outside the repository and, for the custom domain, would not automatically establish equivalent preview-host behavior.

### Dynamic edge logic

A path-matched [Pages Function](https://developers.cloudflare.com/pages/functions/routing/) could inspect the requested asset response and return 404 for a missing file. A [Worker or advanced-mode `_worker.js`](https://developers.cloudflare.com/pages/functions/advanced-mode/) could control response status too. These are possible with **dynamic edge logic**, not within the current static-only architecture. Pages Functions have a [Free allowance but metered invocations](https://developers.cloudflare.com/pages/functions/pricing/); they add routing and operational concerns that a correctly failing browser gate does not warrant. `_routes.json` only controls Function invocation routes, so it is not a static-only fallback selector.

## Trade-off table

| Option | Path-scoped? | Genuine missing-only 404? | SPA elsewhere? | Static only? | Free plan? | Repository controlled? | Architecture impact / recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `_redirects` wildcard | Yes | No | Could, but broad rule intercepts valid assets | Yes | Yes | Yes | Reject; only 3xx redirect or 200 proxy is documented. |
| Root `404.html` | No | Yes for missing paths | No documented SPA fallback | Yes | Yes | Yes | Reject; global route behavior change. |
| `reference-data/404.html` only | Yes by directory | **Candidate; needs staging proof** | **Candidate; needs staging proof** | Yes | Yes | Yes | Lowest-impact option; separate verified parcel if wanted. |
| Dashboard redirect/rewrite/WAF/error rule | Path match possible | No clean missing-only 404 on Free | Unproven or intercepts valid assets | Rules, but external configuration | No clean Free option | Usually no, unless separately managed | Reject; hidden state and wrong response semantics. |
| Pages Function | Yes | Yes with code | Yes with explicit routing | No | Free allowance, metered | Yes | Out of scope; do not add. |
| Worker / advanced mode | Yes | Yes with code | Yes with explicit routing | No | Free allowance, metered | Yes | Out of scope; do not add. |

## Recommendation and verification boundary

Keep the existing fail-closed gate as the release control. Record the nested 404 as a **feasible candidate requiring deployed proof**, not as a confirmed Cloudflare guarantee or open safety defect. A later parcel may add only `public/reference-data/404.html` and check on staging: all 13 JSON files and the manifest still return JSON; a missing `/reference-data/*.json` and an arbitrary missing nested path return HTTP 404; an unrelated hypothetical SPA deep link still returns the app shell; reload and fatal-state behavior remain correct. Check both the preview host and, before any production adoption, the custom domain. The present audit makes none of those deployment changes.

## Proposed durable documentation wording

These are proposed text additions or replacements, **not edits made by this audit**.

- `docs/ARCHITECTURE.md`, reference-data loading: “Cloudflare Pages may serve the SPA shell as `200 text/html` for a missing `/reference-data/*` URL. The startup loader rejects that MIME response before `App` mounts, so normal persistence stays inactive and saved data is preserved. A directory-local `404.html` may provide a path-scoped HTTP 404, but its interaction with SPA fallback has not yet been verified on this deployment; HTTP status is defense in depth, not the integrity boundary.”
- `docs/DEPLOYMENT.md`, reference-data hosting: “The deployed SPA fallback has returned `200 text/html` for a missing reference JSON path. The runtime gate explicitly rejects it and fails closed. Cloudflare's nearest-directory `404.html` behavior suggests a static, path-scoped 404 candidate, but no routing change is in place or required for safe startup. Any adoption needs a separate staging response-matrix check; Workers, Functions, and dashboard-only rules are not being introduced for this HTTP-semantic improvement.”
- `docs/BACKLOG.md`, reference-data recovery item: “A directory-local `/reference-data/404.html` is a possible static defense-in-depth improvement, pending deployed verification that missing reference paths return 404 while valid JSON and SPA deep links remain intact. The current `200 text/html` fallback is already rejected by the startup gate and is an accepted Pages behavior, not an open safety defect. Do not add edge runtime logic solely for this.”

## Validation and limits

- Repository reads: the brief, `public/_headers`, `vite.config.ts`, `package.json`, deployment/architecture/backlog documents, reference-data loader/manifest/startup/fatal code, existing reference integrity tests, and earlier staging smoke evidence. File inventory found no `_redirects`, `404.html`, Wrangler configuration, Pages Function, `_worker.js`, or `_routes.json`.
- Command: `npm run test:components -- tests/referenceIntegrity.test.tsx` — **passed**, 1 file / 23 tests.
- No live nested-404 Pages deployment was available or altered for this read-only audit. The Cloudflare documentation gap is material to the candidate's certainty.

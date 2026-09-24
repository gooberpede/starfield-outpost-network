# Reference Data Caching and Revalidation Review

## Outcome

**CACHE-B — Implement a split manifest/assets policy pre-release.** Production
browser evidence shows that the current Cloudflare Pages validators can preserve
the complete fail-closed integrity model while eliminating repeated
reference-data response bodies:

- normal startup should fetch the manifest with `cache: 'no-cache'`;
- normal startup should fetch the 13 assets with `cache: 'default'`;
- Retry after a failed reference-data gate should fetch the manifest and all
  assets with `cache: 'reload'`; and
- all current status, MIME, bounds, dataset-ID, hash, decoding, parsing, shape,
  complete-snapshot and startup-gate checks must remain unchanged.

In an isolated Windows Chrome 153 profile against production, the split policy
transferred 156,172 bytes on its cold fetch set, then 11,575 and 11,576 bytes on
two warm fetch sets. All 14 warm network responses were conditional 304s; Fetch
returned the verified cached response bytes to the caller. The current
`no-store` policy transferred 156,008 bytes cold and 162,823 / 162,758 bytes on
the two repeats, with 14 network 200s and no conditional requests each time.

The split policy therefore removed all 150,229 previously measured Brotli body
bytes on an unchanged repeat load. Its first warm run reduced the measured
Chrome DevTools Protocol (CDP) encoded transfer total by 144,597 bytes, or
92.6%, relative to its own cold run. The remaining approximately 11.6 KB is
principally the 14 conditional request/304 response exchanges. This is a
bandwidth result, not evidence of a user-visible speed improvement.

No runtime, header, Cloudflare, deployment, reference-data or test change was
made by this audit.

### Post-audit implementation acceptance

The user completed authenticated staging acceptance after the recommended
policy was implemented. This later evidence does not change or retroactively
extend the audit measurements above.

- environment: protected `staging`;
- application commit: `0a0260c`;
- browser: Microsoft Edge `153.0.4234.48` (Official build, 64-bit);
- initial observed load: manifest plus all 13 reference-data assets returned
  `304`;
- warm reload 1: manifest plus all 13 assets returned `304`;
- warm reload 2: manifest plus all 13 assets returned `304`;
- forced reference-data failure followed by application Retry: manifest plus
  all 13 assets returned `200`;
- ordinary reload after the successful Retry: manifest plus all 13 assets
  returned `304` again; and
- overall result: **PASS**.

This confirms in a real authenticated staging browser session that normal
startup and reloads use the intended revalidation path, explicit Retry uses the
stronger refresh path, and later ordinary loads return to normal revalidation.
The observed behavior is consistent with the implemented `no-cache` manifest,
`default` assets and `reload` Retry policy. This manual pass did not measure
bandwidth and does not constitute production acceptance. Production and
cross-deployment cache testing remain part of the final `1.0.0-rc.1` acceptance
matrix.

## 1. Baseline and scope

Audit date: **24 September 2026** (Australia/Sydney).

Repository baseline:

- branch: `staging`;
- commit: `0d5fe6e6d5ce49b4cf2bd818a273861f15b0565f`;
- tracked changes at start: none;
- untracked state at start: the user-supplied
  `docs/implementation-briefs/CODEX_AUDIT_BRIEF_reference-data-caching-revalidation.md`;
- the brief was not modified.

The implementation, deployment documentation, prior bandwidth and release
audits, headers, generated manifest, all 13 JSON assets, reference build and
verification scripts, startup gate, loader and integrity tests were inspected.
The 13 generated assets total 2,762,769 decoded file bytes; including the
1,841-byte manifest, the loader reads 2,764,610 decoded bytes per successful
startup.

This was a report-only audit. A temporary CDP measurement script and isolated
Chrome profile were created in the workspace, used only for read-only GETs,
and removed. No deployment, dashboard, Access, header or repository runtime
setting was changed. Localization-overlay work and every other scope exclusion
in the brief were left closed.

## 2. Existing integrity and startup model

`src/data/referenceDataLoader.ts` currently applies `cache: 'no-store'` to the
manifest and every asset. Independently of transport caching, it enforces:

- manifest fetch status, JSON media type and a 16 KiB decoded-byte bound;
- integer manifest schema version and the supported version value;
- the exact ordered 13-file inventory;
- strict hash syntax and canonical dataset-hash reconstruction;
- equality with the build-bundled expected dataset ID;
- asset fetch status, JSON media type and an 8 MiB per-asset decoded-byte bound;
- exact SHA-256 of every asset's response bytes;
- fatal UTF-8 decoding, JSON parsing and lightweight runtime shape validation;
- first failed asset reporting in manifest order despite parallel completion;
- Web Crypto availability and successful digest behavior; and
- return of a complete snapshot only after all 13 assets settle successfully.

`ReferenceStartupGate` mounts `App` only after that complete snapshot. Until
then, persistence and editor initialization remain inactive. A failure produces
technical diagnostics only; Retry reruns the whole gate. User save data is not
included in the diagnostic report.

HTTP caching does not bypass any of those checks. A browser-cached response is
still delivered to Fetch as response bytes and passes through the same bound,
hash, decoding, parsing and shape path. A network 304 is exposed to Fetch as a
successful response assembled from the validated cache entry; CDP separately
shows the network's 304.

## 3. Current production and staging response behavior

Production target: `https://starfieldoutposts.com`.

Representative production responses in the Chrome run were:

| Resource | Cache-Control | ETag | Last-Modified | Age | CF-Cache-Status | Encoding | Content-Length | Vary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `manifest.json` | `public, max-age=0, must-revalidate` | `W/"c33458fcd714c0388f9cdec4ab72b0f9"` | absent | absent | `DYNAMIC` | `br` on 200 | absent | `accept-encoding` |
| `inorganic-occurrences.json` | same | `W/"28ede06eb00d9b55cde9ef9c8b6074c7"` | absent | absent | `DYNAMIC` | `br` on 200 | absent | `accept-encoding` |
| `products.json` | same | `W/"1dc3491ab26f24ea53420c64c1cd1d8c"` | absent | absent | `DYNAMIC` | `br` on 200 | absent | `accept-encoding` |

Observed `Date` values advanced normally during the 04:59 UTC measurement
window. Every unchanged revalidation sent `If-None-Match` and received network
status 304. No `If-Modified-Since` request was observed because no
`Last-Modified` validator was supplied. All 200 and 304 responses reported
`CF-Cache-Status: DYNAMIC`; no useful `Age` was exposed.

This separates three layers:

- **browser cache:** Chrome stored 200 response bytes and either conditionally
  revalidated them or reused them from disk, depending on Fetch mode;
- **Cloudflare edge:** the observed requests were `DYNAMIC`, so this audit found
  no evidence that the edge served the JSON bodies from its own shared cache;
- **Pages/static origin behavior:** Pages supplied stable weak ETags and honored
  `If-None-Match` with 304 for unchanged files.

Staging target:
`https://staging.starfield-outpost-network.pages.dev`. A fresh in-app Chromium
tab redirected to the Cloudflare Access sign-in page. No authenticated session
was available, so current staging JSON headers and transfer measurements could
not be obtained. The audit did not attempt authentication or change Access.
Production evidence is sufficient for the recommendation, but authenticated
staging remains a required implementation-acceptance environment.

## 4. Browser measurement method and exact units

The primary measurement used Chrome `153.0.8010.53` on Windows in headless mode
with a new isolated user-data directory and the production custom domain. CDP
captured request headers, response/network status, cache source and
`Network.loadingFinished.encodedDataLength` for each request. The harness
cleared the browser cache before each candidate, ran one cold set and two
immediate repeat sets, and read every response body so the candidate exercised
the same body-consumption boundary as the loader.

The fetch set used the manifest plus the exact ordered 13-asset inventory. It
issued those 14 requests together for measurement; the production loader first
validates the manifest and only then starts the 13 asset requests. That
sequencing difference does not change the per-request cache result, but this was
not a patched full-application build.

Units are kept separate:

- **decoded body bytes:** 2,764,610 bytes returned to Fetch after content
  decoding, including bytes supplied from browser cache after 304;
- **prior Brotli body bytes:** 150,229 bytes measured in the earlier deployed
  bandwidth audit; excludes headers and transport framing;
- **CDP encoded transferred bytes:** sum of CDP
  `loadingFinished.encodedDataLength`; includes the bytes Chrome attributes to
  each network transfer and is suitable for within-run cold/warm comparison,
  but is not claimed to include TLS or HTTP/2 framing and is not relabeled as
  the DevTools Network table's exact `Transferred` display value.

The earlier audit's known cold page URL set totaled 550,121 encoded response
body bytes. Removing the 150,229-byte repeated reference body is therefore
27.3% of that directly comparable known cold-body total. It does not imply a
27.3% whole-page transfer reduction on a warm load because other page resources
have different reuse/revalidation behavior and header bytes remain.

## 5. Candidate Fetch policies and results

| Candidate | Manifest / assets | Cold CDP bytes | Warm 1 | Warm 2 | Warm network result |
| --- | --- | ---: | ---: | ---: | --- |
| A. current baseline | `no-store` / `no-store` | 156,008 | 162,823 | 162,758 | 14 × 200; no validators |
| B. browser default | `default` / `default` | 156,199 | 11,574 | 11,585 | 14 × 304; 14 ETags |
| C. explicit revalidation | `no-cache` / `no-cache` | 156,196 | 11,561 | 11,609 | 14 × 304; 14 ETags |
| D. split | `no-cache` / `default` | 156,172 | 11,575 | 11,576 | 14 × 304; 14 ETags |
| Probe only | `force-cache` / `force-cache` | 156,129 | 0 | 0 | 14 disk-cache hits; no network |

Cold differences of a few hundred bytes and the larger first-versus-repeat
`no-store` variation are header-level run noise, including dynamic response
headers. The body inventory was identical in every successful set.

The three revalidation candidates are currently equivalent in transfer outcome
because every JSON response is immediately stale and `must-revalidate`.
Candidate D is preferable semantically: it makes the small trust-root manifest
unconditionally revalidate even if its response headers change later, while
allowing the cryptographically verified asset responses to follow ordinary
browser/server validation and freshness rules.

`force-cache` demonstrates that Chrome can produce zero network bytes, but it
is rejected for normal startup. With stable URLs it deliberately bypasses the
server's `must-revalidate` instruction, so a new app would routinely encounter
an old cached manifest and stop at `REF_BUILD_MISMATCH` until Retry. That is an
avoidable recovery path for only about 11.6 KB more saving than the safe split
policy. It also made all 14 cached responses available while offline, which
would create an implicit stale/offline behavior this product has not adopted.

## 6. Cold/warm bandwidth accounting

For the recommended split candidate:

- cold: 156,172 CDP encoded transferred bytes;
- immediate warm: 11,575 bytes;
- second warm: 11,576 bytes;
- first repeat saving versus cold: 144,597 bytes (92.6%);
- second repeat saving versus cold: 144,596 bytes (92.6%);
- reference response-body saving versus the prior deployed body measurement:
  150,229 of 150,229 bytes (100%); and
- saving as a share of the earlier known 550,121-byte cold page body set: 27.3%
  in directly comparable body-byte units.

All 14 requests still occurred. That is acceptable: the manifest is small, the
conditional exchanges are about 0.8 KB each in this run, and the 2.76 MB
decoded snapshot still undergoes the same client hashing/parsing checks without
being transferred again.

## 7. Deployment-mixing and corruption matrix

The matrix combines real cache behavior with deterministic simulations already
present in `tests/referenceIntegrity.test.tsx` and direct tracing of the loader.

| Scenario | Result under split policy | Evidence / enforcement |
| --- | --- | --- |
| Old app + old cached data | Loads after revalidation and full verification. | Unchanged production responses returned 304 and all bytes remained available to Fetch. |
| New app + old cached manifest/assets | The manifest revalidates. A new manifest is checked against the new bundled ID; if stale old bytes are returned instead, `REF_BUILD_MISMATCH` stops startup. | Existing self-consistent other-build manifest test; bundled expected ID remains authoritative. |
| Old app + new deployment data | A newly returned manifest differs from the old bundled ID and stops at `REF_BUILD_MISMATCH`; it cannot silently accept the new dataset. | Same deterministic mismatch test and manifest-before-assets sequence. |
| New manifest + stale asset | Asset SHA-256 differs from the new manifest and stops at `REF_ASSET_HASH`. | Existing asset-hash simulation; every asset is checked byte-for-byte. |
| Old manifest + new asset | Either the manifest first fails the bundled-ID check, or a new asset differs from the old manifest hash and stops. | Dataset-ID and asset-hash checks are independent. |
| Memory/disk/network mixture | Accepted only when every response hashes to the one accepted manifest; otherwise the first manifest-order failure stops the gate. | Per-asset hash verification plus `Promise.allSettled`/manifest-order reporting. |
| Corrupt cached asset | Hash failure normally occurs first; a self-consistently rehashed corrupt value is still subject to UTF-8, JSON and shape checks. | Existing hash, invalid JSON and invalid-shape tests. |
| Missing asset | `REF_ASSET_FETCH`, with status when available; App remains unmounted. | Existing asset 404 test and gate test. |
| Revalidation unavailable/offline | Normal `default` and split probes failed all 14 fetches from an otherwise seeded cache because the entries require revalidation. The real loader would stop at `REF_MANIFEST_FETCH` before requesting assets. | Actual Chrome offline emulation. No offline support is promised. |

The current tests also cover manifest status/MIME/JSON/bounds-related invalidity,
schema version, exact inventory, duplicate/path/absolute-URL/malformed-hash
entries, canonical dataset hash, asset status/MIME/bounds, missing Web Crypto,
first failure order, complete valid loading, inactive App/persistence during
failure, technical-only reporting and whole-gate Retry.

## 8. Retry and recovery

Retry must not repeat the normal cache policy after a hash, parse, schema,
dataset or fetch failure. The narrow recommendation is:

```text
normal startup:
  manifest cache = no-cache
  assets cache = default

Retry after a failed gate:
  manifest cache = reload
  assets cache = reload
```

The browser probe seeded all 14 entries with `default`, then fetched them with
`reload`. Retry made 14 unconditional network requests, received 14 status 200
responses, transferred 162,976 CDP bytes, and sent no ETag conditions. A
subsequent `default` set received 14 conditional 304s and transferred 11,591
bytes, showing that `reload` both bypassed stale cache state and refreshed the
normal cache for later startup.

This is preferable to a Retry query-string cache buster. `reload` retains the
canonical URLs, normal 404/MIME handling, Cloudflare routing and cache key, and
does not pollute caches with one-off URL variants. Random parameters must not be
added to normal startup. A retry-only query parameter is unnecessary on the
observed platform.

## 9. Manifest versus asset policy

The manifest should be stricter than the assets:

- it is only 748 deployed Brotli body bytes in the prior measurement;
- it identifies the complete dataset and supplies every exact asset hash;
- `no-cache` forces browser revalidation regardless of any future positive
  freshness accidentally or deliberately applied to the manifest; and
- it does not replace the bundled expected dataset ID, which remains the final
  app-build/dataset binding.

Assets should use `default`. Today that means conditional revalidation because
the response is immediately stale. If Pages later gives an asset positive
freshness, reuse remains safe: the bytes must still match the accepted
manifest. If a new manifest meets a stale cached asset, the hash fails and the
user can recover through `reload` Retry.

Using `no-cache` for every asset would produce the same current bandwidth but
discard the browser's ability to honor safe server freshness in the future.
Using `default` for the manifest happens to revalidate today, but makes the
trust-root behavior dependent on headers. The split policy is the clearer
integrity/bandwidth contract.

## 10. Stable filenames and larger-architecture threshold

Stable filenames remain viable. Current ordinary HTTP validation provides:

- an always-revalidated manifest;
- ETag-based 304s for unchanged assets;
- exact per-asset cryptographic verification for any cache/network mixture;
- a build-bundled dataset ID that rejects the wrong manifest; and
- a tested unconditional refresh mechanism for recovery.

No content-hashed filenames, dataset-ID path prefix, service worker, Cache
Storage, IndexedDB, Worker, Function or backend is required. Those designs
should be reconsidered only if later staging/production acceptance demonstrates
that validators are absent/unstable, conditional requests return incorrect
bytes, Retry cannot replace a bad cache entry, or the remaining conditional
overhead becomes a separately evidenced material problem. None of those
thresholds was reached here.

There is no service worker, and this audit does not establish offline support.

## 11. Automated test implications

A later implementation should preserve the entire existing integrity suite and
add narrowly scoped tests for application-owned policy decisions:

1. initial manifest request uses `cache: 'no-cache'`;
2. initial asset requests use `cache: 'default'`;
3. Retry after a failed gate selects `cache: 'reload'` for the manifest and all
   assets;
4. a subsequent ordinary load returns to the normal split policy;
5. a self-consistent old/new manifest mismatch remains `REF_BUILD_MISMATCH`;
6. mixed old/new and corrupt asset bytes remain `REF_ASSET_HASH` (or the
   existing JSON/schema error when the manifest deliberately names those exact
   corrupt bytes);
7. missing/network-failed responses keep their existing fetch codes and asset
   context;
8. first failed asset remains manifest-order stable; and
9. the gate still prevents App/persistence initialization through failure and
   while Retry is pending.

Fetch mocks should assert the requested modes and returned-response handling;
they should not attempt to emulate the browser's internal HTTP cache or 304
assembly. Real-browser acceptance remains the authority for validators,
transfer bytes and cache sources.

## 12. Exact proposed pre-release implementation scope

If authorized by a later implementation brief, make only these changes:

1. introduce a small typed normal/retry request-policy boundary in
   `referenceDataLoader.ts`;
2. change normal manifest Fetch from `no-store` to `no-cache`;
3. change normal asset Fetch from `no-store` to `default` (or omit the property
   only if tests keep the intent explicit);
4. let `ReferenceStartupGate` identify a user Retry so the complete retrying
   load uses `reload` for manifest and assets;
5. add the policy/retry/mixing tests listed above; and
6. update architecture/deployment documentation only where it describes the
   now-obsolete `no-store` behavior.

Do not change `_headers`, Cloudflare settings, stable filenames, manifest
schema/content, hashes, byte bounds, loading order, gate timing, error codes,
persistence, diagnostics or deployment architecture. One Retry remains one
whole-gate operation.

## 13. Manual/browser acceptance plan

Run the following finite matrix first on authenticated staging and then on the
production release candidate. Use a disposable browser profile/origin data and
do not reset valuable production `localStorage`.

| Case | Expected result |
| --- | --- |
| Cold load | 14 successful 200 reference responses; complete verified startup. |
| Warm reload | manifest/assets conditionally revalidate or safely reuse; no reference bodies transferred when unchanged; startup succeeds. |
| Second warm reload | same result, without regression to full bodies. |
| Version A → B with A cache retained | B manifest is obtained/revalidated; B loads only with B dataset and assets. |
| New app + old cache | never mounts with old dataset; normally revalidates to new, otherwise shows `REF_BUILD_MISMATCH`. |
| Old app + new deployment, where reproducible | never accepts the new mismatched dataset; fails closed. |
| One stale/corrupt asset | hash/JSON/schema failure as appropriate; App and persistence stay inactive. |
| One missing asset | `REF_ASSET_FETCH`; App stays inactive. |
| Retry after integrity failure | all 14 requests use refresh behavior, obtain fresh 200s where available, and recover when the server is healthy. |
| Reload after successful Retry | returns to split normal behavior and warm 304/cache reuse. |
| Offline after a successful load | normal startup fails closed; no offline promise. |

For every run record app version/commit and deployment identity, expected and
actual dataset ID, browser/OS version, origin, cache source/network status,
reference request count, encoded transferred bytes, decoded/resource bytes,
startup result and failure code. Confirm first-failed-asset ordering and that no
saved-network content appears in diagnostics. Staging must be authenticated by
the user through the normal Access flow; this audit provides no credential or
Access workaround.

## 14. Residual risks and limitations

- Authenticated staging evidence was unavailable during the audit itself. The
  later implementation acceptance recorded above closes that staging check;
  production and cross-deployment release-candidate coverage remain pending.
- The production harness exercised real Chromium Fetch/cache behavior but not a
  tracked prototype build of the complete application. Loader sequencing and
  integrity conclusions are supported by source/tests. At audit time, the exact
  implemented cache modes still needed acceptance; the later staging evidence
  above closes that environment while production release-candidate acceptance
  remains outstanding.
- Only Chrome 153 on this Windows host was measured. Other Chromium versions
  should follow HTTP semantics but remain implementation-dependent; one current
  release-browser pass is appropriate before release.
- The CDP total is not TLS/framing-inclusive and is not an exact screenshot of
  the DevTools `Transferred` column. Body-byte and CDP-byte claims are therefore
  reported separately.
- 304s still cost requests and response headers, and cached bodies still cost
  local reading, hashing and JSON parsing. No startup-speed improvement was
  measured or promised.
- Cloudflare reported `DYNAMIC`; the recommendation relies on browser caching
  and Pages validators, not an asserted edge-cache saving.
- Offline normal startup fails closed by design. This is not an offline feature.

## 15. Final disposition

**CACHE-B — Implement a split manifest/assets policy pre-release; this provides
the best integrity/bandwidth balance.**

All seven implementation thresholds are met by the evidence available:

1. every current integrity condition remains in the response-processing path;
2. stale and mixed snapshots fail closed through bundled dataset identity and
   exact asset hashes;
3. `reload` gives Retry a narrow, measured recovery path;
4. no service worker, backend or persistence layer is needed;
5. the current static Pages architecture remains intact;
6. unchanged repeat reference-body transfer falls by 150,229 bytes (100%), and
   measured CDP transfer falls by approximately 144.6 KB / 92.6%; and
7. two repeat production runs were consistent, with all 14 responses returning
   conditional 304s.

The recommended implementation is not authorized by this report. It requires a
separate brief and the staging/production acceptance plan above.

# Reference-Name Overlays on Demand — Prototype Report

## Decision

**P2 — Benefit exists, but deployed staging measurement is still required.**

The isolated Vite prototype produces a simple chunk graph, removes 102,274 locally
Brotli-compressed bytes (43.1%) from the English initial JavaScript artifact, and
requires only one additional locale chunk for a non-English session. The design
keeps semantic catalogues eager and reference lookup synchronous. Production
implementation should not begin until a protected staging deployment confirms
browser requests, transfer compression/cache behaviour, and version-A to
version-B recovery.

## Evidence boundary

- Baseline: `staging` at `059d44830293530dbf47c411a2af49fbb9cb3300`.
- Isolation: ignored `.local-work/reference-overlay-prototype/`; normal runtime
  source was not changed.
- Measurement date: 2026-09-23.
- Local sizes use Node `zlib`: gzip level 9 and Brotli quality 11. They are
  artifact measurements, not deployed transfer sizes, and should only be
  compared with the baseline measured by the same script.
- No branch, commit, push, preview, or deployment was created.
- Protected-preview automation was intentionally not attempted. Deployed
  request, timing, and cache measurements remain manual follow-up.

## Baseline architecture

`src/localization/referenceNames.ts` statically imports all eight generated
non-English overlays into one in-memory map. Vite therefore emits one main
JavaScript file containing semantic catalogues and all reference-name overlays.
Locale resolution, preference persistence, locale commitment, and synchronous
translation are owned by `LocalizationProvider`.

The committed baseline main JavaScript is:

| File | Raw | Gzip | Brotli |
|---|---:|---:|---:|
| `index-Fbe9siwU.js` | 1,488,032 | 364,367 | 237,395 |

## Prototype architecture

The prototype replaces static overlay imports with one explicit dynamic-import
map in `referenceNames.ts`. A single loader owns loaded overlays, in-flight
requests, deduplication, retry, and synchronous lookup after readiness.

`LocalizationProvider` is the narrow state owner because it already knows the
effective locale and owns locale preference commitment. On initial non-English
load it gates children until the requested overlay resolves. During a manual
switch it keeps the current locale active, disables the selector while pending,
loads the target overlay, and commits locale plus preference only after success.
Failure keeps the current locale and preference, announces an error, and permits
a later retry. Successfully loaded overlays remain in memory.

English spelling overrides remain synchronous built-ins. `en-US` and `en-GB`
perform no generated-overlay import. Semantic catalogues remain statically
imported and `translate()` remains synchronous.

The dynamic mapping is one module per locale:

```text
fr-FR  -> generated/fr-FR-reference-names.ts
de-DE  -> generated/de-DE-reference-names.ts
es-ES  -> generated/es-ES-reference-names.ts
it-IT  -> generated/it-IT-reference-names.ts
ja-JP  -> generated/ja-JP-reference-names.ts
pl-PL  -> generated/pl-PL-reference-names.ts
pt-BR  -> generated/pt-BR-reference-names.ts
zh-Hans -> generated/zh-Hans-reference-names.ts
```

## Chunk graph and artifact sizes

Vite emitted one main chunk and eight independent content-hashed overlay chunks.
There is no shared overlay chunk and English does not depend on any overlay.

| Artifact | Raw | Gzip | Brotli |
|---|---:|---:|---:|
| `index-BeHfY6US.js` | 641,788 | 162,282 | 135,121 |
| `de-DE-reference-names-CYVd_laC.js` | 99,819 | 24,530 | 18,708 |
| `es-ES-reference-names-ByUQ-kbF.js` | 103,650 | 24,931 | 19,000 |
| `fr-FR-reference-names-BTRVmLwE.js` | 106,957 | 24,939 | 19,150 |
| `it-IT-reference-names-DgJJdZP9.js` | 102,349 | 24,508 | 18,688 |
| `ja-JP-reference-names-D1VWni0p.js` | 129,904 | 26,420 | 20,272 |
| `pl-PL-reference-names-DX_nEwWm.js` | 100,821 | 24,882 | 18,985 |
| `pt-BR-reference-names-CGtxChsV.js` | 102,769 | 24,877 | 18,826 |
| `zh-Hans-reference-names-BIw3f2bL.js` | 104,043 | 25,711 | 19,163 |

The large raw/gzip reduction relative to the sum of standalone overlays also
shows how much repeated object-key structure the previous single-file compressor
could exploit. Brotli is the more conservative and deployment-relevant local
comparison.

## Initial JavaScript scenarios

These totals are artifact-level main plus active overlay, not network transfer
measurements.

| Scenario | Raw total | Gzip total | Brotli total | Brotli reduction from baseline |
|---|---:|---:|---:|---:|
| English | 641,788 | 162,282 | 135,121 | 102,274 (43.1%) |
| German | 741,607 | 186,812 | 153,829 | 83,566 (35.2%) |
| Japanese | 771,692 | 188,702 | 155,393 | 82,002 (34.5%) |
| Simplified Chinese | 745,831 | 187,993 | 154,284 | 83,111 (35.0%) |

The English raw reduction is 846,244 bytes and gzip reduction is 202,085 bytes.
German reduces raw/gzip by 746,425/177,555 bytes, Japanese by
716,340/175,665 bytes, and Simplified Chinese by 742,201/176,374 bytes.

## Request behaviour

The Vite graph and loader tests establish the following expected JavaScript
requests. An actual browser Network capture was not performed locally and is a
required staging measurement.

| Scenario | Initial/switch JavaScript files | Generated overlay requests |
|---|---:|---|
| English first load | 1 | 0 |
| German first load | 2 | 1: German |
| Japanese or Chinese first load | 2 | 1: requested locale |
| English → German | 1 new file | 1: German |
| German → Japanese | 1 new file | 1: Japanese; German stays cached |
| German → English → German | 0 new files after first German load | 0 after the first German load |

Concurrent requests for the same locale share one promise. A failed promise is
removed from the in-flight cache, so retry makes a fresh request. Switching to
English resolves immediately from the built-in spelling overlay.

## Bootstrap, switching, failure, and accessibility

- A persisted or browser-detected non-English locale is resolved synchronously,
  then the reference-dependent application render is gated until its overlay is
  ready. The prototype renders no English-name workspace flash.
- A manual switch leaves the current UI usable until the requested overlay has
  loaded, then commits the locale and preference together.
- The native selector is temporarily disabled and exposes a polite pending
  announcement. Failure exposes an alert while retaining the active locale.
  The selector DOM node is not replaced; exact Chrome focus retention while it
  becomes disabled still needs browser verification.
- A failed initial non-English load falls back wholly to `en-US` for the session,
  rather than combining non-English semantic UI with canonical English names.
  The failed stored preference is not overwritten, so the next reload retries.
  This whole-locale fallback is the recommended policy.
- The prototype's pending/error strings are deliberately minimal English copy.
  Production work should add semantic catalogue keys before shipping.

## Integrity and provenance

All existing overlay provenance and reference-data verification commands still
run before Vite builds. Dynamic imports package the verified TypeScript modules
into the same content-hashed build and browsers enforce JavaScript module parsing
and MIME handling. This is sufficient build/version coupling for the JS-chunk
approach; extra runtime hashes or duplicated schema metadata would add little.

Standalone JSON would require a build manifest and identity, locale identity,
hash/provenance, byte limit, content-type validation, schema validation, safe
fallback, and explicit cache policy. It also needs a typed conversion boundary
that dynamic JS imports avoid. A second JSON prototype is not justified by the
current result.

Canonical reference-data integrity checks and the existing `cache: 'no-store'`
reference-data behaviour were not changed.

## Cross-deployment and caching risk

The main module refers to content-hashed chunks from the same build, which
prevents cross-version aliasing. The unresolved case is an open version-A page
requesting an as-yet-unloaded A chunk after deployment B updates the branch
alias. Cloudflare documents atomic, durable unique preview URLs, but the branch
alias points to the newest deployment. Cloudflare also says cached assets have a
one-week TTL but may disappear at any time. That does not prove that an old
hashed path remains available through the moving branch/custom-domain alias.

Production should catch a dynamic-import failure, retain the current locale, and
offer a reload-oriented recovery message. Staging must explicitly exercise A → B
with a previously unopened locale before this can graduate from P2. Useful
references: [Cloudflare preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
and [Cloudflare Pages serving/cache behaviour](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Offline trade-off

- English works offline whenever the application shell is cached.
- A previously loaded locale can work from memory or browser cache.
- A never-loaded non-English locale cannot be selected offline; the switch fails
  safely and the current locale remains usable.

This is a real regression from the eager design, where all locale overlays are
resident after the main script loads. The measured 82–102 KB local Brotli saving
is large enough to justify staging evaluation of that trade-off. No service
worker is proposed.

## Prototype files

Runtime and test changes exist only under the ignored prototype copy:

```text
src/localization/referenceNames.ts
src/localization/LocalizationProvider.tsx
src/localization/LocalizationContext.ts
src/ui/layout/TitleBar.tsx
tests/referenceOverlayLoader.test.ts
tests/referenceOverlayProvider.test.tsx
tests/loadReferenceOverlays.ts
tests/itemSearch.test.ts
tests/localization.test.ts
tests/localizationReferenceNames.test.ts
tests/validationDiagnostics.test.ts
tests/componentAccessibility.test.tsx
```

Existing synchronous lookup tests preload overlays in test setup; new tests
cover zero-import English, locale isolation, in-flight deduplication, reuse,
failure/retry, initial render gating, failed-switch preservation, and successful
commit timing.

## Verification

Run successfully in the isolated prototype:

- `npm test` — 260 passed;
- `npm run test:components` — 88 passed;
- `npm run typecheck:tests`;
- `npm run localization:verify`;
- `npm run build`;
- `npm run lint`.

`git diff --check` passed in the normal checkout. The normal `staging` checkout
remains unchanged except for this report and the user-supplied untracked brief.

## Recommended manual staging follow-up

If this prototype is promoted for measurement, create an explicitly approved
prototype branch/worktree from the recorded baseline, apply the prototype files
listed above, run `npm ci` and `npm run build`, then push that prototype branch so
Cloudflare Pages creates a protected preview. Do not alter the `staging` runtime
for this measurement.

In authenticated browser DevTools, record cold and warm English, German,
Japanese, and Simplified Chinese first loads; English → German, German →
Japanese, and German → English → German; request URLs/counts; encoded and decoded
sizes; Brotli/gzip; memory/disk cache and 304 behaviour; and locale-switch
latency. Then keep version A open, deploy version B, and request an A locale chunk
that was never loaded. Confirm the recovery path without making previews public
or weakening Cloudflare Access.

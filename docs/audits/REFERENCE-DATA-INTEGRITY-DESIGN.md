# Reference-data integrity and fatal startup design audit

**Date:** 18 September 2026

**Branch:** `staging`

**Scope:** Read-only repository and documentation audit. No application, build, hosting, or localization change was made.

## Executive recommendation

Add a small, generated **runtime deployment manifest** for the 13 required JSON files. At production build time, regenerate the reference JSON into a temporary location, compare it with the committed `public/reference-data` output, validate the complete deployed set, and generate a manifest from the exact bytes that Vite will copy. At startup, load and validate the manifest and all 13 files, including MIME, broad shape, SHA-256, and a short list of referential invariants, **before mounting `App`**. Any failure enters one dedicated, localized fatal state. This is a coherence gate, not an authenticated security signature.

The supplied brief deliberately supersedes the current behavior described in `docs/ARCHITECTURE.md` §15, which allows editing after reference-load failure. Update that durable document only in the later implementation parcel.

## Evidence and current boundary

- `scripts/build-reference-data.mjs` reads canonical CSV and tracker policy from `reference-source`, validates many source relationships, and writes 13 JSON arrays into `public/reference-data`.
- `package.json`: `reference:build` runs localized-name provenance validation and then the generator. `npm run build` runs localized-name provenance validation, Japanese overlay verification, TypeScript compilation, and Vite. It **does not run** `reference:build` or `reference:test`.
- All 13 runtime JSON files and all five manifest/policy JSON files under `reference-source` are tracked by Git. Vite copies the contents of `public` to `dist` at their corresponding root paths. The existing local `dist/reference-data` contains the same 13 names and byte-for-byte hashes as `public/reference-data`. No `reference-source` file appears in that local `dist` inventory. This is local artifact evidence, not a live production inspection.
- `docs/DEPLOYMENT.md` defines Cloudflare Pages static deployment with `npm run build`, output `dist`, staging from `staging`, and a manual production release from `main`. There is no backend, Pages Function, or reference-data service worker in the inspected path.
- `src/data/referenceDataLoader.ts` uses `Promise.all` for 13 `fetch` calls. The helper checks `response.ok`, then calls `response.json()` with a generic TypeScript cast. It does not inspect content type, schema, count, hash, dataset identity, or cross-file relationships. There is no reference-data browser-storage cache. A failed `Promise.all` discards its assembled result; its other requests may still finish.
- `src/main.tsx` mounts `LocalizationProvider` and `App` immediately. `App` calls `initializeNetworkCollection` during its first render and starts reference fetching in an effect. Its editor and import/export controls are present while the requests are pending and after failure. It sets `referenceData` to `null` and displays a generic status-bar error, with raw exception text in `title`. Many consumers receive empty arrays or undefined references. A disabled-by-constant reload control is present in code (`SHOW_REFERENCE_DATA_STATUS = false`).
- Storage initialization is not read-only: `initializeNetworkCollection` calls `trySaveNetworkCollection` when there is no stored collection and again after successful migration/recovery. The subsequent `App` persistence effect writes on a changed collection. The current loader itself does not mutate saved data, but mounting `App` before the integrity gate violates the proposed no-write failure boundary.

### Canonical runtime asset inventory

Every listed file is **fatal-required** for the current complete `ReferenceData` contract; none has a documented optional/degradable mode. Counts below describe the inspected committed files, not permanent expected totals.

| Asset under `/reference-data/` | Records | Loaded as |
| --- | ---: | --- |
| `biomes.json` | 428 | `biomes` |
| `body-biomes.json` | 3,211 | `bodyBiomes` |
| `inorganic-occurrences.json` | 7,780 | `inorganicOccurrences` |
| `species.json` | 1,121 | `species` |
| `planet-species.json` | 1,738 | `planetSpecies` |
| `organic-occurrences.json` | 3,855 | `organicOccurrences` |
| `organic-farming-profiles.json` | 3 | `organicFarmingProfiles` |
| `systems.json` | 123 | `systems` |
| `bodies.json` | 1,776 | `bodies` |
| `resources.json` | 76 | `resources` |
| `products.json` | 30 | `products` |
| `body-resources.json` | 1,445 | `bodyResources` |
| `product-recipes.json` | 30 | `productRecipes` |

The Japanese reference-name overlay is a generated TypeScript module compiled into the app bundle, **not** a separately fetched JSON asset. Its source/sidecar verification belongs at build time.

## Existing source manifests and policies

These are source/provenance controls, not runtime deployment inventories. None lists all 13 deployed JSON files or fingerprints their deployed bytes. Keep them in `reference-source`; derive only suitable non-sensitive linkage metadata into the new runtime manifest if useful.

| File | Format; owner/producer | Contents and role | Runtime reuse |
| --- | --- | --- | --- |
| `biome-inorganic-resources.manifest.json` | JSON; companion of the inorganic CSV export, source-side generated metadata | Dataset/schema and reproducer versions, output filename, export time, 7,780 source rows, location counts, collapsed occurrence count, upstream input filenames/times/counts/SHA-256. `validateInorganicManifest` checks declared output facts and location counts, but explicitly treats upstream hashes as provenance; a missing manifest is currently optional. | No: its hashes concern source inputs, not runtime JSON. Preserve separately. |
| `localized-name-provenance-manifest.json` | JSON; generated by explicit installed-game provenance tooling and accepted with reviewed artifacts | Game version, generation time/tool/optional commit, authoritative plugin and archive identities, sizes/hashes, localization table inputs, locales and encodings. Build-time validation checks policy alignment; it does not describe deployed reference JSON. | No: source provenance only. |
| `localized-reference-names-manifest.json` | JSON generated sidecar of the Japanese reference-name module | Provenance and source-manifest hashes/identity, reviewed plugin/table inputs, entity and per-kind counts, composition policy, generated TypeScript module SHA-256. `verify-reference-name-overlay` checks hashes/counts and resource-ID reconciliation. | No as a deployment manifest; the module is bundled, not fetched as JSON. An optional source linkage could be derived. |
| `localization-provenance-policy.json` | Hand-maintained JSON policy | Authoritative/optional plugins, locales, encodings, expected coverage, row/provider and composed-fauna counts. | No: validation policy, not deployment output. |
| `official-terminology-policy.json` | Hand-maintained JSON policy | Canonical content and terminology-evidence plugin allowlists. | No: source intake policy. |

The source CSVs and manifests are absent from the inspected `dist`, so there is no production exposure through the current Vite copy path. Their repository presence is not a concrete privacy or integrity threat. The generated runtime catalogues are publicly served by design and contain game/reference facts, not user networks.

## What the build does and does not guarantee

The generator validates source structure and identity extensively: planet required fields, consistent extraction timestamp, unique body IDs and system names, numeric/body fields; exact inorganic and item CSV headers, ID uniqueness and FormID crosswalks; inorganic family graph and tracker-policy population; product/ingredient identity, recipe completeness and cycles; biome/body/resource/species joins, repeated-fact consistency, farming signatures, and derived `bodyResources`. `validateCurrentItemPopulation` pins reviewed product/item totals. The optional inorganic companion manifest reconciles declared source row/location counts. `reference:test` exercises these generators and localization modules with focused fixtures, but it is not included in `npm run build`.

The production build checks localization provenance closure and Japanese overlay hashes/counts. Both checks read `public/reference-data/resources.json`, so its absence fails the build and ID-set drift can be caught. **The other 12 JSON files are not required by the current production-build command**, and Vite can copy a missing one without rejecting the build. A stale `resources.json` that preserves the expected ID set, or stale/mixed content in any other file, can also pass the current build. TypeScript interfaces do not validate fetched JSON. The existing build script is the natural place to collect the generated output set and emit a runtime manifest, but the production build needs a deterministic verification step rather than silently rebuilding tracked artifacts during release.

Recommended build gate:

1. Run current source/provenance and localization checks and `reference:test` in CI/release verification.
2. Regenerate all 13 JSON files into a temporary directory using the same generator logic; compare exact bytes (or canonicalized bytes if serialization is deliberately changed) with tracked `public/reference-data`. Fail on missing, extra required-file drift, malformed JSON, or mismatch. Do not silently rewrite committed files during `npm run build`.
3. Validate broad per-file schemas, unique IDs, counts, and cross-file referential integrity against the exact `public` bytes. Use existing builder invariants where possible, adding output-set checks for missing/stale committed artifacts.
4. Generate the runtime manifest from those exact bytes immediately before Vite; verify `dist` contains the manifest plus all 13 files afterward. Keep manifest generation deterministic.

## Runtime manifest and fingerprint design

Use a generated `public/reference-data/manifest.json` (or generate it directly into the build staging output) with a closed allowlist of 13 paths, deterministic ordering, a versioned small schema, and exact-byte SHA-256 hashes. Do not use any existing `reference-source` manifest wholesale. Its source details, local file references, and hashes describe different layers.

| Candidate field | Decision | Reason |
| --- | --- | --- |
| Manifest schema version | **Required** | Enables explicit unsupported-version failure. |
| Dataset/build identifier | **Required** | Deterministic digest of canonical manifest content (or equivalent); embed expected ID in the app bundle and compare it at startup to detect provable app/manifest deployment skew. |
| Required asset paths | **Required** | Exact fixed allowlist; reject omissions, duplicates, unknown paths, off-origin/absolute URLs, and path traversal. |
| Per-file SHA-256 | **Required** | Detects a mixed deployment, stale cache response, or altered/malformed file even if shape/count remains plausible. Hash exact fetched bytes before decoding/parsing. This is a coherence fingerprint, not a signature against same-origin compromise. |
| Per-file schema/version | **Useful optional** | Current files are plain arrays without independent schema versions. A single manifest schema plus shape checks is enough for the first slice; add per-file versions only when formats diverge. |
| Record counts | **Useful optional** | Cheap diagnostic/assertion, but hashes already pin exact content. If included, derive and check them rather than hand-maintain. Do not freeze current counts as policy. |
| Byte sizes | **Useful optional** | Cheap guard/diagnostic and size limit; derive from bytes. Do not rely on HTTP `Content-Length`, which may reflect transfer encoding. |
| App commit/build ID | **Useful optional** | No meaningful identifier is currently embedded; package version is `0.0.0`. A generated build ID can aid support if reproducibly available. Avoid making an unavailable Git commit mandatory for local builds. |
| Source/provenance linkage | **Useful optional** | Compact digest/identifier can help trace a build; source filenames, game install paths, and full source manifests do not belong in runtime payload. |
| Build timestamp | **Unnecessary; undesirable for identity** | Makes equal source builds differ and does not prove freshness. A release timestamp can be informational only, never a gate. |

The expected bundle dataset ID matters: hashing only against a fetched manifest cannot prove that a self-consistent but old manifest and old files match the current app. Even with this link, an entirely old app/manifest/files combination is not provably stale without an independent trusted release source. Fail only on demonstrable mismatch; do not infer staleness from a date or fixed record count.

## Browser startup gate

Implement a top-level initializer under the existing `LocalizationProvider`, **before `App` mounts**. The provider already uses bundled message catalogues and a separate preference key; it does not require reference JSON. Do not initialize, migrate, save, or expose network state while the gate is pending or failed.

1. Fetch the manifest from a fixed same-origin URL. Check status, JSON MIME (`application/json` or `+json`, case/parameters normalized), parse and validate its small schema, version, exact asset allowlist, hash formats, and expected bundle dataset ID. `response.ok` alone is insufficient.
2. Fetch all 13 paths in parallel from that allowlist with a consistent cache policy. Check response status and MIME; identify `200 text/html` as a content-type/SPA-fallback failure. Bound response bytes to a reasonable build-derived or fixed maximum before hashing/parsing.
3. Hash raw response bytes with browser Web Crypto SHA-256 and compare to manifest. Decode/parse JSON, then validate top-level array, required fields/types/enums, unique keys, and narrow cardinality constraints. A content hash failure is distinct from invalid JSON or shape failure; choose a deterministic first reported asset in manifest order if several fail.
4. Check cheap cross-file links: body→system; body-biome→body/biome; inorganic occurrence→body/resource/body-biome; planet-species→body/species/resource; organic occurrence→body-biome/species; farming input→resource; recipe→product/ingredient; `bodyResources`→body/resources and its derived occurrence/harvest union. Check key uniqueness and that biome occurrence belongs to its asserted body. Keep source-specific extraction rules and expensive full regeneration at build time.
5. Only after all checks pass, mount `App` with one complete `ReferenceData` snapshot. On any failure render the fatal state. User-triggered `Reload` should rerun the entire gate; prevent a stale earlier request from replacing a later result. Never accept a partial catalogue. Browser storage may be read separately for an explicit raw backup action, but normal `initializeNetworkCollection` must wait for success because it writes.

The gate is about the reference deployment, not a generic React error boundary. Unexpected errors while hashing/validating map to an internal-loader failure and still stop startup. If Web Crypto is unavailable, fail closed with a stable internal/integrity-check code rather than silently skipping hashes. A strict MIME check is valuable on Pages but should use media-type parsing rather than exact header string equality.

## Stable failure taxonomy and diagnostics

Use a discriminated result with immutable codes, for example `REF_MANIFEST_FETCH`, `REF_MANIFEST_INVALID`, `REF_MANIFEST_VERSION`, `REF_ASSET_FETCH`, `REF_ASSET_CONTENT_TYPE`, `REF_ASSET_JSON`, `REF_ASSET_SCHEMA`, `REF_ASSET_HASH`, `REF_DATASET_COHERENCE`, `REF_LOADER_INTERNAL`. `REF_ASSET_FETCH` carries status when present (including a true 404); network rejection has no HTTP status. `REF_ASSET_CONTENT_TYPE` identifies HTML SPA fallback even with status 200. `REF_MANIFEST_INVALID` covers malformed JSON/shape, while version gets its own code. A bundle/manifest dataset-ID mismatch should have a distinct `REF_BUILD_MISMATCH` code. Do not expose raw exception or stack text in UI or email.

Keep a safe relative asset identifier from the fixed allowlist (`bodies.json`, etc.) in diagnostics and, if helpful, next to a localized user-facing reason. The normal explanation should not show a full URL. The report may include the fixed relative path, error code/category, HTTP status, observed media type, expected/actual hash prefixes, and manifest/bundle dataset IDs. Do not include arbitrary response bodies, request URLs with query strings, local file paths, exception stacks, or any player-state-derived value. Hash mismatch is coherence; missing/HTML/parse errors are transport/content; valid files with broken relationships are dataset-coherence failures.

## Fatal state, export, localization, and accessibility

Use a dedicated full-screen application state, outside the editable shell, with one semantic `h1`, a short localized explanation that the tracker stopped to protect saved work, a concise safe diagnostic code, and native `button`/link controls. Offer **Reload** (user-triggered full gate retry) and **Report**. Do not auto-retry indefinitely or silently open the editor. Keep diagnostics selectable/copyable as text. Move focus to the heading on entry (`tabIndex=-1`) and announce the failure once; avoid duplicate assertive announcements. Maintain visible focus, readable contrast/forced-colors signaling, responsive/reflow layout, clear accessible names and logical Tab order. There is no animation requirement; any optional spinner must respect reduced motion. Test keyboard and screen-reader entry/return behavior, including failed retry.

Put new semantic keys in `src/localization/locales/en-US.ts` for heading, explanation, retry/report/export labels, privacy text, diagnostic labels, and mapped error-category copy. Add complete matching Japanese keys and placeholder parity in `ja-JP.ts`; keep `en-GB.ts` sparse and inherit baseline. Error codes, hashes, IDs, and filenames stay invariant; surrounding words are localized. The `LocalizationProvider` is mounted before `App` and its catalogues are bundled, so ordinary reference-data failure can use the normal `t()` path. If preference storage is unavailable, it already falls back to browser language then en-US. If the JavaScript bundle or localization itself fails to execute, this gate cannot render; an English static HTML fallback would be a separate availability design, not a new localization system for this parcel. Set/maintain document `lang` through the provider.

### Can raw export be offered?

**Yes, but only as a new, narrowly defined raw backup operation, not by reusing the current `NetworkExportButton` path.** The current button exports an already initialized/migrated `NetworkCollection`, calls `getActiveSavedNetwork`, and derives a filename from the character name; the initialization path may write storage. A fatal-screen action can read the existing `starfield-outpost-network` localStorage value, place its **unchanged string** in a JSON Blob, and download it under a fixed generic backup filename, without parsing, migration, reference lookups, or any write. Do not fabricate an empty collection if the key is absent or unreadable; disable/omit the action then, with localized explanation if displayed. Test exact byte/string preservation and zero `setItem` calls. This is a backup of stored bytes and may include malformed historical data; label it accordingly. Keep its contents and filename out of reporting diagnostics. If the later implementation cannot preserve this raw boundary, omit the button.

### `Report` via `mailto:`

The button should build an encoded `mailto:support@starfieldoutposts.com` link on user activation only, with a localized subject and a short plain-text body of technical diagnostics. The email client opens; nothing is sent by the app. Show localized privacy text adjacent to the control: the email contains technical diagnostics only and no saved network data automatically. The user may edit the draft or attach their own export.

| Candidate diagnostic | Default policy |
| --- | --- |
| Stable error code/category; fixed relative failing asset; HTTP status/media type when relevant; bundle/manifest dataset IDs and manifest schema version when available; effective locale | **Include** |
| App package version (`0.0.0` today), generated commit/build ID if made available, expected/actual hash prefixes or safe counts, UTC timestamp | **Optional**; useful only when reliably sourced and bounded. Timestamp is a report-time observation, not proof of dataset freshness. |
| Full user agent/browser version | **Exclude by default**; optional coarse browser family/version only if a concrete support need emerges. |
| Network JSON, localStorage, network/outpost names, notes, imported/exported filenames, raw URLs/query strings, response bodies, arbitrary stack traces, anything derived from saved data | **Always exclude**. |

Construct diagnostics from a closed typed object, not by serializing the exception, `window.location`, or app state. Unit-test the decoded `mailto:` recipient, subject and body against both inclusion and exclusion cases. The current CSP has `form-action 'self'`; `mailto:` activation should be checked in staging browsers, but no CSP relaxation is recommended without observed need.

## Cloudflare Pages fallback

The repository has no top-level `404.html` or `_redirects` rule. [Cloudflare Pages documents](https://developers.cloudflare.com/pages/configuration/serving-pages/) that without a top-level `404.html` it assumes SPA routing and maps unmatched paths to `/`. The repository's [staging smoke-test record](../benchmarks/CLOUDFLARE-STAGING-SMOKE-TEST.md) observed a nonexistent `/reference-data/*.json` returning `200 text/html` with the app shell. The current loader's `response.json()` rejects that HTML, but only after the editable shell has mounted; it reports a generic parse error rather than the true missing-asset category.

Application-level status/MIME/parse/hash validation is sufficient for the fail-closed product behavior and must exist regardless of hosting. A narrow hosting rule that returns a real 404 for missing `/reference-data/*` could improve HTTP semantics, **if** it can be demonstrated not to intercept existing assets or client-side routes. Do not add a global `404.html` merely to change this case: it could alter legitimate SPA deep-link behavior. [Pages redirect documentation](https://developers.cloudflare.com/pages/configuration/redirects/) says `_redirects` rewrites do not support a 404 status, so a simple redirect is not an evidenced fix. Treat a targeted Pages routing adjustment as optional defense in depth after manual staging verification; no Cloudflare setting change is needed for the first implementation slice.

## Verification plan for the implementation parcel

- **Build:** manifest determinism; exact required-file allowlist; missing/extra/stale/invalid committed JSON; hash/count mismatch; unsupported manifest schema; output cross-file invariant failures; `dist` completeness. Isolate fixtures so tests never rewrite committed artifacts.
- **Runtime:** manifest transport/HTML/invalid/version/build mismatch; asset non-2xx/HTML MIME/invalid JSON/shape/hash; cross-file mismatch; parallel failure ordering; fatal state before editor and before network-storage writes; successful gate exposes complete data; Reload retries; raw backup is identical and read-only; `mailto:` has only allowlisted diagnostics.
- **Localization/accessibility:** en-US baseline, complete Japanese parity, en-GB fallback; locale preference read failure; localized heading/buttons/privacy/error reason; focus/announcement once, keyboard use, forced colors, zoom/reflow, screen-reader output.
- **Staging:** maintainer verifies protected preview with a controlled missing-file/fallback scenario, genuine client-side deep links, MIME responses, `mailto:` behavior, no persistence write after failure, and backup download. Keep the existing email-code preview protection. Local tests cannot prove Cloudflare routing.

## Smallest coherent implementation slice and open questions

The smallest useful slice is: deterministic build verification and generated 13-file manifest with hashes; a typed startup gate before `App`; minimal shape/reference checks; localized accessible fatal state with Reload and Report; tests for Pages HTML fallback, mixed files, and no storage write. A raw backup button can follow in the same parcel only if its storage-only implementation and exact preservation tests remain small. Hosting routing is a separate optional parcel.

No blocking product question remains for this design. Implementation should settle the precise byte-size ceiling and manifest location, and verify whether `mailto:` activation works under the deployed CSP in the target browsers. A future decision may choose a dedicated deployment build ID; it is not required to protect the current asset set.

## Audit verification and limits

Read-only inspection covered the brief, repository documentation, source/manifests, build scripts, loader, app startup, persistence, export, localization, accessibility patterns/tests, Vite configuration, public assets, and existing local `dist`. `git status` and `git branch --show-current` were checked before inspection. No build, test, live Cloudflare request, commit, push, or deployment was performed for this design-only parcel; the report makes no claim that the existing app passed a new integrity test. The supplied brief was already untracked at audit start and was left untouched.

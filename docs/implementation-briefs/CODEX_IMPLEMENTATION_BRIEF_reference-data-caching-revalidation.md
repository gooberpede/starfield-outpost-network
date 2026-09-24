# CODEX IMPLEMENTATION BRIEF — Reference Data Caching / Revalidation

## Objective

Implement the pre-release reference-data caching policy approved by the completed audit:

```text
CACHE-B — split manifest/assets policy
```

The implementation must reduce repeat-load bandwidth while preserving the existing fail-closed reference-data integrity model.

The approved normal/retry behavior is:

```text
Normal startup:
  manifest → cache: 'no-cache'
  assets   → cache: 'default'

Retry after a failed reference-data gate:
  manifest → cache: 'reload'
  assets   → cache: 'reload'
```

This is a **narrow transport/cache-policy change**.

Do not change reference-data content, schema, hashes, URLs, Cloudflare headers/settings, deployment architecture, persistence, or startup semantics.

---

## Authority and source material

Treat these as the primary sources for this task:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/DEPLOYMENT.md
docs/audits/REFERENCE-DATA-CACHING-REVALIDATION-REVIEW.md
src/data/referenceDataLoader.ts
src/ReferenceStartupGate.tsx
tests/referenceIntegrity.test.tsx
```

The audit disposition is authoritative for the cache policy:

```text
manifest normal: no-cache
assets normal: default
retry whole snapshot: reload
```

Do not reopen those decisions unless current committed source materially conflicts with the audit assumptions.

---

# 1. Baseline

Work on the current committed `staging` branch.

Record before editing:

```text
branch
commit
tracked/untracked state
```

Do not modify the user-supplied implementation brief.

No commit, push, deployment, Cloudflare mutation, repository publication, or release/tag operation is authorized.

---

# 2. Preserve the complete existing integrity model

Do not weaken, bypass, or reorder the established checks.

The implementation must preserve:

```text
manifest fetch status
manifest JSON MIME/type check
manifest byte bound
manifest schema validation/version
exact ordered asset inventory
canonical manifest dataset hash
equality with bundled expected dataset ID
asset fetch status
asset MIME/type check
asset byte bound
exact SHA-256 per asset
fatal UTF-8 decoding
JSON parsing
runtime shape validation
first failed asset reporting in manifest order
Web Crypto failure behavior
complete-snapshot return only after all assets validate
startup gate before App/persistence initialization
technical-only failure diagnostics
no saved-data leakage
```

Cached/revalidated responses must still flow through the exact same integrity-processing path.

Do not add any “trusted cache” bypass.

---

# 3. Introduce a small typed request-policy boundary

Add the smallest coherent abstraction needed to distinguish normal startup from explicit Retry.

Prefer a narrow internal type, for example:

```ts
type ReferenceRequestMode = 'normal' | 'retry'
```

or equivalent repository-consistent naming.

The request policy should resolve to:

```text
normal:
  manifest → no-cache
  asset    → default

retry:
  manifest → reload
  asset    → reload
```

Keep the policy explicit and testable.

Do not spread raw cache-mode conditionals throughout unrelated code.

Do not introduce a general caching framework.

---

# 4. Normal manifest request

Change only the normal manifest Fetch policy from:

```ts
cache: 'no-store'
```

to:

```ts
cache: 'no-cache'
```

The manifest remains:

```text
same URL
same sequencing
same status handling
same MIME validation
same bounds
same JSON parsing
same schema validation
same canonical dataset ID check
same bundled expected dataset ID check
```

Do not change the manifest format or path.

---

# 5. Normal asset requests

Change normal reference-asset Fetch policy from:

```ts
cache: 'no-store'
```

to:

```ts
cache: 'default'
```

You may omit the `cache` property only if:

- browser-default semantics are exactly intended; and
- tests still make the application-owned policy explicit.

Prefer explicitness unless existing style strongly favors omission.

Every asset must still undergo:

```text
status
MIME
bounded bytes
SHA-256
UTF-8
JSON
shape validation
```

No cached asset is accepted merely because Fetch returned it successfully.

---

# 6. Retry semantics

A user-triggered Retry after a failed reference-data gate must rerun the **complete snapshot** with:

```text
manifest → cache: 'reload'
all assets → cache: 'reload'
```

The intent is to escape stale/corrupt cache state and refresh the browser cache using canonical URLs.

Do not:

```text
add random query parameters
add cache-busting timestamps
change URLs
retry only the failed asset
skip the manifest
use force-cache
```

Retry remains one whole-gate operation.

After a successful Retry, later ordinary loads must return to the normal split policy.

---

# 7. ReferenceStartupGate integration

Make the smallest change necessary for `ReferenceStartupGate` to distinguish:

```text
initial/normal load
user Retry
```

Preserve:

```text
pending behavior
fatal-state behavior
focus behavior
technical diagnostics
App remains unmounted through failure and retry-pending
persistence remains inactive
same user-visible Retry control unless a change is strictly necessary
```

Do not add new user-facing cache terminology.

The user should not need to understand the cache policy.

---

# 8. Error behavior

Preserve all existing error codes and semantics.

Do not create new cache-specific error codes unless an existing failure cannot accurately represent a real case.

Expected behavior remains:

```text
bad/missing manifest       → existing manifest failure
wrong build dataset        → REF_BUILD_MISMATCH
bad/missing asset          → existing asset failure
stale/corrupt asset bytes  → REF_ASSET_HASH where hash differs
bad exact-hash JSON        → existing JSON/schema failure
missing Web Crypto         → REF_LOADER_INTERNAL
```

The cache mode itself is not a user-facing error condition.

---

# 9. Automated tests

Preserve the entire existing reference-integrity suite.

Add focused tests for the new policy.

At minimum verify:

## Normal startup policy

```text
manifest Fetch receives cache: 'no-cache'
asset Fetches receive cache: 'default'
```

## Retry policy

After a first failed gate:

```text
Retry reruns manifest with cache: 'reload'
Retry reruns every asset with cache: 'reload'
```

## Return to normal policy

Where practical, verify that a later fresh/ordinary load uses:

```text
manifest no-cache
assets default
```

rather than remaining in Retry mode.

## Integrity remains unchanged

Retain or add focused assertions that:

```text
self-consistent wrong-build manifest → REF_BUILD_MISMATCH
stale/mixed asset bytes → REF_ASSET_HASH
missing asset → REF_ASSET_FETCH
first failed asset remains manifest-order stable
App/persistence remain inactive during failure and retry pending
```

Do not attempt to make unit-test Fetch mocks simulate real browser HTTP-cache internals or 304 response assembly.

Tests should verify **application-owned request policy**, while real browser acceptance verifies actual cache behavior.

---

# 10. Documentation updates

Update only documentation that is now factually obsolete because it explicitly says reference data is fetched with `cache: 'no-store'`.

Likely owners:

```text
docs/ARCHITECTURE.md
docs/DEPLOYMENT.md
docs/BACKLOG.md
```

but edit only if the current text actually needs correction.

Preserve dated audits as dated evidence.

Do not rewrite the completed caching audit to make it look like implementation evidence.

If backlog wording describes the caching investigation as pending, reconcile it to the implemented/pre-release state.

Do not migrate temporary task identifiers into durable docs.

---

# 11. No header or Cloudflare changes

Do not modify:

```text
public/_headers
Cloudflare dashboard settings
Cache-Control response headers
Access
CSP
HSTS
deployment branch policy
redirects
```

The approved design deliberately relies on current Pages validators and browser caching.

This implementation is client-side Fetch-policy work only.

---

# 12. Stable URLs remain unchanged

Do not change:

```text
/reference-data/manifest.json
/reference-data/*.json
manifest asset paths
file names
dataset ID construction
hash algorithm
```

Do not add:

```text
content-hashed URLs
dataset-ID prefixes
service worker
Cache Storage API
IndexedDB reference cache
new persistence layer
Worker
Pages Function
backend
```

Those are explicitly out of scope.

---

# 13. Offline behavior

Do not add offline behavior.

Normal startup while revalidation is unavailable may continue to fail closed.

Do not:

```text
fall back to force-cache
silently accept stale data
present the app as offline-capable
add offline copy
```

The current product has no offline-support commitment.

---

# 14. Localization overlay work remains closed

Do not touch:

```text
src/localization/generated/*-reference-names.ts
reference overlay dynamic-import prototype
semantic catalogue splitting
locale-loading behavior
```

Reference-data caching and localization-overlay loading remain separate concerns.

---

# 15. Required automated verification

Run:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run build
npm run lint
git diff --check
```

If the known ignored `.local-work/reference-overlay-prototype` TypeScript-root conflict prevents ordinary lint in the main checkout:

1. record that exact known limitation;
2. run lint in the established clean checkout-shaped/isolated copy if practical;
3. do not modify the ignored prototype merely to make lint pass.

Also run the focused reference-integrity tests separately and report their count/result.

Do not claim a check passed unless actually run.

---

# 16. Browser/manual acceptance after implementation

Implementation is not accepted on unit tests alone.

Provide a finite manual checklist for the user.

## Authenticated staging — required

Using a normal authenticated staging session:

### A. Cold load

Expected:

```text
App loads
reference manifest/assets succeed
complete dataset verifies
no fatal state
```

Record:

```text
candidate version/commit
dataset ID if practical
browser/version
origin
```

### B. Warm reload

Expected:

```text
manifest/assets revalidate or safely reuse browser cache
App loads
unchanged reference bodies are not transferred again
```

Where DevTools exposes it, record:

```text
304s
memory/disk cache
Transferred / Resource Size
```

### C. Second warm reload

Expected:

```text
same safe low-transfer behavior
no regression to 14 full-body 200s
```

### D. Retry recovery

Using a safe test method that causes one required reference request to fail or return invalid content:

Expected:

```text
fatal reference state appears
App/persistence remain inactive
Retry causes whole snapshot refresh
healthy server state recovers
```

Where inspectable, Retry should show unconditional refresh behavior rather than ordinary 304 reuse.

Do not ask the user to alter valuable production data.

## Production release candidate — required later

Repeat:

```text
cold load
warm reload
second warm reload
```

and verify the same policy before final launch acceptance.

The audit already measured production behavior against the current site; implementation acceptance must verify the actual candidate.

---

# 17. Cross-deployment acceptance

For the final release-candidate matrix, preserve these cases from the audit:

```text
Version A cache retained → Version B app
new app + old cache
old app + new deployment where reproducible
one stale/corrupt asset
one missing asset
Retry after integrity failure
normal reload after successful Retry
```

The acceptance criterion is:

> The app never mounts with a dataset that fails the bundled dataset-ID or per-asset hash contract.

Do not weaken this criterion to achieve a warm-cache success.

---

# 18. Success criteria

The implementation is complete when:

- normal manifest request uses `no-cache`;
- normal asset requests use `default`;
- Retry uses `reload` for manifest and all assets;
- all prior integrity checks remain in place;
- no reference-data schema/content/hash/URL changes occur;
- no Cloudflare/header/deployment changes occur;
- focused request-policy tests pass;
- full automated verification passes subject only to the already-known lint-worktree limitation;
- authenticated staging confirms normal startup and warm revalidation behavior;
- Retry is demonstrated to recover after a forced failure when the server is healthy;
- no user data or persistence behavior changes.

---

# 19. Non-goals

Do not:

```text
optimize startup parsing/hash CPU
change reference JSON format
compress JSON differently
change asset count
lazy-load subsets of reference data
add service worker/offline mode
change localization overlays
change CSP
change deployment headers
add telemetry
change fatal-state UX
change retry wording
change schema
change saved network data
```

---

# 20. Completion report

Report:

1. baseline branch/commit;
2. files changed;
3. request-policy abstraction used;
4. normal manifest mode;
5. normal asset mode;
6. retry mode;
7. integrity/error behavior preserved;
8. tests added/changed;
9. documentation reconciled;
10. full verification results;
11. focused reference test results;
12. lint status and any known prototype-related limitation;
13. manual staging checklist;
14. any browser evidence Codex itself obtained;
15. remaining release-candidate acceptance work;
16. confirmation no Cloudflare/header/deployment/reference-data-content/schema/history/remote changes occurred.

Suggested commit message:

```text
perf: cache and revalidate reference data
```

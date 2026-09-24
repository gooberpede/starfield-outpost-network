# CODEX AUDIT BRIEF — Reference Data Browser Caching / Revalidation

## Objective

Perform a **bounded pre-release investigation of browser caching/revalidation for runtime reference data**.

The current loader deliberately fetches the reference manifest and all 13 JSON assets with:

```ts
cache: 'no-store'
```

This guarantees fresh transport but causes a measurable repeat-load bandwidth cost.

Previous deployed measurement found approximately:

```text
150,229 bytes Brotli
```

of reference-data response bodies per startup, separate from the JavaScript/localization payload.

Unlike the technical-token geometry audit, **“leave it unchanged” is not the default outcome**. There is already a measurable cost to the present policy.

The audit should determine whether a safer browser-cache/revalidation strategy can preserve the existing fail-closed integrity model while materially reducing repeat-load bandwidth.

This is an **audit/prototype decision task, not an implementation authorization**.

Do not modify production/staging headers, runtime source, deployment settings, or Cloudflare configuration unless a later implementation brief explicitly authorizes that work.

---

## Decision standard

The default direction is:

> **Recommend a cache/revalidation implementation if the current integrity guarantees can be preserved and real browser evidence shows meaningful repeat-load savings.**

Deferral requires stronger evidence than “caching is complicated.”

Recommend deferral only if:

1. tested browser/Cloudflare behavior cannot preserve the existing fail-closed model without substantial new architecture; or
2. measured warm/repeat-load bandwidth savings are materially smaller than expected; or
3. a candidate introduces a demonstrated correctness/recovery regression that cannot be solved narrowly.

The following are **not sufficient reasons by themselves to defer**:

```text
stale-cache behavior exists
ETag/304 behavior needs testing
different request modes behave differently
Retry needs explicit cache-bypass behavior
browser caches are implementation-dependent
```

Those are exactly what this investigation is meant to resolve.

---

# 1. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read before investigating:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/DEPLOYMENT.md
docs/audits/DEPLOYED-BANDWIDTH-AND-LOCALE-LOADING-REVIEW.md
docs/audits/RELEASE-READINESS-REVIEW.md
src/data/referenceDataLoader.ts
src/data/referenceManifest.ts
src/ReferenceStartupGate.tsx
tests/referenceIntegrity.test.tsx
```

Also inspect:

```text
public/_headers
public/reference-data/manifest.json
all 13 public/reference-data/*.json assets
build/reference-generation scripts
```

Do not reopen on-demand localization-overlay work.

---

# 2. Current integrity model — non-negotiable

The existing loader must continue to enforce all current guarantees:

```text
manifest fetch status
manifest JSON MIME/type
manifest byte bound
manifest schema version
exact ordered asset list
manifest canonical dataset hash
expected bundled dataset ID
asset fetch status
asset JSON MIME/type
asset byte bound
exact per-asset SHA-256
UTF-8 decoding
JSON parsing
lightweight runtime shape validation
complete snapshot before App mount
fatal stop on any failure
```

Also preserve:

```text
Web Crypto dependency/failure behavior
first failed asset reporting in manifest order
startup gate before persistence/editor initialization
technical-only failure diagnostics
no user-save leakage
whole-gate Retry behavior
```

Do **not** weaken any integrity condition for bandwidth savings.

A cached response is acceptable only if it still passes the same byte/hash/schema verification.

---

# 3. No preselected Fetch mode

Do **not** assume in advance that the answer is:

```text
cache: 'default'
cache: 'no-cache'
cache: 'reload'
cache: 'force-cache'
```

Investigate actual browser and Cloudflare behavior.

At minimum compare realistic candidates:

```text
A. current no-store baseline
B. default browser caching
C. explicit revalidation/no-cache
D. split manifest/assets policy
```

A split policy should be examined explicitly, for example:

```text
manifest always revalidated
assets permitted to reuse cached bytes when validators/freshness allow
```

This is a candidate, not a predetermined answer.

Reject `force-cache` unless evidence shows it can safely satisfy deployment/version-change behavior and Retry semantics.

---

# 4. Cloudflare response behavior

Inspect actual current response headers for:

```text
/reference-data/manifest.json
several representative reference JSON assets
```

On both:

```text
production
staging, where authenticated browser evidence is available
```

Record:

```text
Cache-Control
ETag
Last-Modified
Age
CF-Cache-Status
Content-Encoding
Content-Length where exposed
Vary
Date
```

Also observe conditional requests:

```text
If-None-Match / 304
If-Modified-Since / 304
```

Do not change headers during this audit.

Clearly separate:

```text
browser cache behavior
Cloudflare edge cache behavior
origin/static Pages behavior
```

---

# 5. Browser measurement

Use a real Chromium browser if available.

Preferred environment:

```text
Windows Chromium
production custom domain
authenticated staging alias where practical
```

For each candidate behavior, record:

```text
cold first load
immediate reload
second reload
normal navigation away/back if useful
browser cache source if exposed
HTTP status
encoded transferred bytes
resource/body bytes
number of reference-data requests
```

The important comparison is not merely request count.

A 304/revalidation path with tiny transferred bytes may be a success even if requests still occur.

If DevTools exposes:

```text
Transferred
Resource Size
memory cache
disk cache
304
```

record them.

If the controlled environment masks them, use an alternate local/browser method where practical and state the limitation.

Do not substitute curl-only behavior for browser-cache evidence.

---

# 6. Cold/warm bandwidth accounting

Measure or derive, with units clearly stated:

```text
cold reference-data transferred bytes
warm reload transferred bytes
repeat warm reload transferred bytes
```

Separate:

```text
manifest
13 JSON assets
headers where available
encoded body
decoded body
```

The prior ~150,229-byte figure is Brotli HTTP body bytes, not exact DevTools Transfer Size. Do not mix units.

State the expected per-repeat saving in:

```text
absolute bytes
percentage of reference-data body traffic
percentage of known total page body traffic if directly comparable
```

Do not promise user-visible performance improvement unless measured.

The primary value is reduced repeated network transfer.

---

# 7. Deployment-mixing scenarios

This is the most important correctness section.

Test or simulate every case below.

## A. Old app + old cached data

Expected:

```text
loads successfully
may reuse/revalidate cache safely
```

## B. New app + old cached manifest/assets

The new app has a bundled `expectedReferenceDatasetId`.

Expected:

```text
stale old snapshot must not be accepted as the new app's data
```

The loader may:

```text
receive a new manifest after revalidation
or
receive stale bytes and fail REF_BUILD_MISMATCH
```

but must never mount the App with the wrong dataset.

## C. Old app + new deployment data

Expected:

```text
must not silently accept the new dataset if expected dataset ID differs
```

A mismatch/fail-closed response is acceptable.

## D. Mixed cache

Examples:

```text
new manifest + one stale asset
old manifest + one new asset
some assets memory-cached, others network
```

Expected:

```text
per-asset hashes catch every mismatch
App does not mount
```

## E. Corrupt cached asset bytes

Expected:

```text
hash/JSON/schema validation fails
App does not mount
```

## F. Missing cached/network asset

Expected:

```text
existing REF_ASSET_FETCH behavior
```

## G. cache validation unavailable/offline

Do not promise offline support.

Record actual behavior only.

---

# 8. Retry/recovery semantics

A cache-related failure must not trap the user in a loop where pressing Retry repeatedly receives the same stale/corrupt cached response.

Investigate whether the existing Retry operation should, in a later implementation, change request policy after an integrity failure.

Candidate behavior to assess:

```text
normal startup: revalidation/cache-friendly policy
Retry after reference-integrity failure: force network refresh / bypass browser cache
```

Determine the narrowest safe mechanism.

Possible tools may include:

```text
cache: 'reload'
cache-busting only on Retry
explicit request mode change
```

Do not implement yet.

Do not casually add random query parameters to normal startup because that would defeat caching.

If a Retry-only cache buster is considered, assess its Cloudflare/browser implications and whether it preserves normal 404/MIME/hash handling.

---

# 9. Manifest-versus-asset policy

Explicitly investigate whether the manifest should use a stricter policy than the assets.

Potential model:

```text
manifest: always revalidate
assets: normal cache/revalidation
```

Reasoning to test:

- manifest is small;
- manifest carries dataset identity and per-asset hashes;
- asset bytes are already cryptographically verified against it;
- stable filenames currently create cross-deployment aliasing risk if stale responses are reused incorrectly.

Determine whether this split is safer/more efficient than one shared Fetch mode.

Do not assume the manifest alone can make an old app/new deployment combination safe; the bundled expected dataset ID must remain authoritative.

---

# 10. Stable filenames and versioned URL threshold

The reference assets currently have stable paths.

Assess whether ordinary HTTP validation is sufficient with these stable filenames.

Do **not** automatically propose:

```text
content-hashed asset filenames
dataset-ID path prefixes
service workers
Cache Storage API
IndexedDB reference cache
custom cache orchestration
```

Those are substantial architecture changes.

Escalate to a versioned-URL design only if evidence shows that normal browser revalidation cannot provide safe/meaningful caching under the current Pages deployment model.

If that threshold is reached, stop and return:

```text
why HTTP caching alone is insufficient
minimum larger design required
estimated benefit
risks
```

Do not implement it in this audit.

---

# 11. Service worker boundary

No service worker exists.

Do not add or recommend one merely to solve reference caching unless ordinary HTTP/browser caching is proven inadequate and the report explicitly classifies that as a separate future architecture decision.

This task does not establish offline support.

---

# 12. Integrity tests to preserve and extend later

Inventory the existing automated integrity coverage.

For a future implementation, specify additional tests needed for caching semantics, such as:

```text
request cache mode for manifest
request cache mode for assets
Retry uses stronger refresh mode after failure
old/new manifest mismatch
mixed asset hash mismatch
corrupt response
failed network request
304-style response behavior where mockable
```

Do not overfit unit tests to browser implementation details that Fetch mocks cannot faithfully represent.

Browser evidence remains required for actual cache behavior.

---

# 13. Local prototype authorization

A small **isolated prototype or measurement harness is allowed** if needed to compare Fetch policies, provided it:

```text
does not change tracked production source
does not change Cloudflare settings
does not deploy
does not weaken integrity checks
does not persist user data
```

Use an ignored/local-work location if repository guidance permits.

If a prototype is created, describe and remove it unless there is a strong reason to preserve it as an ignored investigation artifact.

Do not silently leave generated clutter.

---

# 14. Scope exclusions

Do not modify or investigate as part of this task:

```text
localization overlay lazy loading
semantic catalogue splitting
service worker/offline support
CSP changes
Cloudflare Access
analytics
reference-data schema
reference-data content
hash algorithm
JSON compression format
backend/Workers/Functions
V2 planner data
```

Do not combine this with release indexing or deployment-runbook work.

---

# 15. Candidate recommendations

End with one of:

```text
CACHE-A — Implement browser caching/revalidation pre-release; candidate preserves integrity and yields meaningful repeat-load savings.

CACHE-B — Implement a split manifest/assets policy pre-release; this provides the best integrity/bandwidth balance.

CACHE-C — Implement only a narrow Retry/recovery improvement now; broader caching requires more evidence.

CACHE-D — Defer because ordinary HTTP/browser caching cannot safely preserve the current integrity model without substantial new architecture.

CACHE-E — Defer because measured bandwidth savings are materially smaller than expected.

CACHE-F — Evidence is incomplete; one specific missing measurement is required before deciding.
```

`CACHE-D/E/F` require concrete evidence.

Do not choose a deferral code merely because no approach is risk-free.

---

# 16. Pre-release implementation threshold

Recommend pre-release implementation if all of the following are true:

1. all current integrity guarantees remain enforceable;
2. stale/mixed deployment scenarios fail closed;
3. Retry can recover from stale/corrupt cache state;
4. no service worker/backend/new persistence layer is required;
5. current Pages/static architecture remains intact;
6. warm/repeat-load reference-data transfer is materially reduced;
7. browser evidence is consistent enough to justify the change.

A small number of conditional requests is acceptable.

Zero requests is **not** required.

The goal is safe reuse/revalidation, not “cache everything forever.”

---

# 17. Expected report

Create:

```text
docs/audits/REFERENCE-DATA-CACHING-REVALIDATION-REVIEW.md
```

or an equally clear repository-consistent filename.

The report must contain:

1. baseline;
2. current no-store behavior;
3. current Cloudflare response headers;
4. candidate Fetch policies;
5. cold/warm browser measurements;
6. exact units for bandwidth figures;
7. deployment-mixing matrix;
8. corrupt/mixed-cache behavior;
9. Retry/recovery analysis;
10. manifest-versus-asset recommendation;
11. stable-filename assessment;
12. larger-architecture stop threshold;
13. automated test implications;
14. CACHE-A/B/C/D/E/F recommendation;
15. exact proposed later implementation scope if recommended;
16. manual/browser acceptance plan;
17. residual risks and limitations.

---

# 18. Manual/browser acceptance plan for later implementation

If implementation is recommended, specify a finite follow-up test matrix.

At minimum:

```text
cold load
warm reload
second warm reload
deployment version A → version B with old cache retained
new app + old cache
old app + new deployment where reproducible
one deliberately corrupt/stale asset
one missing asset
Retry after integrity failure
normal reload after successful Retry
staging
production
```

Record:

```text
app build/version
dataset ID
browser/version
cache source/status where exposed
reference requests
bytes transferred
startup result
failure code where applicable
```

---

# 19. Verification

This is report-only unless an isolated local prototype is used.

Run:

```text
git diff --check
```

Confirm:

```text
only the audit report was created
no runtime/config/header/deployment/reference-data files changed
no commit/push/deployment/settings mutation occurred
```

A full application build/test run is not required merely for a report, unless tracked source is touched contrary to the intended scope.

---

# Expected Codex summary

Report:

1. branch/commit;
2. report path;
3. current reference-data body cost;
4. observed current browser/Cloudflare cache behavior;
5. candidate policies tested;
6. cold/warm measured transfer;
7. manifest recommendation;
8. asset recommendation;
9. mixed-deployment result;
10. Retry recommendation;
11. whether stable filenames remain viable;
12. whether larger cache architecture is needed;
13. CACHE-A/B/C/D/E/F disposition;
14. exact pre-release implementation recommended, if any;
15. expected bandwidth reduction;
16. browser/manual limitations;
17. checks run;
18. confirmation no production/staging/settings/runtime change occurred.

Suggested commit message:

`docs: audit reference data caching`

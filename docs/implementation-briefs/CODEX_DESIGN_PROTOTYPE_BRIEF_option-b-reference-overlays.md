# CODEX DESIGN + PROTOTYPE BRIEF — Option B: On-Demand Reference-Name Overlays

## Objective

Design and build an **isolated, non-production prototype** of Option B from:

`docs/audits/DEPLOYED-BANDWIDTH-AND-LOCALE-LOADING-REVIEW.md`

Option B means:

> Keep semantic UI catalogues eager and synchronous, but remove the eight generated non-English reference-name overlays from the initial application bundle and load only the effective non-English overlay when needed.

This prototype exists to answer architectural and measurement questions.

It is **not authorization to ship locale-on-demand loading to production**.

The prototype should produce concrete evidence for:

- actual Vite chunking;
- actual main-bundle reduction;
- per-locale chunk sizes;
- request behavior for English and non-English first render;
- manual locale switching;
- bootstrap/fallback complexity;
- build/version integrity;
- caching/deployment behavior;
- whether the measured benefit justifies production implementation.

---

## Current evidence

The deployed-bandwidth audit established:

```text
Production cold response bodies:
~550,121 bytes encoded

Production main JS:
312,341 bytes Brotli
1,488,032 bytes decoded

Eight non-English overlay modules:
~1,022,808 source bytes
~155,528 independently Brotli-compressed source bytes

Diagnostic Vite build:
removing all eight overlays reduced local main-JS Brotli
by ~103,015 bytes

Estimated deployed English cold saving:
~135,537 bytes

Estimated deployed German/Japanese saving:
~108–110 KB after adding active-locale overlay
```

These are strong indications, but hypothetical dynamic chunks were not measured.

Production architecture decision remains:

```text
Decision E — further evidence required
```

Do not silently convert that into approval.

---

## Prototype isolation

The prototype must not alter the normal `staging` runtime unless explicitly approved after review.

Preferred approaches, in order:

1. create the prototype in ignored `.local-work/` using a worktree/temporary copy or build-time variant;
2. create an isolated prototype branch only if Codex workflow requires a deployable branch and the user explicitly approves deployment;
3. otherwise produce prototype source/diffs under ignored local-work paths.

Do not replace the current committed eager implementation on `staging`.

Do not commit or push.

If Cloudflare deployment requires a branch later, stop after the local prototype and report what branch/deployment step is needed.

---

## Keep semantic catalogues eager

Do not dynamically import any semantic catalogue.

All UI translation remains immediately available and synchronous.

This prototype must not introduce an asynchronous `translate()` path.

---

## English baseline

English reference names remain canonical and require no generated overlay.

For `en-US` and `en-GB`, the prototype should load **zero generated reference-name overlay chunks**.

Preserve current English-specific spelling behavior.

---

## Leading implementation candidate: Vite dynamic JS chunks

Prototype **dynamic JS imports** first.

Conceptually:

```ts
const overlayLoaders = {
  'fr-FR': () => import('./generated/fr-FR...'),
  'de-DE': () => import('./generated/de-DE...'),
  // ...
}
```

Exact paths/names should follow repository structure.

Verify:

- content-hashed chunks are emitted;
- English initial graph excludes non-English overlays;
- one requested locale loads only its own overlay chunk;
- there is no unexpected shared overlay chunk that English must still download.

---

## Standalone JSON comparison

Also assess standalone overlay JSON/data, but do not build a second full prototype unless it is trivial.

Document the additional requirements it would introduce:

```text
manifest/build identity
locale identity
hash/provenance
byte limit
content-type validation
schema validation
safe fallback
cache policy
```

If dynamic JS chunks are clearly simpler and preserve provenance well, keep the prototype focused there.

---

## Centralized overlay loader

Use one narrow loading/cache boundary.

Conceptually:

```text
resolve effective locale
        ↓
English?
  yes → canonical names
  no  → load locale overlay
        ↓
make overlay available
        ↓
render/commit locale
```

Do not scatter dynamic imports through UI components.

Prefer a centralized loader/cache.

---

## First render

For a persisted or browser-detected non-English locale:

```text
resolve desired locale synchronously
load required overlay
then permit meaningful reference-name render
```

Do not intentionally render English names and visibly swap them later.

Assess whether a localized shell/loading state can render while the overlay loads, with the reference-dependent workspace gated until ready.

Keep the prototype simple.

---

## Locale switching

Desired behavior:

```text
current locale stays fully usable
→ requested overlay loads
→ locale commits only after success
```

For English, switching to `en-US`/`en-GB` should require no overlay request.

Successfully loaded overlays should be reused in-memory.

---

## Failure behavior

Simulate an overlay load failure.

Requirements:

- current locale stays active;
- requested locale does not partially commit;
- app remains usable;
- retry is possible;
- no fatal crash unless current architecture genuinely requires it.

Recommend whether automatic first-load failure should fall back to canonical English names or fall back wholly to English locale.

Do not let implementation details choose that policy accidentally.

---

## Preserve synchronous lookup after readiness

Prefer keeping:

```text
getReferenceDisplayName(...)
```

or equivalent synchronous during ordinary render.

Async behavior should live in bootstrap/locale transition, not spread into every consumer.

---

## Integrity and provenance

Trace current overlay generation and validation.

Preserve all existing build-time checks.

Assess whether dynamic chunk hashing/build coupling is sufficient together with build-time validation, or whether each module should expose minimal identity metadata such as locale/build/schema information.

Do not add redundant runtime cryptography without evidence it is needed.

Do not weaken canonical reference-data integrity checks.

---

## Cross-deployment behavior

Investigate this scenario:

```text
user loads app version A
deployment B occurs
user later switches to a locale whose A chunk was never loaded
```

Determine whether the old hashed chunk remains reachable and how failure/reload recovery behaves.

If local testing cannot establish this, mark it as a staging deployment test.

A production recommendation needs a clean recovery strategy.

---

## Build artifact measurements

Build the prototype and record:

```text
baseline main JS:
  raw
  gzip
  Brotli

prototype initial JS:
  raw
  gzip
  Brotli

each locale overlay chunk:
  filename
  raw
  gzip
  Brotli

any shared chunks:
  filename
  whether English needs them
```

Compare against the committed baseline build.

---

## Scenario measurements

Calculate artifact-level initial bytes for:

### English

```text
base only
```

### German

```text
base + de-DE overlay
```

### Japanese

```text
base + ja-JP overlay
```

### Simplified Chinese

Include if practical.

Clearly distinguish:

- local artifact bytes;
- deployed measured bytes;
- deployed estimates.

---

## Request count

Record expected/requested files for:

```text
English first load
German first load
Japanese/Chinese first load
English → German switch
German → Japanese switch
German → English → German
```

Confirm dynamic import caching behavior.

---

## State ownership

Determine the narrowest suitable owner for overlay readiness/state.

Candidates may include:

```text
LocalizationProvider
reference-name service/store
bootstrap state above App
```

Choose the boundary that:

- knows the effective locale;
- gates locale commitment;
- supplies synchronous names after load;
- avoids coupling unrelated domain/reference data.

---

## Persisted locale preference

Do not persist a requested locale before its required overlay loads successfully.

Verify current preference timing.

A failed switch must not leave the next reload targeting a locale that never successfully became active.

---

## Selector loading/error state

Prototype only the minimum accessible behavior needed to assess feasibility.

Possible behavior:

- current selection remains active;
- selector temporarily indicates pending/disabled state;
- concise status/error if loading fails;
- focus is retained;
- no distracting flicker for cached imports.

Do not over-polish visuals.

---

## Accessibility

Assess:

- focus during locale switch;
- pending state announcement if needed;
- failure announcement;
- no mixed-language partial transition;
- no English-name flash on intended non-English first render.

No new graphical UI is required.

---

## Offline behavior

Document:

```text
already-loaded locale offline → works
English offline → works if shell cached
never-loaded locale offline → switch fails safely
```

Do not add a service worker.

Compare this tradeoff explicitly with current eager behavior.

---

## Cloudflare Access for staging measurement

If the user can securely provide automation credentials, the preferred approach is:

- short-lived Cloudflare Access **Service Token**;
- a staging/preview-only **Service Auth** policy;
- read-only use for measurement;
- revoke or allow expiry afterward.

Do not request or use:

```text
Global API key
broad account write token
production write credentials
```

Do not commit or print secrets.

Do not place secrets in:

```text
source
docs
screenshots
fixtures
audit output
```

If Codex cannot securely consume/inject the service-token headers, stop and leave deployed staging measurement to the user rather than weakening Access.

Do **not** recommend making all previews public or adding a broad Bypass policy merely for automation.

---

## Staging deployment

Do not deploy automatically.

If the local prototype is strong enough to justify staging measurement, report:

```text
prototype branch/worktree needed
exact files changed
build command
deployment step required
what the user must authorize
```

Then stop for approval before any deployment.

---

## Tests

For the isolated prototype, cover at minimum:

```text
English requires no overlay
German loads de-DE only
Japanese loads ja-JP only
loaded overlay reused
switch to English requires no overlay
failed load does not commit locale
failed load preserves current locale/overlay
successful load commits locale
synchronous reference lookup works after readiness
existing locale fallback rules remain intact
```

Preserve existing overlay generation/provenance tests.

Do not weaken semantic catalogue tests.

---

## Verification commands

Run at minimum in the isolated prototype:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run build
npm run lint
git diff --check
```

Also confirm the normal staging checkout remains unchanged.

---

## Durable report

Create a durable report only if the prototype yields useful evidence:

```text
docs/audits/REFERENCE-OVERLAY-ON-DEMAND-PROTOTYPE.md
```

The report should include:

```text
baseline architecture
prototype architecture
chunk graph
artifact sizes
scenario bytes
request behavior
bootstrap design
switch behavior
failure behavior
integrity/provenance
cross-deployment risk
offline tradeoff
accessibility implications
staging measurement if available
recommendation
```

Runtime prototype code should remain isolated/uncommitted.

---

## Decision outcomes

End with one of:

```text
P1 — Strong enough to recommend production implementation.
P2 — Benefit exists, but deployed staging measurement is still required.
P3 — Complexity outweighs measured saving; keep eager overlays.
P4 — Integrity/deployment problem requires redesign.
P5 — Evidence remains inconclusive.
```

Do not force P1.

---

## Production recommendation threshold

Recommend production implementation only if the prototype shows:

```text
meaningful initial-bundle reduction
simple chunk graph
zero English overlay request
at most one active-locale overlay request
safe first-render behavior
safe failed-switch behavior
existing provenance retained
semantic catalogues remain synchronous
acceptable offline tradeoff
credible cross-deployment recovery
```

If deployed staging evidence is unavailable, P2 may still be the correct outcome.

---

## Separate reference-data cache issue

Do not modify the existing `cache: 'no-store'` reference-data behavior in this prototype.

That is a separate follow-up investigation.

---

## Stop conditions

Stop and report if:

- Vite cannot isolate overlays from the initial graph;
- reference-name APIs need to become broadly async;
- semantic catalogue loading must change;
- build-time provenance checks would weaken;
- locale failure leaves mixed/invalid UI state;
- cross-deployment chunk failure has no clean recovery path;
- prototype needs changes to canonical reference-data integrity behavior;
- deployed measurement requires exposing staging publicly or committing credentials.

---

## Expected Codex summary

Report:

1. baseline branch/commit;
2. prototype isolation method/path;
3. prototype architecture;
4. dynamic-import mapping;
5. state ownership;
6. baseline main-bundle sizes;
7. prototype main-bundle sizes;
8. per-locale overlay chunk sizes;
9. English initial-byte reduction;
10. German initial-byte reduction;
11. Japanese/Chinese initial-byte reduction;
12. request counts;
13. switch behavior;
14. loaded-overlay caching;
15. first-render behavior;
16. failed-switch behavior;
17. fallback recommendation;
18. integrity/provenance result;
19. cross-deployment risk/result;
20. offline tradeoff;
21. accessibility result;
22. staging measurement, if securely available;
23. recommendation P1/P2/P3/P4/P5;
24. confirmation reference-data cache behavior was untouched;
25. tests/checks run;
26. tracked files changed, if any;
27. suggested next action;
28. confirmation no commit/push/deployment occurred unless separately authorized.

If a durable report is created, suggested commit message:

`docs: prototype on-demand reference overlays`

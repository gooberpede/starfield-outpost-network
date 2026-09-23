# CODEX AUDIT BRIEF — Deployed Bandwidth, Caching, and Locale-on-Demand Review

## Objective

Perform a **read-only investigation** of production/staging bandwidth behavior and localization asset loading for the Starfield Outpost Tracker.

The purpose is to answer:

1. What bytes are actually transferred on a cold deployed load?
2. What bytes are reused from browser/CDN cache on subsequent loads?
3. How much of the deployed transfer is attributable to localization data?
4. Are all locale catalogues/reference overlays effectively paid for up front?
5. Would locale-on-demand loading materially improve transfer cost, or would it add complexity for little practical gain?
6. If on-demand loading is justified, what is the smallest safe architecture?

Do **not** implement lazy loading, dynamic imports, bundle splitting, cache policy changes, or localization architecture changes in this audit.

The only tracked repository change permitted is the durable audit report.

---

## Existing evidence to reconcile

The prior cleanup review recorded approximately:

```text
Main JS:
  1,484,485 bytes raw
  367,128 bytes gzip
  236,262 bytes Brotli

Full built output excluding source maps:
  ~4,313,377 bytes raw
  ~540,131 bytes gzip
  ~354,771 bytes Brotli

Semantic catalogues:
  ~283,773 bytes raw
  ~60,130 bytes Brotli

Eight generated non-English reference overlays:
  ~1,022,808 bytes raw
  ~155,528 bytes Brotli

Local warm startup:
  149–167 ms
  median 158.5 ms
```

These were **local estimates**, not proof of actual Cloudflare transfer behavior.

The earlier conclusion was:

> Startup performance is acceptable, but bandwidth remains open. Local compression does not establish observed deployed transfer. Further deployed profiling, caching review, and locale-loading analysis are required before deciding whether lazy/on-demand loading is warranted.

Treat that as the starting point.

Do not reinterpret the earlier work as already recommending lazy loading.

---

## Primary source of truth

Inspect at minimum:

```text
docs/benchmarks/LOCALIZATION-BUNDLE-AND-STARTUP-REVIEW.md
docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md
docs/ARCHITECTURE.md
docs/DEPLOYMENT.md
docs/BACKLOG.md
src/localization/
src/localization/locales/
src/localization/referenceNames.ts
generated localized reference-overlay assets
Vite/build configuration
public/_headers
Cloudflare Pages deployment behavior
current production build
current staging/preproduction build
```

Use current committed `staging` state.

---

# 1. Deployed environments

Measure both:

```text
production:
https://starfieldoutposts.com/

staging/preproduction:
current Cloudflare Pages staging deployment
```

Record exact deployment/build identity where possible.

Do not assume production and staging headers/compression are identical.

---

# 2. Cold-load network measurement

Measure a genuinely cold load.

Clear/disable browser cache or use an equivalent fresh-cache method.

Record:

```text
request URL
resource type
status
transfer size
decoded/resource size
content-encoding
cache-control
etag / last-modified where relevant
cf-cache-status if present
age if present
vary headers
```

At minimum classify:

```text
HTML
main JS
CSS
fonts
reference-data assets
localized reference overlays
other generated JSON/data
icons/images
```

Report:

```text
total transferred bytes
total decoded bytes
number of requests
largest requests
largest localization-related requests
```

Prefer browser-network measurements for actual transfer.

Command-line header/size probes may supplement but must not substitute for real browser transfer measurements.

---

# 3. Warm-load measurement

Repeat after a normal reload with browser cache enabled.

Record:

```text
requests served from memory cache
requests served from disk cache
304 responses
fresh network transfers
total transferred bytes
```

Distinguish browser cache from Cloudflare edge cache.

The audit should answer:

> After the first visit, how much localization bandwidth is actually paid again?

---

# 4. Repeat-visit / cache lifetime behavior

Inspect cache policy for the major asset classes.

Determine whether hashed build assets are:

```text
immutable
long-lived
revalidated
short-lived
```

Inspect:

```text
Cache-Control
ETag
Last-Modified
Cloudflare cache status
asset filenames/content hashes
```

Identify any asset that is large but unnecessarily revalidated or redownloaded.

Do not change headers in this audit.

---

# 5. Compression behavior

Determine actual deployed compression for:

```text
main JS
CSS
catalogue/reference-data JSON
localized overlays
```

Record whether production serves:

```text
br
gzip
identity
```

when requested by a modern Chromium browser.

Compare observed transfer with prior local gzip/Brotli estimates.

If Cloudflare recompresses or serves different encodings, document it.

---

# 6. Localization loading architecture

Trace exactly how localization assets enter the current application.

For semantic catalogues determine:

- statically imported into the main JS bundle?
- separately emitted chunks?
- separately fetched JSON?
- tree-shaken or always retained?
- whether all locale catalogues are available before first render.

For localized reference overlays determine:

- statically bundled?
- individually fetched?
- fetched eagerly?
- fetched only when locale becomes active?
- loaded as part of manifest/reference bootstrap?
- cached independently?

Do not infer from file layout alone. Trace imports/runtime requests.

---

# 7. Byte attribution by locale

Estimate and, where possible, measure:

```text
baseline English-only localization cost
incremental semantic-catalogue cost per non-English locale
incremental reference-overlay cost per non-English locale
shared localization infrastructure cost
```

Create a per-locale table.

At minimum include:

```text
en-US
en-GB
fr-FR
de-DE
it-IT
ja-JP
pl-PL
pt-BR
zh-Hans
es-ES
```

Do not count shared runtime/library bytes multiple times.

---

# 8. First-load locale scenarios

Measure/trace at least these scenarios:

## A. Default English user

A new browser/session whose effective locale resolves to English.

Question:

> How many non-English localization bytes are transferred anyway?

## B. Non-English user

Use at least one Latin locale and one CJK locale.

Suggested:

```text
de-DE
ja-JP or zh-Hans
```

Question:

> Does first render already include everything, or is the active locale meaningfully different from English in transfer behavior?

## C. Manual locale switch

From English, switch to a non-English locale.

Record whether the switch triggers any new network requests.

Then switch to another non-English locale.

Question:

> Is locale switching currently zero-network because all locale data is already resident?

---

# 9. Reference-overlay scenarios

The generated localized reference overlays are likely the largest localization-specific asset group.

Investigate their actual runtime behavior carefully.

For each active locale determine:

- whether only the active overlay is fetched;
- whether all overlays are fetched;
- whether overlays are part of JS;
- whether overlays are one file or multiple files;
- whether active-locale switching causes an additional request;
- whether overlay caching survives reloads.

This finding is central to the locale-on-demand decision.

---

# 10. Browser memory is secondary

If easy to establish, note whether eager localization significantly increases JS heap/resident data.

Do not turn this into a memory audit.

Bandwidth and loading architecture are the primary questions.

Only report memory if evidence is straightforward.

---

# 11. Rendering/startup impact

Reconcile bandwidth findings with prior startup evidence.

The previous local warm startup was ~150–170 ms.

Do not recommend architectural complexity purely for startup if current startup remains fast.

If current deployed cold start is measured, distinguish:

```text
network wait
reference-data bootstrap
JS parse/compile
React render
```

A slow network transfer and a slow runtime are different problems.

---

# 12. Locale-on-demand candidate architectures

If evidence shows meaningful avoidable eager transfer, evaluate possible approaches without implementing them.

Consider at least:

## Option A — Dynamic-import semantic catalogues only

Example conceptually:

```text
en-US baseline bundled
other semantic catalogues loaded on demand
```

Assess:

- main bundle reduction;
- locale-switch async behavior;
- fallback/error behavior;
- type guarantees;
- catalogue completeness verification;
- preload of detected browser locale;
- impact on current synchronous `translate()` architecture.

## Option B — On-demand reference overlays only

If overlays are separable and materially larger than semantic catalogues, this may offer better complexity/benefit.

Assess:

- bootstrap sequencing;
- active-locale overlay fetch;
- locale switching;
- fallback to English/reference source names;
- integrity/manifest verification;
- cacheability.

## Option C — Both catalogues and overlays on demand

Assess total benefit and added complexity.

## Option D — Keep current eager architecture

This is a valid recommendation if real deployed transfer/caching makes lazy loading low-value.

Do not assume an optimization must be implemented.

---

# 13. English baseline question

Evaluate whether `en-US` should remain the always-available synchronous baseline if future on-demand loading is adopted.

Consider current architecture:

```text
MessageKey derives from en-US baseline
full-catalogue guarantees
fallback behavior
fatal/reference bootstrap behavior
synchronous rendering expectations
```

Do not recommend removing the baseline casually.

---

# 14. Browser-locale preload strategy

If locale-on-demand is justified, evaluate whether the detected locale should be requested **during bootstrap** rather than loading English first and then swapping.

Desired user behavior:

```text
French browser
→ load French localization before meaningful first render
→ avoid visible English flash
```

Assess:

- browser locale detection timing;
- automatic locale override behavior;
- localStorage preference behavior;
- fallback if locale chunk fails.

No implementation in this audit.

---

# 15. Manual locale-switch UX

If future locale loading becomes asynchronous, identify the desired UX.

Questions:

- Should the current locale remain visible until the new one is loaded?
- Should selector show a loading state?
- Is an inline error needed if locale asset fetch fails?
- Should failed locale switch leave the application fully usable in the previous locale?
- Should already-loaded locales remain cached in memory?

Recommend the simplest robust behavior.

---

# 16. Offline/reload resilience

Review implications of on-demand locale assets for:

```text
offline revisit
intermittent connection
cached app shell
locale switch after network loss
```

Do not over-engineer service-worker behavior if none exists.

Just identify whether current eager bundling gives resilience that would be lost.

---

# 17. Integrity/security compatibility

The project has mature reference-data integrity checks.

If localized reference overlays are moved or loaded differently, assess compatibility with:

```text
reference manifest
hash verification
asset-size limits
content-type checks
build/dataset identity
fatal-stop behavior
```

Do not weaken integrity guarantees for bandwidth savings.

---

# 18. Deployment/CDN implications

Assess how Cloudflare Pages would serve dynamically split locale assets.

Consider:

```text
hashed filenames
immutable caching
Brotli/gzip
edge caching
first-request latency
cross-deployment cache invalidation
```

No Cloudflare configuration changes in this audit.

---

# 19. Quantify potential savings

For each viable candidate architecture estimate:

```text
cold English transfer reduction
cold non-English transfer reduction
additional request count
locale-switch transfer cost
implementation complexity
regression surface
```

Use observed deployed bytes wherever possible.

Clearly distinguish:

```text
measured
derived
estimated
```

Do not quote local raw source sizes as if they were deployed transfer savings.

---

# 20. Decision framework

End with one of these conclusions:

```text
A. Keep eager loading; deployed bandwidth cost is too small to justify complexity.
B. Load reference overlays on demand; semantic catalogues can remain eager.
C. Load semantic catalogues on demand; overlays already behave efficiently.
D. Load both catalogues and overlays on demand.
E. Further measurement is required before a decision.
```

You may recommend a phased path.

Do not rank solutions by aesthetics; ground the recommendation in measured transfer and architectural risk.

---

# 21. Threshold reasoning

Do not invent a rigid universal performance budget.

Instead discuss practical significance in context:

- current app is static and relatively small;
- many users may be on broadband, but mobile/slow links matter;
- first load happens less often than repeat cached visits;
- localization may be a substantial fraction of app bytes even if absolute bytes are modest;
- complexity carries maintenance/accessibility/error-state cost.

Explain the tradeoff.

---

# 22. Durable report

Create:

```text
docs/audits/DEPLOYED-BANDWIDTH-AND-LOCALE-LOADING-REVIEW.md
```

or an equally clear repository-consistent name.

Include:

```text
audit date
branch
production/staging deployment identities
measurement environment
cold-load request table
warm-load request table
cache-policy findings
compression findings
localization-loading architecture
per-locale byte attribution
English/non-English/switch scenarios
reference-overlay behavior
candidate architectures
integrity/deployment implications
estimated savings
decision/recommendation
limitations
```

Do not use temporary numbered task identifiers in durable documentation.

---

# 23. Backlog handling

This is read-only.

Do not modify:

```text
docs/BACKLOG.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
runtime code
localization code
build configuration
Cloudflare headers
tests
```

The only tracked change should be the audit report.

Later implementation work can reconcile backlog/docs once a decision is accepted.

---

# 24. External/live evidence

This audit **requires live deployed evidence**.

Use:

- production/staging browser network inspection;
- response headers;
- current Cloudflare-served assets.

Do not rely only on local `dist/`.

Where browser tooling cannot expose exact transfer size, use supplementary HTTP probes and state the limitation.

Do not modify production or staging.

---

# 25. Verification

Run at minimum:

```text
git diff --check
```

Also verify:

- only the audit report is tracked as changed;
- no build/runtime/localization files changed;
- measured values are labeled as measured;
- estimates are labeled as estimates;
- production and staging findings are not conflated;
- local compression estimates are not presented as deployed transfer without evidence.

A full test/build suite is not required for this read-only audit unless needed to establish a fact.

---

# 26. Stop conditions

Stop and report rather than recommending an implementation if:

- actual deployed transfer cannot be measured reliably;
- production/staging build identity is unclear;
- localization byte attribution cannot distinguish bundled vs separately fetched assets;
- Cloudflare/browser caching behavior is ambiguous;
- candidate savings are too uncertain to justify architectural change;
- on-demand loading would weaken current integrity/fallback guarantees without a clear replacement.

The audit should still complete with an explicit “further measurement required” conclusion where appropriate.

---

# 27. Expected Codex summary

Report:

1. branch used;
2. audit report path;
3. production/staging deployment identities;
4. cold-load total transfer;
5. warm-load total transfer;
6. actual compression behavior;
7. browser-cache behavior;
8. Cloudflare cache behavior;
9. semantic-catalogue loading behavior;
10. reference-overlay loading behavior;
11. localization byte attribution;
12. English first-load localization cost;
13. non-English first-load localization cost;
14. locale-switch network behavior;
15. candidate locale-on-demand architectures;
16. estimated transfer savings for each;
17. integrity/deployment risks;
18. recommendation A/B/C/D/E;
19. implementation sequence if any;
20. limitations/stop conditions;
21. checks run;
22. suggested commit message;
23. confirmation no runtime/config/localization code changed;
24. confirmation no commit or push was performed.

Suggested commit message:

`docs: audit deployed localization bandwidth`

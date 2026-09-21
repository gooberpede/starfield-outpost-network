# Codex Implementation Brief — Polish Locale Contracts and Tooling Extension

## Objective

Implement the first Polish onboarding batch by extending the existing localization contracts, review tooling, validation, and regression coverage for:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This task prepares the repository to produce and review Polish localization artifacts safely.

It must **not** expose Polish in the running application yet.

Do not create the final Polish semantic catalogue, terminology-value CSV, glossary, reference overlay, fauna evidence, runtime selector entry, browser mapping, search behavior, collation behavior, or shortcut speech in this task.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Follow the settled plan in:

```text
docs/audits/POLISH-LOCALE-ONBOARDING-PLAN.md
```

Relevant settled findings include:

```text
pl-PL -> pl -> utf-8 -> full catalogue
```

and:

```text
3,561 canonical entities
4,818 qualified provenance rows
0 unresolved

37 terminology evidence rows
33 textual evidence rows
4 intended absences
0 unresolved
```

No new localization framework is required.

The current architecture is to be extended, not replaced.

---

# Scope

This batch should establish:

1. Polish locale metadata in staged/inactive form;
2. deterministic Polish artifact naming and routing;
3. Polish review-tool compatibility;
4. Polish glossary/constraint plumbing without yet supplying the actual glossary values;
5. Polish accidental-English detection support;
6. Polish plural-structure regression coverage;
7. parameterized/shared test coverage sufficient to prevent Polish being omitted from later stages;
8. fail-closed behavior when required Polish artifacts do not yet exist.

The locale must remain unavailable at runtime.

---

# 1. Add staged Polish locale metadata

Update:

```text
reference-source/localization-locale-metadata.json
```

Add a Polish full-locale contract equivalent to:

```json
{
  "trackerLocale": "pl-PL",
  "bethesdaToken": "pl",
  "stringTableEncoding": "utf-8",
  "catalogueRole": "full",
  "runtimeAvailable": false
}
```

Use the repository’s existing metadata schema exactly.

Do not add fields merely because they might be useful later.

Requirements:

- `pl-PL` is recognized by tooling;
- Bethesda token resolves to `pl`;
- decoding is strict UTF-8;
- catalogue role is full;
- runtime availability remains false.

Do not add Polish to any runtime-visible selector or `SupportedLocale` registry in this batch unless the repository separates tooling locale IDs from runtime locale IDs and requires a non-exposed compile-time entry. If such a seam exists, preserve the existing staging pattern used for earlier locales.

---

# 2. Artifact naming and path derivation

Ensure the generalized tooling can derive Polish artifact paths deterministically.

Expected later paths include:

```text
src/localization/reviewDrafts/pl-PL.ts
docs/localization/pl-PL-review.csv
docs/localization/pl-PL-deepl.xliff
src/localization/locales/pl-PL.ts
reference-source/official-terminology-values-pl-PL.csv
reference-source/localized-fauna-evidence-pl-PL.json
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

This task should make path derivation/routing recognize these names where appropriate.

Do not create empty placeholder artifacts merely to satisfy routing.

Missing required Polish artifacts should fail with a clear staged/incomplete-locale diagnostic rather than silently falling back.

---

# 3. Review-draft routing

Extend the existing explicit review-routing mechanism to recognize Polish as an onboarding locale.

Do not create:

```text
src/localization/reviewDrafts/pl-PL.ts
```

yet unless the current tool contract strictly requires the module to exist at this stage.

If the tooling expects a review draft only when review generation is invoked, prefer staged failure such as:

> Polish review draft has not been created yet.

The goal is to make future Polish routing ordinary and deterministic, not to generate translation content early.

---

# 4. Glossary and review-constraint plumbing

The Polish audit settled that the existing three-class glossary model is sufficient:

1. official Bethesda terminology;
2. tracker-owned preferred terminology;
3. context-sensitive/inflected concepts.

Extend locale-keyed review constraint structures so Polish can later supply:

- phrase constraints;
- key-scoped constraints;
- semantic-concept constraints;
- approved contextual variants.

Do not populate the actual Polish glossary or final Polish terminology values in this task.

The constraint infrastructure must support inflected/contextual Polish without requiring one invariant literal string in every grammatical position.

Do not create a Polish morphology engine.

Do not enumerate theoretical case forms.

---

# 5. Accidental-English detector support

Extend the accidental-English source-intersection detector for Polish.

Requirements:

- Polish participates in the detector;
- baseline behavior is strict;
- invariant/protected technical vocabulary remains handled by the existing shared allowlist;
- Polish-specific allowlisting must be narrow and evidence-driven;
- do not pre-allow broad English vocabulary.

The audit identified likely legitimate shared/technical items such as:

```text
system
status
Starfield
X-Tech
JSON
FormID
file extensions / protected tokens
```

Do not blindly add all of these as Polish-specific exemptions if existing invariant handling already covers them.

Prefer:

```text
shared invariant handling
+
small Polish-only false-positive allowlist if demonstrably needed
```

Add tests proving ordinary copied English source text still fails.

---

# 6. Plural contract: preserve current engine

Do not add `few`, `many`, or richer ICU syntax.

The settled Polish policy for the current catalogue is:

- the formatter remains `one / other`;
- all four current Polish pluralized keys will later use natural count-neutral wording if needed;
- if editorial review cannot produce natural output, Polish onboarding stops and richer plural support is reconsidered separately.

The four current pluralized semantic keys are:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

This task should add regression coverage proving the current formatter/validator behavior is understood for Polish.

At minimum test representative counts:

```text
1
2
5
12
22
25
```

The tests should establish:

- `Intl.PluralRules('pl-PL')` exposes Polish categories as expected;
- the current application formatter still selects only the existing `one`/`other` syntax;
- Polish catalogue validation does not incorrectly require unsupported `few`/`many` branches;
- later Polish catalogue rows may legally use count-neutral text across branches;
- malformed plural syntax still fails.

Do not add fake Polish final translations solely for tests unless the existing fixture style requires localized fixture strings.

If fixture text is required, use clearly test-only neutral examples and keep them out of runtime catalogs.

---

# 7. Placeholder-safety test coverage

Polish grammar makes opaque placeholder insertion a high-risk area.

Add or extend tests so future Polish semantic review preserves exact placeholder names and structure for representative high-risk families.

Cover at least examples involving:

```text
{item}
{resource}
{product}
{outpost}
{system}
{body}
{skill}
{name}
{previousName}
{count}
```

The purpose is structural integrity, not grammar generation.

Tests should continue to reject:

- missing placeholders;
- renamed placeholders;
- duplicated required placeholders where invalid;
- mutated protected tokens;
- malformed plural parameters.

Do not encode grammatical cases into placeholder names.

---

# 8. Strict UTF-8 verification

Ensure Polish is covered by the generalized string-table encoding contract.

Requirements:

- `pl` decodes only as strict UTF-8;
- malformed UTF-8 fails;
- no Windows-1252 fallback;
- no byte sniffing;
- no best-effort replacement decoding.

If current tests already parameterize this from locale metadata, extend the shared table rather than copying a Polish-only suite.

Do not add a new decoder.

---

# 9. Metadata-driven terminology/readiness behavior

Polish is not yet expected to have:

```text
reference-source/official-terminology-values-pl-PL.csv
```

in this batch.

Tooling should distinguish:

```text
locale contract exists
```

from:

```text
terminology artifact exists
```

and fail clearly when terminology generation/verification is invoked too early.

Do not weaken terminology verification globally to accommodate staging.

Do not create an empty terminology file.

---

# 10. Metadata-driven reference-overlay behavior

Likewise, Polish is not yet expected to have:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

in this batch.

Ensure the generalized build/verify tooling can resolve `pl-PL` metadata and derive these target names, while failing clearly if outputs have not yet been generated.

Do not write the overlay now.

Do not regenerate canonical provenance.

---

# 11. Fauna eligibility/plumbing

Verify that the fauna evidence pipeline will treat Polish as an eligible locale once the staged metadata exists.

Expected later evidence path:

```text
reference-source/localized-fauna-evidence-pl-PL.json
```

Do not create the evidence file yet.

Do not generate or commit prediction output unless the current architecture requires a locale-recognition fixture.

No Polish-specific fauna composition rule should be introduced in this batch.

---

# 12. Parameterized locale tables

Audit tests and helper tables that explicitly enumerate onboarding/full locales.

Extend or centralize only where needed to prevent Polish from being omitted from:

- metadata parity;
- artifact naming;
- review routing;
- XLIFF/review package eligibility;
- placeholder validation;
- accidental-English detection;
- encoding tests;
- terminology routing;
- reference-overlay routing;
- fauna evidence routing;
- locale closure readiness.

Prefer shared tables/parameterization where the repository already uses them.

Do not introduce runtime discovery or a plugin framework.

Do not refactor unrelated locale code solely for elegance.

---

# 13. Runtime must remain inactive

This is a hard requirement.

After this task:

- Polish must not appear in the language selector;
- automatic browser resolution must not select Polish;
- `document.lang` must not switch to Polish;
- runtime semantic lookup must not expose Polish;
- no Polish search behavior should run;
- no Polish collator should be wired into runtime consumers;
- no Polish shortcut speech should be active.

If current metadata consumers could accidentally expose any locale with a metadata entry, adjust the staging boundary so `runtimeAvailable: false` is authoritative.

Add regression coverage for this.

---

# 14. Do not implement later Polish policies yet

The following are settled for later stages but are out of scope now:

## Search

Later:

```text
NFD diacritic folding
+
ł -> l
```

with exact Polish spelling ranked first.

Do not implement it now.

## Collation

Later use the shared Polish `Intl.Collator`.

Do not wire it into runtime now.

## Browser mapping

Later intended policy:

```text
pl
pl-PL
pl-PL-*
    -> pl-PL

explicit pl-UA / pl-LT / other pl-*
    -> continue to next preference
```

Do not implement it now.

## Selector

Later label:

```text
Polski (Polska)
```

Do not add it now.

## Shortcut speech

Later initial policy:

```text
Control
Alt
Shift
plus
Strzałka w górę
Strzałka w dół
Strzałka w lewo
Strzałka w prawo
```

Do not add it now.

---

# 15. No semantic translation content yet

Do not create:

```text
src/localization/reviewDrafts/pl-PL.ts
src/localization/locales/pl-PL.ts
docs/localization/pl-PL-review.csv
docs/localization/pl-PL-deepl.xliff
```

unless one of those is strictly required by the current generalized tooling contract merely to register a staged locale.

If a stub is technically unavoidable, stop and report why before inventing translation content.

Preferred result: contracts/tooling know Polish exists, but translation artifacts do not yet exist.

---

# 16. No terminology/glossary content yet

Do not create:

```text
docs/localization/POLISH-GLOSSARY.md
reference-source/official-terminology-values-pl-PL.csv
```

Those belong to the next implementation stage.

The only work here is ensuring the current generalized machinery can accept them later.

---

# 17. No durable roadmap/profile closure yet

Do not mark Polish Supported.

Do not add a final Polish Locale Profile to `LOCALE-ONBOARDING.md`.

If current durable documentation needs a tiny staged-status note because metadata now exists, keep it minimal and factual:

```text
Polish onboarding in progress; runtime inactive
```

Only make such a doc change if current documentation would otherwise become materially false.

Do not update selector-order or post-localization cleanup decisions.

---

# 18. Tests

Run the relevant automated suite.

At minimum:

```text
npm test
npm run test:components
npm run localization:provenance:test
npm run localization:terminology:verify
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

If the repository has more focused localization/review-package commands, run those too.

Expected behavior:

- existing supported locales remain unchanged;
- Polish metadata/tooling tests pass;
- Polish remains runtime-inactive;
- missing later Polish artifacts fail clearly only when those later-stage commands are invoked;
- no existing locale artifacts drift.

Do not weaken existing tests to make staging pass.

---

# 19. Scope discipline

Allowed tracked changes should be limited to areas such as:

```text
reference-source/localization-locale-metadata.json
scripts/localization/...
src/localization/reviewPackage.ts
localization tooling helpers
tests/...
package/test routing only if required
```

Potentially a very small durable documentation update only if necessary.

Unexpected changes to:

```text
src/localization/locales/*
src/localization/generated/*
src/ui/*
CSS
runtime selector behavior
reference corpora
persistence/domain code
```

should be treated as scope creep and reverted unless strictly required by the established staging architecture.

---

# 20. Explicitly out of scope

Do not:

- translate Polish UI text;
- create the Polish glossary;
- create official Polish terminology values;
- generate review CSV/XLIFF;
- call DeepL;
- adjudicate translations;
- generate the Polish reference overlay;
- collect fauna evidence;
- activate Polish runtime support;
- add Polish browser mapping;
- add Polish search folding;
- add Polish collation consumers;
- add Polish selector label;
- add Polish shortcut speech;
- modify CSS or geometry;
- modify persistence/schema;
- perform bundle optimization;
- reorder locales;
- move XLIFF files;
- begin Simplified Chinese work.

---

# 21. Completion criteria

This batch is complete when:

- `pl-PL` is a valid staged tooling locale;
- `pl` resolves to strict UTF-8;
- deterministic Polish artifact paths are recognized;
- Polish review/constraint routing is ready;
- accidental-English detection supports Polish safely;
- plural regression coverage reflects the accepted `one/other` strategy;
- placeholder structural tests cover Polish onboarding risk;
- terminology/reference/fauna tooling can derive Polish paths and fail clearly before artifacts exist;
- Polish remains completely hidden from runtime;
- all existing locales continue to pass;
- no semantic/catalogue/overlay artifacts have been prematurely created.

---

# Completion response

Return:

1. branch;
2. files changed;
3. metadata entry added;
4. confirmation `runtimeAvailable` remains false;
5. artifact-path/routing changes;
6. review-routing changes;
7. glossary/constraint-plumbing changes;
8. accidental-English detector changes;
9. Polish-specific allowlist additions, if any, with justification;
10. plural-regression coverage;
11. representative plural counts tested;
12. placeholder-safety coverage;
13. UTF-8 verification;
14. terminology staged-failure behavior;
15. reference-overlay staged-failure behavior;
16. fauna staged-routing behavior;
17. parameterized/shared test improvements;
18. confirmation Polish is absent from runtime selector;
19. confirmation browser mapping unchanged;
20. confirmation search unchanged;
21. confirmation collation runtime unchanged;
22. confirmation shortcut speech unchanged;
23. confirmation no Polish semantic catalogue was created;
24. confirmation no Polish glossary was created;
25. confirmation no terminology-value CSV was created;
26. confirmation no Polish reference overlay was created;
27. automated verification results;
28. `git diff --check` result;
29. deviations from brief;
30. recommended next implementation stage;
31. suggested commit message;
32. confirmation no commit/push occurred.

The suggested commit message should describe the work and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.

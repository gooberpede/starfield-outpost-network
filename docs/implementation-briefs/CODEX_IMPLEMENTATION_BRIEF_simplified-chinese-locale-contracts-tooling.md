# Codex Implementation Brief — Simplified Chinese Locale Contracts and Tooling Extension

## Objective

Implement the first Simplified Chinese onboarding batch by extending the existing localization contracts, review tooling, validation, and regression coverage for:

```text
Tracker locale:   zh-Hans
Bethesda token:   zhhans
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This task prepares the repository to produce and review Simplified Chinese localization artifacts safely.

It must **not** expose Simplified Chinese in the running application yet.

Do not create the final Simplified Chinese semantic catalogue, terminology-value CSV, glossary, reference overlay, fauna evidence, runtime selector entry, browser mapping, search behavior, collation behavior, shortcut speech, or Chinese CSS/font-stack changes in this task.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Follow the settled plan in:

```text
docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md
```

Relevant settled findings include:

```text
zh-Hans -> zhhans -> utf-8 -> full catalogue
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

# Settled policy before implementation

Treat these decisions as fixed for later stages:

## Tracker locale

Use:

```text
zh-Hans
```

not:

```text
zh-CN
```

The locale is script-specific and does not claim one country.

## Traditional Chinese boundary

Simplified Chinese support does **not** imply support for:

```text
zh-Hant
zh-TW
zh-HK
zh-MO
```

Do not add Simplified↔Traditional conversion or aliasing.

## Selector label later

Use:

```text
简体中文
```

Do not append `（中国）`.

## Browser policy later

Later runtime mapping should be:

```text
zh          -> zh-Hans
zh-Hans     -> zh-Hans
zh-Hans-*   -> zh-Hans
zh-CN       -> zh-Hans
zh-SG       -> zh-Hans
```

Explicit Traditional tags must continue to later preferences.

Do not implement browser mapping in this parcel.

## Search later

V1 search should remain conservative:

```text
exact/prefix/substring Simplified Chinese
canonical English aliases
abbreviations
existing curated alternates
```

No pinyin, fuzzy search, Simplified↔Traditional conversion, punctuation stripping, broad width folding, or transliteration framework.

Do not implement search in this parcel.

## Typography later

An explicit Simplified Chinese system-font stack is approved in principle, but **do not add CSS in this parcel**.

## Fauna later

First-party screenshot evidence is required before runtime activation to prove separator fidelity, but there is no quota and no target hunting.

## DeepL later

Use the existing:

```text
independent Codex draft
-> pre-DeepL review
-> one XLIFF 1.2 handoff
-> DeepL
-> neutral adjudication
```

Before the real handoff, a small disposable XLIFF round trip may be used to verify DeepL placeholder/tag behavior.

---

# Scope

This batch should establish:

1. staged Simplified Chinese locale metadata;
2. deterministic Simplified Chinese artifact naming and routing;
3. Simplified Chinese review-tool compatibility;
4. locale-keyed glossary/constraint plumbing without actual glossary values yet;
5. hardened accidental-English detection suitable for Han + Latin mixed text;
6. Simplified Chinese plural-structure regression coverage;
7. strict UTF-8 coverage;
8. parameterized/shared tests preventing omission from later stages;
9. fail-closed behavior when required Simplified Chinese artifacts do not yet exist.

The locale must remain runtime-inactive.

---

# 1. Add staged Simplified Chinese locale metadata

Update:

```text
reference-source/localization-locale-metadata.json
```

Add a full-locale contract equivalent to:

```json
{
  "trackerLocale": "zh-Hans",
  "bethesdaToken": "zhhans",
  "stringTableEncoding": "utf-8",
  "catalogueRole": "full",
  "runtimeAvailable": false
}
```

Use the repository’s existing metadata schema exactly.

Requirements:

- `zh-Hans` is recognized by tooling;
- Bethesda token resolves to `zhhans`;
- decoding is strict UTF-8;
- catalogue role is full;
- runtime availability remains false.

Do not add fields merely because they might be useful later.

---

# 2. Artifact naming and path derivation

Ensure the generalized tooling can derive Simplified Chinese artifact paths deterministically.

Expected later paths include:

```text
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
docs/localization/zh-Hans-deepl.xliff
src/localization/locales/zh-Hans.ts
reference-source/official-terminology-values-zh-Hans.csv
reference-source/localized-fauna-evidence-zh-Hans.json
src/localization/generated/zh-Hans-reference-names.ts
reference-source/localized-reference-names-zh-Hans-manifest.json
```

This task should make path derivation/routing recognize these names where appropriate.

Do not create empty placeholder artifacts merely to satisfy routing.

Missing required artifacts should fail with a clear staged/incomplete-locale diagnostic rather than silently falling back.

---

# 3. Review-draft routing

Extend the existing explicit review-routing mechanism to recognize Simplified Chinese as an onboarding locale.

Do not create:

```text
src/localization/reviewDrafts/zh-Hans.ts
```

yet unless the current tool contract strictly requires it at this stage.

Preferred behavior:

```text
Simplified Chinese review draft has not been created yet.
```

with the deterministic expected path.

The goal is to make later Chinese routing ordinary and deterministic without creating translation content prematurely.

---

# 4. Glossary and review-constraint plumbing

The Simplified Chinese audit settled that the existing three-class glossary model is sufficient:

1. official Bethesda terminology;
2. tracker-owned preferred terminology;
3. context-sensitive concepts.

Extend locale-keyed review constraint structures so Simplified Chinese can later supply:

- phrase constraints;
- key-scoped constraints;
- semantic-concept constraints;
- approved contextual variants.

Do not populate actual Chinese glossary values or final terminology values in this task.

Do not create a Chinese grammar engine.

Do not add segmentation/transliteration machinery.

---

# 5. Harden accidental-English detection for Simplified Chinese

This is the one narrow generalized validator change explicitly recommended by the audit.

Current behavior is insufficient because:

- unknown/unregistered locales can bypass residue checks;
- Unicode-word grouping can treat adjacent Han + Latin text as a single token;
- ordinary English residue can therefore hide directly next to Chinese characters.

Implement a bounded Simplified-Chinese residue check.

## Required behavior

After placeholders and protected/invariant tokens are removed/ignored according to existing rules:

1. scan translated candidate text for ordinary ASCII letter runs:

```regex
[A-Za-z]+
```

2. compare those runs against meaningful English-source tokens;
3. flag copied English residue even when the Latin run is directly adjacent to Han characters;
4. preserve explicitly allowed technical/product tokens.

The goal is to detect things like:

```text
资源Validation状态
```

where `Validation` is accidental residue.

Do not create a generic language detector.

Do not reject every Latin sequence in Chinese.

Chinese legitimately contains mixed Latin/technical text.

---

# 6. Protected/invariant token handling

Shared protected/invariant handling should continue to cover legitimate items such as:

```text
JSON
FormID
X-Tech
Starfield
HTTP/HTTPS
file extensions
shortcut key names
placeholders
IDs
code-like syntax
```

Important nuance:

Official Chinese may later use:

```text
星空
```

for localized references to the game title, while some tracker-owned product/technical contexts intentionally preserve:

```text
Starfield
```

Do not settle exact per-key branding behavior in this parcel.

The terminology/glossary stage will define those contexts.

The accidental-English detector must not make that later distinction impossible.

---

# 7. Chinese prose presence check

The audit recommended that a complete English fallback must not pass merely because the ASCII-run detector is narrow.

Add a bounded quality guard for full Simplified Chinese review candidates.

For ordinary prose/message keys:

- a full English source copied unchanged into the Chinese draft must fail;
- a candidate consisting only of protected technical tokens may remain valid where the source itself is technical/invariant;
- mixed Chinese/Latin strings should pass when the Latin material is allowed and genuine localized content is present.

Do not require Han characters for every single key if the key is intentionally:

- a brand token;
- a keycap;
- an acronym;
- a technical identifier;
- an invariant syntax fragment.

Prefer existing metadata/context to crude global rules.

---

# 8. Accidental-English detector tests

Add tests covering at least:

## Must fail

```text
ordinary English copied as whole target
English residue separated by spaces
English residue directly adjacent to Han
English residue between Han segments
```

Examples may be synthetic test-only strings.

## Must pass

```text
合法中文JSON文本
X-Tech
FormID
Starfield
Ctrl / Alt / Shift where context permits
file extensions / code-like tokens
```

Do not broaden the global allowlist preemptively.

Any Chinese-specific allowlist addition must be minimal and justified by a real false positive.

---

# 9. Plural contract: preserve current engine

Do not add new plural categories or formatting syntax.

Simplified Chinese uses only:

```text
other
```

under `Intl.PluralRules('zh-Hans')`.

The current application still structurally requires the established:

```text
one / other
```

message syntax for the four pluralized keys:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

Later Chinese wording may use identical visible text in both branches.

This task should add regression coverage proving:

- `Intl.PluralRules('zh-Hans')` selects only `other` for representative counts;
- the application formatter remains unchanged;
- Chinese catalogue validation still accepts the existing `one / other` syntax;
- identical Chinese branch text is legal;
- unsupported syntax remains invalid.

Representative counts:

```text
0
1
2
10
```

Do not create final Chinese translations solely for these tests.

Use test-only neutral fixtures if required.

---

# 10. Placeholder structural safety

Extend tests so future Simplified Chinese semantic review preserves exact placeholder identities.

Cover representative placeholders including:

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
{itemList}
{contents}
{destination}
```

Tests should continue to reject:

- missing placeholders;
- renamed placeholders;
- unknown/replacement placeholders;
- malformed plural parameters;
- protected-token mutation.

Legitimate placeholder repetition remains allowed under the existing global policy.

Do not encode Chinese grammar/classifiers into placeholder names.

---

# 11. Strict UTF-8 verification

Ensure Simplified Chinese participates in the generalized string-table encoding contract.

Requirements:

```text
zhhans -> strict UTF-8
zh-Hans -> strict UTF-8
```

Malformed UTF-8 must fail.

No:

- Windows-1252 fallback;
- byte sniffing;
- replacement decoding;
- best-effort decoding.

If encoding tests are metadata-driven, extend shared tables rather than copying suites.

Do not add a new decoder.

---

# 12. BCP-47 / locale canonicalization coverage

Add tooling-level tests confirming:

```text
Intl.getCanonicalLocales('zh-Hans') -> zh-Hans
```

and that the tracker artifact/locale identity remains exactly:

```text
zh-Hans
```

Do not substitute:

```text
zh-CN
```

inside repository artifacts.

Later DeepL import may need BCP-47-equivalent canonicalization if the service returns a different casing/spelling, but do **not** weaken locale validation now.

---

# 13. Metadata-driven terminology staging

Simplified Chinese is not yet expected to have:

```text
reference-source/official-terminology-values-zh-Hans.csv
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

and fail clearly when terminology verification/generation is invoked before that artifact exists.

Do not weaken global verification.

Do not create an empty terminology CSV.

---

# 14. Metadata-driven reference-overlay staging

Likewise, do not create yet:

```text
src/localization/generated/zh-Hans-reference-names.ts
reference-source/localized-reference-names-zh-Hans-manifest.json
```

Ensure generalized reference tooling can:

- resolve `zh-Hans` metadata;
- resolve `zhhans`;
- derive deterministic output paths;
- fail clearly while outputs are absent.

Do not write the overlay.

Do not regenerate canonical provenance.

---

# 15. Fauna eligibility/plumbing

Verify that the fauna evidence pipeline will recognize Simplified Chinese once staged metadata exists.

Expected later path:

```text
reference-source/localized-fauna-evidence-zh-Hans.json
```

Do not create it yet.

Do not hard-code a Chinese separator or composition rule in this parcel.

The later evidence stage must prove whether official rendered fauna use:

```text
U+0020 spaces
no spaces
another separator behavior
```

---

# 16. Search policy remains unimplemented

Do not modify runtime search in this parcel.

The settled V1 policy for later implementation is:

```text
exact/prefix/substring Simplified Chinese
canonical English aliases
abbreviations
existing curated alternates
```

Explicitly out of scope:

- pinyin;
- fuzzy matching;
- Simplified/Traditional conversion;
- broad NFKC/width folding;
- punctuation stripping;
- removal of meaningful ASCII spaces.

Only add test/planning hooks where current tooling requires locale registration.

---

# 17. Simplified/Traditional boundary tests at tooling level

Do not implement browser mapping yet.

However, locale metadata/tests should preserve the conceptual boundary:

```text
zh-Hans != zh-Hant
```

Do not alias or canonicalize `zh-Hant` into `zh-Hans`.

Do not add Traditional Chinese artifacts.

---

# 18. No typography/CSS changes yet

Do not add:

```css
:lang(zh-Hans)
```

font rules in this parcel.

The later runtime-integration stage is responsible for the approved explicit Simplified Chinese system-font stack.

Do not change:

- font family;
- line-height;
- letter-spacing;
- text-transform;
- line-breaking;
- geometry.

This parcel is tooling/contracts only.

---

# 19. No line-breaking changes yet

Do not modify:

```text
word-break
overflow-wrap
line-break
white-space
```

in this parcel.

Default browser CJK line breaking remains the current baseline until real Chinese catalogue content is rendered.

---

# 20. No punctuation/spacing transformation logic

Do not add automatic Chinese punctuation conversion.

The later semantic/glossary/editorial stages will use Chinese punctuation for tracker-authored prose.

Official Bethesda names must remain literal.

Do not normalize:

- ASCII spaces;
- hyphens;
- Roman numerals;
- square brackets;
- mixed Han/Latin text.

---

# 21. Parameterized locale tables

Audit tests/helpers that explicitly enumerate full/onboarding locales.

Extend or centralize only where needed to prevent Simplified Chinese from being omitted from:

- metadata parity;
- artifact naming;
- review routing;
- XLIFF/review-package eligibility;
- accidental-English validation;
- plural validation;
- placeholder validation;
- encoding tests;
- terminology routing;
- reference-overlay routing;
- fauna evidence routing;
- locale-closure readiness.

Prefer existing shared parameterization.

Do not introduce runtime discovery or a plugin framework.

Do not refactor unrelated locale code merely for elegance.

---

# 22. Runtime must remain inactive

This is a hard requirement.

After this task:

- Simplified Chinese must not appear in the language selector;
- automatic browser resolution must not select Simplified Chinese;
- `document.lang` must not switch to `zh-Hans`;
- runtime semantic lookup must not expose Chinese;
- Chinese reference names must not be registered;
- Chinese search/collation must not run;
- Chinese shortcut speech must not be active;
- no Chinese font stack should be active.

If metadata consumers could accidentally expose any staged locale, ensure:

```text
runtimeAvailable: false
```

remains authoritative.

Add regression coverage for this.

---

# 23. No semantic translation artifacts yet

Do not create:

```text
src/localization/reviewDrafts/zh-Hans.ts
src/localization/locales/zh-Hans.ts
docs/localization/zh-Hans-review.csv
docs/localization/zh-Hans-deepl.xliff
```

Preferred result:

> tooling knows Simplified Chinese exists, but semantic translation artifacts do not yet exist.

If a stub becomes technically unavoidable, stop and report why before inventing content.

---

# 24. No terminology/glossary content yet

Do not create:

```text
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
reference-source/official-terminology-values-zh-Hans.csv
```

Those belong to the next implementation stage.

Only make the current generalized machinery ready to accept them.

---

# 25. No durable support profile yet

Do not mark Simplified Chinese Supported.

Do not add a final locale profile.

If current durable documentation becomes materially false because staged metadata exists, a minimal factual note is acceptable:

```text
Simplified Chinese onboarding in progress; runtime inactive
```

Only do this if needed.

Do not perform final locale-selector ordering.

Do not perform XLIFF cleanup.

Do not perform the post-localization bundle review yet.

---

# 26. Tests

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

Run focused localization/review-package tests as applicable.

Expected behavior:

- existing supported locales remain unchanged;
- Simplified Chinese metadata/tooling tests pass;
- `zh-Hans` remains runtime-inactive;
- missing later Chinese artifacts fail clearly only when later-stage commands are invoked;
- accidental-English validation catches Han-adjacent English residue;
- no existing locale artifacts drift.

Do not weaken tests merely to make staging pass.

---

# 27. Scope discipline

Allowed tracked changes should be limited to areas such as:

```text
reference-source/localization-locale-metadata.json
scripts/localization/...
src/localization/reviewPackage.ts
localization tooling helpers
tests/...
package/test routing only if required
```

Potentially a tiny durable doc update only if necessary.

Unexpected changes to:

```text
src/localization/locales/*
src/localization/generated/*
src/ui/*
CSS
runtime locale registry
browser resolver
search
persistence/domain code
```

should be treated as scope creep.

---

# 28. Explicitly out of scope

Do not:

- translate Simplified Chinese UI text;
- create the Chinese glossary;
- create official Chinese terminology values;
- generate review CSV/XLIFF;
- call DeepL;
- run the disposable DeepL protocol test;
- adjudicate translations;
- generate the Chinese reference overlay;
- collect fauna evidence;
- activate Chinese runtime support;
- add Chinese browser mapping;
- add Chinese search behavior;
- add Chinese collation consumers;
- add Chinese selector label;
- add Chinese shortcut speech;
- add Chinese font CSS;
- change line breaking;
- change UI geometry;
- modify persistence/schema;
- reorder locales;
- move XLIFF files;
- optimize bundle.

---

# 29. Completion criteria

This batch is complete when:

- `zh-Hans` is a valid staged tooling locale;
- `zhhans` resolves to strict UTF-8;
- deterministic Simplified Chinese artifact paths are recognized;
- review/constraint routing is ready;
- accidental-English detection meaningfully handles Chinese + Latin mixed text;
- whole English fallback cannot silently pass;
- plural regression coverage reflects Chinese `other` behavior while preserving `one / other` catalogue syntax;
- placeholder structural coverage is intact;
- terminology/reference/fauna tooling derives Chinese paths and fails clearly while artifacts are absent;
- Simplified Chinese remains completely hidden from runtime;
- all existing locales continue to pass;
- no semantic/terminology/reference artifacts have been prematurely created.

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
9. Han-adjacent English-residue behavior;
10. full-English-fallback behavior;
11. Chinese-specific allowlist additions, if any, with justification;
12. plural-regression coverage;
13. representative plural counts tested;
14. placeholder-safety coverage;
15. UTF-8 verification;
16. BCP-47/canonical locale verification;
17. terminology staged-failure behavior;
18. reference-overlay staged-failure behavior;
19. fauna staged-routing behavior;
20. parameterized/shared test improvements;
21. confirmation Simplified Chinese is absent from runtime selector;
22. confirmation browser mapping unchanged;
23. confirmation search unchanged;
24. confirmation runtime collation unchanged;
25. confirmation shortcut speech unchanged;
26. confirmation no Chinese font/CSS changes;
27. confirmation no semantic catalogue/draft was created;
28. confirmation no Chinese glossary was created;
29. confirmation no terminology-value CSV was created;
30. confirmation no Chinese reference overlay/fauna evidence was created;
31. automated verification results;
32. `git diff --check` result;
33. deviations from brief;
34. recommended next implementation stage;
35. suggested commit message;
36. confirmation no commit/push occurred.

The suggested commit message should describe the work and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.

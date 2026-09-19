# Codex Implementation Brief — French and German Localization Tooling Contracts

## Objective

Implement the tooling and contract generalization required to support French and German as future first-class locales without yet exposing either locale in the running application.

This implementation should prepare the localization pipeline for:

```text
fr-FR  -> Bethesda token fr
de-DE  -> Bethesda token de
```

while preserving all existing English and Japanese behavior.

This is an enabling/tooling implementation only.

Do **not** translate French or German UI catalogues, add French/German runtime locale options, generate committed French/German reference-name overlays, change search behavior, perform layout changes, or begin the later terminology/catalogue/reference-name closure work.

Do not commit or push unless explicitly instructed.

---

## Naming rule

The implementation-step identifiers used in planning discussions and audit reports must **not** leak into repository-facing names.

Do not use names such as:

```text
Parcel 1
Parcel1
P1
Phase 1
```

in:

- source-code identifiers;
- file names;
- npm scripts;
- generated artifact names;
- comments;
- test names;
- commit messages;
- documentation headings added by this implementation.

Use descriptive names based on actual responsibility, such as:

```text
locale metadata
review tooling
reference-name manifest
terminology locale values
localization verification
```

---

## Primary design source

Use as the implementation plan:

```text
docs/audits/FRENCH-GERMAN-LOCALE-ONBOARDING-PLAN.md
```

Also read and preserve current policy in:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
AGENTS.md
```

Historical Japanese briefs may be consulted for implementation history, but current durable documentation and the French/German audit take precedence.

---

# Locked decisions

The following decisions are approved for this implementation.

## Runtime/tracker locale IDs

Use:

```text
fr-FR
de-DE
```

as tracker/runtime locale identities.

Map them to Bethesda localization tokens:

```text
fr-FR -> fr
de-DE -> de
```

Do not expose these locales in the running app yet.

Do not add them to user-selectable locale UI until the later runtime-integration work.

---

## Bethesda string-table encodings

Use explicit encoding policy:

```text
en -> windows-1252
fr -> utf-8
de -> utf-8
ja -> utf-8
```

No byte guessing.

Unsupported locale tokens must continue to fail closed.

Malformed UTF-8 must fail rather than silently replace or reinterpret bytes.

---

## Generated reference-name artifacts

Adopt a scalable **one generated module + one sidecar manifest per locale** model.

The future shape should support artifacts such as:

```text
src/localization/generated/ja-JP-reference-names.ts
src/localization/generated/fr-FR-reference-names.ts
src/localization/generated/de-DE-reference-names.ts
```

with matching per-locale manifests such as:

```text
reference-source/localized-reference-names-ja-JP-manifest.json
reference-source/localized-reference-names-fr-FR-manifest.json
reference-source/localized-reference-names-de-DE-manifest.json
```

Exact migration mechanics for the existing Japanese sidecar should be chosen by Codex based on current repository constraints.

The governing rule is:

> Japanese runtime/reference-name output and closure must remain semantically identical.

Literal byte-for-byte preservation of the old manifest file is **not** required if a clean versioned migration is better, but equivalence must be proved.

Do not create committed French/German overlay modules yet.

---

## Terminology artifact direction

Generalize the terminology boundary so that:

```text
locale-neutral identity/provenance
```

is separated from:

```text
locale-specific resolved values
```

Do not continue scaling by adding language columns such as:

```text
OfficialFrench
OfficialGerman
OfficialSpanish
...
```

to one increasingly wide provenance file.

Preferred direction:

- preserve one locale-neutral terminology evidence/provenance contract;
- add small per-locale value artifacts keyed by stable evidence identity;
- retain source-use classification such as canonical-content vs terminology-only evidence;
- preserve `SFBGS050.esm` as terminology-only evidence.

Choose a versioned migration path that keeps Japanese verification intact.

---

# Scope

Implement the following six areas.

## 1. Locale metadata contract

Create or generalize one authoritative localization metadata contract sufficient to describe at least:

```text
tracker locale tag
Bethesda token
string-table encoding
full/sparse locale role where relevant
```

The implementation should support current and future locales without scattering duplicate mappings.

At minimum the contract must correctly represent:

```text
en-US
en-GB
ja-JP
fr-FR
de-DE
```

However:

- `fr-FR` and `de-DE` must remain tooling-known only for now;
- do not make them selectable;
- do not add incomplete runtime catalogues;
- do not cause automatic browser locale resolution to select them yet.

Keep runtime exposure separate from tooling capability.

---

## 2. Encoding policy generalization

Generalize the current encoding handling so there is one authoritative locale-token encoding map in tooling.

Audit and remove unnecessary duplication between:

```text
reference-source/localization-provenance-policy.json
committed/local intake metadata
scripts/localization/string-table-reader.mjs
```

Desired behavior:

```text
encodingForLocale('en')       -> windows-1252
encodingForLocale('en-US')    -> windows-1252 where tracker tags are accepted
encodingForLocale('fr')       -> utf-8
encodingForLocale('fr-FR')    -> utf-8 where tracker tags are accepted
encodingForLocale('de')       -> utf-8
encodingForLocale('de-DE')    -> utf-8 where tracker tags are accepted
encodingForLocale('ja')       -> utf-8
encodingForLocale('ja-JP')    -> utf-8 where tracker tags are accepted
```

Preserve explicit failure for unsupported locales.

Do not add fallback encodings.

Do not sniff bytes.

---

## 3. Locale-parameterized review tooling

Generalize the Japanese semantic-translation review tooling into locale-neutral machinery.

Inspect current files/scripts/types such as:

```text
japaneseReviewPackage.ts
generate-japanese-review-package.ts
localization:review
```

or their current equivalents.

The result should support deterministic per-locale review artifacts without embedding Japanese in generic API/file names.

The future intended review CSV contract is one file per locale, e.g.:

```text
docs/localization/fr-FR-review.csv
docs/localization/de-DE-review.csv
```

Do **not** create populated French/German review translations in this implementation unless a tiny empty/template fixture is needed for testing.

The review schema should support at least:

```text
Key
Locale
EnglishSource
EnglishSourceSha256
Context
Risk
Parameters
ProtectedTokens
OfficialTermConstraints
CodexTranslation
DeepLTranslation
ComparisonStatus
FinalTranslation
ReviewerNote
```

Required behavior:

- deterministic key order;
- stable source hash from exact English source;
- exact placeholder inventory;
- protected-token inventory;
- duplicate-key rejection;
- missing-key rejection;
- stale-source detection;
- invalid-placeholder detection;
- invalid protected-token detection;
- explicit comparison state;
- final catalogue generation only from current-source approved rows.

Keep DeepL as an external/manual input.

Do not add a DeepL API dependency.

Do not call DeepL.

Do not introduce a translation-management system.

---

## 4. Locale-parameterized reference-name overlay tooling

Generalize the existing Japanese reference-name generation/serialization/verification path so it can target an explicit locale.

Audit and generalize Japanese-specific assumptions including:

- fixed `ja` input selection;
- `ja-JP-reference-names.ts` output naming logic;
- serializer export names/comments;
- drift labels such as `changed-japanese-value`;
- Japanese-specific manifest fields;
- fixed Japanese verifier paths;
- Japanese-only CLI names;
- Japanese-only contract tests.

Prefer a command shape that can naturally support examples such as:

```text
npm run localization:reference-names:build -- --locale ja-JP
npm run localization:reference-names:verify -- --locale ja-JP
```

and later:

```text
npm run localization:reference-names:build -- --locale fr-FR
npm run localization:reference-names:verify -- --locale fr-FR
```

Do not generate or accept committed French/German overlays yet.

The generalized tooling must preserve the existing Japanese generated output semantically.

---

## 5. Per-locale reference-name sidecars

Introduce a versioned per-locale sidecar shape.

Each sidecar should be capable of recording:

- tracker locale tag;
- Bethesda token;
- encoding;
- exact official input table identities;
- exact archive/member hashes;
- upstream provenance identity/hash;
- entity counts;
- per-kind counts;
- generated module hash;
- composition policy;
- separator policy/evidence state;
- generator/tool version as already appropriate.

Do not include:

- machine-local paths;
- raw Bethesda strings;
- Bethesda-owned corpora;
- unnecessary duplicate source content.

Migrate the existing Japanese sidecar cleanly or provide a temporary compatibility reader.

Whichever path is chosen, verify:

```text
Japanese canonical entity coverage unchanged
Japanese generated values unchanged
Japanese runtime lookup unchanged
Japanese verifier closure unchanged
```

If the migration changes tracked artifact names, update all authoritative references consistently.

Do not preserve obsolete file names merely for cosmetic compatibility if doing so creates two permanent manifest formats.

---

## 6. Terminology evidence/value separation

Generalize official terminology storage and verification.

Current Japanese-specific fields such as:

```text
OfficialJapanese
RecommendedDefaultForJaJP
```

must not become a growing multi-language column set.

Refactor toward:

```text
locale-neutral evidence identity/provenance
+
per-locale resolved values
```

Preserve stable evidence identity and all currently useful provenance including:

- `TermId`;
- `EvidenceId` or equivalent stable evidence key;
- source-use classification;
- source plugin;
- record identity where applicable;
- name-source plugin;
- string-table type;
- string ID;
- canonical English/context evidence.

Per-locale value artifacts should key back to stable evidence identity.

Keep contextual evidence contextual.

Do not imply that every official localized substring is automatically a canonical standalone term.

Preserve the rule:

```text
SFBGS050.esm = terminology evidence only
```

and ensure generalized validation cannot accidentally promote Free Lanes content into canonical tracker reference data.

---

# Japanese compatibility contract

Japanese is already a supported locale and must remain fully closed throughout this implementation.

Required invariants include:

```text
ja-JP catalogue behavior unchanged
Japanese reference-name lookup unchanged
3,561 canonical names still closed
4,818 qualified provenance rows still closed
no new unresolved identities
existing Japanese search/runtime behavior unchanged
existing Japanese terminology behavior unchanged
```

Where generic tooling replaces Japanese-specific tooling:

- update Japanese tests to run through the generalized path where appropriate;
- retain narrow Japanese profile/hardening tests where they represent genuinely Japanese behavior;
- do not erase historical Japanese-specific rules merely to make everything look generic.

Safe Japanese-specific exceptions include, where still valid:

- `:lang(ja)` typography;
- Japanese composition evidence;
- Japanese correction/product-hardening expectations;
- historical Japanese preview/provenance artifacts where they remain useful evidence.

---

# Closure command

If inexpensive and clean, add a thin locale-oriented verification/orchestration command.

Preferred conceptual shape:

```text
npm run localization:verify -- --locale ja-JP
```

Later it should be usable for other complete locales.

This command should **orchestrate existing authoritative checks**.

It must not create a second independent verification framework.

If adding it would cause unnecessary churn, document why it was deferred.

---

# Tests

Add or generalize durable tests for the new tooling contracts.

At minimum cover:

## Locale metadata

- tracker tag -> Bethesda token;
- tracker tag/token -> encoding;
- all known mappings unique;
- unsupported values fail closed;
- tooling-known locales can remain unavailable at runtime.

## Encoding

- English Windows-1252;
- Japanese UTF-8;
- French UTF-8;
- German UTF-8;
- malformed UTF-8 failure;
- unsupported locale failure;
- no byte sniffing/fallback.

## Review tooling

- deterministic output;
- exact English source hash;
- placeholder extraction;
- protected-token extraction;
- duplicate/missing key rejection;
- stale-source detection;
- lost/renamed placeholder rejection;
- protected-token corruption rejection;
- deterministic locale-specific paths;
- Japanese review package remains reproducible.

## Overlay tooling

- explicit locale parameter;
- deterministic serialization;
- generalized drift labels;
- per-locale output naming;
- per-locale sidecar validation;
- Japanese generated values/coverage unchanged;
- no accidental canonical rediscovery;
- unsupported/missing locale inputs fail clearly.

## Terminology

- locale-neutral evidence schema valid;
- locale-specific values keyed correctly;
- Japanese values preserved;
- missing/duplicate evidence values detected;
- `SourceUse` enforced;
- `SFBGS050.esm` cannot contribute canonical reference entities.

## General contract tests

Where current tests are Japanese-specific only because Japanese was the first full locale, parameterize them.

Where tests verify genuinely Japanese behavior, keep them locale-specific.

Do not duplicate entire suites per locale if a parameterized contract is clearer.

---

# npm script naming

Use descriptive generic script names.

Good examples:

```text
localization:review
localization:reference-names:build
localization:reference-names:verify
localization:terminology:verify
localization:verify
```

Avoid introducing names containing:

```text
french-german
fr-de
parcel
phase
```

unless the script genuinely performs a one-off locale-specific diagnostic, which production tooling should generally avoid.

Locale selection should be an argument or metadata input, not encoded into generic command names.

---

# Files/artifacts that should remain local only

Do not commit:

- extracted Bethesda string tables;
- BA2 member dumps;
- raw official localization text corpora;
- machine-specific intake configs;
- local game paths;
- temporary diagnostic outputs.

Use ignored `.local-work/` paths where required.

No Bethesda-owned localization corpus should be added to Git.

---

# Explicitly out of scope

Do **not** implement any of the following now:

- French semantic catalogue;
- German semantic catalogue;
- French glossary;
- German glossary;
- DeepL translation/import workflow execution;
- official French/German terminology resolution;
- committed French/German reference-name overlays;
- composed-fauna French/German proof sets;
- runtime registration of `fr-FR`;
- runtime registration of `de-DE`;
- locale selector changes;
- browser `fr-*` / `de-*` automatic mapping;
- French/German search normalization;
- accent folding;
- German `ae/oe/ue/ss` aliases;
- accessible French/German shortcut speech;
- layout/CSS changes;
- accessibility UI changes;
- lazy locale loading;
- bundle splitting;
- ICU/FormatJS;
- persistence/schema changes.

Those belong to later implementation work.

---

# Runtime exposure guard

This is important.

After this implementation, the tooling may know about:

```text
fr-FR
de-DE
```

but the application must **not yet present them as supported user locales**.

Verify that:

- they do not appear in the locale selector;
- `Automatic` cannot resolve to them yet;
- no incomplete catalogue fallback can expose a partially translated French/German UI;
- persisted locale preference validation does not begin accepting them as active UI locales prematurely unless the implementation cleanly distinguishes tooling-known vs runtime-supported locales.

If current types make that distinction awkward, introduce the smallest clean separation required.

Do not solve it by adding empty/sparse French or German catalogues.

---

# Migration discipline

This implementation touches mature localization tooling.

Use explicit migration steps rather than broad rewrites.

For each generalized artifact/tool:

1. prove existing Japanese behavior;
2. introduce the generalized contract;
3. migrate Japanese onto it;
4. prove equivalence;
5. remove obsolete duplicate paths only after equivalence is established.

Avoid leaving permanent parallel legacy/new implementations.

A temporary compatibility reader is acceptable during the change if it enables a safe migration, but the finished work should have one clear canonical contract where practical.

---

# Documentation updates

Update durable documentation where the implementation changes real contracts.

Likely files:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/ARCHITECTURE.md
```

Update only what actually changed.

Also correct the stale historical semantic-message count in `LOCALE-ONBOARDING.md` if it still presents `331` as current. Prefer wording that makes **parity** the invariant so future key growth does not make the handbook stale again.

Do not mark French or German as supported yet.

They should remain not onboarded/in progress until the later catalogue/runtime/closure work completes.

Do not update `BACKLOG.md` to claim French/German completion.

---

# Required verification

Run the relevant complete verification suite after implementation.

At minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
```

Also run any newly introduced locale/tooling verification commands.

If a command name changes during generalization, run the new authoritative equivalent and clearly report the mapping from old to new.

No verification step may require committed Bethesda game files.

Installed-game/local-input diagnostics may be used separately, but ordinary repository verification must remain self-contained.

---

# Audit/conformance notes for Codex

While implementing, keep an eye on the audit’s identified Japanese-specific areas:

```text
review tooling
overlay CLI/output/export/parser/verifier
sidecar manifest shape
drift-category naming
terminology locale values
contract tests
closure orchestration
```

Do not broaden into unrelated localization cleanup.

Do not refactor canonical provenance discovery.

Do not alter domain/persistence models.

Do not redesign runtime localization.

---

# Completion response

Return a concise implementation summary containing:

1. branch;
2. files changed;
3. locale metadata/mapping introduced;
4. encoding-policy result;
5. review-tooling generalization;
6. reference-name tooling generalization;
7. sidecar-manifest migration/design;
8. terminology evidence/value separation;
9. Japanese equivalence results;
10. runtime-exposure guard result;
11. tests added/generalized;
12. documentation updated;
13. verification commands/results;
14. any deviations from the audit recommendation;
15. any unresolved issue that blocks the next localization step;
16. suggested commit message.

The suggested commit message must be descriptive and must **not** include implementation-step identifiers such as `Parcel 1`.

Do not commit or push unless explicitly instructed.

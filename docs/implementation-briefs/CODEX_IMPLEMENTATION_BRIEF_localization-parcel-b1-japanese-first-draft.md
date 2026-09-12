# CODEX IMPLEMENTATION BRIEF — Localization Parcel B1: Japanese Catalogue First Draft and Review Package

## Objective

Implement **Parcel B1** of the Japanese localization programme.

This parcel should:

1. register `ja-JP` as a supported locale;
2. add browser/Automatic locale resolution for Japanese;
3. add a **complete first-pass Japanese tracker-authored message catalogue** covering the existing semantic message set;
4. create a durable Japanese translation glossary/style guide;
5. add catalogue completeness, placeholder/token, and locale-resolution tests;
6. generate a structured **review package** for independent translation QA in later Parcel B2/B3;
7. create a durable third-party provenance/credit ledger and record the external tools/repositories already used or planned for this localization work.

This is **not** the final Japanese translation approval parcel.

This is **not** the Bethesda reference-name extraction parcel.

This is **not** Japanese layout/font hardening.

This is **not** an accessibility audit.

---

# Cost / scope discipline

The repository is now mature and broad cross-cutting changes are expensive.

Parcel A was a high-cost cross-cutting refactor.

Parcel B1 should remain **medium-cost and bounded**.

Do not revisit Parcel A architecture unless a concrete blocker is found.

Do not opportunistically refactor unrelated localization, validation, history, import/export, reference-data, or UI code.

Do not solve Japanese layout issues in this parcel except where the locale cannot function at all.

Record layout/font/search problems for Parcel E instead.

---

# Current localization state

Parcel A is complete and committed.

Current settled state includes:

- complete semantic string migration;
- approximately 330 `en-US` tracker-owned semantic message keys;
- sparse `en-GB` override;
- semantic validation descriptors for all validation rules;
- relocalizable semantic history descriptors;
- localized accessibility/help/status/transient strings;
- locale-aware list/number/percent/collation helpers;
- effective-locale synchronization of `document.documentElement.lang`;
- existing reference-name overlay architecture;
- no network/persistence schema change;
- no Japanese catalogue yet;
- no Bethesda official-term extraction yet.

Treat this architecture as the foundation.

Do not replace it with a third-party localization runtime.

---

# Authoritative design basis

Read:

- `docs/audits/codex-localization-coverage-and-japanese-audit.md`
- current localization architecture/docs after Parcel A
- current `docs/BACKLOG.md`

Also read all current localization files, especially:

- `src/localization/types.ts`
- `src/localization/registry.ts`
- `src/localization/catalog.ts`
- `src/localization/locale.ts`
- `src/localization/LocalizationProvider.tsx`
- `src/localization/formatters.ts`
- `src/localization/referenceNames.ts`
- `src/localization/locales/en-US.ts`
- `src/localization/locales/en-GB.ts`
- current localization tests.

Do not rely on pre-Parcel-A assumptions if the implementation has since changed.

---

# Core product boundary

Parcel B1 translates **tracker-authored text only**.

Examples:

- Planned Supply
- Present
- Producing
- Inputs
- Logistics
- Add Outpost
- Add Network
- validation messages
- remediation text
- import/export messages
- status messages
- help text
- tooltips
- accessibility labels
- Undo/Redo/history action descriptions
- dialog text
- settings/preferences labels
- navigation text.

Parcel B1 must **not invent Japanese translations for Bethesda-owned reference/master-data names**.

Examples to leave on canonical fallback until Parcels C/D:

- Vytinium Fuel Rod
- Aluminum / Aluminium
- Adhesive
- systems
- planets/moons
- biomes
- species
- manufactured product names
- Bethesda skill names unless already explicitly treated as tracker copy.

If a Japanese tracker sentence includes a reference-name parameter, let the existing reference-name resolver provide its current fallback.

Do not hard-code Bethesda terms into Japanese messages to bypass the later official-term overlay work.

---

# Translation strategy

The user cannot read or write Japanese and does not have access to a human Japanese reviewer.

Therefore the translation process must be designed for **multi-stage machine-assisted review**, not one-pass generation.

Parcel B1 is only the first stage.

Required later workflow:

```text
B1  Codex first-pass Japanese catalogue + glossary + review package
B2  Independent DeepL translation pass from English source
B3  Comparative adjudication and refinement
B4  Final Japanese integration/verification
```

Do not pretend B1 output is human-validated or final.

---

# Japanese catalogue

Add:

`src/localization/locales/ja-JP.ts`

or the repository-consistent equivalent.

Requirements:

- every required tracker-owned `en-US` key must exist in Japanese;
- `ja-JP` is a **complete locale**, not a sparse regional override;
- semantic keys must remain identical to the `en-US` baseline;
- all placeholders must be preserved exactly;
- protected technical tokens must remain invariant where appropriate;
- sentence structure may be reordered naturally in Japanese;
- do not translate by word substitution or English-fragment order;
- use natural Japanese software UI language;
- use concise wording for compact controls where appropriate;
- use fuller natural wording for help, validation, and accessibility text;
- avoid unnecessary English loanwords when a clear natural Japanese UI term exists;
- do not force Japanese translations for proper names or technical tokens whose ownership is outside this parcel.

---

# Locale registration and Automatic resolution

Register `ja-JP` as a supported locale.

Update Automatic/browser matching so at minimum:

```text
ja
ja-JP
ja-*
```

resolve to `ja-JP`.

Matching should be case-insensitive and follow the current supported-locale strategy.

Preserve existing English behavior.

Expected precedence should remain conceptually:

```text
explicit supported override
-> supported browser locale match
-> existing English resolution rules
-> en-US fallback
```

Use the current repository architecture rather than inventing a parallel resolver.

---

# Locale selector label

Japanese should identify itself in the locale selector as:

```text
日本語
```

Do not display only `Japanese`.

Preserve the existing English locale labels and Automatic behavior.

---

# Japanese glossary / style guide

Create a durable translator document, recommended path:

`docs/localization/JAPANESE-GLOSSARY.md`

Create the directory if needed.

This document must do more than list word pairs.

For important tracker concepts, record:

- semantic key/concept;
- English source term;
- product meaning;
- what it does **not** mean where ambiguity matters;
- approved or provisional Japanese term;
- notes on usage/register;
- protected tokens or terms;
- whether the term is tracker-authored or Bethesda-owned.

At minimum include concepts such as:

- Planned Supply
- Present
- Producing
- Inputs
- Logistics
- Import
- Export
- Cargo Pad
- Outpost
- Network
- validation severity/state terms
- availability / unavailable
- source / destination
- Undo / Redo
- Reshuffle / reorder / move
- manufacturing / production terminology used by the app.

For `Planned Supply`, explicitly document the product meaning:

> A virtual assertion that an item will eventually be supplied to the outpost, allowing downstream production/logistics to be designed before the real supply route exists.

Also state that it does **not** mean:

- stock currently held;
- reserved inventory;
- actual incoming cargo.

The glossary should clearly distinguish tracker terminology from Bethesda-owned terminology.

---

# Protected / invariant tokens

Define and preserve an explicit set of token categories that must not be accidentally translated.

Examples:

- `He-3`
- FormIDs
- EditorIDs
- stable IDs
- abbreviations such as `VFR`, `SMS`, where displayed
- keyboard tokens such as `Ctrl`, `Shift`, `Z`
- file extensions
- JSON/schema tokens
- version numbers
- technical punctuation/placeholders
- product/app proper name where intentionally invariant.

Do not assume every English-looking token is invariant.

Document the rule in the glossary and tests.

---

# Placeholder integrity

All interpolation placeholders must survive translation exactly.

Examples:

```text
{count}
{outpostName}
{resourceName}
{ordinal}
{networkName}
```

Requirements:

- no renamed placeholders;
- no deleted placeholders;
- no extra placeholders;
- no accidental full-width brace conversion;
- no translated placeholder identifiers.

Add automated parity checks between `en-US` and `ja-JP`.

---

# First-pass translation quality

Use context, not literal word substitution.

Before translating a key, inspect:

- the English message;
- its semantic key;
- where it appears;
- its parameter meanings;
- nearby related keys;
- glossary entries;
- whether it is compact UI, explanatory prose, validation, accessibility text, or history text.

The first-pass Japanese should be internally consistent even though it will later be independently reviewed.

Do not use DeepL in B1.

DeepL must remain independent for B2.

Do not seed the B1 translation from DeepL output.

---

# Risk classification

Classify Japanese messages by review risk.

Recommended categories:

```text
LOW
MEDIUM
HIGH
```

Examples:

## LOW

- Close
- Cancel
- Save
- Add
- Remove
- simple headings.

## MEDIUM

- cargo/logistics labels;
- state/status wording;
- history descriptions;
- compact matrix terms;
- tooltips.

## HIGH

- Planned Supply;
- validation diagnostics/remediation;
- destructive confirmations;
- dense domain-specific explanations;
- accessibility instructions;
- messages where English ambiguity could produce materially wrong behavior understanding.

Use repository evidence to classify actual keys.

---

# Review package for B2/B3

Generate a structured review artifact for later independent QA.

Recommended committed path:

`docs/localization/ja-JP-review-source.csv`

or another simple deterministic text format.

CSV is preferred if practical.

Each row should contain at minimum:

```text
Key
English
Context
Risk
ProtectedTokens
Parameters
CodexJapanese
```

Optional useful columns:

```text
Namespace
Notes
TrackerOrBethesdaOwned
```

Requirements:

- one row per tracker-owned semantic message key;
- deterministic ordering;
- preserve semantic key as the join key;
- English text must be the exact baseline source;
- Codex Japanese must be the exact B1 catalogue value;
- parameters listed explicitly;
- protected tokens listed explicitly;
- Context should say where/how the message is used;
- Risk should be LOW/MEDIUM/HIGH.

This review package is intended to support B2:

1. feed **English source independently** to DeepL;
2. collect DeepL Japanese without showing it Codex's Japanese;
3. later merge by `Key`;
4. compare the two translations in B3.

Do not pre-populate a DeepL column in B1.

---

# Translation review audit placeholder

Create or reserve the durable location for the eventual comparative review report:

`docs/audits/codex-japanese-translation-review.md`

Do not fabricate a final review in B1.

If useful, create a short placeholder explaining that the report will be produced after independent QA; otherwise leave creation to B3.

Do not claim Japanese is final at B1 completion.

---

# Third-party provenance / credit ledger

Create:

`docs/THIRD-PARTY-REFERENCES.md`

This is a durable project provenance/credit ledger for external repositories, vendors, tools, models, or sources that materially influence implementation or content but are not necessarily runtime package dependencies.

The purpose is to allow correct future attribution in:

- repository documentation;
- About/credits UI if appropriate;
- release notes;
- license notices where legally required.

Each entry should record:

- name;
- maintainer/vendor;
- canonical URL;
- license/terms where relevant;
- exact role in this project;
- whether code was copied/adapted or merely studied/referenced;
- whether data/output was used;
- whether it is a runtime dependency;
- attribution/license action required;
- date or parcel where used if useful.

At minimum add entries for:

## Bethesda Strings Editor / `0xra0/bethesda-strings-editor`

Record accurately:

- external GitHub project;
- MIT-licensed according to its repository;
- used/studied as a technical reference for Bethesda BA2/string-table localization architecture;
- especially relevant to the `(plugin, string-table extension, string ID)` alignment model;
- AI translation features are **not** part of the tracker plan;
- no claim should be made that code was copied unless later implementation actually copies/adapts code;
- if future code is adapted, the ledger and license notices must be updated accordingly.

Use the exact repository name/URL currently referenced by project discussions/audit.

## DeepL

Record:

- vendor/service;
- planned use in Parcel B2 as an **independent translation QA source** for tracker-authored Japanese copy;
- not a runtime dependency;
- not used to translate Bethesda-owned canonical game terminology;
- output will be compared with B1 rather than blindly accepted;
- any subscription/trial arrangement is a development workflow detail, not a runtime requirement.

## OpenAI / Codex / ChatGPT

If project convention permits vendor-development provenance in this document, record:

- used for code generation/review and initial Japanese catalogue drafting/reasoning;
- not a runtime dependency.

If this would duplicate existing project attribution policy, document the existing location instead of creating inconsistent duplicate credit.

Do not invent attribution/legal requirements.

If license/terms are uncertain, record that verification is required.

---

# Attribution architecture

Do not automatically add every development tool to the visible About dialog in B1.

Instead, recommend/record categories:

```text
Runtime dependency
Code/reference implementation influence
Data/content provenance
Development/translation tool
Canonical game source
```

The durable ledger should distinguish them.

Later public-release work can decide which entries belong:

- only in repo docs;
- in license notices;
- in visible app credits;
- or in multiple locations.

---

# Official Bethesda terminology boundary

B1 must preserve this rule:

> Bethesda-owned game terminology should use official Bethesda Japanese localization wherever available, but that work belongs to Parcels C/D.

Therefore:

- do not machine-translate the reference catalogue;
- do not add ad hoc Japanese resource/product/system/body/biome/species maps;
- do not embed Japanese Bethesda names directly in tracker messages;
- do not use DeepL or Codex as the canonical source for those names.

If a tracker message currently receives a reference name as a parameter, leave that architecture intact.

---

# Japanese complete-locale policy

`ja-JP` should be represented as a complete release-oriented locale, unlike sparse `en-GB`.

Implement or use the Parcel A infrastructure so tests can enforce:

- every baseline semantic key exists;
- no required tracker message falls back to English;
- placeholder parity is exact.

Runtime fallback to `en-US` may remain as defensive resilience.

Tests must nevertheless fail when ordinary tracker-owned `ja-JP` keys are missing.

---

# Residual English checks

Add Japanese-specific checks that identify accidental English fallback or untranslated tracker copy.

Do not fail on:

- Bethesda-owned reference names awaiting Parcels C/D;
- abbreviations;
- app/product proper name;
- IDs;
- technical tokens;
- file names/extensions;
- keyboard shortcuts;
- user-authored persisted names.

Prefer key/catalogue-based completeness checks over naive regex alone.

If a residual-English heuristic is added, use an allowlist and document limitations.

---

# Tests

Add/update tests covering at minimum:

## Locale registration

- `ja-JP` supported;
- selector displays `日本語`;
- explicit `ja-JP` works;
- `ja`, `ja-JP`, `ja-*` Automatic matching resolves to `ja-JP`;
- case variants behave correctly;
- English resolution remains unchanged.

## Catalogue completeness

- every `en-US` key exists in `ja-JP`;
- `ja-JP` has no missing tracker-owned keys;
- no unexpected extra semantic keys;
- `en-GB` remains sparse.

## Placeholder parity

- same placeholder set in English and Japanese for every parameterized key;
- no missing/extra/renamed placeholders.

## Protected tokens

Representative messages preserve invariant tokens such as:

- `He-3`;
- keyboard shortcuts;
- identifiers where applicable.

## Runtime rendering

Representative tests for:

- visible UI;
- validation;
- history;
- help/tooltips;
- accessibility;
- status/import feedback.

The purpose is to prove the existing semantic system renders Japanese correctly, not to exhaustively snapshot all 330 strings.

## Document language

- effective Japanese locale sets:

```html
<html lang="ja-JP">
```

- switching back updates it.

## Formatters

Exercise existing locale-aware formatting under `ja-JP`.

Do not add speculative formatter infrastructure.

## Review package

Test/generate deterministically:

- row count equals expected semantic message count;
- all keys represented exactly once;
- English/Japanese values match catalogues;
- parameters/protected-token metadata is deterministic.

---

# Review package generation

Prefer deriving the review package from the catalogues and metadata rather than maintaining 330 duplicated rows manually.

If context/risk metadata requires a source map, create a small maintainable metadata structure keyed by semantic message key.

Avoid having two separately editable Japanese translations.

`ja-JP.ts` should remain the translation source of truth.

The review CSV should be generated or validated against it.

---

# Documentation updates

Update:

## `docs/ARCHITECTURE.md`

Document:

- `ja-JP` as a complete locale;
- complete-locale vs sparse-override distinction;
- independent QA/review workflow;
- reference-name fallback remains separate from tracker catalogue.

## `docs/UX-DESIGN.md`

Document:

- locale selector self-name `日本語`;
- Japanese tracker-copy support;
- no assumption that B1 is layout-final;
- layout/font hardening deferred to Parcel E.

## `docs/BACKLOG.md`

Update Parcel B/localization state.

Do not mark Japanese localization fully complete after B1.

Record remaining:

- independent DeepL pass;
- comparative adjudication;
- official Bethesda terminology extraction;
- reference-name overlay;
- Japanese search/font/layout hardening;
- release verification.

## `docs/THIRD-PARTY-REFERENCES.md`

Create/update as described above.

## `docs/localization/JAPANESE-GLOSSARY.md`

Create as described above.

---

# Suggested implementation sequence

1. Read current post-Parcel-A localization implementation.
2. Add `ja-JP` to locale types/registry.
3. Add Japanese Automatic/browser matching.
4. Add selector label `日本語`.
5. Create Japanese glossary/style guide.
6. Translate the complete tracker-owned catalogue into first-pass Japanese.
7. Add complete-locale and placeholder/token tests.
8. Exercise document language and formatter behavior under `ja-JP`.
9. Create/generate deterministic review-source CSV.
10. Add third-party provenance ledger.
11. Update durable docs/backlog.
12. Run full verification.
13. Perform a basic browser smoke test in Japanese.
14. Report high-risk/ambiguous translations separately.

---

# Browser smoke test

Perform a basic Japanese-mode browser smoke test.

At minimum inspect:

- locale selector;
- navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo Pads;
- Search;
- validation panel;
- import/export dialogs;
- About/preferences;
- status bar;
- Undo/Redo titles.

Do **not** spend significant time fixing visual density or font issues.

Record any such findings for Parcel E unless the UI is functionally broken.

Check console for errors.

---

# Translation ambiguity report

At completion, provide a concise list of:

- HIGH-risk translations;
- terms where multiple Japanese renderings were plausible;
- places where English source wording itself was ambiguous;
- places where Bethesda-owned terms prevented fully Japanese output;
- any messages likely to need special attention in B2/B3.

Do not hide uncertainty.

---

# Verification

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run build
npm run lint
git diff --check
```

Run any new localization/review-package command if added.

Do not commit or push unless explicitly instructed.

---

# Final summary requirements

Report:

- final semantic key count;
- confirmation that every key has `ja-JP` tracker translation;
- locale matching behavior;
- glossary path;
- review package path and row count;
- third-party provenance ledger path;
- HIGH-risk translation count;
- representative ambiguous terms;
- test results;
- browser smoke-test results;
- any layout/font issues observed but deferred;
- confirmation that Bethesda-owned reference names were not machine-translated;
- confirmation that DeepL was not used in B1;
- confirmation that no persistence/network schema changes were made;
- confirmation that no Bethesda BA2/string extraction was implemented.

---

# Acceptance criteria

B1 is complete when:

- `ja-JP` is a registered supported locale;
- Automatic locale resolution recognizes Japanese browser locales;
- locale selector displays `日本語`;
- all tracker-owned semantic keys have first-pass Japanese translations;
- Japanese is treated as a complete locale in tests;
- placeholder parity passes;
- protected-token checks pass;
- document `<html lang>` becomes `ja-JP`;
- existing locale-aware formatters work under Japanese;
- durable Japanese glossary/style guide exists;
- deterministic independent-review package exists;
- third-party provenance/credit ledger exists and accurately records relevant external influences/tools;
- Japanese browser smoke test is functional;
- ambiguous/high-risk strings are explicitly reported;
- no DeepL output is used yet;
- no Bethesda-owned reference catalogue is machine-translated;
- no BA2/string extraction is added;
- no persistence schema change occurs;
- all verification checks pass.

# Codex Implementation Brief — French and German Semantic Catalogue Translation and Review

## Objective

Implement the French and German semantic-catalogue translation and independent review workflow for tracker-authored UI text.

The target locales are:

```text
fr-FR
de-DE
```

The implementation should:

- freeze the current `en-US` semantic source for both target locales;
- generate deterministic review artifacts from that same frozen source;
- produce Codex draft translations constrained by the approved French/German glossaries and official terminology;
- generate DeepL-ready XLIFF files carrying useful context for ambiguous/domain-specific strings;
- support deterministic re-import of DeepL translations by stable message key;
- compare Codex and DeepL drafts;
- editorially resolve disagreements;
- produce complete French and German semantic catalogues with exact key/placeholder parity;
- verify catalogue closure without exposing either locale in the running application yet.

This is the semantic-catalogue translation/review implementation.

Do not generate official French/German reference-name overlays, do not perform composed-fauna proof, do not expose French/German in the locale selector or browser resolution, and do not begin later search/layout/runtime integration work.

Do not commit or push unless explicitly instructed.

---

## Naming rule

Planning identifiers used in audits/discussion must not leak into repository-facing names.

Do not use names such as:

```text
Parcel 3
Parcel3
P3
Phase 3
```

in:

- source-code identifiers;
- filenames;
- npm scripts;
- generated artifact names;
- comments;
- test names;
- documentation headings added by this implementation;
- commit messages.

Use descriptive names based on responsibility, such as:

```text
semantic review
translation review
DeepL handoff
French catalogue
German catalogue
```

---

## Primary design sources

Read and preserve current policy in:

```text
docs/audits/FRENCH-GERMAN-LOCALE-ONBOARDING-PLAN.md
docs/localization/LOCALE-ONBOARDING.md
docs/localization/FRENCH-GLOSSARY.md
docs/localization/GERMAN-GLOSSARY.md
docs/localization/LOCALIZATION-INPUTS.md
docs/ARCHITECTURE.md
AGENTS.md
```

Also inspect the generalized review tooling created in the prior implementation, including current equivalents of:

```text
src/localization/reviewPackage.ts
scripts/generate-review-package.ts
docs/localization/ja-JP-review.csv
```

and all tests/documentation covering:

- review package generation;
- placeholder validation;
- protected-token validation;
- source-hash drift;
- comparison states;
- final-catalogue generation.

Historical Japanese localization briefs/artifacts may be used for implementation precedent where useful, but current durable policy and the French/German onboarding plan take precedence.

---

# Locked product decisions

## Target locales

Use:

```text
fr-FR
de-DE
```

These remain tooling/catalogue targets only during this implementation.

Do not expose them yet through:

- runtime locale selector;
- browser automatic resolution;
- persisted active locale preference;
- reference-name runtime overlay registration.

---

## Translation authority hierarchy

Preserve the following hierarchy:

1. **Official Bethesda localized terminology** where suitable official evidence exists.
2. **Approved French/German glossary choices** for tracker-owned concepts and semantic distinctions.
3. **Codex + DeepL independent translation comparison** for whole tracker-authored messages.
4. **Editorial adjudication** where drafts differ or context requires judgment.

DeepL is a comparison witness, not an authority.

Codex is also not authoritative by default.

Final translations should be chosen against:

- English source meaning;
- UI context;
- approved glossary terminology;
- official Bethesda terminology where relevant;
- target-language grammar;
- message role and surrounding concepts.

---

# DeepL handoff format

Use XLIFF again for the DeepL handoff.

The Japanese workflow demonstrated that XLIFF is practical for this use.

The French/German implementation should improve it by making context metadata deliberate and rich enough to reduce sense-selection errors.

If the repository contains an established Japanese XLIFF version/shape, reuse it where practical.

If no durable XLIFF format exists, choose a standard DeepL-compatible XLIFF form and document the exact version/shape used.

Do not make the workflow depend on undocumented one-off XML edits.

---

# Core workflow

The intended broad flow is:

```text
en-US catalogue
    ↓
frozen deterministic semantic review source
    ↓
Codex draft translation
    ↓
context-rich DeepL XLIFF export
    ↓
user uploads XLIFF to DeepL
    ↓
user returns translated XLIFF
    ↓
deterministic re-import by stable key
    ↓
Codex-vs-DeepL comparison
    ↓
editorial adjudication
    ↓
approved final translations
    ↓
complete fr-FR / de-DE semantic catalogues
```

The review CSV and XLIFF must derive from the same frozen English source revision.

Do not join translated output by row position alone.

Use stable message keys.

---

# 1. Freeze the semantic source

Create deterministic French and German review packages from the current `en-US` baseline.

The source package must capture at least:

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

Use one review artifact per locale.

Expected durable shape:

```text
docs/localization/fr-FR-review.csv
docs/localization/de-DE-review.csv
```

If current generalized tooling already dictates exact names/schema, follow it.

The source hash must be computed from the exact English source string.

If `en-US` changes later:

- changed rows must become stale;
- approval must not silently survive a changed English source;
- unchanged rows should remain reusable.

---

# 2. Context authoring is required

Context is not optional metadata for this implementation.

The previous Japanese effort exposed ambiguity failures where an isolated English label could be interpreted in the wrong sense.

For example:

```text
Present
```

must be disambiguated as:

```text
the item/resource exists at this outpost/location
```

and explicitly **not**:

```text
currently / at the present time
```

For ambiguous or domain-specific messages, write context that explains:

- the semantic meaning;
- the UI surface;
- nearby contrasting concepts;
- senses to avoid where useful;
- glossary constraints;
- whether the string is a label, instruction, status, validation message, accessible name, etc.

A vague note such as:

```text
Resource Matrix label
```

is insufficient for high-risk strings when the English source is semantically overloaded.

---

# 3. Translation-risk classification

Classify every semantic message for translation review.

Use a bounded risk model such as:

```text
LOW
MEDIUM
HIGH
```

Suggested meaning:

## LOW

Straightforward generic UI copy with little semantic ambiguity.

Examples may include:

```text
Close
Cancel
Delete
```

provided the actual UI context does not introduce ambiguity.

## MEDIUM

Domain-specific terms, compact labels, or strings where context affects natural phrasing.

## HIGH

Messages with:

- ambiguous English;
- overloaded single-word labels;
- tracker-specific semantics;
- official-term constraints;
- nontrivial placeholders;
- plural behavior;
- sentence fragments;
- accessibility implications;
- easily confused neighboring concepts.

Risk should drive review attention and context richness.

Do not mechanically force every string into elaborate commentary.

---

# 4. Context-rich XLIFF generation

Generate one DeepL-ready XLIFF file per locale from the same frozen review source.

Expected outputs may be:

```text
docs/localization/fr-FR-deepl.xliff
docs/localization/de-DE-deepl.xliff
```

Use current project naming conventions if a better established naming pattern exists.

Each translatable unit must retain a stable message key.

Where supported by the chosen XLIFF format, carry metadata/notes such as:

- English semantic source;
- message key;
- UI context;
- translation-risk level;
- glossary/official-term constraints;
- protected tokens;
- placeholder expectations;
- explicit disambiguation notes.

Do not alter the true English source merely to make it easier for DeepL.

Provide disambiguation in metadata/notes rather than replacing a short real UI label with a longer fake source sentence.

---

# 5. High-risk context requirements

Ensure especially strong context for terse/ambiguous concepts including, where present:

```text
Present
Producing
Inputs
Logistics
Planned Supply
Resource Matrix
Reshuffle
Lock
Inorganic
Organic
Validation
Manufacturing
```

Also identify any additional ambiguous strings in the current catalogue.

For example, the semantic cue for `Present` should explicitly indicate:

```text
present at this outpost/location
not temporal "currently"
```

For `Lock`, explain the exact application action rather than leaving DeepL to infer physical/security/login senses.

For `Inputs` and `Logistics`, explain their Resource Matrix semantics rather than relying on ordinary dictionary meanings.

Use the approved French/German glossaries as the terminology constraint source.

---

# 6. Placeholder protection

Preserve all named placeholders exactly.

Examples:

```text
{item}
{count}
{outpost}
```

and any supported plural/message syntax.

XLIFF generation/import must protect placeholders so DeepL cannot silently:

- remove;
- translate;
- rename;
- reorder illegally;
- corrupt braces/syntax.

Re-import must reject invalid placeholder sets.

Do not accept a translated unit with mismatched required placeholders.

---

# 7. Protected technical tokens

Preserve invariant tokens where required.

Examples may include:

```text
He-3
JSON
FormID
X-Tech
keyboard chord tokens
resource abbreviations
```

Use glossary/official terminology policy to distinguish:

```text
translate surrounding phrase
```

from:

```text
preserve exact technical token
```

Re-import should detect lost/corrupted protected tokens.

---

# 8. Codex draft translations

Produce independent Codex draft translations for both locales.

Codex translations should use:

- frozen English source;
- full context;
- risk;
- approved glossary;
- official terminology constraints;
- placeholders/protected tokens.

Do not read DeepL translations before producing the independent Codex draft if the workflow can cleanly preserve independence.

The goal is two independently produced translations, not one model revising the other.

Record Codex drafts into the locale review artifacts.

---

# 9. DeepL user handoff

The user will manually upload the generated XLIFF files to DeepL.

Do not call DeepL directly.

Do not add a DeepL API integration.

The implementation should make this handoff simple:

- generate one French XLIFF;
- generate one German XLIFF;
- explain which source-language/target-language choices to select if required;
- avoid machine-local file references in the artifact;
- keep message IDs stable.

The Codex completion response should clearly identify the two XLIFF files the user must upload.

At the point where user-supplied translated XLIFF is required, stop and request those files rather than fabricating DeepL output.

---

# 10. DeepL re-import

Implement deterministic import of the translated XLIFF.

Required behavior:

- join by stable message key;
- reject duplicate keys;
- reject unknown keys;
- reject missing required keys;
- verify the source hash/review package is still current;
- validate placeholders;
- validate protected tokens;
- preserve exact locale identity;
- populate `DeepLTranslation`;
- classify comparison state.

Do not trust row order.

Do not silently accept a DeepL output generated from a stale XLIFF source.

---

# 11. Comparison states

Use the generalized review model.

At minimum support useful states equivalent to:

```text
IDENTICAL
TYPOGRAPHIC_ONLY
SUBSTANTIVE
MISSING
INVALID_TOKENS
```

If the current tooling already has canonical names, use those.

Comparison should distinguish genuine translation differences from harmless documented typographic differences.

Do not normalize so aggressively that meaningful punctuation or wording differences disappear.

---

# 12. Editorial adjudication

After DeepL import:

- inspect all `SUBSTANTIVE` differences;
- inspect all HIGH-risk messages even if Codex and DeepL agree;
- inspect official-term constrained messages;
- inspect placeholder/plural/accessibility-sensitive strings;
- spot-check LOW-risk identical rows rather than assuming identity proves correctness.

Resolve final translations against:

- English intent;
- glossary;
- official terminology;
- UI context;
- grammatical naturalness;
- consistency across related messages.

Record the chosen final translation.

Use `ReviewerNote` where a non-obvious decision should remain durable.

Do not mechanically select:

- Codex;
- DeepL;
- shortest translation;
- most literal translation.

---

# 13. Tracker-owned glossary terms remain revisable by evidence

The French/German glossaries are locked translation constraints for consistency, but they are not immune to stronger sentence-level evidence.

If the semantic review reveals that a tracker-owned glossary choice is awkward or incorrect in actual repeated UI context:

- do not silently diverge message-by-message;
- flag the glossary term;
- make one deliberate editorial correction;
- update the glossary consistently;
- rerun affected review constraints.

Official Bethesda-backed terms should remain authoritative unless the glossary explicitly documents that the evidence is contextual rather than a standalone term.

---

# 14. Complete semantic catalogues

After editorial approval, generate or update complete locale catalogues:

```text
src/localization/locales/fr-FR.*
src/localization/locales/de-DE.*
```

Use the repository’s current catalogue module format.

Each must have:

- exact current `en-US` key parity;
- exact placeholder parity;
- no empty values;
- valid supported plural syntax;
- protected tokens intact;
- no accidental ordinary-English fallback except explicit invariant allowlist.

If new `en-US` keys appear during the work, update the review source and translated rows before closure.

Do not ship sparse French/German catalogues.

---

# 15. Catalogue verification

Generalize/use full-locale contract tests for:

```text
ja-JP
fr-FR
de-DE
```

where appropriate.

Test at minimum:

- exact keys;
- exact placeholders;
- non-empty values;
- plural syntax;
- protected tokens;
- source drift;
- ordinary untranslated-English detection;
- deterministic review generation;
- approved final row -> catalogue generation;
- catalogue -> review key correspondence.

Keep genuinely Japanese-specific profile tests separate.

---

# 16. No runtime exposure yet

Even after complete French/German semantic catalogues exist, do **not** expose them in the app yet.

This implementation must not change:

- locale selector options;
- browser `fr-*` / `de-*` resolution;
- persisted active-locale preference acceptance;
- runtime reference-name overlay registration.

Why:

The app would still lack French/German official reference-name overlays and later runtime/search integration.

Complete semantic catalogues may exist in source while remaining inactive.

Verify this explicitly.

---

# 17. Accessibility strings are in scope

The semantic catalogues must include tracker-authored accessibility text.

Review:

- `aria-label`;
- visually hidden text;
- dialog names/descriptions;
- Search announcements/instructions;
- validation speech;
- status/live-region text;
- keyboard shortcut action labels/help copy.

Do not generalize French/German spoken shortcut chord connectors in this implementation if that remains scheduled for later runtime integration.

Translate semantic accessibility messages now; defer locale-specific chord pronunciation machinery if it is a separate runtime concern.

---

# 18. Validation/status/history strings are in scope

The semantic catalogue review must include:

- validation messages;
- severity labels;
- contextual issue text;
- status/transient feedback;
- import/export feedback;
- session history labels/descriptions.

Preserve stable IDs/structured facts.

Do not move localization into domain logic.

---

# 19. Official-reference names remain out of scope

Do not translate or generate:

- systems;
- bodies;
- biomes;
- species;
- resources;
- products;
- official entity/reference names.

Those must come from Bethesda official localization through the reference-name overlay pipeline later.

If semantic messages embed reference entity names, keep the message template localized and leave entity resolution to the existing stable-ID display layer.

---

# 20. XLIFF durability and source control

The DeepL handoff artifacts may be committed if they are project-owned semantic source/translation-review artifacts and contain no Bethesda-owned localization corpus beyond approved terminology constraints already represented in project docs.

Do not include raw Bethesda string-table dumps.

Document whether translated DeepL XLIFF outputs are durable review artifacts or temporary handoff files.

Prefer keeping enough durable review evidence to reproduce editorial decisions without turning the repository into a translation-management archive.

---

# 21. Documentation updates

Update durable documentation only where this implementation establishes real policy/process.

Likely:

```text
docs/localization/LOCALE-ONBOARDING.md
```

Record:

- context-rich XLIFF handoff;
- risk classification;
- Codex/DeepL independence;
- deterministic re-import;
- editorial adjudication;
- glossary correction rule.

Update French/German locale-profile notes to indicate semantic catalogue progress if appropriate.

Do **not** mark French/German fully supported yet.

Do not update `BACKLOG.md` to mark locale onboarding complete.

---

# 22. Verification before DeepL handoff

Before requesting user DeepL work, run at minimum:

```text
npm test
npm run typecheck:tests
npm run localization:provenance:test
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
npm run lint
git diff --check
```

Also run targeted review/XLIFF generation tests.

The handoff XLIFF files must be deterministic and placeholder-safe before asking the user to upload them.

---

# 23. Stop point for external DeepL step

This implementation necessarily has an external user handoff.

When the following are ready:

- French frozen review source;
- German frozen review source;
- French Codex draft;
- German Codex draft;
- French DeepL-ready XLIFF;
- German DeepL-ready XLIFF;

Codex should stop and report them.

Do **not** fabricate or simulate DeepL translations.

The user will return translated XLIFF files.

After those files are supplied, continue the same implementation effort with:

- import;
- comparison;
- editorial adjudication;
- final catalogues;
- closure verification.

If Codex cannot pause/resume the same task cleanly, document the exact handoff state so the follow-up correction/continuation brief can resume deterministically.

---

# 24. Final verification after DeepL/adjudication

After final catalogues are approved, run:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
npm run localization:provenance:test
npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
npm run build
npm run lint
git diff --check
```

Run all new review/XLIFF/catalogue closure tests.

Do not require French/German full `localization:verify` closure yet if it correctly fails because official reference-name overlays do not exist.

That failure is expected until later reference-name work.

---

# Out of scope

Do **not**:

- generate French/German reference-name overlays;
- resolve 3,561 official names;
- perform composed-fauna proof;
- expose French/German in locale selector;
- implement browser locale mapping;
- change Search normalization;
- implement accent folding;
- add German digraph aliases;
- generalize accessible shortcut chord speech;
- perform layout/CSS fixes;
- perform final accessibility smoke testing;
- optimize bundle loading;
- add lazy locale loading;
- introduce ICU/FormatJS unless a concrete current message proves the existing format impossible;
- alter persistence/schema;
- change canonical reference populations.

If a current French/German semantic message genuinely cannot be represented by the existing interpolation/plural model, stop and report the exact case before introducing a new message framework.

---

# Completion response — pre-DeepL handoff

Before the external DeepL step, return:

1. branch;
2. files changed;
3. current `en-US` key count;
4. French review CSV path;
5. German review CSV path;
6. French XLIFF path;
7. German XLIFF path;
8. Codex draft completion status;
9. context/risk metadata summary;
10. placeholder/protected-token verification result;
11. official/glossary constraint coverage;
12. tests run/results;
13. confirmation French/German remain absent from runtime locale selection;
14. exact instructions for the user to upload/translate the XLIFF files in DeepL;
15. confirmation no commit or push occurred.

---

# Completion response — final semantic catalogue closure

After returned DeepL files are imported and editorial review is complete, return:

1. branch;
2. files changed;
3. French comparison statistics;
4. German comparison statistics;
5. count of HIGH-risk rows reviewed;
6. glossary changes made during adjudication, if any;
7. unresolved editorial issues, if any;
8. final French catalogue closure;
9. final German catalogue closure;
10. Japanese regression status;
11. runtime-exposure guard result;
12. complete verification results;
13. documentation updates;
14. deviations from the brief;
15. recommended next step;
16. suggested commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.

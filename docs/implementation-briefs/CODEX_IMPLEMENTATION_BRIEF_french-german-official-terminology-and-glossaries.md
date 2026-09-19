# Codex Implementation Brief — French and German Official Terminology and Glossaries

## Objective

Implement the official-terminology and glossary groundwork required for the French and German localization tranche.

This implementation should:

- resolve the existing official terminology evidence into French and German locale-value artifacts;
- create durable French and German glossaries for tracker-authored translation work;
- distinguish official Bethesda terminology from tracker-owned terminology;
- resolve or explicitly flag context-dependent terminology rather than guessing;
- lock terminology constraints that the later semantic-catalogue translation work can consume.

This is **not** the semantic-catalogue translation parcel.

Do not create complete French or German UI catalogues, do not run the Codex + DeepL catalogue comparison workflow, do not expose French or German in the application, and do not begin official reference-name overlay generation.

Do not commit or push unless explicitly instructed.

---

## Naming rule

Planning identifiers used in audits/discussion must not leak into repository-facing names.

Do not use names such as:

```text
Parcel 2
Parcel2
P2
Phase 2
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

Use descriptive names based on actual responsibility, for example:

```text
official terminology
French glossary
German glossary
terminology values
locale terminology verification
```

---

## Primary design sources

Use as the current implementation plan:

```text
docs/audits/FRENCH-GERMAN-LOCALE-ONBOARDING-PLAN.md
```

Also read and preserve current policy in:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
AGENTS.md
```

Inspect the current generalized terminology implementation produced by the previous localization-tooling work, especially:

```text
reference-source/official-terminology-provenance.csv
reference-source/official-terminology-values-en-US.csv
reference-source/official-terminology-values-ja-JP.csv
reference-source/official-terminology-policy.json
scripts/localization/verify-official-terminology.mjs
scripts/localization/verify-localization.mjs
scripts/localization/official-terminology.test.mjs
```

Historical Japanese terminology/glossary files may be used as implementation precedent, but current durable policy and the French/German onboarding audit take precedence.

---

# Locked product decisions

The following decisions are approved.

## Target locales

The target locale identities are:

```text
fr-FR
de-DE
```

with Bethesda localization tokens:

```text
fr
de
```

These locales remain tooling-only during this implementation.

Do not expose them in:

- locale selector;
- browser automatic resolution;
- persisted runtime locale preference;
- runtime catalogue registry.

---

## Authority hierarchy

Use the following authority model.

### Bethesda-owned terminology

Where official Bethesda evidence exists and is suitable for the tracker concept:

> Official Bethesda French/German wording is the starting authority.

Do not replace official Bethesda terminology with Codex- or DeepL-generated alternatives merely because another wording appears more natural in isolation.

However:

> Contextual official evidence remains contextual.

A localized word or phrase appearing within an official Bethesda sentence does not automatically become the tracker’s canonical standalone term.

Where official evidence is ambiguous, context-dependent, grammatical rather than lexical, or unsuitable for the tracker concept, preserve that distinction and escalate the editorial choice rather than silently collapsing it.

### Tracker-owned terminology

Where no suitable official Bethesda term exists, choose a tracker-owned French/German term editorially.

Codex may propose:

- preferred wording;
- alternatives;
- grammatical notes;
- reasons for rejecting close alternatives.

Do not treat Codex wording as authoritative merely because it is the first proposal.

Flag genuinely ambiguous choices for user review.

---

## DeepL boundary

Do **not** run the full Codex + DeepL catalogue comparison workflow in this implementation.

DeepL belongs to the later semantic-catalogue translation work.

It may be used selectively only if the user later chooses to cross-check a genuinely contentious glossary term.

Do not add DeepL API integration.

Do not design glossary generation around DeepL.

---

# Scope

Implement the following areas.

## 1. Resolve French and German official terminology values

Use the existing locale-neutral official terminology evidence identities.

Current audit scope is approximately:

```text
37 evidence rows
19 term IDs
```

Resolve French and German values using the same qualified identities already recorded for Japanese/English, including:

```text
NameSourcePlugin
StringTable
StringID
```

Do not rediscover terminology by reverse matching English text.

Do not scan arbitrary game strings for plausible translations.

Use the generalized locale-value artifact model introduced previously.

Create locale-specific value artifacts for:

```text
fr-FR
de-DE
```

following the current canonical naming/schema conventions established by the generalized terminology tooling.

If exact filenames are already dictated by current code/tests, use those.

Do not invent a parallel artifact format.

---

## 2. Preserve evidence semantics

The locale-neutral evidence/provenance artifact must remain authoritative for:

- stable `TermId`;
- stable evidence identity;
- source plugin;
- record identity where applicable;
- name-source plugin;
- table type;
- string ID;
- source-use classification;
- canonical English/context evidence.

Preserve the distinction between:

```text
canonical content evidence
terminology-only evidence
tracker-owned terminology
```

In particular:

```text
SFBGS050.esm
```

must remain **terminology evidence only**.

Nothing in this implementation may allow Free Lanes content to become canonical runtime reference data.

---

## 3. Contextual evidence review

For each `TermId`, inspect all official evidence rows.

Do not blindly collapse multiple evidence rows to one preferred term.

Classify cases such as:

```text
DIRECT_OFFICIAL_TERM
CONTEXTUAL_SUPPORT
MULTIPLE_OFFICIAL_VARIANTS
TRACKER_OWNED
AMBIGUOUS_REQUIRES_EDITORIAL_REVIEW
```

Exact internal enum names are optional; the important requirement is that the implementation/review process distinguishes these cases.

Where multiple official contexts produce different localized forms because of:

- inflection;
- gender;
- number;
- articles;
- case;
- capitalization;
- sentence grammar;
- abbreviated usage;

do not assume those forms are interchangeable standalone labels.

Record the evidence and choose a tracker glossary form only when justified.

If a real editorial ambiguity remains, surface it in the Codex completion response for user decision.

Do not guess.

---

# Glossary deliverables

Create:

```text
docs/localization/FRENCH-GLOSSARY.md
docs/localization/GERMAN-GLOSSARY.md
```

Use the Japanese glossary as a structural precedent where useful, but do not mechanically copy Japanese-specific categories.

Each glossary entry should include, where relevant:

- English concept;
- preferred French/German wording;
- status:
  - official Bethesda;
  - official-derived/contextual;
  - tracker-owned;
- relevant `TermId`;
- official evidence/source note;
- semantic distinction from nearby concepts;
- rejected/confusable alternatives;
- capitalization policy;
- abbreviation policy;
- grammatical notes;
- example tracker UI contexts;
- protected/invariant tokens where applicable.

The glossaries are editorial translation constraints, not runtime sentence-fragment dictionaries.

Do not design the app to mechanically assemble translated prose from glossary entries.

---

# Minimum glossary scope

Stabilize at least the following tracker concepts in both French and German:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Planned Supply
Present
Producing
Inputs
Logistics
Manufacturing
Validation
Resource Matrix
Reshuffle
Lock
Inorganic
Organic
X-Tech
X-Tech Power Core
```

Also inspect the current `en-US` catalogue and terminology evidence for additional **recurring high-value concepts** that would likely create translation inconsistency later.

Add them when justified.

Do not turn the glossary into an exhaustive copy of all 400+ semantic messages.

The goal is to stabilize concepts, not translate the app.

---

# Specific editorial principles

## Official terms first

For concepts with direct official Bethesda evidence, prefer that wording unless:

- evidence is only contextual;
- the official phrase is grammatical within a larger sentence but unsuitable standalone;
- the official concept does not actually match the tracker concept;
- multiple official variants create a genuine context problem.

In those cases, document the distinction.

---

## Tracker concept fidelity

The tracker may deliberately distinguish concepts that Starfield itself does not label.

For tracker-owned terms such as potentially:

```text
Planned Supply
Resource Matrix
Reshuffle
Present
Producing
Inputs
Logistics
```

choose wording for the tracker’s exact meaning rather than forcing a vaguely related Bethesda phrase.

Do not label a term “official” merely because one of its words appears in Bethesda text.

---

## Consistency over literalism

Where several tracker surfaces use the same concept, prefer one stable term unless grammar requires inflection.

Do not optimize glossary entries only for one button or heading.

Record grammar-sensitive forms where French/German may require different sentence forms later.

---

## Technical/invariant tokens

Keep technical tokens invariant unless established product behavior says otherwise.

Examples may include:

```text
He-3
JSON
FormID
X-Tech
keyboard chord tokens
resource abbreviations
```

Do not translate abbreviations merely because a localized expansion exists.

If an official localized Bethesda term includes an invariant product/brand token, preserve the token exactly as official evidence requires.

---

# French-specific review concerns

During glossary review, pay particular attention to:

- grammatical gender;
- articles;
- contractions/elision;
- singular/plural form;
- adjective placement;
- standalone noun phrase vs sentence usage;
- capitalization conventions;
- official wording that only makes sense in a larger phrase.

Do not prebuild French grammar machinery.

Record only evidence-backed glossary guidance.

---

# German-specific review concerns

During glossary review, pay particular attention to:

- compound nouns;
- grammatical gender;
- case-sensitive/context-sensitive forms;
- noun capitalization;
- long-label suitability;
- official compounds vs tracker-owned compounds;
- abbreviation choices;
- standalone noun phrase vs inflected sentence usage.

Do not shorten German terms merely to reduce layout pressure.

Layout fixes belong later.

The glossary should first preserve semantic correctness and consistency.

---

# Terminology value artifacts

Create/complete the French and German terminology value artifacts using the generalized schema.

Required properties:

- keyed by stable evidence identity;
- deterministic ordering;
- locale explicitly identified;
- official localized value preserved exactly where sourced;
- no machine-local paths;
- no raw Bethesda corpora;
- no unrelated game-string dumps;
- no reverse English-name matching;
- no invented official terminology.

If the artifact schema has a field for recommended tracker default vs official observed value, use it consistently with the generalized design.

If current schema deliberately keeps only official observed values and leaves glossary recommendation in Markdown, preserve that separation.

Do not redesign the artifact schema unless a concrete blocker appears.

---

# Verification requirements

Extend/use the generalized terminology verifier so these now pass:

```text
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
```

Japanese must continue to pass:

```text
npm run localization:terminology:verify -- --locale ja-JP
```

The thin locale closure command may still fail later for French/German due to missing reference-name overlays or catalogues; that is expected.

Do not force the full locale closure command to pass prematurely.

Tests should cover at least:

- all evidence IDs accounted for;
- no duplicate locale-value rows;
- no missing required resolved official values;
- source-use classification remains valid;
- `SFBGS050.esm` remains terminology-only;
- locale mismatch rejected;
- unsupported locale rejected;
- French/German value artifacts parse and verify;
- Japanese remains unchanged/closed;
- official evidence identity remains stable.

---

# Editorial review output

In addition to the two glossaries, produce a concise implementation-time summary of terminology decisions.

This may be included in the Codex final response rather than as a separate durable file.

For each genuinely ambiguous or context-sensitive case, report:

```text
TermId
English concept
French options/evidence
German options/evidence
recommended disposition
whether user decision is required
```

Do not hide unresolved choices inside generated artifacts.

If no user decisions remain, say so explicitly.

---

# Out of scope

Do **not**:

- create `fr-FR` semantic catalogue;
- create `de-DE` semantic catalogue;
- generate Codex translations for all semantic messages;
- run DeepL comparison;
- create populated French/German review CSVs beyond any tooling fixture already required;
- generate French/German reference-name overlays;
- resolve all 3,561 reference entities;
- perform composed-fauna proof;
- expose French/German in runtime locale selection;
- add browser `fr-*` / `de-*` resolution;
- change search normalization;
- add accent folding;
- add German `ae/oe/ue/ss` aliases;
- change CSS/layout;
- change accessible shortcut speech;
- optimize bundle size;
- introduce ICU/FormatJS;
- alter persistence/schema;
- change canonical reference-data population.

---

# Runtime exposure guard

After this implementation:

```text
fr-FR
de-DE
```

may have terminology value artifacts and glossaries, but they must still **not** be user-selectable locales.

Verify:

- locale selector unchanged;
- browser automatic resolution unchanged;
- runtime catalogue registry unchanged;
- persisted locale preference behavior unchanged.

Do not add placeholder/sparse French or German catalogues.

---

# Documentation updates

Update durable docs only where terminology/glossary policy changes or new locale-specific guidance is now established.

Likely:

```text
docs/localization/LOCALE-ONBOARDING.md
```

Add/update French and German locale-profile notes only to the extent justified by completed terminology work.

Do **not** mark French or German as fully supported.

Do not claim semantic catalogue completion.

Update `LOCALIZATION-INPUTS.md` only if this implementation reveals a real new terminology-input rule not already documented.

Do not update `BACKLOG.md` to mark localization complete.

---

# Tests and verification

Run at minimum:

```text
npm run localization:provenance:test
npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
npm test
npm run typecheck:tests
npm run lint
git diff --check
```

If terminology changes affect the production build or shared generated contracts, also run:

```text
npm run build
```

Run any new targeted terminology/glossary tests introduced by this implementation.

No ordinary repository verification step may require committed Bethesda game files.

Local installed-game extraction/resolution may be used to produce the reviewed French/German terminology values, but raw Bethesda string tables must remain ignored/local.

---

# Expected completion state

At completion:

- French official terminology values exist and verify;
- German official terminology values exist and verify;
- Japanese terminology still verifies;
- French and German glossaries exist and are implementation-ready;
- tracker-owned terminology is clearly distinguished from official terminology;
- contextual official evidence is not misrepresented as standalone canonical terminology;
- unresolved editorial choices, if any, are explicitly reported;
- later semantic translation work has stable terminology constraints;
- French/German are still not runtime-supported/selectable.

---

# Completion response

Return:

1. branch;
2. files changed;
3. French terminology artifact summary;
4. German terminology artifact summary;
5. glossary files created;
6. official vs tracker-owned terminology decisions;
7. any contextual/multiple-variant findings;
8. any unresolved editorial decisions requiring user input;
9. Japanese compatibility result;
10. `SFBGS050.esm` evidence-only validation result;
11. runtime-exposure guard result;
12. tests/verification results;
13. documentation updates;
14. deviations from the brief, if any;
15. recommended next step;
16. suggested commit message.

The suggested commit message must be descriptive and must not include planning identifiers such as `Parcel 2`.

Do not commit or push unless explicitly instructed.

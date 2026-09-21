# Codex Implementation Brief — Polish Semantic Draft and Pre-DeepL XLIFF Handoff

## Objective

Implement the next Polish onboarding batch by producing the complete **independent Polish semantic draft**, deterministic review package, and one XLIFF 1.2 handoff for later DeepL comparison.

Target locale:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This task stops **before** any DeepL upload or returned-XLIFF import.

The generated Polish draft and XLIFF must be reviewed before the user sends the XLIFF to DeepL.

Do not adjudicate against DeepL yet.

Do not create the final runtime catalogue.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Use the settled Polish policy from:

```text
docs/audits/POLISH-LOCALE-ONBOARDING-PLAN.md
docs/localization/POLISH-GLOSSARY.md
reference-source/official-terminology-values-pl-PL.csv
```

and the staged Polish locale metadata/tooling already committed.

Key product rule:

> Reuse official Starfield Polish wording when concept and context genuinely match. Where Polish grammar or tracker context differs, use the natural contextual form rather than forcing an official string literally.

DeepL is not involved in this parcel.

The Codex draft must be genuinely independent.

---

# Hard checkpoint

This parcel must end with these reviewable artifacts:

```text
src/localization/reviewDrafts/pl-PL.ts
docs/localization/pl-PL-review.csv
docs/localization/pl-PL-deepl.xliff
```

The user will provide the diff/XLIFF for review **before uploading to DeepL**.

Do not proceed into DeepL import/adjudication in this task.

---

# 1. Create the independent Polish semantic draft

Create:

```text
src/localization/reviewDrafts/pl-PL.ts
```

Requirements:

- exact key parity with current `en-US`;
- exact placeholder-name parity;
- no empty values;
- no untranslated English fallback except approved invariants/protected tokens;
- no copying from DeepL or any other machine translation;
- use the approved Polish glossary and official terminology values;
- preserve tracker meaning over literal English word order;
- respect Polish grammar around opaque placeholders;
- use natural Polish UI conventions rather than English title-case habits.

The draft is an editorial candidate, not a final catalogue.

---

# 2. Preserve official terminology

Where the glossary marks official terminology as direct/default, use it unless the specific sentence requires a grammatical/contextual variant.

At minimum respect:

```text
Outpost                  -> Placówka
Cargo Link               -> Połączenie towarowe
Inter-System Cargo Link  -> Międzyukładowe połączenie towarowe
Planetary Body           -> ciało planetarne
Star System              -> Układ gwiezdny
X-Tech                   -> X-Tech
X-Tech Power Core        -> Rdzeń mocy X-Techu
Starfield                -> Starfield
```

Also preserve all five official skill names.

Do not replace official game terminology with invented synonyms merely for stylistic variety.

---

# 3. Context-sensitive Polish grammar

Translate parameterized messages as whole messages.

Opaque placeholders must not require the app to infer or generate grammatical case/gender.

High-risk placeholders include:

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

Prefer structures using:

- punctuation;
- labels;
- arrows;
- quotation;
- impersonal wording;
- syntactic isolation;
- colon constructions;
- count-neutral phrasing.

Do not mutate placeholder names.

Do not encode grammatical case into placeholder names.

---

# 4. Four plural keys

The current runtime syntax remains `one / other`.

The four current pluralized keys are:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

Use natural count-neutral Polish wording if necessary so that the same noun morphology does not become incorrect for `few` / `many`.

The audit suggested structures like:

```text
Liczba ...: {count}
```

but these were examples, not mandated final wording.

Requirements:

- natural Polish;
- exact placeholder preservation;
- structurally valid `one / other` syntax;
- no unsupported `few` / `many` branches;
- no knowingly incorrect universal plural noun form.

If a key cannot be translated naturally under this contract, stop and flag it rather than forcing poor Polish.

---

# 5. Tracker-owned terminology

Apply the approved glossary carefully for:

```text
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
Network
Active Production
Source
Destination
Undo
Redo
Inorganic
Organic
```

Do not assume one literal Polish word fits every key.

Use key-scoped/contextual variants where the glossary permits them.

Preserve semantic distinctions, especially:

- Present != temporal “currently”;
- Producing != Manufacturing;
- Inputs != form fields;
- Logistics means routed/configured cargo use;
- Reshuffle means manual reorder mode, not random shuffle;
- Lock means finish/prevent reordering, not account/security lock;
- Active Production means configured production, not throughput.

---

# 6. Starfield branding

All tracker UI references to the game brand must remain:

```text
Starfield
```

Do not use:

```text
W gwiazdy
```

as tracker branding.

That value is evidence only.

---

# 7. X-Tech contextual forms

Standalone labels may use:

```text
X-Tech
```

Prose may use evidence-backed inflected forms such as:

```text
X-Techem
X-Techu
```

when grammatically required.

Do not over-normalize every occurrence to literal `X-Tech`.

Do not invent unsupported case forms if a sentence can be restructured safely.

---

# 8. Capitalization

Follow Polish sentence-style capitalization.

Do not mechanically copy English title case.

Preserve official capitalization for:

- proper names;
- brand tokens;
- official skill names where appropriate;
- technical tokens.

UI headings/buttons may capitalize the first word according to normal Polish interface conventions.

---

# 9. Accidental-English detection

Generate the draft through the existing accidental-English detector.

Polish-specific allowlist remains:

```text
status
system
```

Shared handling covers invariants/protected tokens such as:

```text
Starfield
X-Tech
JSON
FormID
```

Requirements:

- no broad allowlist growth unless a real false positive appears;
- report every added exception with rationale;
- copied English source text must fail.

If the first draft exposes accidental English, correct it before generating final review artifacts.

---

# 10. Structural validation

Before generating review CSV/XLIFF, validate:

- exact key set;
- exact required placeholder names;
- plural syntax;
- protected tokens;
- no empty strings;
- no malformed formatting;
- no stale source relationships;
- no accidental-English residue after approved allowances.

Do not suppress failures to complete the parcel.

---

# 11. Create deterministic review CSV

Generate:

```text
docs/localization/pl-PL-review.csv
```

using the existing review-package pipeline.

It should contain the established fields for:

- stable key;
- English source;
- Polish Codex draft;
- context;
- risk;
- placeholders/parameters;
- protected tokens;
- terminology/glossary constraints;
- source hash;
- other existing review metadata.

Do not hand-edit the CSV after generation unless the established workflow explicitly expects deterministic regeneration from source.

The draft source remains:

```text
src/localization/reviewDrafts/pl-PL.ts
```

---

# 12. Create one XLIFF 1.2 handoff

Generate:

```text
docs/localization/pl-PL-deepl.xliff
```

Requirements:

- XLIFF 1.2;
- one trans-unit per semantic key;
- stable semantic key identity preserved;
- English source unchanged;
- Polish Codex draft represented in the intended target field/handoff shape;
- source hashes/context/constraints preserved according to the current generalized pipeline;
- placeholders/protected tokens encoded so DeepL cannot silently mutate them without later validation;
- deterministic ordering;
- exact current source set.

Do not split Polish into multiple XLIFF files.

---

# 13. XLIFF is a handoff, not authority

The generated XLIFF must be suitable for DeepL document translation, but:

- it is not the final catalogue;
- it is not an adjudication result;
- its future returned target text is comparative evidence only;
- no machine translation is automatically accepted later.

Do not alter review metadata to make DeepL the preferred/default source.

---

# 14. Pre-DeepL review checkpoint

The completion response must explicitly instruct that the produced XLIFF should **not yet be uploaded to DeepL**.

The expected workflow after this task is:

1. user provides diff and generated XLIFF for review;
2. review checks draft quality, constraints, placeholders, plural handling, accidental English, and XLIFF structure;
3. only after approval does the user upload that exact XLIFF to DeepL;
4. returned XLIFF is handled in a later adjudication parcel.

Do not bypass this checkpoint.

---

# 15. No final semantic catalogue

Do not create:

```text
src/localization/locales/pl-PL.ts
```

The independent draft must remain clearly separate from the final approved catalogue.

---

# 16. No runtime activation

Hard requirement:

```text
runtimeAvailable: false
```

must remain unchanged.

Polish must remain absent from:

- selector;
- runtime semantic registry;
- browser mapping;
- search behavior;
- collation consumers;
- shortcut speech;
- `document.lang` switching.

---

# 17. No reference overlay in this parcel

Do not generate:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

That remains a later stage.

---

# 18. No fauna evidence in this parcel

Do not create:

```text
reference-source/localized-fauna-evidence-pl-PL.json
```

Fauna composition work remains separate.

---

# 19. Review high-risk surfaces

Before finalizing the draft, perform a bounded semantic review of keys involving:

```text
Outpost / Cargo Link / Inter-System
Planned Supply
Present / Producing / Inputs / Logistics
Manufacturing
Validation
Resource Matrix
Reshuffle / Lock
Search
import/export
history
skills
X-Tech
Planetary Body / Star System
Help / shortcuts
status/live-region messages
```

Pay special attention to:

- inflection around placeholders;
- overly literal English structure;
- ambiguous tracker terminology;
- compact labels that become semantically vague;
- English residue.

Do not change UI geometry or shorten correct translations solely for fit.

---

# 20. Tests

Add/extend tests for:

- Polish draft exact key parity;
- placeholder parity;
- plural syntax;
- accidental-English detection;
- glossary/constraint coverage;
- protected tokens;
- deterministic review CSV;
- deterministic XLIFF;
- XLIFF locale identity;
- source-hash freshness;
- one trans-unit per semantic key;
- no final catalogue creation;
- runtime remains inactive.

Run at minimum:

```text
npm test
npm run test:components
npm run localization:terminology:verify
npm run localization:provenance:test
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Run focused review/XLIFF generation/validation commands as applicable.

---

# 21. Scope discipline

Expected tracked changes may include:

```text
src/localization/reviewDrafts/pl-PL.ts
docs/localization/pl-PL-review.csv
docs/localization/pl-PL-deepl.xliff
review/XLIFF tooling tests
possibly small locale-routing/test updates
```

Do not modify:

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

unless a genuine previously-undiscovered tooling bug requires a narrow fix.

If such a bug appears, report it explicitly.

---

# 22. Completion criteria

This parcel is complete when:

- a full independent Polish draft exists;
- all current semantic keys are present;
- placeholders/protected tokens are correct;
- the four plural keys are naturally handled under `one / other`;
- approved terminology/glossary policy is applied;
- accidental-English detection passes;
- review CSV is generated deterministically;
- one XLIFF 1.2 handoff is generated deterministically;
- XLIFF/source hashes/constraints validate;
- no final Polish catalogue exists;
- Polish remains runtime-inactive;
- the XLIFF has **not** been sent to DeepL.

---

# Completion response

Return:

1. branch;
2. files changed;
3. Polish draft path;
4. semantic key count;
5. exact key/placeholder parity result;
6. accidental-English detector result;
7. any new Polish allowlist additions, with rationale;
8. four plural-key final draft wordings;
9. count-neutral plural validation result;
10. official terminology conformance summary;
11. tracker-owned terminology conformance summary;
12. placeholder-grammar review findings;
13. high-risk keys manually corrected during drafting;
14. review CSV path;
15. review row count;
16. XLIFF path;
17. XLIFF version;
18. XLIFF trans-unit count;
19. source-hash/constraint validation result;
20. protected-token validation result;
21. deterministic-generation result;
22. confirmation no final `pl-PL` catalogue was created;
23. confirmation no reference overlay was created;
24. confirmation runtime remains inactive;
25. automated verification results;
26. `git diff --check` result;
27. deviations from brief;
28. explicit instruction that the XLIFF is ready for review but **must not yet be uploaded to DeepL**;
29. recommended next action after review approval;
30. suggested commit message;
31. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.

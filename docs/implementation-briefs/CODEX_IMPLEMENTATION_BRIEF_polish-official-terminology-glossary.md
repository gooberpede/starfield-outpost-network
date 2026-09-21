# Codex Implementation Brief — Polish Official Terminology and Glossary

## Objective

Implement the second Polish onboarding batch by creating and reviewing:

1. the Polish official-terminology values artifact; and
2. the Polish glossary and locale-keyed review constraints.

Target locale:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This task establishes the approved Polish terminology policy that later semantic translation/adjudication must follow.

Do not create the Polish semantic draft, review CSV, XLIFF, final semantic catalogue, reference overlay, runtime registration, browser mapping, search normalization, collation wiring, shortcut speech, or UI changes in this task.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Follow:

```text
docs/audits/POLISH-LOCALE-ONBOARDING-PLAN.md
```

and the already implemented staged Polish locale contract.

The key product rule for this parcel is:

> Text and terminology that already exist in Starfield should carry over into the tracker when the concept and context are genuinely the same. Do not replace official Polish game wording with an invented tracker synonym merely for stylistic preference. However, when the tracker uses the term in a different grammatical or conceptual context, use the form that is correct and natural in that context rather than forcing an official string literally.

This rule applies both to exact official terms and to inflected/contextual variants.

---

# Settled policy before implementation

Treat the following as already decided:

## Official Bethesda terms

Use official Starfield Polish wording as the default when:

- the tracker concept is the same;
- the grammatical role is compatible;
- the official wording is suitable as a standalone label or the same kind of phrase.

## Context-sensitive terms

Do not require one literal form in every sentence when Polish grammar requires:

- case changes;
- number changes;
- gender/agreement;
- altered word order;
- inflection of `X-Tech`;
- a shorter contextually unambiguous form.

## Brand

Preserve:

```text
Starfield
```

as the tracker/game brand name.

The official evidence value:

```text
W gwiazdy
```

must remain provenance/evidence only and must **not** replace the product brand in tracker UI.

## Inter-System Cargo Link

Preferred standalone/default:

```text
Międzyukładowe połączenie towarowe
```

Allow evidence-backed contextual order such as:

```text
Połączenie towarowe międzyukładowe
```

where natural Polish sentence structure warrants it.

## Star System

Preferred full tracker term:

```text
Układ gwiezdny
```

Allow compact/contextual:

```text
układ
```

only where context already makes the meaning unambiguous.

## X-Tech

Preferred standalone:

```text
X-Tech
```

Allow grammatically required contextual forms such as:

```text
X-Techem
X-Techu
```

Do not force literal `X-Tech` into every Polish sentence.

## X-Tech Power Core

Use the official evidence-backed standalone form unless review finds a genuine context mismatch:

```text
Rdzeń mocy X-Techu
```

## Planetary Body

Do not pre-commit blindly to one form.

Evaluate the official evidence and tracker meaning and recommend the best standalone Polish tracker term, considering at least:

```text
ciało planetarne
ciało niebieskie
```

or another evidence-supported option if justified.

The final choice must preserve the tracker concept: a selectable planetary/body object within a star system, not an arbitrarily broad astronomical category.

If the evidence remains genuinely ambiguous, flag it for user review rather than guessing.

---

# 1. Generate official Polish terminology values

Create:

```text
reference-source/official-terminology-values-pl-PL.csv
```

using the existing deterministic terminology pipeline and unchanged evidence identities.

Expected evidence closure:

```text
37 evidence rows
33 textual evidence rows
4 intended absences
0 unresolved
```

Requirements:

- preserve exact evidence identity/order;
- preserve source/plugin provenance;
- preserve intended absence rows;
- decode strictly as UTF-8;
- no manual re-keying of evidence IDs;
- no guessed strings where the official source has no value;
- no substitution from community/wiki translations;
- no normalization that changes Polish wording beyond the established pipeline.

The values artifact is evidence, not yet the semantic catalogue.

---

# 2. Review and classify every terminology identity

For each of the existing 19 term IDs, classify its Polish handling as one of:

```text
A. direct official standalone default
B. official term requiring context-sensitive/inflected variants
C. tracker-owned concept informed by official evidence
D. evidence-only / not suitable as tracker UI default
```

Record the rationale in the glossary.

Do not create a fifth ad hoc category unless a real need is demonstrated.

---

# 3. Official terms expected to be strong defaults

At minimum review and likely approve:

```text
Outpost
Cargo Link
Inter-System Cargo Link
X-Tech
X-Tech Power Core
official skill names
```

Expected current evidence includes:

```text
Outpost                  -> Placówka
Cargo Link               -> Połączenie towarowe
Inter-System Cargo Link  -> Międzyukładowe połączenie towarowe
X-Tech                   -> X-Tech
X-Tech Power Core        -> Rdzeń mocy X-Techu
```

and official Polish skill names such as:

```text
Zarządzanie placówką
Inżynieria placówek
Zasiedlanie planet
Metody badawcze
Projekty specjalne
```

Verify these from the generated evidence rather than copying them blindly from this brief.

If the generated official values disagree with the audit evidence, stop and report the discrepancy.

---

# 4. Official terms requiring contextual treatment

Review at least:

```text
Biome
Planet
Planetary Body
Star System
Starfield
X-Tech in prose
Inter-System Cargo Link word order
```

For each, record:

- official evidence forms;
- whether a safe standalone form exists;
- preferred tracker standalone form;
- approved contextual variants;
- excluded/misleading forms;
- capitalization guidance;
- whether the term may be shortened on compact surfaces.

Do not treat contextual official evidence as if it were automatically a canonical standalone label.

---

# 5. Create Polish glossary

Create:

```text
docs/localization/POLISH-GLOSSARY.md
```

Use the existing three-class structure.

## Class 1 — Official Bethesda terminology

Include direct/default official concepts such as:

```text
Outpost
Cargo Link
Inter-System Cargo Link
X-Tech
X-Tech Power Core
official skill names
```

For each entry record:

- English concept/key name;
- official Polish evidence;
- recommended standalone tracker form;
- capitalization;
- allowed contextual variants;
- excluded senses;
- compact-label guidance where relevant;
- evidence/source notes.

## Class 2 — Tracker-owned preferred terminology

Include at minimum:

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

For each entry propose:

- preferred Polish term or phrase;
- intended tracker meaning;
- excluded meanings;
- grammatical category;
- compact/full form if useful;
- contexts/keys where the recommendation applies;
- whether variants are expected.

These are proposals to be used by the later semantic review stage, not claims of Bethesda authorship.

Do not invent terminology that conflicts with an existing official Starfield term when the meaning is the same.

## Class 3 — Context-sensitive concepts

Include at minimum:

```text
Biome
Planet
Planetary Body
Star System
Starfield branding
X-Tech in declined prose
Inter-System Cargo Link contextual order
Present
Producing
Inputs
Reshuffle
Lock
Source
Destination
Inorganic
Organic
```

where one literal invariant phrase would be misleading or ungrammatical.

---

# 6. Tracker-owned terminology review principles

The following semantic distinctions are important.

## Planned Supply

Must mean:

- intended/virtual future supply;
- not current inventory;
- not reservation;
- not physical delivery already happening.

## Present

Must mean the resource/product is present at an outpost.

Avoid a form that reads primarily as “currently/today” if that obscures the matrix-state meaning.

## Producing

Must represent configured/active production state.

Do not collapse it into the broader noun “manufacturing” if that would blur the matrix distinction.

## Inputs

Must mean required recipe/material inputs.

Do not use a word whose primary UI meaning is form fields or data-entry inputs if a clearer material/recipe term exists.

## Logistics

Means the item is actually configured on routed cargo/export logistics.

It does not mean merely “available for logistics”.

## Manufacturing

Means the manufacturing/fabrication domain/configuration.

Keep it semantically distinct from the state label “Producing”.

## Validation

May use a technical Polish term if natural, but distinguish:
- the Validation feature/panel;
- prose such as “check/correctness problems”.

One invariant word is not mandatory across every sentence.

## Reshuffle

Means enter/manual reorder mode.

It must **not** imply random shuffle.

## Lock

Means finish/prevent reordering.

It must not imply account/security locking or permanent immutability of data.

## Active Production

Means configured production state, not measured throughput.

## Source / Destination

Use cargo/supply endpoint senses, not generic “purpose” or evidentiary-source meanings unless the key context requires them.

## Inorganic / Organic

These may require nominalized/category forms or context-aware adjective agreement.

Do not force a single adjective across every surface without checking the implied noun.

---

# 7. Planetary Body decision

This is the main terminology decision in this parcel.

Review:

- all official Polish evidence for Planet / Planetary Body / celestial-body language;
- how the tracker actually uses the selector and label;
- the semantic scope of the current English tracker term.

Recommend one preferred standalone Polish form.

The recommendation should answer:

1. Does `ciało planetarne` sound natural and specific enough?
2. Is `ciało niebieskie` too broad for the tracker concept?
3. Does Bethesda use a different phrase that better fits?
4. Would a context-specific label avoid ambiguity more naturally?

If one option is clearly preferable, implement it in the glossary/constraints.

If genuinely ambiguous, mark:

```text
USER REVIEW REQUIRED
```

and do not pretend certainty.

---

# 8. Star System policy

Use:

```text
Układ gwiezdny
```

as the preferred full term unless generated evidence clearly contradicts the audit.

Allow:

```text
układ
```

as a context-sensitive compact variant when the UI already establishes the astronomical context.

Do not globally constrain every occurrence of English `system` to the full two-word form.

---

# 9. Starfield brand policy

The glossary must explicitly state:

```text
Starfield
```

is invariant branding in tracker UI.

Official localized evidence such as:

```text
W gwiazdy
```

must be recorded as official evidence but classified as unsuitable for replacing the game/product brand.

Ensure later constraint generation does not force `W gwiazdy` into tracker UI.

---

# 10. X-Tech policy

The glossary must distinguish:

```text
standalone label: X-Tech
contextual Polish inflection: X-Techem / X-Techu / other evidence-backed forms
```

Do not enumerate speculative case forms.

Record only:

- observed official variants;
- forms needed by actual tracker contexts;
- guidance that human review may permit grammatically necessary inflection.

The constraint system must not require literal invariant `X-Tech` where Polish grammar makes that wrong.

---

# 11. Build Polish review constraints

Populate the Polish locale-keyed constraint data used by:

```text
src/localization/reviewPackage.ts
```

or its current generalized source.

Use the existing constraint types only:

```text
phrase
key-scoped
semantic-concept
approved variants
```

Do not add a morphology engine.

Do not create regex-heavy grammar logic.

Do not enumerate every case form in Polish.

The goal is useful review guidance, not automated Polish grammar generation.

---

# 12. Constraint strategy

Use:

## Phrase constraints

Only when the Polish value should genuinely remain invariant for the relevant context.

Examples may include:

```text
Placówka
Połączenie towarowe
Starfield
```

where appropriate.

## Key-scoped constraints

Use for surface-specific labels such as:

- Resource Matrix headings;
- Planned Supply heading;
- compact/full cargo terms;
- specific button labels;
- selector labels;
- validation panel headings.

## Semantic-concept constraints

Use when wording may change by grammatical role but the meaning must remain stable.

Examples:

```text
Present
Producing
Inputs
Reshuffle
Lock
Source
Destination
X-Tech contextual use
```

## Variant lists

Keep them finite and evidence-backed.

If a concept requires open-ended Polish inflection, use context notes/human adjudication instead of pretending a finite variant list is exhaustive.

---

# 13. Accidental-English allowlist review

Review the staged Polish-specific accidental-English allowlist:

```text
status
system
```

Confirm whether both are legitimate Polish words/cognates likely to appear naturally.

Only add another Polish-specific exception if the terminology/glossary work produces a real false positive.

Shared invariant handling should continue to cover technical/brand tokens such as:

```text
Starfield
X-Tech
JSON
FormID
```

Do not broaden the allowlist preemptively.

---

# 14. Capitalization policy

Polish common nouns should follow Polish capitalization norms.

Do not inherit English title case mechanically.

Record guidance for:

- sentence starts;
- selector labels;
- panel headings;
- buttons;
- glossary standalone forms;
- official skill names;
- technical/brand tokens.

Do not lowercase official proper names or skill titles if Bethesda’s official display uses capitalization intentionally.

---

# 15. Compact labels

For terms likely to appear in narrow controls or matrix columns, note whether:

- the full preferred term is suitable;
- a shorter context-safe variant exists;
- no safe short form exists.

Do not invent abbreviations purely to fit current geometry.

Do not change UI dimensions.

Any future clipping is a separate QA/UI issue.

---

# 16. Plural-language guidance

Do not implement richer plural syntax in this task.

The glossary should note that the four existing pluralized keys must later use natural count-neutral wording if possible:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

Do not finalize their complete translated strings in this parcel unless required as terminology examples.

The semantic stage will adjudicate the full messages.

---

# 17. Placeholder grammar guidance

Add durable glossary/review guidance for opaque inserted values:

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
```

General rule:

> Do not require the application to decline or infer grammatical gender/case for inserted official or user-authored names.

Prefer later message structures using:

- punctuation;
- labels;
- arrows;
- quotation;
- impersonal wording;
- syntactic isolation.

Do not encode case in placeholder names.

---

# 18. Verification of terminology artifact

Add/extend tests for Polish terminology values.

At minimum verify:

- 37 evidence rows;
- 33 textual rows;
- 4 intended absences;
- zero unresolved rows;
- deterministic evidence order;
- strict UTF-8;
- expected recommended direct defaults;
- Starfield brand exception;
- X-Tech contextual treatment;
- selected Planetary Body policy if settled.

Do not make tests overly brittle to harmless contextual inflection.

---

# 19. Verification of glossary constraints

Add/extend tests proving:

- Polish constraints are no longer empty;
- stale keys fail closed;
- official terms are routed to the intended constraint class;
- context-sensitive concepts allow approved variants where appropriate;
- tracker-owned concepts receive Polish review guidance;
- Starfield is not forced to `W gwiazdy`;
- X-Tech does not require one invariant literal form in all prose;
- constraint output is deterministic.

Do not test prose style by exact whole-sentence equality.

---

# 20. No semantic draft yet

Do not create:

```text
src/localization/reviewDrafts/pl-PL.ts
docs/localization/pl-PL-review.csv
docs/localization/pl-PL-deepl.xliff
src/localization/locales/pl-PL.ts
```

The terminology/glossary/constraints should be approved first.

---

# 21. No reference overlay yet

Do not generate:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

That remains a later stage.

---

# 22. Runtime remains inactive

Hard requirement:

```text
runtimeAvailable: false
```

must remain unchanged.

Polish must remain absent from:

- selector;
- runtime semantic registry;
- browser mapping;
- search;
- runtime collation;
- shortcut speech;
- `document.lang` switching.

---

# 23. Durable documentation

Create only:

```text
docs/localization/POLISH-GLOSSARY.md
```

plus the terminology values CSV and necessary implementation/test changes.

Do not add a final Polish Locale Profile yet.

Do not mark Polish Supported.

Do not update post-localization cleanup status.

---

# 24. Tests and verification

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

Run any focused terminology/glossary/review-package commands that already exist.

Expected:

- all existing locales remain unchanged;
- Polish terminology resolves exactly;
- Polish constraints are valid and deterministic;
- runtime remains inactive;
- no semantic draft artifacts are required yet.

---

# 25. Scope discipline

Expected tracked changes may include:

```text
reference-source/official-terminology-values-pl-PL.csv
docs/localization/POLISH-GLOSSARY.md
src/localization/reviewPackage.ts
terminology tooling/tests
review constraint tests
```

Potentially small helper changes if genuinely needed.

Unexpected changes to:

```text
src/localization/locales/*
src/localization/generated/*
src/ui/*
CSS
runtime registry
browser resolver
search
persistence/domain code
```

should be treated as scope creep.

---

# 26. Completion criteria

This parcel is complete when:

- official Polish terminology values exist and fully close;
- all 19 term IDs have an explicit handling classification;
- `POLISH-GLOSSARY.md` exists with the three agreed classes;
- official Starfield terminology is carried over where context matches;
- context-sensitive Polish inflection is documented rather than suppressed;
- tracker-owned terminology proposals are recorded with excluded senses;
- Planetary Body is either responsibly settled or explicitly flagged for user review;
- Starfield branding remains invariant;
- X-Tech contextual inflection is supported by constraints;
- Polish review constraints are populated and fail closed;
- Polish remains runtime-inactive;
- no semantic translation artifacts are created prematurely.

---

# Completion response

Return:

1. branch;
2. files changed;
3. terminology artifact path;
4. evidence-row closure;
5. list of all 19 term IDs and classification A/B/C/D;
6. direct official defaults approved;
7. context-sensitive official terms;
8. Planetary Body recommendation and rationale;
9. Star System final policy;
10. Starfield brand policy;
11. X-Tech policy;
12. tracker-owned terminology proposals;
13. ambiguous tracker-owned terms requiring user review, if any;
14. glossary path;
15. constraint types used;
16. Polish accidental-English allowlist result;
17. capitalization policy;
18. compact-label guidance;
19. plural guidance;
20. placeholder grammar guidance;
21. terminology verification results;
22. constraint verification results;
23. full automated test results;
24. `git diff --check` result;
25. confirmation runtime remains inactive;
26. confirmation no semantic draft/XLIFF/catalogue was created;
27. confirmation no reference overlay was created;
28. deviations from brief;
29. recommended next stage;
30. suggested commit message;
31. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.

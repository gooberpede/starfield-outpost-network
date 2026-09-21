# Codex Implementation Brief — Polish DeepL Import, Neutral Adjudication, and Final Catalogue

## Objective

Import the user-supplied Polish XLIFF returned from DeepL, validate it against the frozen pre-DeepL handoff, neutrally adjudicate every semantic row against:

- the English source;
- the independent Codex Polish draft;
- the returned DeepL translation;
- the approved Polish glossary;
- official Bethesda terminology evidence;
- key/context/risk metadata;
- placeholder and protected-token requirements;

and generate the final approved Polish semantic catalogue.

Target locale:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This parcel must **not** activate Polish at runtime.

Do not generate the Polish reference-name overlay or fauna evidence in this task.

Do not commit or push unless explicitly instructed.

---

# Input returned from DeepL

Use the user-supplied returned XLIFF corresponding to:

```text
docs/localization/pl-PL-deepl.xliff
```

The approved pre-DeepL handoff had SHA-256:

```text
207B0A214CD9D378D2FCFBE2DF7B86E068B07FA20C1BCBAEC6C968466A9D2F97
```

The returned DeepL document is expected to contain translated `<target>` values while preserving the frozen English sources and review metadata.

Do not treat the returned file as authoritative merely because it came from DeepL.

---

# Pre-import review findings

The returned XLIFF has already received a structural/manual pre-review.

Observed:

```text
XLIFF version: 1.2
source-language: en-US
target-language: pl-PL
trans-units: 414
unique IDs: 414
non-empty targets: 414
source-hash metadata: present on all 414 rows
source hashes matching source text: 414 / 414
```

No new product-policy decision is required before import.

However, the returned DeepL text contains expected machine-translation failures that **must be caught by validation/adjudication rather than silently accepted**.

## Placeholder corruption

A bounded independent scan found approximately:

```text
68 / 414
```

rows where DeepL translated, declined, renamed, removed, or otherwise changed required placeholder names.

Examples include transformations like:

```text
{outpost}     -> {placówka}
{item}        -> {element}
{resource}    -> {zasób}
{contents}    -> {zawartość}
{destination} -> {miejscem docelowym}
```

The repository importer is the authority for the exact invalid-row count.

Do not hard-code `68` as an expected test value unless the importer independently produces that exact result.

## Plural syntax corruption

DeepL materially rewrote the application's plural syntax in the four pluralized source keys, including translating syntax tokens such as:

```text
plural
one
other
count
```

Examples include Polish-language pseudo-syntax such as:

```text
{liczba, liczba mnoga, ...}
```

and:

```text
{count, liczba mnoga, ...}
```

All such structural mutations must be classified invalid.

The final Polish catalogue must retain the approved narrow `one / other` syntax and count-neutral Polish wording.

## Terminology drift

DeepL frequently ignores the approved official terminology despite the terminology notes.

Examples include translating Cargo Link as variants such as:

```text
połączenie transportowe
połączenie ładunkowe
łącze ładunkowe
link do ładunku
```

instead of the approved Starfield term:

```text
Połączenie towarowe
```

Other rows may likewise use synonyms or literal translations that conflict with the approved glossary.

These are adjudication differences, not new policy questions.

The approved glossary remains authoritative.

---

# Source of truth

Use:

```text
docs/audits/POLISH-LOCALE-ONBOARDING-PLAN.md
docs/localization/POLISH-GLOSSARY.md
reference-source/official-terminology-values-pl-PL.csv
src/localization/reviewDrafts/pl-PL.ts
docs/localization/pl-PL-review.csv
```

and the exact current `en-US` catalogue.

The already approved corrected Codex draft includes:

```text
validation.counts
Błędy: {errors} · Ostrzeżenia: {warnings} · Informacje: {info}

matrix.state.active
{item}: stan aktywny

matrix.state.inactive
{item}: stan nieaktywny
```

Preserve those corrections as the Codex candidate during adjudication.

---

# 1. Import the returned XLIFF through the existing validator

Use the existing generalized returned-XLIFF import path.

Validate at minimum:

- XLIFF version/shape;
- `source-language="en-US"`;
- `target-language="pl-PL"`;
- exact 414-key identity;
- no missing/duplicate/unknown keys;
- exact current English source;
- exact source SHA-256;
- placeholder names;
- protected tokens;
- supported plural structure;
- non-empty target text;
- locale identity;
- stale review/constraint detection.

Do not manually copy translations out of the XLIFF into another format before validation.

---

# 2. Record invalid DeepL rows explicitly

Do not discard malformed DeepL rows.

The review/adjudication artifact should record that DeepL supplied a candidate but that candidate failed machine validation.

Use the existing decision/status model, including the established equivalent of:

```text
INVALID_DEEPL_REPAIRED
```

where appropriate.

For each invalid candidate record:

- the DeepL target;
- the reason it was invalid;
- the repaired/final candidate;
- the adjudication rationale.

Do not silently normalize translated placeholders back to English names and then pretend DeepL supplied a valid candidate.

Invalid DeepL output remains useful comparative evidence, but can never be selected verbatim.

---

# 3. Neutral row-by-row adjudication

Adjudicate **all 414 rows**.

Do not default to:

- Codex;
- DeepL;
- shortest wording;
- literal English;
- official terminology in contexts where grammar requires a variant.

Available decision classes should follow the established generalized workflow, such as:

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

Use the repository's actual existing names.

Every non-trivial choice must have a substantive rationale.

The final catalogue must be generated from approved adjudication rows, not hand-edited independently.

---

# 4. Adjudication priority

For each row consider, in this order:

1. semantic fidelity to the English source and actual tracker behavior;
2. approved official Bethesda terminology where concept/context match;
3. Polish grammatical naturalness;
4. opaque-placeholder safety;
5. glossary distinctions and excluded senses;
6. accessibility/context notes;
7. compactness appropriate to the actual surface;
8. Codex-vs-DeepL wording quality.

Do not choose wording solely because one candidate sounds smoother if it changes product meaning.

---

# 5. Official terminology

Enforce the approved policy.

Important defaults include:

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

and the five approved official skill names.

Contextually correct inflection and word order remain allowed.

Do not accept DeepL synonyms merely because they are understandable Polish when they replace established Starfield terminology without grammatical necessity.

---

# 6. Cargo Link terminology requires particular scrutiny

The returned DeepL XLIFF shows widespread Cargo Link drift.

Audit every row constrained by:

```text
term.cargo-link
term.inter-system-cargo-link
```

Do not accept uncontrolled variation such as:

```text
połączenie transportowe
połączenie ładunkowe
łącze ładunkowe
link cargo
kanał transportowy
```

where the app is naming the Starfield construct.

Use:

```text
Połączenie towarowe
Międzyukładowe połączenie towarowe
```

or grammatically necessary contextual forms/order.

Tracker prose that refers generically to a relationship rather than the named construct may use ordinary Polish only if the key/context genuinely warrants it.

---

# 7. Placeholder safety

The final value for every row must preserve required placeholder names exactly.

Opaque values include:

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

and all other catalogue parameters.

Do not decline a placeholder by changing its identifier.

Do not infer gender or case from the inserted value.

Where Polish needs case/agreement, restructure the sentence around the placeholder using:

- labels;
- punctuation;
- quotation;
- arrows;
- impersonal constructions;
- syntactic isolation.

The final catalogue must pass exact required-name parity.

Legitimate repeated occurrences remain allowed under the existing validation policy.

---

# 8. Plural keys

The four pluralized keys are:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

DeepL's returned versions are structurally invalid and must not be selected verbatim.

Preserve the current application's supported syntax:

```text
one / other
```

Do not introduce:

```text
few
many
```

in this parcel.

Use the approved count-neutral Polish strategy.

The independent draft currently proposes:

```text
cargo.pad.count
Liczba połączeń towarowych: {count}

validation.issueCount
Walidacja — liczba problemów: {count}

validation.plannedSupplyUnresolved
Planowane zaopatrzenie — liczba nierozwiązanych pozycji: {count}. Pozycje: {itemList}.

search.results.found
Liczba placówek, w których znaleziono pozycję „{searchItem}”: {count}.
```

These remain strong candidates but should still be adjudicated rather than automatically copied.

Test representative counts:

```text
1
2
5
12
22
25
```

and confirm rendered Polish remains natural.

---

# 9. Other non-ICU count-bearing strings

Re-audit non-plural count messages during adjudication.

In particular preserve the already corrected:

```text
validation.counts
Błędy: {errors} · Ostrzeżenia: {warnings} · Informacje: {info}
```

Do not accept a DeepL formulation that attaches Polish count-sensitive noun forms directly to arbitrary numeric placeholders unless it is structurally safe for all values.

---

# 10. Matrix state placeholder isolation

Preserve the approved safe pattern:

```text
matrix.state.active
{item}: stan aktywny

matrix.state.inactive
{item}: stan nieaktywny
```

or an equally safe custom formulation.

Do not select a candidate where an adjective directly agrees with unknown `{item}`.

---

# 11. Starfield branding

Final tracker UI must use:

```text
Starfield
```

not:

```text
W gwiazdy
```

The latter remains evidence only.

Reject any DeepL branding translation or paraphrase.

---

# 12. X-Tech

Use standalone:

```text
X-Tech
```

and evidence-backed Polish inflection where context requires it.

Do not reject a grammatically necessary `X-Techu` / `X-Techem` solely because it differs from the standalone term.

Do not invent unsupported forms where a safe sentence restructure is preferable.

---

# 13. Tracker-owned terminology

Review DeepL carefully against the glossary for:

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

Preserve settled semantic distinctions.

In particular:

- Planned Supply is virtual/intended future supply;
- Present is a matrix state, not merely temporal “currently”;
- Producing differs from Manufacturing;
- Inputs means recipe/material requirements;
- Logistics means configured/routed cargo use;
- Reshuffle means manual reorder mode, not randomness;
- Lock means finish/prevent reordering;
- Active Production is configured production, not measured throughput.

---

# 14. Accidental-English validation

Run the existing detector against candidate/final values.

Polish-specific allowlist remains:

```text
status
system
```

Do not broaden it unless adjudication reveals a genuine Polish false positive.

Shared protected/invariant handling continues for tokens such as:

```text
Starfield
X-Tech
JSON
FormID
```

Record any proposed new exemption explicitly.

---

# 15. Semantic quality audit after adjudication

After all rows receive decisions, perform a bounded whole-catalogue semantic pass.

Search for:

- accidental English residue;
- glossary contradictions;
- inconsistent Cargo Link terminology;
- inconsistent Outpost terminology;
- literal/awkward English word order;
- declined/renamed placeholders;
- unsafe gender agreement around opaque values;
- incorrect count morphology;
- English title-case habits;
- inconsistent punctuation;
- suspicious machine-translation calques;
- compact labels whose meaning changed.

Correct through adjudication, not by silently editing the generated final catalogue.

---

# 16. Generate final Polish semantic catalogue

Only after all rows are approved, generate:

```text
src/localization/locales/pl-PL.ts
```

Requirements:

- exact 414-key parity with `en-US`;
- exact required placeholder-name parity;
- no empty values;
- no invalid plural syntax;
- protected tokens preserved;
- glossary/terminology policy satisfied;
- accidental-English detection passes;
- generated deterministically from adjudication evidence.

Do not register this catalogue at runtime yet.

---

# 17. Preserve review evidence

Update/generate the Polish review/adjudication artifact according to the existing generalized workflow.

It must retain enough information to reconstruct:

- English source;
- Codex independent draft;
- DeepL candidate;
- DeepL validation status;
- final decision;
- final value;
- rationale;
- context/risk;
- terminology constraints;
- source hash.

Do not overwrite the independent Codex draft with the DeepL result.

Do not erase invalid DeepL evidence.

---

# 18. Decision statistics

Report counts for:

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

using actual project decision labels.

Also report:

- structurally valid DeepL rows;
- invalid-token rows;
- typographic-only differences if the workflow distinguishes them;
- substantive Codex-vs-DeepL differences.

These are review evidence, not quality scores.

---

# 19. Returned-XLIFF structural report

Report:

- imported trans-unit count;
- duplicate IDs;
- missing/unknown IDs;
- source hash mismatches;
- placeholder-invalid rows;
- protected-token-invalid rows;
- plural-structure-invalid rows;
- empty target rows;
- other import validation failures.

If the repository importer produces counts that differ from the pre-review estimate, use the importer result and explain why.

---

# 20. No runtime activation

Hard requirement:

```text
runtimeAvailable: false
```

must remain unchanged.

Do not add Polish to:

- selector;
- runtime semantic registry;
- browser mapping;
- runtime search;
- collation consumers;
- shortcut speech;
- `document.lang` switching.

The existence of a final catalogue does not authorize runtime exposure.

---

# 21. No reference overlay or fauna work

Do not create:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
reference-source/localized-fauna-evidence-pl-PL.json
```

Those remain the next separate stage.

---

# 22. Tests

Add/extend tests for:

- returned-XLIFF import;
- exact key/source/hash matching;
- invalid placeholder detection;
- invalid plural-token detection;
- protected tokens;
- neutral decision completeness;
- substantive rationale requirements;
- final catalogue generation;
- exact final key/placeholder parity;
- accidental-English detection;
- Polish terminology/glossary conformance;
- four plural keys across representative counts;
- `validation.counts`;
- Matrix active/inactive placeholder isolation;
- deterministic final catalogue generation;
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

Run all focused review/XLIFF/adjudication/final-catalogue verification commands available in the repository.

---

# 23. Scope discipline

Expected changes may include:

```text
docs/localization/pl-PL-review.csv
returned-XLIFF/adjudication evidence as established by current workflow
src/localization/locales/pl-PL.ts
review/adjudication tests
small generalized importer fixes only if a genuine bug is exposed
```

Do not modify:

```text
src/localization/generated/*
src/ui/*
CSS
runtime locale registry
browser resolver
search behavior
persistence/domain code
```

Unexpected runtime/UI changes are scope creep.

---

# 24. Stop conditions

Stop and report before final catalogue generation if:

- the returned XLIFF does not correspond to the frozen 414-key handoff;
- source hashes do not close;
- import tooling cannot distinguish invalid DeepL candidates from valid ones;
- glossary/terminology constraints cannot be represented by the current adjudication system;
- a plural key cannot be rendered naturally within the existing `one / other` contract;
- opaque-placeholder grammar cannot be made safe for a required message;
- adjudication requires a new product terminology decision not already covered by the glossary.

Do not invent a policy merely to finish the parcel.

---

# 25. Completion criteria

This parcel is complete when:

- the returned DeepL XLIFF is imported and fully validated;
- malformed DeepL candidates remain recorded as invalid evidence;
- all 414 rows are neutrally adjudicated;
- every final value has a substantive basis;
- official terminology/glossary policy is applied;
- placeholders/protected tokens/plural syntax close exactly;
- the four Polish plural messages remain natural under representative counts;
- final `pl-PL.ts` is generated deterministically;
- Polish remains runtime-inactive;
- no reference overlay/fauna work is performed.

---

# Completion response

Return:

1. branch;
2. files changed;
3. returned XLIFF used;
4. imported trans-unit count;
5. source/hash closure;
6. structurally valid DeepL row count;
7. invalid DeepL row count;
8. invalid-placeholder count;
9. invalid-protected-token count;
10. invalid-plural count;
11. empty/missing/duplicate/unknown row counts;
12. Codex-vs-DeepL identical count;
13. typographic-only difference count, if supported;
14. substantive difference count;
15. decision-class counts;
16. notable DeepL terminology failures;
17. notable placeholder/grammar failures;
18. final four plural-key values;
19. `validation.counts` final value;
20. Matrix active/inactive final values;
21. official terminology conformance;
22. tracker-owned terminology conformance;
23. any new accidental-English allowlist additions;
24. final catalogue path;
25. final catalogue key/placeholder parity;
26. deterministic-generation result;
27. automated verification results;
28. `git diff --check` result;
29. confirmation runtime remains inactive;
30. confirmation no reference overlay/fauna evidence was created;
31. deviations from brief;
32. any unresolved user decisions;
33. recommended next stage;
34. suggested commit message;
35. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.

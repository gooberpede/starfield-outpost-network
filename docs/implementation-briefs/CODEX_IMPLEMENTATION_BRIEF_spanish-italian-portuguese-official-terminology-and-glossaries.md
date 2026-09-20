# Codex Implementation Brief — Spanish, Italian, and Brazilian Portuguese Official Terminology and Glossaries

## Objective

Implement the next localization stage for:

```text
Spanish (Spain)  -> es-ES
Italian          -> it-IT
Portuguese (Brazil) -> pt-BR
```

This task should:

- resolve and commit the official terminology values for all three locales;
- author one durable glossary per locale;
- classify terms as official Bethesda terminology, tracker-owned preferred terminology, or context-sensitive terminology;
- establish glossary constraints that will govern the later semantic-catalogue review;
- preserve the current runtime-inactive state of all three locales.

This task must **not** begin the 414-key semantic catalogue translation/review stage.

Do not commit or push unless explicitly instructed.

---

## Settled product decisions

The following are already agreed.

### Regional targets are strict

Use:

```text
es-ES  -> Spanish (Spain)
it-IT  -> Italian
pt-BR  -> Portuguese (Brazil)
```

Do not broaden or neutralize wording toward:

```text
Latin-American Spanish
European Portuguese
other unsupported regional variants
```

The product should not imply coverage of regional variants that have not been explicitly onboarded.

---

## Official terminology remains evidence-led

Where Bethesda has a suitable official localized term, prefer it.

Where the tracker concept is:

- broader;
- narrower;
- more abstract;
- structurally different;
- or used in a different semantic role;

do not force official game wording merely because an English term happens to overlap.

Tracker-owned terminology is acceptable and expected where appropriate.

---

## Capitalization is contextual

Do not treat capitalization in Bethesda source evidence as a universal tracker rule.

For example, an official value that appears in title case in game data may still need sentence-case treatment in:

- prose;
- tooltips;
- validation messages;
- status text;
- accessible descriptions.

The glossary should distinguish:

- canonical/approved term wording;
- recommended compact label form;
- sentence/prose usage;
- capitalization guidance.

Do not propagate title case mechanically.

---

## Geometry remains frozen

Do not shorten a correct translation merely to fit current UI geometry.

Do not change:

- button sizes;
- panel sizes;
- column widths;
- grid/flex proportions;
- padding;
- margins;
- gaps;
- breakpoints;
- dialog dimensions;
- typography metrics;
- colors;
- borders;
- wrapping geometry.

If a natural/official term appears likely to create later presentation pressure, record the risk for QA.

Do not “solve” it here.

---

## Semantic meaning outranks literal English symmetry

For recurring tracker concepts, prefer the target-language expression that conveys the intended UI meaning, not a mechanically parallel English phrase.

Terms that require explicit sense notes include at minimum:

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

Also review:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Planetary Body
Star System
X-Tech
X-Tech Power Core
Info
```

Do not require lexical symmetry between locales.

A noun phrase in one language and state phrase/adjective in another is acceptable if the UI meaning remains correct.

---

## Glossary constraints become authoritative later

Once this task is approved, the resulting glossaries and constraint values become authoritative inputs to the semantic review pipeline.

The later semantic-catalogue stage should:

- treat glossary matches as constraints;
- flag drift;
- require explicit adjudication where context justifies deviation;
- not casually revise terminology during bulk translation.

This task therefore needs careful editorial reasoning before values are locked.

---

## Three terminology classes

Every important glossary concept should be categorized as one of:

### 1. Official Bethesda terminology

Use when the tracker concept intentionally corresponds to an official Starfield term.

Record:

- approved localized value;
- official evidence identity/ID;
- relevant plugin/string-table source where current tooling exposes it;
- grammatical/context notes;
- capitalization notes;
- whether the term is safe as a compact standalone label.

### 2. Tracker-owned preferred terminology

Use when no suitable official term exists or the tracker concept differs from Bethesda’s usage.

Record:

- preferred localized wording;
- intended semantic sense;
- forbidden/confusable alternatives where useful;
- capitalization;
- compact-label suitability;
- representative UI contexts.

### 3. Context-sensitive terminology

Use where no single invariant surface form is safe across all usages.

Typical reasons:

- articles;
- contractions;
- inflection;
- number/gender agreement;
- prepositions;
- adjective position;
- verbal/state phrasing;
- sentence integration.

Record:

- preferred semantic concept;
- allowed surface variants if useful;
- contexts where each variant applies;
- what the review constraint should actually enforce;
- what must **not** be enforced by naïve substring matching.

Do not force context-sensitive terms into one global literal replacement.

---

# Primary sources

Treat these as current authority:

```text
docs/audits/SPANISH-ITALIAN-PORTUGUESE-LOCALE-ONBOARDING-PLAN.md
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/BACKLOG.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
AGENTS.md
```

Also inspect:

```text
reference-source/official-terminology-provenance.csv
reference-source/official-terminology-values-en-US.csv
reference-source/official-terminology-values-ja-JP.csv
reference-source/official-terminology-values-fr-FR.csv
reference-source/official-terminology-values-de-DE.csv

docs/localization/FRENCH-GLOSSARY.md
docs/localization/GERMAN-GLOSSARY.md

reference-source/localization-locale-metadata.json
src/localization/reviewPackage.ts
scripts/localization/
tests/
```

The French/German glossaries are precedent, not templates to copy mechanically.

---

# 1. Resolve official terminology values

Resolve the official terminology evidence identities for:

```text
es-ES
it-IT
pt-BR
```

using the existing provenance and installed official Bethesda localization inputs.

Do not rediscover terminology identities.

Reuse the current:

```text
37 evidence rows
19 term IDs
```

contract.

Create:

```text
reference-source/official-terminology-values-es-ES.csv
reference-source/official-terminology-values-it-IT.csv
reference-source/official-terminology-values-pt-BR.csv
```

Use the established schema and deterministic ordering.

Verify:

- every required evidence row resolves;
- intended absence rows remain empty;
- no cross-locale fallback occurs;
- no English/manual translation is substituted for unresolved official evidence;
- official values are preserved exactly where they are evidence values.

---

# 2. Evidence interpretation

Do not assume every official value should become the tracker’s preferred UI term.

For each concept:

1. inspect official evidence;
2. inspect the tracker’s actual semantic role;
3. decide whether the official term is:
   - directly suitable;
   - suitable only in some contexts;
   - unsuitable for the tracker concept;
4. document the decision in the glossary.

Important examples likely to require editorial judgment:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Planetary Body
Star System
X-Tech
X-Tech Power Core
```

Official wording is evidence, not an automatic string substitution rule.

---

# 3. Author the Spanish glossary

Create:

```text
docs/localization/SPANISH-GLOSSARY.md
```

Target:

```text
Spanish (Spain)
es-ES
```

The glossary should cover:

- official terminology;
- tracker-owned terminology;
- context-sensitive concepts;
- capitalization;
- grammatical notes;
- compact-label suitability;
- forbidden/confusable alternatives where useful;
- representative tracker contexts.

Pay particular attention to:

- `Present` as existence/availability, not temporal “current”;
- `Producing` as operational state, not generic action;
- `Inputs` as manufacturing/resource inputs, not form fields;
- `Source` / `Destination`;
- `Planned Supply`;
- `Active Production`;
- `Resource Matrix`;
- `Reshuffle`;
- `Lock`;
- `Undo`;
- `Redo`;
- noun gender;
- articles;
- agreement;
- imperatives versus noun labels.

Do not drift toward Latin-American Spanish.

---

# 4. Author the Italian glossary

Create:

```text
docs/localization/ITALIAN-GLOSSARY.md
```

Target:

```text
Italian
it-IT
```

Pay particular attention to:

- `Present` as availability/presence, not temporal “current”;
- `Inputs` as manufacturing inputs, not generic data-entry fields;
- `Producing`;
- `Planned Supply`;
- `Active Production`;
- `Resource Matrix`;
- `Source` / `Destination`;
- `Reshuffle`;
- `Lock`;
- `Undo`;
- `Redo`;
- articles;
- prepositional contractions;
- elision;
- apostrophes;
- adjective/noun agreement;
- parameterized message grammar.

Where a term will naturally contract or inflect inside prose, mark it context-sensitive rather than enforcing a single literal substring.

---

# 5. Author the Brazilian Portuguese glossary

Create:

```text
docs/localization/PORTUGUESE-BRAZIL-GLOSSARY.md
```

Target:

```text
Portuguese (Brazil)
pt-BR
```

Pay particular attention to:

- `Present` as availability/presence;
- `Producing` as operational state;
- `Inputs` as manufacturing/resource inputs;
- `Source` / `Destination`;
- `Inorganic` / `Organic`;
- `Active Production`;
- `Planned Supply`;
- `Resource Matrix`;
- `Reshuffle`;
- `Lock`;
- `Undo`;
- `Redo`;
- gender/number;
- contractions;
- article use;
- regional Brazilian register;
- title-case official evidence versus normal sentence-case usage.

Do not normalize wording toward European Portuguese.

---

# 6. Glossary structure

Use a durable structure similar in usefulness to the French/German glossaries, but evolve it if the new terminology-class distinction benefits clarity.

At minimum, each concept entry/table row should capture where applicable:

```text
English concept
Terminology class
Preferred localized value
Official evidence ID
Tracker-owned / official status
Semantic sense
Capitalization guidance
Compact-label suitability
Context sensitivity
Constraint strategy
Confusable/forbidden alternatives
Representative UI contexts
Notes
```

Do not make the document unwieldy for ordinary maintenance.

Prefer concise, decision-oriented entries.

---

# 7. Glossary constraint strategy

Update the generalized glossary constraint data so all three target locales have approved constraint values where applicable.

Do **not** simply require every approved glossary phrase as a global substring.

Use:

- phrase matching where genuinely invariant;
- key-scoped rules;
- context-scoped rules;
- semantic-concept rules;
- allowed variants where grammatically necessary.

Context-sensitive terms should enforce the intended concept without rejecting valid target-language grammar.

Requirements:

- no cross-locale fallback;
- missing required target constraint fails clearly;
- stale-constraint detection remains active;
- existing French/German constraints remain unchanged unless a shared bug is found;
- Japanese behavior remains unchanged.

If the current generalized constraint structure cannot express a necessary context-sensitive rule cleanly, make the smallest reusable extension required.

Do not build a grammar engine.

---

# 8. Recommended terminology defaults

For each official terminology evidence ID, set:

```text
OfficialValue
RecommendedDefault
```

according to the existing artifact contract.

`RecommendedDefault` should reflect tracker usage, not blindly duplicate `OfficialValue`.

Where an official value is not appropriate as the tracker default:

- preserve exact official evidence;
- set the recommended tracker value appropriately;
- explain the reason in the glossary.

Do not silently rewrite the official evidence field.

---

# 9. High-risk semantic concepts

Explicitly flag high-risk concepts for the later semantic-catalogue review.

At minimum include:

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
```

For each locale, indicate:

- exact intended sense;
- likely mistranslation risk;
- whether DeepL/Codex must receive extra context;
- whether substring enforcement is safe;
- whether inflection/variant forms are expected.

These notes should make the next semantic-review brief easier and safer.

---

# 10. Compact-label review

Review whether approved terminology is suitable as:

- standalone headings;
- button labels;
- table headings;
- status chips;
- compact controls.

Do not alter translations solely for visual fit.

If a correct term is likely to be long:

- keep the correct term;
- mark compact-label risk;
- leave physical UI mitigation for later QA.

Do not modify geometry.

---

# 11. Capitalization policy

For each glossary:

- distinguish official-source capitalization from tracker presentation rules;
- identify terms that should normally use sentence case in prose;
- preserve invariant brand/technical capitalization such as:
  - `Starfield`
  - `X-Tech` / locale-specific official equivalent where applicable;
- do not force title case because Bethesda source text used title case.

This is especially important for Portuguese official values such as title-cased cargo terminology.

---

# 12. Regional language discipline

### Spanish

Do not:

- substitute Latin-American regional vocabulary;
- prefer supposedly “neutral Spanish” if it conflicts with Spain Spanish;
- broaden browser or terminology assumptions.

### Portuguese

Do not:

- substitute European Portuguese terminology;
- neutralize Brazilian forms toward generic Portuguese;
- use `pt-PT` conventions.

### Italian

Use standard Italian appropriate to `it-IT`.

Regional variation outside the target is not part of this task.

---

# 13. Do not start semantic catalogue translation

Do not create or complete:

```text
src/localization/locales/es-ES.ts
src/localization/locales/it-IT.ts
src/localization/locales/pt-BR.ts
```

Do not produce the 414-key Codex drafts.

Do not generate completed review CSVs/XLIFF handoffs.

Do not call DeepL.

This stage ends after terminology/glossary/constraint readiness.

---

# 14. Runtime remains inactive

At completion:

```text
es-ES
it-IT
pt-BR
```

must still remain runtime-inactive.

Do not add them to:

- locale selector;
- runtime semantic registry;
- runtime reference-name registry;
- automatic browser mapping;
- persisted runtime-supported locale list;
- user-visible UI.

Their metadata remains:

```text
runtimeAvailable: false
```

---

# 15. Browser mapping

Do not implement browser mapping.

The approved future policy remains conservative:

```text
es / es-ES -> es-ES
explicit non-Spain es-* -> no automatic mapping

it / it-IT -> it-IT
explicit non-Italy it-* -> no automatic mapping

pt / pt-BR -> pt-BR
pt-PT and explicit non-Brazilian pt-* -> no automatic mapping
```

Do not broaden this policy.

---

# 16. Documentation updates

Update durable documentation only where terminology policy materially changes.

Likely required:

```text
docs/localization/LOCALE-ONBOARDING.md
```

Possible only if needed:

```text
docs/localization/LOCALIZATION-INPUTS.md
```

Do not mark these locales:

```text
Supported
Runtime integrated
Semantic catalogue complete
```

Their status should remain staged/in progress.

Do not duplicate the audit.

---

# 17. Verification

Run:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
npm run localization:provenance:test
npm run localization:provenance:verify

npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE

npm run localization:terminology:verify -- --locale es-ES
npm run localization:terminology:verify -- --locale it-IT
npm run localization:terminology:verify -- --locale pt-BR

npm run localization:reference-names:verify -- --locale ja-JP
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE

npm run localization:verify -- --locale ja-JP
npm run localization:verify -- --locale fr-FR
npm run localization:verify -- --locale de-DE

npm run build
npm run lint
git diff --check
```

For the three new locales:

- terminology verification should pass after their value artifacts are created;
- full localization closure should still fail on later missing artifacts, which is expected.

Add targeted tests for:

- locale-specific terminology values;
- no cross-locale fallback;
- constraint coverage;
- context-sensitive constraint handling;
- stale-constraint detection;
- deterministic artifact ordering.

---

# 18. Preservation checks

Before finishing, verify:

- French glossary behavior unchanged;
- German glossary behavior unchanged;
- Japanese terminology closure unchanged;
- no semantic catalogues created for the three staged locales;
- no runtime activation;
- no CSS/UI changes;
- no Bethesda corpus committed;
- no generated reference overlays created;
- no XLIFF handoff generated unless needed only as a non-committed diagnostic.

Inspect:

```text
git diff --stat
git diff
```

---

# Explicitly out of scope

Do not:

- translate the semantic catalogue;
- call DeepL;
- generate completed review CSVs/XLIFF;
- create runtime catalogues;
- generate final reference overlays;
- collect/accept fauna screenshots;
- activate runtime locales;
- implement browser mapping;
- implement search normalization;
- implement shortcut speech;
- change collation;
- change UI geometry;
- modify CSS;
- add fonts;
- move XLIFF files;
- optimize bundles;
- change persistence/schema.

---

# Completion response

Return:

1. branch;
2. files changed;
3. Spanish terminology artifact summary;
4. Italian terminology artifact summary;
5. Brazilian Portuguese terminology artifact summary;
6. Spanish glossary summary;
7. Italian glossary summary;
8. Brazilian Portuguese glossary summary;
9. official Bethesda terminology decisions;
10. tracker-owned terminology decisions;
11. context-sensitive terminology decisions;
12. high-risk semantic concepts per locale;
13. glossary-constraint coverage per locale;
14. any new generalized constraint behavior;
15. compact-label risks identified;
16. capitalization guidance;
17. regional-language discipline confirmation;
18. terminology verification results;
19. current-locale regression results;
20. confirmation no semantic catalogues were created;
21. confirmation no runtime activation occurred;
22. confirmation no browser mapping was implemented;
23. confirmation no UI/CSS changes occurred;
24. `git diff --check` result;
25. deviations from the brief;
26. blockers/user decisions before semantic review;
27. recommended next stage;
28. suggested commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.

# Codex Implementation Brief — French and German Official Reference Names and Fauna Composition Evidence

## Objective

Implement the French and German official-reference-name overlays and the accompanying fauna-composition evidence workflow.

The target locales are:

```text
fr-FR
de-DE
```

This implementation should:

- consume the existing canonical localization provenance identities;
- resolve official French and German Bethesda strings for the existing canonical reference population;
- generate deterministic per-locale reference-name overlays and sidecar manifests;
- prove complete closure over the existing canonical population;
- generate predicted French/German composed-fauna names from the existing prefix/species/diet identities;
- support an evidence workflow based on **opportunistic in-game screenshots**, not targeted animal hunting or Creation Kit navigation;
- compare observed in-game localized fauna names against the predicted composition model;
- fail closed if observed first-party evidence contradicts the model.

French and German must remain inactive at runtime until later integration work.

Do not commit or push unless explicitly instructed.

---

## Naming rule

Planning identifiers used in discussion and audit documents must not leak into repository-facing names.

Do not use names such as:

```text
Parcel 4
Parcel4
P4
Phase 4
```

in:

- source-code identifiers;
- filenames;
- npm scripts;
- generated artifact names;
- comments;
- test names;
- commit messages;
- durable documentation headings introduced by this implementation.

Use descriptive names based on actual responsibility, such as:

```text
reference names
fauna composition evidence
French reference overlay
German reference overlay
localized fauna proof
```

---

## Primary design sources

Read and preserve current policy in:

```text
docs/audits/FRENCH-GERMAN-LOCALE-ONBOARDING-PLAN.md
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/localization/FRENCH-GLOSSARY.md
docs/localization/GERMAN-GLOSSARY.md
docs/ARCHITECTURE.md
AGENTS.md
```

Inspect the current generalized tooling introduced in earlier localization work, including current equivalents of:

```text
scripts/localization/build-reference-name-overlay.mjs
scripts/localization/verify-reference-name-overlay.mjs
src/localization/generated/
reference-source/localized-reference-names-*-manifest.json
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-c6-fauna.csv
reference-source/localized-name-provenance-c5-fauna-lineage.csv
reference-source/localization-locale-metadata.json
```

Exact filenames may differ. Follow the current generalized implementation rather than recreating Japanese-specific paths.

Historical Japanese localization briefs may be consulted for implementation precedent, especially the composed-fauna work, but current durable policy and this brief take precedence.

---

# Locked product decisions

## Target locale identities

Use:

```text
fr-FR
de-DE
```

with Bethesda localization tokens:

```text
fr
de
```

Both are UTF-8 according to the existing locale metadata/policy.

---

## Canonical population is fixed

The canonical provenance population is already established.

Expected current closure:

```text
3,561 canonical entities
4,818 qualified provenance rows
0 unresolved
```

Reuse the existing canonical identities.

Do not rediscover:

- FormIDs;
- providers;
- canonical English names;
- system/body populations;
- species populations;
- C6 component identities;
- provider/master relationships.

Do not introduce English reverse matching.

Do not scan arbitrary game records looking for additional localized names.

Locale onboarding should resolve **different localized values for the same existing identities**.

---

## Official-source boundary

Reference names must come from Bethesda official localized string tables.

Do not use:

- Codex translation;
- DeepL translation;
- wiki/fan/community translations;
- guessed cognates;
- hand-written replacements;

for Bethesda-authored reference names where official localized strings exist.

Tracker-authored semantic UI translation remains separate and has already been handled.

---

# 1. Local intake setup

Create ignored local intake configuration/manifest data for:

```text
fr
de
```

using the current explicit archive/plugin mapping model.

Use the same authoritative plugin boundaries already established:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

and terminology-only evidence where appropriate:

```text
SFBGS050.esm
```

Do not allow `SFBGS050.esm` to contribute canonical reference entities.

Game archives, extracted string tables, local paths, and raw Bethesda text remain local/ignored.

Do not commit Bethesda string tables or archive dumps.

---

# 2. Resolve all qualified provenance rows

Use the existing locale-neutral provenance identities to resolve French and German values by exact qualified identity.

For direct/template values, resolve by the existing contract such as:

```text
NameSourcePlugin
StringTable
StringID
```

For composed fauna, use the existing ordered semantic component identities.

Expected target:

```text
4,818 qualified rows resolved for fr
4,818 qualified rows resolved for de
0 unresolved
```

If any required French/German value is missing, ambiguous, malformed, or unavailable:

- fail closed;
- record the exact identity;
- do not silently fall back to English;
- do not synthesize a translation.

---

# 3. Generate per-locale official reference-name overlays

Generate deterministic official reference-name modules for:

```text
src/localization/generated/fr-FR-reference-names.ts
src/localization/generated/de-DE-reference-names.ts
```

Use the current generalized serializer and current project naming conventions if these exact paths already exist or differ slightly.

Expected entity closure should match the established canonical population, currently:

```text
428 biomes
1,776 bodies
1,121 species
5 official terms
30 products
78 resources
123 systems
----------------
3,561 names
```

If the canonical population has legitimately changed since the audit, derive counts from current source contracts rather than freezing historical numbers blindly, and report the difference explicitly.

Do not change stable entity IDs.

---

# 4. Generate per-locale sidecar manifests

Generate deterministic sidecars for French and German using the current generalized manifest schema.

Each sidecar should record, as currently supported:

- tracker locale tag;
- Bethesda token;
- encoding;
- input table identities;
- archive/member hashes;
- upstream provenance identity/hash;
- canonical entity counts;
- per-kind counts;
- generated module hash;
- composition policy;
- separator policy/evidence state;
- generator/tool version if part of the established schema.

Do not include:

- local machine paths;
- raw Bethesda localized strings;
- full Bethesda string-table content;
- unnecessary duplicate source text.

The sidecars should remain repository-verifiable without installed game files once generated and reviewed.

---

# 5. Full overlay verification

Add/extend tests and verification so the French and German overlays prove:

- exact canonical entity closure;
- exact provenance-row closure;
- no missing localized values;
- no empty localized values;
- no accidental fallback to canonical English;
- deterministic output;
- sidecar/module hash consistency;
- resource reconciliation;
- provider identity consistency;
- per-kind counts;
- no drift after accepted generation.

Expected command shape should follow current generalized tooling, for example:

```text
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE
```

Do not duplicate a French-specific or German-specific verifier if one parameterized verifier already exists.

---

# 6. Composed-fauna prediction

Use the existing 922-fauna composed-name population and 2,179 component identities.

For each target locale:

- resolve the official localized prefix/species/diet components by exact qualified identity;
- generate the predicted localized composed name using the current composition model;
- preserve semantic slots;
- preserve the currently documented component order unless evidence disproves it;
- preserve the current separator assumption unless evidence disproves it.

Generate a deterministic **prediction/proof support artifact** suitable for comparing against screenshots.

This support artifact may remain ignored/local if it contains large amounts of Bethesda-owned text.

Prefer a compact project-owned structure that contains:

```text
stable fauna ID
canonical English display name
predicted French/German display name
component shape
component roles
source identifiers needed for comparison
```

Do not commit raw Bethesda string-table corpora.

---

# 7. Fauna evidence standard — opportunistic screenshots

The evidence workflow must be practical for a user who does not understand French or German.

Do **not** require the user to:

- navigate Creation Kit in French/German;
- locate specific fauna by foreign-language name;
- hunt for a predetermined English-named animal;
- identify a specific translated animal in advance.

Instead, use the same practical model that worked for Japanese:

> The user plays normally in the target language and takes screenshots opportunistically whenever a fauna name is clearly visible.

The screenshot becomes first-party rendered evidence.

Codex should identify/match the observed fauna **after the fact**, using:

- visible localized name;
- planet/location context where available;
- visual/record context if useful;
- predicted localized names;
- canonical population.

The burden of mapping the screenshot back to a canonical fauna belongs to the analysis/tooling process, not to the user.

---

# 8. Fauna evidence coverage goal

Do not impose a rigid checklist or fixed quota.

A useful evidence sample should **aim** to include variety such as:

```text
prefix + species + diet
species + diet
prefix + species
missing prefix
missing diet
long German names
French names that could expose elision/agreement
different punctuation/spacing patterns
DLC fauna if encountered naturally
```

But these are coverage goals, not scavenger-hunt requirements.

Do not block progress merely because every shape was not encountered.

The standard is:

> Gather a reasonable varied sample of opportunistic first-party screenshots sufficient to test whether the proposed model has obvious counterexamples.

---

# 9. Fauna evidence acceptance rule

For each observed screenshot:

1. identify the canonical fauna after the fact;
2. retrieve the predicted localized name from the generated model;
3. compare the screenshot text with the prediction;
4. record:
   - exact observed text;
   - predicted text;
   - component order;
   - spacing/separator;
   - punctuation;
   - any visible inflection/agreement/elision behavior;
   - match/mismatch.

Acceptance logic:

## If observed evidence matches the prediction

Accumulate it as supporting evidence.

## If observed evidence shows a consistent locale-wide order/separator difference

Stop full acceptance, determine the narrow locale-specific composition policy, regenerate predictions, and retest against observed evidence.

## If observed evidence reveals entity-specific grammar not captured by the component model

Stop and report the counterexample.

Do not invent a general grammar engine.

Do not silently special-case individual fauna without a reviewed design.

---

# 10. Provisional evidence standard

The composed-fauna model may be accepted **provisionally** for a locale when:

- a reasonable varied screenshot sample has been reviewed;
- observed rendered names are consistent with predicted names;
- no contradictory first-party example has been found;
- any known limitations are documented.

This is explicitly not a mathematical proof.

It is an evidence-backed practical validation standard.

If later gameplay produces a counterexample, treat that as new evidence and reopen only the composition policy required by that evidence.

---

# 11. User handoff point

Codex should proceed with all repository/local generation work it can complete independently.

If screenshot evidence is required before accepting final composed-fauna overlays:

- generate the overlays/predictions in a reviewable state;
- report the exact handoff requirement;
- stop and ask the user for opportunistic screenshots from French and/or German gameplay.

Do not ask for specific fauna.

A good user instruction is conceptually:

```text
Play normally in French/German and take screenshots whenever an alien fauna name is clearly visible. Include the whole nameplate/name text. No need to seek particular species.
```

If possible, ask for several screenshots over ordinary gameplay, but do not mandate a precise count.

---

# 12. Screenshot matching support

Where practical, create local tooling or a lightweight matching aid that helps Codex map an observed localized name back to:

```text
stable fauna ID
canonical English name
predicted localized name
planet/species context
```

Do not expose this as user-facing app functionality.

Do not build OCR automation unless genuinely necessary; screenshots may be inspected directly.

Do not require the user to transcribe foreign-language text manually if the screenshot is legible.

---

# 13. Composition policy metadata

For each target locale, record the accepted/provisional composition policy in the sidecar or durable localization documentation, consistent with the existing schema.

At minimum capture:

- role order;
- separator policy;
- evidence status;
- whether support is:
  - inherited from current model;
  - independently observed;
  - provisional;
  - blocked by contradiction.

Do not overstate evidence.

If screenshot evidence is limited, say so explicitly.

---

# 14. Direct/template names vs composed fauna

Do not hold direct/template official reference names hostage to composed-fauna uncertainty.

It is acceptable to:

- fully resolve and generate direct/template names;
- generate composed-fauna predictions;
- defer final acceptance of the composed subset pending screenshot evidence.

However, do not mark the **entire locale overlay as fully accepted/closed for runtime integration** until the composed-fauna evidence gate is satisfied to the agreed provisional standard.

---

# 15. Official terminology integration

Where the reference overlay includes the existing small official-term population, use the official locale terminology values already established.

Do not duplicate or contradict:

```text
official-terminology-values-fr-FR.csv
official-terminology-values-de-DE.csv
```

The reference overlay should remain consistent with approved terminology/glossary decisions.

---

# 16. Search normalization remains out of scope

Do not implement:

- accent folding;
- apostrophe normalization;
- hyphen normalization;
- German `ae/oe/ue/ss` aliases;
- fuzzy search;
- transliteration.

However, while inspecting the generated official-name corpus, record evidence relevant to later search decisions:

- typographic apostrophes;
- unusual hyphen characters;
- ligatures such as `œ`;
- umlauts;
- `ß`;
- punctuation patterns.

Report findings without changing search behavior.

---

# 17. Runtime exposure remains out of scope

Even with complete generated overlays, French and German must remain inactive.

Do not:

- register overlays in runtime `referenceNames` lookup;
- add locales to the selector;
- add browser locale resolution;
- accept them as active persisted locale preferences;
- switch the app to French/German at runtime.

The later runtime-integration work will handle activation.

Verify the current runtime supported set remains unchanged.

---

# 18. Bundle behavior

Do not introduce:

- dynamic imports;
- lazy locale loading;
- bundle splitting;
- code-splitting changes.

The project intentionally defers bundle optimization until all planned V1 locales are onboarded.

Generating new overlay modules may increase source/repository size; that is expected.

Do not treat the existing Vite chunk advisory as a reason to optimize now.

---

# 19. Documentation updates

Update durable documentation only for actual completed reference-name/composition policy.

Likely:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
```

Add/update French and German locale-profile notes with:

- official reference-name closure status;
- composed-fauna evidence status;
- composition policy;
- any observed punctuation/separator behavior;
- remaining runtime-integration work.

Do **not** mark French/German fully supported unless runtime integration and later release closure are actually complete.

Do not update `BACKLOG.md` to mark localization done.

---

# 20. Tests

Add/generalize tests for:

## Overlay closure

- exact entity IDs;
- exact per-kind coverage;
- exact provenance-row coverage;
- deterministic serialization;
- locale/sidecar consistency;
- no empty values;
- no accidental English fallback;
- resource reconciliation;
- official terminology consistency.

## Fauna predictions

- all composed-fauna identities resolve;
- all component roles resolve;
- component order deterministic;
- separator deterministic;
- predicted strings deterministic;
- no missing components where a role is required;
- expected shape counts remain consistent with canonical provenance.

## Evidence recording

If a project-owned evidence artifact is introduced:

- valid canonical fauna ID;
- observed/predicted values required;
- evidence locale matches target locale;
- match/mismatch explicit;
- contradiction prevents accepted status.

Do not hard-code a required screenshot count.

---

# 21. Verification before user screenshot handoff

Before asking the user for screenshots, run at minimum:

```text
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
npm run localization:reference-names:verify -- --locale ja-JP
npm test
npm run typecheck:tests
npm run lint
git diff --check
```

Run the new French/German overlay generation and targeted tests.

If French/German overlay verification intentionally remains in a `PENDING_COMPOSITION_EVIDENCE` or equivalent review state, report that clearly rather than forcing a false pass.

---

# 22. Final verification after screenshot evidence

Once sufficient opportunistic screenshot evidence has been reviewed and the composition model is provisionally accepted:

Run:

```text
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
npm run localization:provenance:verify
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
npm run build
npm run lint
git diff --check
```

French/German full `localization:verify` may still remain intentionally incomplete if runtime registration is not yet part of the closure command contract.

Report exact behavior.

---

# Out of scope

Do not:

- expose French/German at runtime;
- change locale selector;
- add browser locale mapping;
- alter search behavior;
- perform layout/CSS fixes;
- generalize spoken shortcut chords;
- perform final accessibility smoke tests;
- implement lazy loading;
- redesign provenance;
- add arbitrary plugin support;
- rerun canonical discovery;
- machine-translate official reference names;
- require Creation Kit navigation;
- require targeted fauna hunting;
- require a rigid screenshot quota;
- build a general grammar engine;
- alter persistence/schema.

---

# Expected intermediate completion state

Before screenshot evidence:

- French official direct/template reference names resolved;
- German official direct/template reference names resolved;
- French/German composed-fauna predictions generated;
- per-locale overlay modules generated in reviewable form;
- per-locale sidecars generated;
- exact canonical population closure mechanically verified;
- composition evidence status clearly marked pending/provisional;
- no runtime exposure.

---

# Expected final completion state

After sufficient screenshot evidence:

- French overlay accepted provisionally;
- German overlay accepted provisionally;
- 3,561 canonical names closed per locale, subject to current canonical counts;
- 4,818 qualified provenance rows resolved per locale;
- no unresolved identities;
- composition policy documented;
- observed screenshot sample consistent with predicted names;
- no known counterexample;
- French/German still inactive at runtime;
- Japanese unaffected.

---

# Completion response — before screenshot evidence

Return:

1. branch;
2. files changed;
3. French overlay generation status;
4. German overlay generation status;
5. canonical entity counts;
6. provenance-row counts;
7. unresolved count;
8. French composed-fauna prediction summary;
9. German composed-fauna prediction summary;
10. any punctuation/hyphen/apostrophe/umlaut/ligature observations relevant to later search work;
11. sidecar status;
12. tests/verification results;
13. runtime-exposure guard result;
14. exact screenshot instructions for the user;
15. confirmation no commit or push occurred.

---

# Completion response — after screenshot evidence

Return:

1. branch;
2. files changed;
3. French screenshot evidence summary;
4. German screenshot evidence summary;
5. composition-policy decision for each locale;
6. any mismatches/counterexamples;
7. final French overlay closure;
8. final German overlay closure;
9. canonical counts;
10. provenance-row counts;
11. sidecar/evidence status;
12. Japanese regression status;
13. runtime-exposure guard result;
14. verification results;
15. documentation updates;
16. remaining unresolved issues, if any;
17. recommended next step;
18. suggested commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.

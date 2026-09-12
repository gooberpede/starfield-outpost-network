# CODEX AUDIT BRIEF — Localization Parcel C6: Composed-Fauna Naming and Locale-Aware Assembly

## Purpose

Perform a **diagnostic/design audit only** for Parcel C6.

C6 concerns the 922 fauna species already classified by C5 as genuinely **CCT-composed** names.

Do **not** implement production composed-fauna provenance yet.

The audit must determine, from actual Starfield data and the production xEdit exporter behavior, exactly how composed fauna names are built and localized.

The key unknown is not merely which localized strings correspond to components such as:

```text
Flocking
Dodo
Grazer
```

but whether Bethesda applies the same component order and assembly rules in every locale.

The audit must answer:

> What exact records, localized fields, string IDs, rule-selection semantics, ordering rules, spacing/punctuation behavior, and locale-specific behavior does Starfield use to construct composed fauna display names?

Do not assume English grammar applies to Japanese or any other language.

Do not commit or push.

---

# Inputs / source of truth

Use:

- the committed C5 handoff:
  - `reference-source/localized-name-provenance-c6-fauna.csv`
- the committed C5 fauna lineage / diagnostics:
  - `reference-source/localized-name-provenance-c5-fauna-lineage.csv`
- the committed C1–C5 localization/provenance tooling
- the committed localization-input extraction manifest and official English/Japanese string tables
- the production xEdit exporter used to generate organic names:
  - `Starfield - Export Planet Biome Organic Resources(1).pas`
- installed official plugin set:
  - `Starfield.esm`
  - `ShatteredSpace.esm`
  - `SFBGS00D.esm`
  - `SFBGS050.esm`

Treat the production xEdit exporter as the behavioral reference for current English name construction, especially:

- native NPC keywords;
- Object Template combinations;
- recursively included OMOD keywords;
- `dn_CCTPrefixes`;
- `dn_CCTSuffixes`;
- specificity / `YNAM` / rule-order precedence.

Do not replace its behavior with assumptions.

---

# Scope classification

**High-complexity audit / architecture task.**

This is expected to be one of the most technically difficult localization parcels.

The audit should spend effort now to avoid repeated implementation patches later.

Do not optimize for speed over certainty.

---

# Audit output location

Write the audit report to:

```text
docs/audits/codex-localization-c6-composed-fauna-audit.md
```

Do not scatter conclusions across temporary notes only.

Temporary diagnostic scripts/data may live under:

```text
.local-work/localization/c6-audit/
```

and remain untracked unless a small reusable diagnostic clearly belongs in production tooling.

---

# Population boundary

The audit population is exactly the C5 handoff:

```text
922 CCT-composed fauna
```

Do not:

- enumerate arbitrary NPCs;
- discover additional fauna;
- revisit flora;
- revisit direct NPC FULL fauna;
- revisit template-resolved fauna;
- broaden into generic Bethesda naming systems.

C6 remains a sniper aimed only at the C5 handoff population.

---

# Core questions

The audit must answer all of the following.

## 1. Which exact INNR rules are selected?

For representative and sampled C6 fauna, trace:

```text
canonical fauna
-> source NPC_
-> native NPC keywords
-> Object Template combination
-> OMOD keyword additions
-> effective keyword set
-> selected prefix rule
-> selected species/body rule
-> selected diet rule
```

Verify the current C5 rule-selection logic against actual game data.

Confirm or correct the known precedence:

```text
greatest keyword specificity
then highest YNAM - Index
then earliest matching rule
```

Record any deviations.

---

## 2. What exact localized fields carry each component?

For selected INNR rules, identify:

```text
record signature
record FormID
source plugin
field path
string table type
raw string ID
```

for each name-bearing component.

Do not infer components from English text.

The audit must prove the serialized localization provenance for:

```text
prefix
species/body
diet
```

where present.

If any component is inline/non-localized, document that explicitly.

---

## 3. Are prefix/species/diet semantic roles actually encoded by separate rule sets?

Confirm the role and relationship of:

```text
dn_CCTPrefixes
dn_CCTSuffixes
```

and any other naming-rule records used by the 922-species population.

Determine how the exporter distinguishes:

```text
prefix
species/body
diet
```

within suffix rules.

Do not rely solely on English appearance.

---

## 4. What determines component order?

This is the most important audit question.

Determine whether final composed-name order is controlled by:

- hard-coded game logic;
- INNR rule ordering;
- record structure;
- naming-rule category;
- locale-specific strings/templates;
- a higher-level formatter/template;
- localized punctuation/spacing embedded in components;
- some other mechanism.

Do not assume:

```text
prefix + species + diet
```

is universally correct.

---

## 5. Is order locale-specific?

Trace the same representative fauna in at least:

```text
English
Japanese
```

For each, determine the actual final component order.

If possible, verify the observed in-game localized display name from official strings/records rather than constructing a plausible Japanese phrase ourselves.

The audit must distinguish:

```text
same component order, different localized words
```

from:

```text
different component order by locale
```

and from:

```text
same logical roles but locale-specific formatting/template
```

---

## 6. Where do spaces and punctuation come from?

Determine whether separators are:

- inserted by game logic;
- included at the end/beginning of component strings;
- stored in localized template strings;
- language-specific;
- absent in languages that do not use spaces.

This matters especially for Japanese.

Do not normalize whitespace before understanding its source.

---

## 7. Are there hidden affixes or non-obvious components?

Check whether final names may include:

- articles;
- hyphens;
- punctuation;
- inflection markers;
- plural/number behavior;
- gender markers;
- qualifiers not represented by prefix/species/diet;
- empty components that still affect formatting.

If none occur in the 922-species population, say so explicitly.

---

## 8. Are the same component string IDs reused broadly?

Measure reuse of:

```text
prefix string IDs
species/body string IDs
diet string IDs
```

across the 922 fauna.

Report:

- unique prefix components;
- unique species/body components;
- unique diet components;
- total component occurrences;
- most reused components if useful.

This informs the eventual normalized provenance schema and overlay-generation efficiency.

---

## 9. Does plugin/provider ownership vary?

For each selected localized component, preserve:

```text
RecordSourcePlugin
NameSourcePlugin
NameStringTable
NameStringID
```

Determine whether components used by DLC fauna still come from:

```text
Starfield.esm
```

or whether:

```text
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

provide their own INNR/component records.

Do not assume all naming components belong to the base game merely because C5’s English reconstruction could resolve them there.

---

## 10. Are winning overrides/provider inheritance relevant?

Determine whether any selected component name is inherited from a master rather than serialized in the winning record.

If so, document the exact provider-resolution requirement.

Do not implement general arbitrary-mod override support, but identify what the official plugin set actually needs.

---

## 11. Do English and Japanese align by the same qualified string identity?

For each representative component, verify that:

```text
(NameSourcePlugin, table type, string ID)
```

selects the English and Japanese counterpart from the corresponding official locale tables.

Confirm that no cross-extension or cross-plugin ID matching is required.

---

# Representative audit sample

Use a deliberately varied sample from the 922-species handoff.

At minimum include examples of:

```text
prefix + species + diet
species + diet
prefix + species
species only
```

if all such shapes exist.

Also include:

- at least one fauna with multiple Object Template combinations;
- at least one Shattered Space fauna;
- at least one fauna whose prefix is absent;
- at least one fauna whose diet is absent;
- at least one highly reused species/body component if identifiable.

Do not cherry-pick only the easiest cases.

Aim for roughly 10–20 deeply traced representatives before drawing architecture conclusions.

---

# Full-population inventory

After proving mechanics on representatives, run a bounded inventory across all 922 C6 fauna.

Report counts by composition shape, for example:

```text
prefix + species + diet
prefix + species
species + diet
species only
other
```

Use actual observed categories.

Also report:

- number of distinct Object Template combinations selected;
- number of fauna with >1 candidate combination;
- number of fauna whose useful combinations collapse to one identical name;
- number of ambiguities;
- number of unsupported shapes.

Do not implement final provenance generation yet.

---

# English reconstruction validation

For each representative and for the full inventory where practical:

1. select the exact component rules;
2. resolve official English component strings through their raw IDs;
3. assemble them using the discovered game ordering/formatting rule;
4. compare the result to the canonical C5 English composed name.

The audit should require:

```text
reconstructed official English == C5 canonical English
```

or explicitly classify discrepancies.

No reverse matching.

No fuzzy matching.

---

# Japanese reconstruction validation

Once the ordering/formatting mechanism is understood:

1. use the **same selected underlying rule/component identities**;
2. resolve Japanese counterparts by qualified string identity;
3. assemble using the actual game/locale rule;
4. compare against whatever authoritative Japanese display evidence is available.

Do not invent Japanese word order.

If the actual final Japanese display cannot be independently observed from data, say so and identify what further runtime/CK evidence would be needed.

---

# Possible architecture outcomes

The audit should conclude which of these models is actually supported.

## Model A — fixed role order

Example:

```text
prefix
species
diet
```

for all locales, with locale-specific component strings only.

If true, prove it.

## Model B — locale-specific component order

Example:

```text
en: prefix species diet
ja: diet species prefix
```

or another locale-specific sequence.

If true, identify where the order is stored/derived.

## Model C — localized format/template string

Example conceptual model:

```text
"{prefix} {species} {diet}"
```

with a different localized template for Japanese.

If true, identify the exact record/string provenance of the template.

## Model D — rule-localized phrase fragments

Components themselves may include spacing, punctuation, or surrounding grammar such that concatenation order alone is insufficient.

If true, document exact mechanics.

## Model E — mixed population

Different fauna/rule families may use different mechanisms.

If so, classify each observed family and estimate population counts.

Do not force all data into one preferred model.

---

# Provenance-schema audit

Evaluate whether the existing normalized schema is sufficient:

```text
EntityKind
EntityId
DisplayNameSourceKind
ComponentOrder
ComponentRole
RecordSourcePlugin
RecordFormID
RecordSignature
NameFieldPath
NameSourcePlugin
NameStringTable
NameStringID
CanonicalEnglish
```

Questions to answer:

- Is one row per localized component enough?
- Is `ComponentOrder` globally valid, or must order be locale-specific?
- Is `ComponentRole` sufficient?
- Do we need a separate composition/template entity?
- Do we need a `CompositionRuleId`?
- Do we need locale-specific ordering metadata outside the provenance crosswalk?
- Can the same provenance rows support future languages without schema change?

Prefer the smallest schema that faithfully models actual Bethesda behavior.

Do not implement schema changes during the audit unless needed for a diagnostic fixture.

---

# C6 implementation recommendation

The audit must end with a concrete implementation plan.

Break it into bounded sub-parcels if appropriate, for example:

```text
C6.1 rule/component provenance
C6.2 composition-order model
C6.3 full 922-species generation
C6.4 verification/hardening
```

or recommend one implementation parcel if the mechanics prove simple.

Classify expected effort/usage for each.

---

# Fail-closed requirements

The audit should flag, not guess, when encountering:

- multiple equally valid rule selections;
- multiple locale-order interpretations;
- missing localized string IDs;
- provider ambiguity;
- malformed/unsupported INNR structures;
- unexpected extra components;
- English reconstruction mismatch;
- Japanese reconstruction mismatch;
- plugin/table ownership uncertainty.

Do not “make the name look right.”

---

# Temporary diagnostics

It is acceptable to add local diagnostic scripts under:

```text
.local-work/localization/c6-audit/
```

for:

- INNR rule dumps;
- selected component traces;
- locale lookup comparisons;
- composition-shape inventories;
- English/Japanese reconstruction experiments.

Do not commit Bethesda text corpora.

Do not commit full raw record dumps.

---

# Deliverables

The audit report must contain:

1. exact C6 population size;
2. representative traced examples;
3. exact selected records/fields/string IDs for each component;
4. component-role model;
5. component-order model;
6. spacing/punctuation model;
7. English vs Japanese comparison;
8. plugin/provider ownership findings;
9. override/provider findings;
10. full 922-species composition-shape inventory;
11. ambiguity/unsupported counts;
12. component reuse statistics;
13. provenance-schema recommendation;
14. implementation sequence;
15. cost/complexity estimate;
16. explicit unresolved questions.

---

# No implementation yet

Do not:

- generate final composed-fauna provenance rows;
- modify runtime localization;
- generate Japanese fauna overlays;
- change search;
- alter persistence;
- change C5 canonical data;
- implement arbitrary locale grammars based on intuition.

This is an audit only.

---

# Verification

Run enough existing project checks to prove diagnostics did not damage the repo.

At minimum:

```text
npm test
npm run reference:test
npm run localization:provenance:test
git diff --check
```

If no tracked implementation files are changed, full app build/lint may be optional, but report what was run.

Do not commit or push.

---

# Final report summary

In the final Codex response, summarize:

- whether the game uses fixed or locale-aware order;
- where that order comes from;
- whether English and Japanese use the same component sequence;
- whether spacing/punctuation is localized;
- how many unique component strings exist by role;
- whether DLC fauna reuse base-game rules/components;
- whether current provenance schema is sufficient;
- recommended C6 implementation shape;
- any blockers.

Do not proceed to C6 implementation unless separately instructed.

# CODEX IMPLEMENTATION BRIEF — Localization Parcel C6: Composed-Fauna Component Provenance

## Purpose

Implement **Parcel C6** using the conclusions of:

```text
docs/audits/codex-localization-c6-composed-fauna-audit.md
```

C6 should convert the 922 fauna deliberately deferred by C5 into normalized, provider-qualified **composed localized-name provenance**.

The implementation must follow the game’s actual CCT naming model established by the audit:

```text
prefix (optional)
species/body (required)
diet (optional)
```

with:

```text
fixed semantic order: 0 = prefix, 1 = species, 2 = diet
separator: literal U+0020 between non-empty components
```

Do not invent locale-specific grammar.

Do not reverse-match strings.

Do not change the production source extract.

Do not commit or push.

---

# Source of truth

Use:

- `docs/audits/codex-localization-c6-composed-fauna-audit.md`
- `reference-source/localized-name-provenance-c6-fauna.csv`
- the committed C5 organic provenance implementation
- the committed production xEdit exporter behavior
- the committed localization-input manifest and extracted locale tables
- the committed C1–C5 provenance infrastructure

The audit is authoritative for C6 mechanics unless the implementation uncovers a concrete contradiction.

If implementation evidence differs from the audit, stop and report it rather than silently changing behavior.

---

# Scope classification

**High-complexity implementation parcel.**

Expected work:

- promote audited CCT rule traversal into production code;
- make string-table decoding locale/encoding aware;
- emit normalized component provenance rows for all 922 fauna;
- preserve exact record/provider/table/string-ID identity for every component;
- reconstruct and verify all 922 English names;
- reconstruct Japanese names from the same qualified identities for verification/handoff;
- replace deliberate C5 deferrals;
- extend committed-data validation and documentation.

Do not broaden into generic Bethesda naming infrastructure.

---

# Population boundary

The C6 target population is exactly:

```text
reference-source/localized-name-provenance-c6-fauna.csv
```

Expected population:

```text
922 fauna
```

This file is the sole population driver.

Do not:

- enumerate arbitrary NPCs;
- discover additional fauna;
- revisit flora;
- revisit direct `NPC_.FULL` fauna;
- revisit template-resolved fauna.

C6 remains target-driven.

---

# Audit-locked naming model

The audit established:

```text
dn_CCTPrefixes / ruleset 0 => prefix
dn_CCTSuffixes / ruleset 0 => species/body
dn_CCTSuffixes / ruleset 1 => diet
```

No other INNR record participates in the current 922-species population.

The final assembly order is:

```text
prefix
species/body
diet
```

skipping absent components.

The assembler inserts exactly one:

```text
U+0020
```

between adjacent emitted components.

No selected component contains leading/trailing separator whitespace.

Do not add locale-specific component order tables.

Do not add a format/template entity.

---

# Expected full-population invariants

Lock these audit results as production verification gates:

```text
C6 fauna:                         922

Shapes:
  prefix + species + diet:        335
  species + diet:                 320
  prefix + species:               267
  species only:                     0
  unsupported:                      0

Component occurrences:
  prefix:                         602
  species/body:                   922
  diet:                           655
  total:                        2,179

Unique qualified component IDs:
  prefix:                           8
  species/body:                   198
  diet:                              6
  total:                           212
```

The production build must fail if these counts drift unexpectedly for the audited input version.

If a future game update changes them, require explicit re-audit/update rather than silently accepting drift.

---

# Rule-selection algorithm

Promote the C5/audit rule-selection behavior into a production C6 module.

For each role/ruleset:

1. a rule matches only if it requires at least one keyword;
2. every required keyword must be present in the effective keyword set;
3. greatest required-keyword count wins;
4. if tied, highest `YNAM - Index` wins;
5. if still tied, earliest serialized rule index wins.

Do not sort INNR rules.

Serialized order is semantically meaningful.

---

# Effective keyword set

For each target fauna:

```text
effective keywords
=
native NPC KWDA keywords
+
NKEY keyword properties from selected top-level OMODs
+
NKEY keyword properties from recursively included OMODs
```

Requirements:

- recurse through nested OMOD includes;
- guard cycles;
- deduplicate visited OMODs;
- preserve deterministic traversal;
- collect only naming-relevant `NPC - Keyword` relationships;
- do not conflate naming OMOD traversal with produced-resource OMOD logic.

The audit found 35 fauna exercising recursive OMOD includes.

Add tests that preserve this behavior.

---

# Object Template combinations

The audited 922-fauna population currently has:

```text
1 Object Template combination per fauna
```

Do not hard-code that as a universal engine rule.

Production C6 should:

- enumerate combinations;
- resolve each independently;
- reconstruct the English name for each useful combination;
- require all useful combinations to collapse to one identical canonical name;
- fail closed if multiple final names are produced.

Expected current counts:

```text
fauna with >1 candidate combination: 0
ambiguous final names:               0
```

---

# Selected component provenance

For each emitted component, record exact provenance.

The current selected name field is:

```text
INNR
  > Naming Rules
    > Ruleset[ruleSetIndex]
      > Names
        > Name[ruleIndex]
          > WNAM - Text
```

`WNAM` is a four-byte localized string ID.

Expected table:

```text
strings
```

Do not infer the localized component from the visible English value.

Read the raw WNAM ID.

---

# Provider identity

Preserve separately:

```text
RecordSourcePlugin
NameSourcePlugin
```

The audit found all selected current C6 components are owned and provided by:

```text
Starfield.esm
```

and all 2,179 occurrences resolve through:

```text
Starfield.esm:strings:<ID>
```

However, do not hard-code that as a permanent architectural shortcut.

The implementation should still:

- determine the winning provider in the declared official load order;
- preserve actual provider identity;
- fail if provider inheritance/ambiguity is unsupported.

This keeps C6 compatible with future official-data changes without implementing arbitrary mod support.

---

# DLC behavior

The four current Shattered Space fauna remain C6 targets.

The audit found they reuse base-game:

```text
OMODs
INNR rules
localized component strings
```

C6 should verify this naturally through provider resolution.

Do not create DLC-specific naming rules.

Supported official plugin set remains:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

Zero component providers from a plugin is valid.

---

# Normalized provenance rows

Emit one row per **non-empty localized component occurrence** into:

```text
reference-source/localized-name-provenance.csv
```

Use the existing schema:

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

For C6:

```text
EntityKind = fauna
DisplayNameSourceKind = composed
RecordSignature = INNR
```

Recommended component semantics:

```text
prefix:
  ComponentOrder = 0
  ComponentRole  = prefix

species/body:
  ComponentOrder = 1
  ComponentRole  = species

diet:
  ComponentOrder = 2
  ComponentRole  = diet
```

Do **not** renumber semantic slots when an earlier component is absent.

Example:

```text
Beetle Grazer
```

should emit:

```text
species => ComponentOrder 1
diet    => ComponentOrder 2
```

not `0` and `1`.

---

# NameFieldPath

Use exact indexed project-owned paths that identify the selected serialized WNAM.

For example:

```text
Naming Rules[0]/Names[13]/WNAM - Text
Naming Rules[1]/Names[2]/WNAM - Text
```

The path must distinguish:

```text
ruleset index
rule index
field
```

Do not use a generic `INNR.WNAM` path that loses rule identity.

---

# CanonicalEnglish semantics for component rows

For composed rows, `CanonicalEnglish` should represent the official English value of that exact selected component.

Examples:

```text
Herding
Dodo
Scavenger
```

Do not repeat the full composed fauna name in every component row.

The entity-level final English composition should be verified separately.

If repository conventions require a different interpretation of `CanonicalEnglish`, preserve existing schema semantics and document the chosen behavior clearly.

Do not silently overload the field inconsistently.

---

# C5 deferral replacement

C5 deliberately deferred 922 fauna.

After C6 generation:

- those fauna must no longer appear as deliberate C6 deferrals;
- they must be represented by normalized composed component rows;
- genuinely unresolved cases, if any, belong in the unresolved artifact.

Expected outcome:

```text
C6 deferred:     0
C6 unresolved:   0
C6 resolved:   922 entities
rows emitted: 2,179
```

Do not delete C5 handoff/source evidence if it remains useful for deterministic regeneration.

---

# English assembly verification

For every C6 fauna:

1. resolve selected components by exact provenance;
2. sort by fixed semantic `ComponentOrder`;
3. omit absent roles;
4. join with literal `U+0020`;
5. compare exactly to the C5 canonical composed English name.

Required result:

```text
922 / 922 exact English matches
```

No fuzzy comparison.

No reverse lookup.

No global normalization.

If a discrepancy appears, fail and report it.

---

# Locale-aware string-table decoding

The current production `string-table-reader.mjs` was built for English-only provenance and decodes text as Windows-1252.

C6 must make string-table decoding explicitly locale/encoding aware.

At minimum:

```text
English => Windows-1252
Japanese => UTF-8
```

Use a project-owned encoding policy keyed by locale or localization input metadata.

Do not guess encoding from byte patterns.

Do not create a C6-only duplicate parser.

Update the shared string-table reader so later locales can reuse it.

---

# Future-language requirement

Design locale decoding so adding a later locale does not require another C6 architecture rewrite.

Do not hard-code only:

```text
en
ja
```

into the data model.

It is acceptable for the current encoding policy table to contain only known locale mappings, but unsupported locales should fail with a clear:

```text
UNSUPPORTED_LOCALE_ENCODING
```

or equivalent.

Document that new locales require:

- encoding mapping;
- table intake;
- representative composed-name verification.

They do **not** require a repeat of the full C6 architecture audit unless evidence contradicts the fixed CCT model.

---

# Japanese verification

For every selected component, resolve Japanese using the same qualified identity:

```text
(NameSourcePlugin, NameStringTable, NameStringID)
```

Do not search by English text.

Build a Japanese composed-name verification output using:

```text
same semantic component order
same absent/present roles
literal U+0020 separator
Japanese component values
```

The audit established no locale-specific reordering mechanism.

Do not add one.

---

# Japanese artifact boundary

C6 may generate a deterministic **verification/handoff artifact** containing the reconstructed Japanese composed fauna names.

Do not wire it into runtime UI yet.

Parcel D remains responsible for production reference-name overlay integration.

Suggested local/checked-in artifact, if useful:

```text
reference-source/localized-name-c6-fauna-ja-preview.csv
```

or another clearly named build/reference artifact.

If the repository already has a better handoff convention, use it.

The artifact should be clearly described as:

```text
verified composed-name output for later overlay generation
```

not as runtime localization.

---

# Japanese hardening limitation

The audit found:

- official component identity is proven;
- fixed structural order is proven;
- public Japanese player data corroborates spaced output;
- no official fully composed string exists for direct comparison.

Therefore C6 should keep one explicit hardening item:

```text
direct Japanese runtime / Creation Kit confirmation of exact on-screen U+0020 separator fidelity
```

This is not a blocker to normalized provenance generation.

It is a later hardening gate before declaring Japanese runtime overlay behavior fully proven.

Do not fake an official final-string comparison that does not exist.

---

# Representative Japanese locks

Add deterministic expected outputs for representatives covering all observed shapes.

At minimum include:

```text
Carasnail Scavenger
Herding Dodo Scavenger
Hunting Tuskfrog
Schooling Kronosaurus Scavenger
Apex Parrothawk
one Shattered Space fauna
```

Use the audited official component IDs/values.

Do not hard-code these as special runtime cases; they are regression fixtures.

---

# Rule-order tie coverage

The audit found 8 fauna where two prefix rules tie on:

```text
specificity
YNAM
```

and earliest serialized rule order determines the selected result.

Production tests must lock this behavior.

Representative ties include:

```text
Swarming Arachnofly Scavenger
Swarming Shardhopper Scavenger
Hunting Sloth Geophage
Pack Cockroach Stalker
```

At least one synthetic test should prove earliest-rule selection.

The installed-game verification should report all 8 still resolve as audited.

---

# Empty WNAM handling

The audited INNR rules include unused rules where:

```text
WNAM = 0
```

None is selected by the current 922 fauna.

Production C6 should:

- treat selected `WNAM=0` as unsupported/fail-closed;
- not invent visible text;
- not silently omit a role if a matching rule explicitly selects zero.

Add a focused test.

---

# Fail-closed behavior

Add stable errors/reasons where useful:

```text
C6_NPC_NOT_FOUND
C6_OBJECT_TEMPLATE_MISSING
C6_MULTIPLE_FINAL_NAMES
C6_REQUIRED_SPECIES_COMPONENT_MISSING
C6_INNR_RECORD_NOT_FOUND
C6_INNR_RULE_UNSUPPORTED
C6_WNAM_ZERO
C6_STRING_ID_MISSING
C6_PROVIDER_AMBIGUOUS
C6_ENGLISH_RECONSTRUCTION_MISMATCH
C6_UNSUPPORTED_LOCALE_ENCODING
```

Reuse existing generic codes when appropriate rather than duplicating categories.

Do not “make the name look right.”

---

# Committed-data validation

Extend repository-only validation for composed fauna rows.

Without installed Bethesda files, validate all project-owned invariants that can be checked from committed artifacts:

- all 922 C6 entity IDs are represented;
- each entity has exactly the expected role shape from the committed generated provenance;
- `DisplayNameSourceKind = composed`;
- component orders are semantic slots `0/1/2`;
- component roles are valid;
- `RecordSignature = INNR`;
- field paths contain exact ruleset/rule indices;
- string IDs are valid uppercase eight-digit hex;
- provider/table fields are structurally valid;
- no C6 entity remains in the deliberate-deferral state.

Do not pretend repository-only validation can independently re-prove Bethesda rule selection.

Local installed-game regeneration remains the authority for that.

---

# Tests

Add focused project-authored tests.

## Rule selection

Cover:

- required-keyword matching;
- specificity precedence;
- `YNAM` precedence;
- earliest serialized rule tie-break;
- no-keyword rule rejection;
- selected `WNAM=0` failure.

## Keyword traversal

Cover:

- native NPC keywords;
- OMOD `NKEY` keywords;
- recursive OMOD includes;
- cycle protection;
- duplicate includes.

## Role mapping

Cover:

```text
dn_CCTPrefixes set 0 -> prefix
dn_CCTSuffixes set 0 -> species
dn_CCTSuffixes set 1 -> diet
```

## Shapes

Cover:

- prefix + species + diet;
- species + diet;
- prefix + species;
- no species -> fail.

## Component order

Prove semantic slots stay:

```text
0 prefix
1 species
2 diet
```

even when prefix/diet is absent.

## Assembly

Cover:

- one `U+0020` between non-empty components;
- no leading/trailing separator;
- absent component does not create double spaces.

## Locale decoding

Cover:

- Windows-1252 English;
- UTF-8 Japanese;
- unsupported locale encoding fails clearly.

## Qualified locale lookup

Prove English and Japanese use the same:

```text
plugin + table + string ID
```

identity.

## DLC

Include a Shattered Space fauna using base-game CCT components.

---

# Installed-game generation gates

The full local C6 build must assert:

```text
922 entities
2,179 component rows
8 unique prefixes
198 unique species/body components
6 unique diets
212 unique component IDs
```

and:

```text
335 prefix+species+diet
320 species+diet
267 prefix+species
0 species-only
0 unsupported
```

It must also assert:

```text
922/922 exact English reconstructions
0 provider ambiguities
0 missing English component IDs
0 missing Japanese component IDs
0 unsupported selected shapes
```

---

# Full provenance totals

After replacing C5 deferrals, report updated global provenance totals.

Do not hard-code the expected overall row count unless calculated from current committed populations.

Report separately:

```text
resolved entities
resolved provenance rows
composed C6 entities
composed C6 rows
unresolved entities
```

Because composed entities now have multiple provenance rows, distinguish entity count from row count clearly.

---

# Documentation

Update durable documentation.

At minimum:

## `docs/ARCHITECTURE.md`

Document:

```text
canonical fauna
-> effective CCT keywords
-> selected INNR rules
-> raw WNAM IDs
-> ordered component provenance
-> locale lookup
-> fixed-slot assembly
```

Clarify:

- fixed role order belongs to the CCT naming family;
- locale changes component values, not order;
- separator is U+0020;
- future locales need encoding + representative verification;
- runtime overlay consumption remains later work.

## localization/reference regeneration docs

Document:

- C6 population source;
- exact assembly rule;
- locale decoding policy;
- installed-game invariants;
- Japanese verification/hardening limitation;
- future-locale onboarding rule.

---

# C6 audit report retention

Keep:

```text
docs/audits/codex-localization-c6-composed-fauna-audit.md
```

as the architectural evidence for this implementation.

Do not replace it with generated implementation documentation.

---

# No runtime overlay integration

Do not modify:

- React UI;
- runtime reference-name overlay consumers;
- Japanese locale selector behavior;
- search;
- persistence;
- Undo/Redo;
- import/export;
- network/player schema.

C6 may generate Japanese verification/handoff data, but Parcel D owns runtime overlay generation/integration.

---

# No generic Bethesda naming toolkit

Do not add:

- generic INNR explorer;
- arbitrary NPC naming resolver;
- generalized OMOD relationship graph;
- all-record browser;
- arbitrary mod-load-order support.

The production module should remain narrowly targeted to the canonical CCT fauna naming family.

---

# Verification commands

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run build
npm run lint
git diff --check
```

Also run:

- installed-game provenance regeneration;
- full C6 English reconstruction verification;
- Japanese component lookup/reconstruction verification;
- any new locale-aware string-table tests.

---

# Acceptance criteria

C6 is complete when:

1. all 922 C5-deferred fauna are processed;
2. no extra fauna are discovered into scope;
3. CCT effective keyword traversal matches the audited behavior;
4. rule selection uses specificity → YNAM → earliest serialized rule;
5. prefix/species/diet roles map to the audited INNR records/rulesets;
6. exact raw WNAM string IDs are extracted;
7. provider plugin/table identity is preserved;
8. one provenance row is emitted per non-empty component;
9. exactly 2,179 component rows are emitted for the audited population;
10. semantic component slots remain `0=prefix`, `1=species`, `2=diet`;
11. final assembly uses fixed role order and literal U+0020 separators;
12. all 922 English names reconstruct exactly;
13. Japanese resolves through the same qualified component identities;
14. Japanese reconstruction uses the same structural order;
15. string-table decoding is locale/encoding aware;
16. the production string-table reader no longer corrupts Japanese UTF-8;
17. all four Shattered Space C6 fauna resolve through their actual base-game component providers;
18. all 8 audited rule-order tie cases remain deterministic;
19. selected WNAM=0 fails closed;
20. no C6 species remains deliberately deferred;
21. unresolved count is zero unless a genuine contradiction is found;
22. existing provenance schema remains sufficient without locale-specific order/template entities;
23. future-language onboarding requires encoding + representative verification, not a repeated architecture audit by default;
24. no canonical organic source data is rewritten;
25. no runtime/UI/Japanese-overlay integration/persistence/schema changes are introduced;
26. no generic Bethesda naming toolkit is created;
27. all verification commands pass;
28. no commit or push is performed.

---

# Final report

Report:

- files changed/added;
- C6 entity count;
- emitted component-row count;
- composition-shape counts;
- unique component counts by role;
- provider/plugin breakdown;
- English reconstruction result;
- Japanese lookup/reconstruction result;
- locale-decoding changes;
- rule-order tie verification;
- recursive OMOD verification;
- any new explicit normalization approvals;
- unresolved/error count;
- updated global provenance entity/row totals;
- Japanese hardening item status;
- future-locale support implications;
- tests/build/lint results;
- confirmation that no runtime overlay/UI/persistence/schema work was introduced.

Do not proceed into Parcel D runtime integration unless separately instructed.

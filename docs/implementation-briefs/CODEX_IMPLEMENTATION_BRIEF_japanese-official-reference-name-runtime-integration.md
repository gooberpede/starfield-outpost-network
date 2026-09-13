# CODEX IMPLEMENTATION BRIEF — Japanese Official Reference-Name Runtime Integration

## Purpose

Integrate the committed Japanese official reference-name overlay into the application runtime.

The generated artifact already exists and is verified:

```text
src/localization/generated/ja-JP-reference-names.ts
```

This implementation slice should make those official Japanese names appear through the existing localization/reference-name seam while preserving stable IDs, canonical English fallback, history semantics, persistence behavior, and current en-US/en-GB behavior.

Do **not** redesign the localization architecture.

Do **not** add generic terminology adjudication in this slice.

Do **not** expand into Japanese search/font/layout hardening.

Do **not** commit or push.

---

# Naming guidance

Avoid transient roadmap identifiers such as:

```text
D2
C7
C8
```

in durable implementation names.

Use domain-oriented names such as:

```text
reference names
official terms
history reference fallback
localized presentation
```

Roadmap labels may remain in historical audit/report prose only.

---

# Scope classification

**Medium cross-cutting runtime integration.**

Expected touched areas:

- `src/localization/referenceNames.ts`;
- generated Japanese overlay registration;
- reference-name types;
- character skill label presentation;
- validation/history presentation;
- history label descriptor construction;
- runtime localization tests;
- locale-switching tests;
- documentation.

Do not modify:

- persistence schema;
- import/export schema;
- collection/domain state shape;
- provenance generation;
- Japanese generated reference-name values;
- semantic terminology catalogue adjudication;
- fonts/layout;
- search ranking/aliases;
- broad collation behavior.

---

# Upstream contract

The committed Japanese reference-name overlay contains exactly:

```text
428 biome
1,776 body
1,121 species
5 official-term
30 product
78 resource
123 system
----------------
3,561 total
```

The reference-name generator and repository verifier already guarantee this artifact.

Consume it as-is.

Do not regenerate or edit Japanese values manually during runtime integration.

---

# Existing runtime seam

The existing runtime API is conceptually:

```ts
getReferenceDisplayName(kind, id, canonicalName, locale): string
```

Current fallback behavior is:

```text
locale-specific reference-name override
-> canonical English name
-> raw stable ID
```

Preserve this behavior.

The generated Japanese map should be registered through this existing seam rather than creating a second lookup path.

---

# ReferenceNameKind extension

Extend the runtime reference-name kind union to include:

```text
official-term
```

Expected durable kind set:

```text
resource
product
system
body
biome
species
official-term
```

Do not add provenance-specific kinds such as `flora` or `fauna` at runtime.

The generated map already normalizes those to `species`.

---

# Japanese overlay registration

Statically import:

```text
src/localization/generated/ja-JP-reference-names.ts
```

into the reference-name registration layer.

Register it under:

```text
ja-JP
```

alongside the existing hand-owned English sparse overrides.

Do not replace or reorder the current `en-US` / `en-GB` reference-name behavior.

Expected precedence remains:

```text
requested locale overlay
-> canonical English runtime name
-> stable ID
```

---

# en-US / en-GB preservation

Preserve the existing Aluminum/Aluminium proof.

Expected behavior must remain:

```text
en-US resource:aluminium -> Aluminum
en-GB resource:aluminium -> Aluminium
ja-JP resource:aluminium -> アルミニウム
```

Do not allow Japanese registration to replace the sparse English override maps.

Add a regression test for all three.

---

# Runtime reference families

The generated Japanese overlay should immediately flow through existing consumers for:

```text
resource
product
system
body
biome
species
```

Do not special-case individual screens.

Where consumers already call `getReferenceDisplayName()`, they should require little or no code change.

Verify at least:

- system selector;
- body selector;
- biome presentation;
- Resource Matrix;
- Planned Supply;
- cargo editors;
- search result display/index source;
- validation messages;
- history labels.

Do not redesign these consumers if the shared lookup already supplies the correct result.

---

# Official-term runtime integration

The five official skill terms currently exist in provenance and in the generated Japanese overlay under stable IDs.

Examples include:

```text
skill.special-projects
skill.outpost-management
skill.planetary-habitation
skill.research-methods
skill.outpost-engineering
```

Use the repository’s exact committed IDs.

Add a small durable mapping between runtime skill slots and official-term IDs.

Do not use PERK FormIDs at runtime.

Do not persist localized skill labels.

---

# Skill-label behavior

Character skill labels currently come from semantic message keys.

For the five official Bethesda skill names:

```text
use official-term reference-name lookup
```

with canonical English fallback derived from the existing English semantic/source label.

Recommended conceptual behavior:

```text
skill slot
-> official-term stable ID
-> getReferenceDisplayName(
     'official-term',
     officialTermId,
     canonicalEnglishSkillName,
     locale
   )
```

This should produce official Bethesda Japanese skill names while retaining safe English fallback.

Do not remove semantic messages that are still needed for tracker-authored surrounding text.

---

# Validation integration

Validation domain logic must remain structural and locale-independent.

If validation presentation includes skill names or other canonical reference names:

```text
resolve them through the same reference-name lookup layer
```

Do not introduce localized strings into domain validation issues.

Do not duplicate skill/reference localization logic inside validators.

---

# History fallback correctness fix

The Parcel D audit found a session-history relocalization issue.

Current problematic pattern:

```text
localized presentation copy
-> .name
-> stored as HistoryLabelDescriptor reference fallback
```

If an action is created while Japanese is active, the fallback can capture Japanese.

Later, if rendered under English and the reference lookup cannot resolve, that Japanese fallback may leak into the English history label.

This must be corrected.

---

# Correct history fallback rule

History reference descriptors should store:

```text
stable reference kind
stable reference ID
canonical English fallback
```

The fallback must come from canonical reference data, not a currently localized presentation copy.

Conceptually:

```text
referenceParameters: [{
  kind,
  id,
  fallback: canonicalReferenceName
}]
```

not:

```text
fallback: localizedReferenceName
```

Do not change history snapshot/state semantics.

Do not add locale to history entries.

Do not persist generated Japanese strings in history.

---

# History relocalization behavior

Add regression coverage proving:

1. locale = `ja-JP`;
2. create an action whose history label contains a canonical reference;
3. history descriptor stores stable ID + canonical English fallback;
4. render history in Japanese -> Japanese name appears;
5. switch locale to `en-US`;
6. render same history entry -> English canonical name appears;
7. history length and collection state remain unchanged.

Also verify the inverse direction where practical:

```text
action created in English
-> rendered later in Japanese
```

should display Japanese through stable-ID lookup.

---

# Locale switching invariants

Changing locale must remain presentation-only.

Verify that switching between:

```text
en-US
en-GB
ja-JP
```

does not change:

- persisted network state;
- active network/outpost selection;
- history entry count;
- Undo/Redo history snapshots;
- import/export payloads;
- stable reference IDs;
- schema versions.

Do not dispatch collection edits when locale changes.

---

# Search boundary

Search already builds display/index values through localized reference names for resources/products.

Allow Japanese names to flow through naturally via the shared lookup.

Do not in this slice add:

- English aliases under Japanese;
- romanized aliases;
- kana/kanji normalization;
- ranking changes;
- dual-script indexing;
- Japanese-specific search UX.

Those belong to later Japanese hardening.

Only basic correctness should be verified:

```text
displayed Japanese search result
still submits the same stable item identity
```

---

# Sorting/collation boundary

Preserve current ordering behavior.

Do not undertake broad locale-aware sorting changes.

If Japanese names cause obviously broken basic rendering in an existing comparator, report it rather than expanding this implementation into a collation project.

Broad sorting/collation review belongs later.

---

# Canonical fallback sources

Where `getReferenceDisplayName()` requires `canonicalName`, pass canonical English from authoritative runtime reference data.

Avoid taking fallback text from:

- localized presentation copies;
- current locale message output;
- generated Japanese overlay.

For `official-term` skill labels, use the canonical English skill label already defined by the application.

---

# Missing Japanese behavior

Runtime fallback should remain safe:

```text
missing ja-JP overlay entry
-> canonical English
-> stable ID
```

However, generated overlay coverage is already complete.

Add tests ensuring fallback still works for an intentionally unknown/missing test key.

Do not insert English fallback entries into the generated Japanese overlay.

---

# Generated artifact immutability

Do not manually edit:

```text
src/localization/generated/ja-JP-reference-names.ts
reference-source/localized-reference-names-manifest.json
```

Runtime integration should consume them only.

`npm run localization:reference-names:verify` must remain zero-drift.

---

# Semantic terminology boundary

Do not yet adjudicate generic Bethesda terminology such as:

```text
Outpost
Cargo Link
Cargo Pad
Inter-System
X-Tech Power Core
Starfield
Biome
Planet
Star System
```

Those remain a separate semantic-message terminology task.

Do not create fake stable reference entities for them here.

Do not modify the 330-message Japanese catalogue except where a tiny structural change is strictly necessary to stop a duplicate skill-name path; if any catalogue change seems needed, explain before making it.

---

# Runtime consumer audit during implementation

As part of implementation, identify active code paths that still bypass `getReferenceDisplayName()` for canonical names.

If you find a bypass:

- route it through the existing reference-name seam if local and clearly correct;
- do not perform a broad refactor;
- report all bypasses found.

The goal is one shared presentation path, not architectural churn.

---

# Tests

Add focused runtime tests for at least:

## Reference lookup

```text
resource:aluminium
resource:x-tech
resource:gastronomic-delight
product:adaptive-frame
system:119226
body:01000801
body:0005E364
biome:01012244
species:01039BE3
species:0008D0D8
species:000065E6
official-term:skill.outpost-management
```

## Locale behavior

- en-US Aluminum;
- en-GB Aluminium;
- ja-JP アルミニウム;
- Japanese DLC body;
- Japanese composed fauna;
- unknown/missing Japanese key -> canonical English fallback.

## Skills

- all five skill slots map to official-term IDs;
- Japanese official skill labels appear;
- English fallback remains canonical;
- no skill FormID is persisted.

## History

- Japanese-created history rerenders correctly in English;
- English-created history rerenders correctly in Japanese;
- canonical English fallback is stored/used;
- stable ID remains unchanged;
- no history entry is created by locale switching.

## Persistence invariants

- switching locale does not mutate collection state;
- import/export output is unchanged by locale;
- Undo/Redo state is unchanged by locale.

## Search smoke test

- Japanese displayed item name appears in search;
- selecting it returns the same stable resource/product identity.

Do not duplicate the reference-name generator’s provenance/provider tests.

---

# No schema or persistence changes

Explicitly do not change:

- `NetworkCollection`;
- `SavedNetwork`;
- outpost/item/resource IDs;
- history snapshot schema;
- import/export schema;
- local-storage collection schema;
- locale preference storage format unless absolutely necessary for existing `ja-JP` registration.

No migration should be required.

---

# Documentation

Update durable localization architecture docs to describe:

- generated Japanese official reference-name overlay registration;
- `official-term` runtime kind;
- skill-label mapping;
- fallback chain;
- history canonical-fallback rule;
- stable-ID/presentation-only principle.

Use functional names, not roadmap labels.

Do not rewrite historical audit documents.

---

# Verification commands

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run build
npm run lint
git diff --check
```

The generated Japanese overlay must remain zero-drift.

---

# Acceptance criteria

Runtime integration is complete when:

1. the generated `ja-JP` reference-name overlay is registered in the existing lookup layer;
2. `ReferenceNameKind` includes `official-term`;
3. all six existing canonical runtime families automatically receive Japanese names through the shared lookup;
4. all five official skill names route through `official-term`;
5. en-US/en-GB reference-name behavior remains unchanged;
6. Japanese reference names render correctly for representative base-game and DLC entities;
7. composed fauna render their precomposed Japanese generated names;
8. runtime fallback remains locale overlay -> canonical English -> stable ID;
9. history descriptors use canonical English reference fallback, never current localized presentation text;
10. history entries relocalize correctly after locale switches;
11. locale switching does not mutate collection/history/persistence state;
12. stable IDs remain the only persisted canonical identities;
13. search displays Japanese names without changing submitted stable identity;
14. no broad search/collation/font/layout work is introduced;
15. no generic terminology adjudication is mixed into this slice;
16. generated Japanese artifacts remain unchanged and zero-drift;
17. no schema/import/export migrations are introduced;
18. all required tests/build/lint/checks pass;
19. no transient roadmap identifiers are introduced into durable implementation names;
20. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- reference-name registration changes;
- final `ReferenceNameKind`;
- skill-slot -> official-term mapping;
- representative Japanese runtime outputs;
- en-US/en-GB regression results;
- history fallback correction details;
- locale-switching invariants;
- search smoke-test result;
- any canonical-name bypasses discovered;
- whether any persistence/schema code changed;
- generated-overlay verification result;
- full test/build/lint result;
- confirmation that semantic terminology, fonts/layout, and broad search/collation were not included.

Do not proceed to generic terminology adjudication or Japanese UX hardening unless separately instructed.

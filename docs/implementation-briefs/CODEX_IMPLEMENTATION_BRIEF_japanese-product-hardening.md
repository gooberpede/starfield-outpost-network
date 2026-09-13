# CODEX IMPLEMENTATION BRIEF — Japanese Product Hardening

## Purpose

Implement the Japanese product-hardening work identified by the completed audit.

This pass should address five focused areas:

1. multilingual search aliases;
2. Japanese font/typography fallback;
3. compact contextual controls and Inter-System marker;
4. measured layout breakpoint defects;
5. targeted locale-aware collation.

The goal is to make Japanese feel like a first-class product without changing the tracker’s domain model, persistence model, canonical reference identities, or localization provenance architecture.

Do **not** commit or push.

---

# Scope classification

**Medium cross-cutting product-hardening implementation.**

Expected touched areas:

- item search catalogue/index/ranking;
- localization/search alias plumbing;
- global typography/font tokens;
- selected mixed-script technical text styles;
- Outpost/Cargo Link Add controls;
- Inter-System marker presentation;
- page header / character header responsive layout;
- outpost location-strip layout;
- selected presentation-layer sort comparators;
- focused tests;
- durable architecture/localization documentation if needed.

Do not modify:

- persistence schema;
- import/export schema;
- history snapshot structure;
- domain types;
- canonical reference-name provenance;
- generated Japanese reference-name artifacts;
- terminology provenance architecture;
- resource-family/topology ordering;
- body/orbit ordering;
- pane resizing/persistence;
- broad accessibility architecture.

---

# Naming guidance

Avoid transient roadmap identifiers in durable code, filenames, exports, functions, or config.

Do not introduce names such as:

```text
E1
E2
E3
```

Use functional names such as:

```text
search aliases
Japanese typography
compact add control
inter-system indicator
localized collation
```

---

# Source audit

Follow the current conclusions of:

```text
docs/audits/codex-japanese-product-hardening-audit.md
```

Key established findings:

```text
Outcome B — targeted hardening required
14 findings
0 BLOCKER
2 HIGH
6 MEDIUM
5 LOW
1 COSMETIC
```

Do not reopen settled terminology/provenance work unless a concrete implementation defect requires it.

---

# Slice 1 — multilingual search aliases

## Goal

Allow Japanese users to search official localized names **and** canonical English names without duplicating visible results or changing stable IDs.

Current problem under `ja-JP`:

```text
アルミニウム        -> matches
順応型フレーム      -> matches
Aluminum            -> no match
Aluminium           -> no match
adaptive frame      -> no match
```

Implement one search entry per stable entity with multiple searchable aliases.

## Search entry model

Recommended conceptual shape:

```ts
{
  key: 'resource:aluminium',
  displayName: 'アルミニウム',
  abbreviation: 'Al',
  aliases: [
    { kind: 'localized', value: 'アルミニウム' },
    { kind: 'canonical-en', value: 'Aluminum' },
    { kind: 'alternate', value: 'Aluminium' }
  ],
  item: { type: 'resource', id: 'aluminium' }
}
```

Exact implementation shape may differ.

Critical invariant:

```text
one stable entity
-> one visible result row
-> multiple searchable aliases
```

Do not create duplicate result rows per alias.

## Alias sources

Search aliases should include:

1. current localized display name;
2. current abbreviation;
3. canonical English name;
4. explicitly known supported alternates.

For the current product, `Aluminium` is a useful regression case because it is an established en-GB override already represented by the product.

Do **not**:

- generate romaji;
- transliterate kana;
- infer spelling variants algorithmically;
- pull aliases from unofficial sources;
- add every supported locale’s name as a hidden alias;
- add fuzzy edit-distance matching.

## Search ranking

Preserve one stable result record and rank matches approximately as:

```text
1. exact localized display name
2. exact abbreviation
3. localized prefix
4. localized substring
5. exact canonical English alias
6. canonical English prefix
7. canonical English substring
8. explicit alternate exact/prefix/substring
```

If existing ranking semantics require a slightly different internal ordering, preserve the spirit:

```text
localized presentation wins
canonical English remains easy to find
explicit alternates remain lower priority
```

Use locale-aware tiebreaking for otherwise equal visible results.

Always retain a stable deterministic final tie-breaker such as:

```text
type + stable ID
```

## Search normalization

Keep:

```text
trim
Unicode NFC
locale-aware lowercasing
```

Add only conservative whitespace normalization if needed.

Do not broaden this slice into half/full-width kana normalization, hiragana/katakana equivalence, broad punctuation rewriting, romaji reading generation, or fuzzy matching.

## Alias collision handling

Update collision/disambiguation logic so aliases are considered.

If two stable entities share the same searchable alias:

- preserve one result per stable entity;
- show existing category disambiguation where appropriate;
- do not auto-submit ambiguous free text;
- keep deterministic ordering.

Add explicit alias-collision tests.

## Required search tests

At minimum under `ja-JP` verify:

```text
アルミニウム         -> resource:aluminium
アルミ               -> resource:aluminium
Aluminum             -> resource:aluminium
Aluminium            -> resource:aluminium
AL / al              -> resource:aluminium
順応型フレーム       -> product:adaptive-frame
adaptive frame       -> product:adaptive-frame
```

Verify one result row per stable entity, Japanese display remains visible under `ja-JP`, English alias search does not switch the displayed result to English, submission still returns the original stable ID, localized matches outrank aliases, and collisions remain deterministic.

---

# Slice 2 — Japanese font and typography fallback

## Goal

Stop relying on accidental browser CJK fallback.

Japanese currently renders without tofu on the audited Windows runtime, but ordinary UI text can mix Barlow/IBM Plex Latin glyphs with an unspecified system CJK fallback.

Use explicit language-sensitive typography.

## Japanese UI font stack

Prefer an explicit `:lang(ja)` UI font token.

Conceptual shape:

```css
:root {
  --ui-font:
    "Barlow Semi Condensed",
    "Arial Narrow",
    system-ui,
    sans-serif;
}

:lang(ja) {
  --ui-font:
    "Yu Gothic UI",
    "Yu Gothic",
    "Hiragino Sans",
    "Meiryo",
    system-ui,
    sans-serif;
}
```

Exact order may be adjusted after runtime testing.

Do not ship font files, add web-font dependencies, or require font downloads.

## Branding and technical-token exceptions

Japanese locale should use the Japanese UI stack for ordinary human-language interface text.

Preserve deliberate Latin typography where it has a job:

- Barlow for brand-oriented Latin treatment;
- IBM Plex Mono for FormIDs, stable IDs, abbreviations, numeric codes, technical counters, and short technical flags.

Do not use mono merely because text appears in a technical-looking panel.

## Mixed-language context cleanup

Known target:

```text
validation-summary-panel__context
```

Human-language Japanese context should use the normal Japanese UI face. If a technical token inside it needs mono treatment, style that token locally where practical.

Do not add elaborate segmentation solely for visual purity.

## Japanese tracking / uppercase assumptions

Where small headings/labels use Latin-oriented uppercase/tracking, reduce or neutralize excessive tracking under `:lang(ja)`.

Do not remove Latin uppercase/tracking globally.

Prefer one shared Japanese typography rule/token over many ad-hoc exceptions.

## Font acceptance checks

Verify:

```text
ー
・
「」
：
（）
X-テック
X-テックパワーコア
アルミニウム
拠点エンジニアリング
```

No tofu; coherent baseline/weight; English locales visually unchanged; no font binaries added.

---

# Slice 3 — compact controls and Inter-System indicator

## Compact Add controls

Change visual labels:

```text
+ Add Outpost
+ Add Cargo Link
```

to:

```text
+ Add
+ Add
```

Japanese:

```text
＋ 拠点を追加
＋ 貨物リンクを追加
```

to:

```text
＋ 追加
＋ 追加
```

Do **not** reduce to bare `+` in this pass.

## Full semantic label remains available

Each shortened Add control must keep the complete localized action as both tooltip and `aria-label`.

Examples:

```text
visual: + Add
tooltip / aria-label: Add Outpost
```

```text
visual: + Add
tooltip / aria-label: Add Cargo Link
```

Japanese:

```text
visual: ＋ 追加
tooltip / aria-label: 拠点を追加
```

```text
visual: ＋ 追加
tooltip / aria-label: 貨物リンクを追加
```

All user-facing text remains in the localization layer.

A shared generic visual key such as `common.add` is acceptable if the grammar is genuinely shared, while full action keys remain context-specific.

## Inter-System marker

Retire visible:

```text
[INT]
```

For this implementation pass, prototype a localization-neutral text-symbol treatment rather than drawing/finalizing an SVG.

Preferred prototype:

```text
✷⇄✷
```

A closely related symbol composition is acceptable if runtime rendering is materially better.

Do not introduce an icon library or create a final SVG asset in this pass.

## Inter-System semantics

The visual symbol is **not localized**.

The full meaning must remain localized in tooltip and `aria-label`:

```text
Inter-System Cargo Link
星系間貨物リンク
```

Use the existing localized semantic key where possible.

Internal `interstellar` must remain unchanged.

## Marker fallback

If the symbol prototype renders poorly/inconsistently, use:

```text
[I-S]
```

Do not use `[INT]` or `[IS]`.

`[I.S.]` is acceptable only if testing clearly favors it, but `[I-S]` is the preferred text fallback.

## Marker accessibility

Tooltip alone is insufficient. Expose an explicit accessible name. Screen readers should receive the localized semantic meaning rather than the literal symbol sequence.

Do not rely on color alone.

Compact controls must preserve focus, disabled states, click targets, keyboard interaction, and cargo semantics.

---

# Slice 4 — layout hardening

## Goal

Correct two measured breakpoint discontinuities without redesigning the workspace.

Known defects:

1. Page/character header becomes excessively tall and constricted before the current breakpoint.
2. Outpost location/details strip overflows horizontally around the 1025–1100 px range, then recovers at 1024 px.

## Header layout

Measured Japanese behavior includes roughly:

```text
145 px high at 1280
213 px high around 1100
```

The issue is structural, not Japanese-specific: action clusters retain width, the center region becomes too narrow, fields stack excessively, then the current breakpoint suddenly repairs the layout.

Move the wrap/span transition earlier or derive it from measured content needs.

Do not add locale-specific breakpoints.

Do not solve this merely by allowing uncontrolled sticky-header growth.

## Header acceptance widths

Retest:

```text
1440
1280
1100
1050
1024
960
900
```

There should be no range where layout becomes dramatically worse immediately before a breakpoint and improves immediately after it.

Japanese may remain somewhat taller than English.

## Outpost location/details strip

Add an earlier compression/wrap step.

Preferred order:

```text
1. reduce gaps/minima
2. preserve System/Body selector usability
3. allow biome/later field regions to span or wrap where appropriate
```

Preserve field order, semantic grouping, and selector usability.

Do not globally stack all fields early.

## Layout boundaries

Do not:

- redesign mobile behavior;
- introduce pane resizing;
- persist layout state;
- reorder Resource Matrix columns;
- remove matrix horizontal scrolling;
- redesign Outpost navigation;
- introduce locale-specific width values.

The Resource Matrix geometry should remain unchanged unless a direct regression is found.

---

# Slice 5 — targeted locale-aware collation

## Goal

Use active-locale collation consistently only for genuinely alphabetical presentation lists.

Do not impose locale sorting on topology/spatial/domain ordering.

## Star-system selector

Adopt locale-aware sorting now.

There is no meaningful canonical source order to preserve.

In the presentation layer:

```text
localized system records
-> getCollator(locale).compare(displayName)
-> stable system ID tie-breaker
```

Do not sort by resources, biology, level, distance, ownership, or gameplay relevance.

## Body selector

Do **not** alphabetize bodies in this pass.

Preserve existing body/source/orbit sequence.

A future dedicated improvement may derive true inner-to-outer orbital order.

## Planned Supply

Preserve explicit inorganic/resource-family/topology order.

For genuinely alphabetical localized name groups such as organic rows, product groups, or compact localized-name groups, replace host-default `localeCompare` with the shared locale collator where appropriate.

Preserve explicit X-Tech placement.

## Cargo export candidates

Use the active locale collator for localized display-name ordering.

Preserve stable IDs and cargo semantics.

## Import summaries

Do not move locale into pure domain logic merely for display sorting.

If the sort can be moved cleanly to presentation without broad refactoring, do so only if clearly local and safe. Otherwise leave it unchanged and report it as deferred.

This is not a blocker.

## Lists that must remain non-collated

Preserve:

```text
body/orbit order
biome occurrence/index order
resource-family/topology order
persisted outpost order
validation severity/rule order
history chronology
source-class order for organic production
```

Every locale-sensitive comparator must use a deterministic stable fallback, preferably stable ID.

---

# Explicit non-changes

Do not change composed-fauna U+0020 spacing.

Do not perform broad punctuation normalization.

Do not globally replace ASCII `...` with `…`.

Do not alter canonical localization/provenance artifacts.

Do not rename internal `CargoPad` / `interstellar` identifiers.

Do not add schema, persistence, history, import/export, or domain migrations.

---

# Tests

## Search

Cover Japanese localized exact/prefix, canonical English exact/prefix, `Aluminium`, abbreviation case folding, one-row-per-entity, stable submission IDs, alias collisions, and deterministic ranking.

## Typography

Where practical, verify `lang="ja"` selects the Japanese UI token and technical/branding exceptions remain intentional. Do not snapshot platform-specific computed font names.

## Compact controls

Verify visual `+ Add` / `＋ 追加`, full localized tooltip, full localized accessible name, click/disabled behavior unchanged, `[INT]` absent, Inter-System meaning localized, and internal `interstellar` unchanged.

## Layout

At minimum verify no document horizontal overflow from `OutpostDetails` in the previously broken range, header content no longer collapses pathologically, English remains sound, Japanese locale switching reflows immediately, and matrix scoped scrolling remains intact.

If browser zoom still cannot be observed reliably, leave 125%/150% as manual follow-up.

## Collation

Verify localized system sorting under at least `en-US` and `ja-JP`; body order unchanged; Planned Supply/cargo localized alphabetical lists use the shared collator where intended; resource topology and X-Tech placement unchanged.

---

# Documentation

Update durable architecture/localization documentation where useful to record:

- multilingual entity-search alias model;
- Japanese language-sensitive UI font strategy;
- localized compact-control semantics;
- Inter-System marker presentation/internal-domain boundary;
- presentation-layer locale collation policy;
- system-vs-body ordering distinction.

Use functional language, not roadmap labels.

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
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
```

Run any focused browser/UI test suite already available.

Do not require game files for ordinary repository verification.

---

# Acceptance criteria

The hardening pass is complete when:

1. Japanese item search supports canonical English aliases.
2. Explicit established alternates such as `Aluminium` work through the generic alias model.
3. Search results remain one row per stable entity.
4. Stable IDs remain unchanged on submission.
5. No romaji/transliteration system is introduced.
6. Japanese ordinary UI text uses an explicit language-sensitive Japanese font stack.
7. No Japanese font binaries or network font dependency is added.
8. Branding/technical Latin typography remains intentional.
9. Whole-sentence Japanese technical context no longer relies unnecessarily on mono styling.
10. Excessive Japanese tracking is reduced where appropriate.
11. Outpost and Cargo Link Add controls visually use `+ Add` / `＋ 追加`.
12. Shortened Add controls retain full localized tooltip and accessible names.
13. Visible `[INT]` is retired.
14. The prototype Inter-System marker uses a localization-neutral symbol, with `[I-S]` fallback if needed.
15. The Inter-System marker retains full localized tooltip/accessibility text.
16. Internal `interstellar` remains unchanged.
17. The pathological page-header breakpoint behavior is corrected.
18. The OutpostDetails 1025–1100-ish overflow discontinuity is corrected.
19. No locale-specific breakpoint hack is introduced.
20. Star systems are locale-sorted in the presentation layer.
21. Body ordering remains unchanged.
22. Planned Supply/cargo alphabetical localized lists use the shared locale collator where appropriate.
23. Topology/domain/user/history/severity orderings remain unchanged.
24. Composed-fauna U+0020 spacing remains unchanged.
25. No broad punctuation cleanup is introduced.
26. No canonical localization/provenance artifacts drift.
27. No schema/persistence/history/import/export/domain migration is introduced.
28. All tests/build/lint/verifiers pass.
29. No transient roadmap identifiers are introduced into durable implementation names.
30. No commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- search alias model implemented;
- exact alias/ranking behavior;
- any alias collisions discovered;
- final Japanese font stack;
- mono/branding exceptions retained;
- compact Add control implementation;
- Inter-System symbol used and whether fallback was required;
- tooltip/accessibility implementation;
- header/layout breakpoint changes;
- widths tested;
- system-selector collation behavior;
- which other comparators changed;
- which domain/topology orderings were explicitly preserved;
- composed-fauna spacing confirmation;
- whether import-summary sorting was deferred;
- generated/reference/terminology verification results;
- full test/build/lint results;
- confirmation that no persistence/schema/domain work occurred.

Do not proceed to the final release-verification/accessibility phase unless separately instructed.

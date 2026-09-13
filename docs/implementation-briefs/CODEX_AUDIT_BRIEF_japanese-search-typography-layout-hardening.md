# CODEX AUDIT BRIEF — Japanese Search, Typography, Layout, and Presentation Hardening

## Purpose

Open the Japanese product-hardening phase with a focused audit of the live application.

The goal is to identify concrete Japanese usability and presentation issues now that localization infrastructure, official reference names, and official terminology are complete.

This audit should examine the application as a Japanese product, not merely as a translated English UI.

Primary areas:

- search behavior;
- font coverage and fallback;
- text wrapping/truncation;
- dense controls and compact labels;
- locale-aware sorting/collation;
- inter-system cargo-link indication;
- button-label compression opportunities;
- worst-case Japanese layout;
- any direct runtime/Creation Kit confirmation still needed for separator/spacing assumptions.

Do **not** implement fixes yet.

Do **not** commit or push.

Write the audit report to:

```text
docs/audits/codex-japanese-product-hardening-audit.md
```

---

# Naming guidance

Avoid transient roadmap identifiers such as:

```text
E
E1
D3
```

in durable implementation names.

Use functional terminology such as:

```text
Japanese search
locale-aware collation
Japanese typography
layout hardening
compact controls
inter-system indicator
```

Roadmap labels may remain in planning prose only.

---

# Scope classification

**Medium cross-cutting product audit.**

Expected inspection areas:

- localized search/indexing;
- resource/product/system/body/species selectors;
- Resource Matrix;
- Planned Supply;
- cargo-link editors;
- outpost navigation;
- validation lists;
- history;
- About/settings/locale controls;
- typography/font stack;
- sorting and collation;
- compact buttons;
- indicators/badges/tooltips;
- responsive/min-width behavior;
- Japanese string length extremes;
- accessibility implications of visual shortening.

No persistence/schema/domain changes.

---

# Current localization baseline

The following are complete and should be treated as upstream invariants:

```text
330 / 330 Japanese semantic messages populated
3,561 official Japanese reference names generated
3,561 official Japanese reference names integrated at runtime
official terminology provenance implemented
Cargo Pad presentation retired in favor of Cargo Link
cargo-related Interstellar presentation retired in favor of Inter-System
X-Tech Power Core officially localized as X-テックパワーコア
```

Do not reopen terminology architecture unless a concrete product defect requires it.

---

# Audit question 1 — Japanese search behavior

Audit how search behaves under `ja-JP`.

Inspect at minimum:

- resources;
- products;
- any other searchable reference families currently exposed;
- exact Japanese-name matching;
- partial Japanese-name matching;
- kana/kanji behavior;
- Latin-script fallback;
- English canonical-name aliases while Japanese is active;
- case folding for Latin text;
- punctuation/apostrophe handling;
- stable-ID result submission.

Determine whether a Japanese user should be able to search by:

```text
アルミニウム
Aluminum
Aluminium
adaptive frame
順応型フレーム
```

and what currently happens.

Do not implement dual-script aliases during the audit.

---

# Audit question 2 — recommended search model

Recommend the smallest robust search model for `ja-JP`.

Consider:

```text
localized display name
canonical English alias
locale-specific alternate aliases if needed
stable ID
```

Do not add romanization unless evidence shows it materially helps.

Prefer one search index with multiple aliases per stable entity rather than duplicated result records.

Report expected ranking:

```text
exact localized match
prefix localized match
localized substring
canonical English alias
other aliases
```

or a better ordering if the current architecture suggests one.

---

# Audit question 3 — font coverage

Inspect the actual font stack used by the application.

Determine:

- whether Barlow Semi Condensed covers Japanese;
- whether IBM Plex Mono covers Japanese;
- what browser/system fallback is currently rendering CJK;
- whether glyph metrics create obvious misalignment;
- whether missing glyph/tofu risk exists;
- whether punctuation, prolonged sound mark, Japanese quotes, full-width punctuation, and middle dot render correctly;
- whether mixed Latin/Japanese rows exhibit baseline or weight mismatch.

Do not add font files.

Recommend a safe CSS/system-font fallback strategy.

---

# Audit question 4 — typography hierarchy

Audit whether Japanese text remains visually coherent in:

- headings;
- small labels;
- compact buttons;
- matrix column/row labels;
- tooltips;
- validation text;
- monospace-like technical fields;
- IDs/codes;
- counts and badges.

Determine where the current condensed Latin typography becomes awkward once Japanese fallback fonts take over.

Recommend where the design should preserve:

```text
technical Latin mono
```

versus where it should allow a normal Japanese UI font.

---

# Audit question 5 — wrapping and truncation

Audit all places where Japanese text:

- wraps unexpectedly;
- clips;
- overflows;
- increases row height excessively;
- makes controls too tall;
- pushes adjacent controls;
- causes column misalignment;
- becomes unreadable through ellipsis.

At minimum inspect:

- `+ Add Outpost`;
- `+ Add Cargo Link`;
- cargo-link summaries;
- outpost navigation;
- Resource Matrix headers;
- Planned Supply;
- validation panels;
- locale selector;
- skill labels;
- system/body selectors.

Report concrete selectors/components, not just screenshots.

---

# Audit question 6 — compact button labels

Audit context-rich controls where full labels may be unnecessarily verbose.

Specifically review:

```text
+ Add Outpost
+ Add Cargo Link
```

Consider presentation variants:

```text
+ Add
+
```

while preserving a full localized tooltip/accessibility name.

For each candidate, state:

- whether surrounding context makes the shorter visual label unambiguous;
- whether keyboard/screen-reader labeling can remain explicit;
- whether the same shortening should apply across all locales.

Do not implement shortening yet.

---

# Audit question 7 — inter-system cargo-link indicator

Audit the current visible:

```text
[INT]
```

indicator.

The product preference is:

- `[INT]` is not favored;
- if a text badge remains, `[I-S]` or `[I.S.]` is preferred over `[IS]`;
- ideally a compact symbol/icon may be better than a textual abbreviation;
- the internal `interstellar` discriminator must remain unchanged;
- the full localized meaning should remain available via tooltip/accessibility text:
  - `Inter-System Cargo Link`
  - `星系間貨物リンク`

Evaluate options:

```text
[I-S]
[I.S.]
symbol/icon
no badge, styling only
```

Recommend the best option based on clarity, density, localization neutrality, and accessibility.

Do not redesign the whole cargo UI.

---

# Audit question 8 — symbol/icon feasibility

If recommending an icon or symbol for Inter-System Cargo Links, evaluate only low-complexity options.

Criteria:

- distinguishable at small size;
- comprehensible without color alone;
- not confused with link/delete/edit icons;
- works in monochrome;
- visually consistent with Starfield-like technical UI;
- easy to tooltip;
- no font-icon dependency if avoidable.

Possible conceptual directions:

```text
two linked nodes
two stars with connector
split/orbit/link glyph
compact transfer glyph
```

Do not create image assets in this audit.

---

# Audit question 9 — locale-aware collation

Audit sorting under Japanese for:

- resources;
- products;
- systems;
- bodies;
- biomes;
- species;
- outposts if user-defined names are sorted anywhere;
- search results where alphabetical tiebreaking occurs.

Determine:

- whether current sorting uses English canonical names;
- localized display names;
- raw Unicode ordering;
- `localeCompare`;
- `Intl.Collator`;
- fixed domain order.

Recommend where Japanese locale-aware collation should apply and where stable domain ordering should remain unchanged.

Do not globally replace every comparator.

---

# Audit question 10 — mixed-script sorting

Inspect cases where Japanese and Latin-script entries coexist.

Examples:

```text
X-テック
He-3
H2O
Vytinium
アルミニウム
```

Determine whether Japanese collation produces useful results or whether some technical/resource lists should preserve existing canonical/domain ordering.

Call out exceptions explicitly.

---

# Audit question 11 — punctuation and spacing

Audit Japanese punctuation and spacing in live UI text:

- ASCII colon vs full-width colon;
- spaces around punctuation;
- parentheses;
- em dash/en dash;
- ellipsis;
- slash-separated counts;
- bracketed indicators;
- English/Japanese mixed terms;
- U+0020 usage in composed fauna names.

Do not normalize punctuation globally without evidence.

---

# Audit question 12 — composed fauna spacing

The official Japanese composed-fauna overlay is precomposed with literal U+0020 spaces between non-empty components.

Verify visually in the runtime whether this remains acceptable for Japanese.

If possible, compare with official Starfield UI/Creation Kit runtime presentation.

Report whether:

- U+0020 should remain;
- separators should be locale-specific;
- the current output looks artificial;
- no change is warranted.

Do not change the composition model during the audit.

---

# Audit question 13 — Creation Kit/runtime separator confirmation

If local tools permit, inspect official Japanese display behavior for relevant multi-component names.

Use this only to validate formatting/separator assumptions, not to rediscover already-known localization identities.

Report evidence source and limitations.

If direct confirmation is impractical, state that clearly.

---

# Audit question 14 — minimum widths and dense desktop layout

Audit current hard minimum widths and panel assumptions under Japanese.

Identify where:

- Japanese wrapping improves fit;
- Japanese increases vertical density;
- controls become too tall;
- fixed widths are unnecessarily generous;
- hard minimums remain justified.

Apply the product principle:

> Adapt before overflowing; hard min-width is a usability claim.

Do not propose general responsive redesign unless concrete defects justify it.

---

# Audit question 15 — matrix-specific worst cases

Stress-test the Resource Matrix with long Japanese labels and realistic dense data.

Inspect:

- long resource/product names;
- X-Tech Power Core tooltip;
- narrow columns;
- Present / Producing / Planned Supply labels;
- help/tooltips;
- row hover states;
- localized validation indicators.

Report the worst actual cases.

---

# Audit question 16 — cargo-editor worst cases

Stress-test Cargo Links under Japanese with:

- six links;
- Inter-System links;
- long outpost names;
- long body/system names;
- multiple outbound resources/products;
- destination selectors;
- validation warnings.

Pay attention to:

- label wrapping;
- indicator placement;
- ordinal labels;
- add buttons;
- destination summaries;
- inter-system marker clarity.

---

# Audit question 17 — navigation worst cases

Stress-test outpost navigation with:

- 24 outposts;
- long Japanese and Latin mixed names;
- selected/active states;
- add button;
- reshuffle controls.

Determine whether the current navigation remains usable without horizontal ambiguity.

---

# Audit question 18 — tooltip dependence

Audit where shortening or icons would make tooltips/accessibility labels essential.

For each proposed compact control, define:

```text
visual label
tooltip
aria-label / accessible name
```

Do not assume title attributes alone are sufficient if the current component system supports a stronger accessible label.

---

# Audit question 19 — locale switching visual stability

Verify that switching:

```text
en-US
en-GB
ja-JP
```

does not leave stale layout measurements, clipped labels, or cached widths.

This is presentation-only verification; domain state invariants are already covered elsewhere.

---

# Audit question 20 — browser zoom / scaling

Test representative Japanese screens at:

```text
100%
125%
150%
```

browser zoom if practical.

Report only meaningful layout defects.

Do not expand this into a full accessibility audit.

---

# Audit question 21 — responsive viewport stress

Test representative desktop widths around the current practical minimum.

Use actual application breakpoints/min-widths rather than arbitrary mobile targets.

Identify the first width where Japanese becomes materially worse than English.

---

# Audit question 22 — user-facing hard-coded strings

While auditing presentation, note any user-facing string that still bypasses localization.

Do not perform a broad source rewrite.

Report exact occurrences.

All new user-facing text must continue to route through localization.

---

# Audit question 23 — current screenshots as evidence

Use current Japanese runtime screenshots if available, but do not rely on screenshots alone.

For every significant issue, identify the responsible:

- component;
- semantic key;
- CSS selector/rule;
- comparator/search function;
- font stack.

The audit should lead directly to implementation briefs.

---

# Audit question 24 — severity classification

Classify findings:

```text
BLOCKER
HIGH
MEDIUM
LOW
COSMETIC
```

Definitions:

- BLOCKER: unusable or incorrect behavior;
- HIGH: frequent meaningful friction;
- MEDIUM: clear product-quality defect;
- LOW: minor inconsistency;
- COSMETIC: polish only.

---

# Audit question 25 — implementation slicing

End with a recommended implementation sequence.

Prefer small, coherent slices, for example:

```text
1. Japanese search aliases/indexing
2. font stack and typography fallback
3. compact controls / inter-system indicator
4. wrapping/min-width/layout corrections
5. locale-aware collation
```

But revise this ordering if the audit shows a better dependency structure.

Do not encode roadmap labels into durable filenames/functions.

---

# Audit question 26 — regression boundaries

For each recommended implementation slice, identify what must not change.

Examples:

- search aliases must not alter stable IDs;
- font changes must not ship font binaries;
- compact labels must preserve accessible names;
- collation must not reorder fixed domain-priority lists;
- layout changes must not introduce pane resizing/persistence;
- icon changes must not rely on color alone.

---

# Required report sections

## Executive summary

Include:

```text
finding count by severity
largest Japanese-specific usability issue
largest cross-locale UI issue
whether search needs dual-script aliases
whether font fallback needs intervention
whether compact controls are recommended
whether [INT] should be replaced
whether locale-aware collation is warranted
```

## Search findings

Table:

```text
Area
CurrentBehavior
JapaneseIssue
RecommendedChange
Severity
```

## Typography/layout findings

Table:

```text
Component
Issue
Cause
RecommendedChange
Severity
```

## Compact-control candidates

Table:

```text
Control
CurrentLabel
SuggestedVisualLabel
Tooltip/AccessibleLabel
CrossLocale?
```

## Sorting/collation findings

Table:

```text
List
CurrentComparator
RecommendedComparator
LocaleSensitive?
Notes
```

## Implementation slices

Table:

```text
Slice
Scope
Dependencies
Risk
ExpectedFiles
```

---

# Non-goals

Do not:

- implement fixes;
- change localization provenance;
- add new terminology sources;
- alter reference-name generation;
- change persistence/schema/history/import/export;
- rename internal CargoPad/interstellar identifiers;
- add pane resizing;
- add mobile-specific design;
- create icon assets;
- add font files;
- perform a full accessibility audit;
- commit or push.

---

# Verification

Run repository-safe checks as needed.

At minimum:

```text
npm test
npm run build
git diff --check
```

If no tracked files are changed except the audit report, state that.

---

# Final disposition

End with one of:

## Outcome A — mostly polish

Japanese is already functionally solid; only compact UI and typography polish are needed.

## Outcome B — targeted hardening required

A few concrete search/font/layout/collation issues need focused implementation slices.

## Outcome C — substantial Japanese product issues

Japanese is functionally correct but several systemic UI assumptions require broader correction.

---

# Final report requirements

The report must state:

1. exact issue count by severity;
2. whether Japanese search should include English aliases;
3. whether romanization is needed;
4. whether font fallback should change;
5. whether `+ Add Outpost` / `+ Add Cargo Link` should be shortened;
6. recommended replacement for `[INT]`;
7. whether composed-fauna spacing should change;
8. whether locale-aware sorting should be introduced;
9. worst affected components;
10. smallest implementation sequence;
11. any blocker before implementation.

Do not proceed to implementation unless separately instructed.

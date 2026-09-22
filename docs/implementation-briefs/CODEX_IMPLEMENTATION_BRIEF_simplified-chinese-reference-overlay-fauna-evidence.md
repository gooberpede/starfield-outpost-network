# Codex Implementation Brief — Simplified Chinese Reference Overlay and Fauna Evidence

## Objective

Implement and verify the **Simplified Chinese (`zh-Hans`) Bethesda reference-name overlay and fauna display evidence** for the Starfield Outpost Tracker.

This stage covers:

- official Bethesda reference names sourced from the existing `zhhans` game-data inputs;
- deterministic `zh-Hans` reference-overlay generation;
- completeness/provenance validation;
- Simplified Chinese fauna component composition;
- first-party in-game screenshot evidence for fauna ordering and separators.

This stage does **not** activate `zh-Hans` at runtime.

Do not add selector/browser-locale/font/CSS/runtime work here.

Do not commit or push.

---

# Background

The Simplified Chinese semantic catalogue is complete and has been reconciled through source-blinded review.

The locale contract is already established as:

```text
runtime locale: zh-Hans
Bethesda token: zhhans
encoding: strict UTF-8
scope: full
runtimeAvailable: false
```

The official Bethesda reference-data audit previously established:

```text
3,561 reference entities
4,818 source rows
0 unresolved official-name mappings
```

Simplified Chinese official terminology and tracker-owned terminology are already settled.

This task now moves from **tracker-authored UI strings** to **Bethesda-authored reference names**.

For Bethesda-authored names, the official game string is authoritative. There is no Codex-vs-DeepL adjudication in this stage.

---

# Core policy

## 1. Bethesda strings are authoritative

When the official `zhhans` game data supplies a localized reference name, use it **exactly as supplied**.

Do not:

- rewrite for style;
- “improve” awkward wording;
- normalize mixed Chinese/Latin script;
- alter punctuation;
- alter capitalization;
- expand abbreviations;
- translate internal-looking values;
- substitute semantic equivalents.

Preserve literal official values.

If an official value looks odd, preserve it and report the evidence rather than silently correcting it.

---

## 2. No Simplified/Traditional conversion

Use only the official:

```text
zhhans
```

Bethesda source for the `zh-Hans` overlay.

Do not generate Simplified Chinese names by converting:

```text
zh-Hant
zh-TW
zh-HK
zh-MO
```

or any other Chinese source.

Do not add automatic Simplified/Traditional conversion logic.

---

## 3. No machine translation

Do not use Codex, DeepL, or another translation engine to fill reference-name gaps.

An unexpected missing official Chinese value is a provenance/completeness defect to investigate.

It is not a translation prompt.

---

# Existing architecture

Before changing code, inspect the existing reference-overlay implementation for completed locales, especially the most recent locale with fauna evidence.

Reuse the established architecture and naming conventions.

Do not create a Chinese-specific parallel system if the generalized overlay builder already supports the required inputs.

Prefer:

```text
existing generalized builder
+ zh-Hans locale metadata/input
+ Chinese evidence/verification
```

over new special-case infrastructure.

Do not widen production APIs unless the existing overlay architecture genuinely requires it.

---

# Reference overlay

## 4. Build the `zh-Hans` official-name overlay

Generate the Simplified Chinese reference-name overlay from the established official Bethesda inputs.

The overlay must map the same canonical reference identities used by the base/reference catalogue.

Expected population based on the established corpus:

```text
3,561 entities
```

Derive the count mechanically.

Do not hard-code `3561` merely to make a test pass.

If the current canonical population differs, stop and report why.

---

## 5. Provenance

Each localized value must remain traceable to the official `zhhans` Bethesda source under the repository's existing provenance model.

Do not weaken provenance requirements for Chinese.

Verify:

- canonical entity identity preserved;
- locale source is `zhhans`;
- strict UTF-8 decode;
- deterministic output;
- no unresolved mappings;
- no duplicate canonical identities;
- no unexpected extra localized identities.

If the overlay format includes a manifest/hash, generate it using the existing deterministic process.

---

## 6. Completeness must fail closed during generation/verification

For the expected official-name population:

```text
resolved official Chinese names == expected overlay population
unresolved == 0
```

An unexpected unresolved official Chinese name should fail the overlay build/verification stage.

Do not silently fall back to English during generation to obtain a “complete” overlay.

Do not substitute another locale.

---

# Runtime fallback policy

## 7. Preserve runtime resilience without weakening verification

The existing application should remain recoverable if a localized overlay entry is unexpectedly absent at runtime.

If the established reference-name system falls back to the base/canonical reference name, preserve that behavior.

However:

```text
runtime fallback != overlay completeness success
```

The build/provenance checks must still flag an unexpected missing official `zh-Hans` value.

Do not make runtime resilience hide overlay defects.

---

# Fauna localization

## 8. Fauna remains compositional

Do not create 922 hand-translated fauna-name strings.

Use the existing fauna composition model:

```text
official localized component values
+ established component order/shape
+ renderer separator
```

The established fauna population is expected to remain:

```text
922 fauna
2,179 component occurrences
```

Derive and report the actual counts.

If the canonical fauna/component population differs, investigate rather than forcing these numbers.

---

## 9. First-party Simplified Chinese screenshot evidence

The user has supplied in-game Simplified Chinese screenshots from:

```text
Jemison
Montara Luna
```

Use these screenshots as first-party evidence for the rendered fauna structure.

The screenshots demonstrate Bethesda forms including:

```text
[群聚] 珊瑚虫
[顶级掠食者] 翼鸦鹰
[畜牧] 纹刃 [食草动物]
```

The key rendering evidence is:

```text
ASCII square brackets
single ASCII space between rendered components
```

The multi-component example confirms:

```text
[prefix descriptor] + " " + base name + " " + [suffix descriptor]
```

Do not replace the square brackets with Chinese full-width brackets.

Do not remove the spaces merely because normal Chinese prose often omits inter-word spaces.

---

## 10. Do not add an unnecessary Chinese-specific fauna separator

If the generalized fauna renderer already composes components using a single literal space:

```text
components.join(' ')
```

or equivalent behavior, reuse it.

Do not add:

```text
if locale === 'zh-Hans'
```

only to reproduce behavior the generic renderer already provides.

A locale-specific fauna separator rule is justified only if the existing generalized mechanism cannot express the evidenced output.

The preferred outcome is:

```text
Chinese uses the normal generalized component renderer
```

because the official Chinese game UI happens to use the same single-space separator.

---

## 11. Validate all fauna component shapes represented by the evidence

Use the screenshots to verify the established component-order model across the shapes present in the supplied evidence.

At minimum verify:

```text
prefix + base
base + suffix
prefix + base + suffix
```

If the supplied screenshots do not actually evidence one of these shapes, do not claim that they do.

Report exactly which shapes are evidenced.

Do not hunt for arbitrary screenshot quotas.

Do not require the user to provide additional screenshots unless a material ambiguity remains after comparing the supplied evidence with the official component data.

---

# Screenshot evidence handling

## 12. Evidence, not manual exception data

The screenshots should validate the generalized composition model.

Do not turn screenshot strings into a hand-maintained exception table.

Do not implement fauna by matching screenshot text.

The expected evidence chain is:

```text
canonical fauna/component records
→ official zhhans component strings
→ generalized renderer
→ rendered value
→ screenshot match
```

---

## 13. Preserve a durable evidence record

Follow the existing localization evidence convention used for prior locales.

Record enough evidence to show:

- source planet/body;
- fauna identity or canonical record;
- expected composed `zh-Hans` value;
- screenshot-observed value;
- component shape;
- result: match / contradiction / unresolved.

Do not invent screenshot text that is not legible.

Do not use OCR as the authoritative source.

The screenshot itself is the evidence; any transcription must be manually verified against the image.

If the existing evidence format records screenshot filenames rather than embedding image files, follow that convention.

Do not add large screenshot binaries to the repository unless that is already the established project convention.

---

# Search behavior

## 14. No new Chinese search-normalization work in this stage

Do not add:

```text
pinyin
fuzzy transliteration
Simplified/Traditional conversion
space-removal normalization
broad width folding
new punctuation folding
```

The already-approved `zh-Hans` search policy remains:

- exact Chinese matches;
- prefix/substring matching;
- English aliases;
- abbreviations;
- existing curated alternates only;
- normal ranking rules.

Reference-overlay generation must not manufacture pinyin aliases.

---

# Collation

## 15. No collation changes here

Do not change sorting/collation in this stage.

The approved later runtime baseline remains:

```text
Intl.Collator('zh-Hans', {
  sensitivity: 'base',
  numeric: true
})
```

Only implement that when the runtime-integration stage requires it.

---

# Fonts and CJK layout

## 16. No font or CSS work

Do not add the proposed `:lang(zh-Hans)` system font stack yet.

Do not alter:

- typography;
- line breaking;
- widths;
- padding;
- control geometry;
- matrix layout;
- selector layout;
- header/status layout.

Any rendering/layout observations should be reported for the runtime/manual-QA stage.

---

# Runtime activation boundary

## 17. Keep Simplified Chinese inactive

After this task:

```text
runtimeAvailable: false
```

must remain true as a statement of current availability status.

Do not add:

- `简体中文` to the live selector;
- browser-language mapping;
- `zh`, `zh-CN`, `zh-SG` activation;
- `document.lang` behavior;
- Chinese reference-overlay runtime registration if registration itself makes the locale selectable/active;
- Chinese shortcut speech;
- Chinese font stack;
- locale-specific runtime CSS.

If the architecture requires registering the overlay artifact without activating the locale, that is acceptable only if it preserves the existing `runtimeAvailable: false` boundary.

Report exactly what was registered.

---

# Expected implementation artifacts

Use the repository's existing naming conventions rather than inventing filenames unnecessarily.

Expected categories are:

```text
generated/reference zh-Hans overlay
overlay provenance/manifest if used by the existing architecture
fauna evidence record
tests/verification updates
Simplified Chinese onboarding audit update
```

Mirror the established files for previous completed locales wherever possible.

Do not create planning-ID filenames or headings.

---

# Verification requirements

## 18. Reference overlay verification

Verify and report:

```text
canonical reference entities
official zhhans source rows
resolved localized entities
unresolved entities
duplicate mappings
unexpected extras
strict UTF-8 result
deterministic regeneration
```

Expected current baseline:

```text
3,561 entities
4,818 source rows
0 unresolved
```

Again, derive actual values rather than hard-coding.

---

## 19. Fauna verification

Verify and report:

```text
canonical fauna count
component occurrence count
official Chinese component resolution
unresolved component values
screenshot comparisons
component shapes evidenced
contradictions
```

Expected population from the established canonical data:

```text
922 fauna
2,179 component occurrences
```

For screenshot evidence, report the exact number of usable screenshot matches obtained from the supplied Jemison/Montara Luna set.

Do not manufacture a target number.

All compared screenshot examples must either:

```text
match exactly
or be explicitly documented as a contradiction/unresolved case
```

Do not silently normalize screenshot text before comparing it.

---

# Tests

Add or extend focused tests using the existing reference-localization test structure.

Tests should cover at minimum:

1. `zh-Hans -> zhhans` reference routing;
2. strict UTF-8 input handling;
3. overlay population completeness;
4. zero unresolved official mappings;
5. deterministic output;
6. exact literal preservation of representative mixed-script/punctuation values;
7. fauna component composition;
8. single-space fauna separator;
9. ASCII square-bracket preservation;
10. prefix/base/suffix composition as supported by evidence;
11. no runtime activation;
12. no unexpected search-normalization expansion.

Avoid brittle tests tied to arbitrary row ordering unless ordering is itself contractual.

---

# Regression protection

Do not disturb existing overlays/locales.

Run cross-locale/reference tests sufficient to prove that the generalized builder still produces unchanged output for already-supported locales.

If a generalized builder change is necessary, compare generated hashes/output before and after for existing locales.

No incidental regeneration churn.

---

# Documentation

Update the existing Simplified Chinese onboarding audit with:

- overlay generation result;
- provenance/completeness counts;
- strict UTF-8 result;
- fauna population/component counts;
- screenshot evidence summary;
- confirmed separator/order rule;
- explicit statement that Bethesda official strings are authoritative;
- explicit statement that no machine translation filled reference gaps;
- explicit statement that runtime activation remains deferred.

Do not repeat the semantic blind-adjudication discussion except where necessary for current stage status.

---

# Validation commands

Use the repository's actual existing scripts.

At minimum run the relevant equivalents of:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run localization:terminology:verify
npm run localization:provenance:test
npm run build
npm run lint
git diff --check
```

Also run all focused reference-overlay/fauna tests used by prior locales.

If the project has a dedicated overlay-generation or localization-reference verification command, run it and report it explicitly.

---

# Stop conditions

Stop and report rather than improvising if any of the following occurs:

- official `zhhans` reference population does not reconcile with the canonical entity set;
- unresolved official-name mappings remain;
- source decoding is not strict UTF-8;
- fauna component records cannot be mapped deterministically;
- screenshot evidence contradicts the current component-order model;
- screenshot evidence contradicts the single-space separator rule;
- a runtime activation change appears necessary merely to build the overlay;
- a Chinese-specific renderer branch appears necessary for reasons not evidenced by the game;
- another locale's generated output changes unexpectedly.

Do not “fix” any of these silently.

---

# Out of scope

Do not implement:

```text
runtime activation
selector entry
browser-locale mapping
zh-Hans document language
Chinese font stack
CJK CSS/layout changes
search pinyin
Simplified/Traditional conversion
manual Bethesda-name translation
semantic catalogue edits
DeepL/Codex adjudication
Apple/WebKit work
post-localization bundle review
final selector ordering
global XLIFF cleanup
```

---

# Completion criteria

This stage is complete when:

- the official Simplified Chinese reference overlay is generated deterministically;
- the canonical reference population reconciles with official `zhhans` names;
- unresolved official-name mappings are zero;
- official values are preserved literally;
- fauna component data resolves completely;
- the generalized renderer reproduces the evidenced Simplified Chinese fauna structure;
- screenshot evidence is recorded;
- no unsupported Chinese-specific renderer exception is added;
- runtime activation remains deferred;
- existing locales remain unchanged.

---

# Completion response

Return:

1. branch;
2. files changed/created;
3. official `zhhans` source path(s);
4. canonical entity count;
5. official source-row count;
6. resolved overlay count;
7. unresolved overlay count;
8. duplicate/unexpected mapping counts;
9. strict UTF-8 verification result;
10. overlay artifact path;
11. manifest/provenance artifact path if applicable;
12. overlay/manifest SHA-256 values;
13. deterministic regeneration result;
14. confirmation official Bethesda strings were preserved literally;
15. confirmation no machine translation was used for reference names;
16. canonical fauna count;
17. fauna component-occurrence count;
18. unresolved fauna component count;
19. fauna composition implementation used;
20. separator used;
21. bracket style used;
22. component shapes evidenced by screenshots;
23. number of supplied screenshots inspected;
24. number of usable exact screenshot comparisons;
25. exact-match count;
26. contradiction count;
27. unresolved screenshot-evidence count;
28. fauna evidence artifact path;
29. representative evidenced fauna examples;
30. confirmation no hand-maintained fauna exception table was introduced;
31. confirmation no pinyin/Chinese search-normalization expansion occurred;
32. focused reference/fauna test results;
33. cross-locale/reference regression result;
34. `npm test` result;
35. `npm run test:components` result;
36. `npm run typecheck:tests` result;
37. `npm run localization:terminology:verify` result;
38. `npm run localization:provenance:test` result;
39. `npm run build` result;
40. `npm run lint` result;
41. `git diff --check` result;
42. confirmation `runtimeAvailable` remains `false`;
43. confirmation no selector/browser-locale/font/CSS/runtime activation occurred;
44. onboarding-audit documentation update;
45. deviations from brief;
46. unresolved user decisions;
47. recommended next stage;
48. suggested commit message;
49. confirmation no commit/push occurred.

Suggested commit message:

```text
feat: add Simplified Chinese reference overlay
```

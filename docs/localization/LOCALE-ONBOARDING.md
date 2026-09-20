# Locale Onboarding

## Purpose

This document is the durable handbook for adding and maintaining user-interface locales in **Starfield Outpost Network**.

Its goals are to:

- define what it means for a locale to be fully supported;
- make future locale additions an onboarding exercise rather than a new localization architecture project;
- preserve the distinction between tracker-authored UI text and Bethesda-authored reference names/terminology;
- record the repeatable extraction, generation, verification, search, typography, layout, accessibility, and release process;
- preserve locale-specific rules and evidence in one place so they do not become undocumented folklore;
- separate current policy from historical implementation detail.

This document is intentionally cumulative. Shared rules belong in the common sections below. Once a locale is onboarded, any rules genuinely specific to that locale should be recorded in its **Locale Profile**.

Historical audit reports remain historical evidence. Do not turn this document into a chronological diary of experiments.

---

# 1. Long-term language target

The tracker’s long-term language target is the set of languages officially supported by **Starfield**.

Bethesda’s support matrix currently lists:

| Starfield language | Bethesda support | Tracker target | Tracker status |
| --- | --- | --- | --- |
| English | Interface/Text + Voice | Yes | Supported |
| French | Interface/Text + Voice | Yes | Not onboarded |
| German | Interface/Text + Voice | Yes | Not onboarded |
| Spanish (Spain) | Interface/Text + Voice | Yes | Not onboarded |
| Japanese | Interface/Text + Voice | Yes | Supported |
| Italian | Interface/Text | Yes | Not onboarded |
| Polish | Interface/Text | Yes | Not onboarded |
| Portuguese (Brazil) | Interface/Text | Yes | Not onboarded |
| Simplified Chinese | Interface/Text | Yes | Not onboarded |

Authority:

- Bethesda Support: `https://help.bethesda.net/app/answers/detail/a_id/60444/~/what-languages-does-starfield-support%3F`

The tracker is text/UI software, so Bethesda’s distinction between voice-supported and text-only languages does not change whether a language is a tracker target.

`en-GB` is a tracker-supported sparse English override, not a separate Starfield language in Bethesda’s matrix.

There is no required onboarding order. Japanese was deliberately onboarded early because it was likely to expose architectural weaknesses involving non-Latin script, font fallback, string length, composition, search, collation, and layout. Future additions do **not** need to proceed hardest-first.

A reasonable future strategy is to use one or more relatively straightforward Latin-script locales to prove that this document and the current tooling make onboarding routine. Languages expected to expose larger language-specific concerns, including Simplified Chinese and potentially Polish, may be deferred until later. This is a planning option, not a fixed roadmap.

---

# 2. Definition of a supported locale

A locale is not considered fully supported merely because tracker-authored UI strings have been translated.

A fully supported locale should have:

1. a semantic tracker catalogue with complete key and placeholder parity;
2. official Bethesda reference-name coverage for all surfaced canonical entities;
3. official terminology evidence/policy where tracker concepts overlap Bethesda terminology;
4. stable-ID runtime integration;
5. search behavior that works with localized names while preserving canonical English aliases;
6. locale-appropriate collation for genuinely alphabetical presentation lists;
7. an explicit typography/font policy;
8. any required locale-specific composition rules;
9. layout verification under realistic content lengths;
10. accessibility verification;
11. automated closure checks;
12. a completed manual release-verification pass, except for explicitly accepted/deferred platform limitations;
13. a Locale Profile in this document.

Locale switching must remain **presentation-only**.

Adding or changing a locale must not change:

- `NetworkCollection`;
- persisted stable IDs;
- import/export schema;
- history snapshots;
- reference identities;
- cargo/internal domain discriminators;
- domain ordering;
- user-authored outpost/network names.

---

# 3. Architectural principles

## 3.1 Stable IDs are canonical; localized strings are presentation

Localized names must never become domain identity.

Persist and operate on stable IDs. Resolve localized display text at the presentation boundary.

This rule applies to:

- resources;
- products;
- systems;
- bodies;
- biomes;
- species;
- official terms/skills;
- search submissions;
- history descriptors;
- cargo references.

A locale switch must never rewrite user data.

---

## 3.2 Tracker-authored text and Bethesda-authored text are different classes of data

### Tracker-authored semantic text

Examples:

- `Add`
- `Planned Supply`
- `Validation`
- `No actual source`
- accessibility labels/descriptions
- import/export feedback
- help copy

These belong in the semantic localization catalogues.

### Bethesda-authored reference names

Examples:

- resource names;
- manufactured product names;
- star-system names;
- planetary/body names;
- biome names;
- flora/fauna species components;
- official skill names;
- other official named game entities.

These should come from Bethesda’s localized game data through the provenance/reference-name pipeline wherever possible.

Do not manually translate official reference names merely because a translation is easy to guess.

---

## 3.3 Official terminology is evidence-driven

Some tracker concepts are ordinary tracker UI concepts. Others overlap official Starfield terminology.

Where official Bethesda terminology exists and is appropriate, prefer it.

Where no official term exists or the tracker concept is deliberately different, use tracker-owned terminology.

Do not silently promote wiki/fan/community wording into official terminology.

---

## 3.4 Locale-specific behavior should be explicit and narrow

Do not scatter ad-hoc checks such as:

```ts
if (locale === 'ja-JP') ...
```

through unrelated components.

Prefer:

- locale-policy modules;
- locale-scoped CSS;
- generated locale overlays;
- explicit alias data;
- reusable collator helpers;
- documented composition rules.

Only add locale-specific behavior when the locale demonstrates a real need.

Do not prebuild universal transliteration, fuzzy matching, punctuation normalization, grammatical inflection, or composition machinery without evidence.

---

# 4. Source authority and provenance

## 4.1 Canonical content sources

Current canonical content + terminology sources:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

These define the canonical reference population used by the tracker.

Current canonical provenance closure:

```text
3,561 resolved entities
4,818 qualified provenance rows
0 unresolved
3 approved normalizations
```

Provider-row distribution at the time Japanese onboarding closed:

```text
Starfield.esm       4,781
ShatteredSpace.esm     35
SFBGS00D.esm             2
```

---

## 4.2 Terminology-only evidence sources

`SFBGS050.esm` (Free Lanes) is an approved **official terminology evidence source only**.

It is **not** a canonical content source.

Do not ingest its systems, bodies, resources, products, or other entities into runtime canonical reference data merely because it is consulted for terminology.

This distinction exists because Free Lanes supplied authoritative wording needed by the tracker while its content population is outside the current canonical tracker reference universe.

---

## 4.3 Provenance tooling philosophy

The localization provenance tooling is intentionally narrow.

It should remain a **sniper, not a browser/gatherer**.

It exists to resolve the exact canonical tracker targets and their localized strings. It is not intended to become a generic Bethesda archive explorer or modding toolkit.

Generic archive/string/plugin exploration belongs elsewhere.

---

# 5. Semantic catalogue onboarding

## 5.1 Baseline

`en-US` is the semantic baseline and fallback locale.

All tracker-authored message keys originate there.

A new full locale should achieve exact key parity with `en-US`.

The baseline count changes as product copy evolves. The durable invariant is
exact key and placeholder parity with the current `en-US` catalogue, not a
historical message count.

---

## 5.2 Sparse override locales

A locale may be a sparse override when that model is appropriate.

`en-GB` is the current example.

Sparse overrides should:

- contain only genuine differences;
- inherit all unspecified messages from `en-US`;
- never duplicate the baseline merely for apparent completeness.

---

## 5.3 Catalogue rules

For every new full locale:

- every baseline key must exist;
- placeholder names must match exactly;
- required parameters must match exactly;
- no value may be accidentally empty;
- protected technical tokens must remain intact;
- formatting/plural syntax must parse;
- accidental baseline-language fallback must be detectable;
- new accessibility strings must use the same localization layer as visible strings.

All new tracker-authored user-facing text must continue to enter the localization layer.

---

# 6. Official reference-name generation

## 6.1 Shared architecture

The expensive architecture work has already been done.

Future locales should reuse:

- canonical entity population;
- stable IDs;
- qualified provider/provenance rows;
- winning-override handling;
- plugin-source policy;
- generated-overlay shape;
- stable runtime lookup;
- deterministic generation;
- drift verification;
- fauna composition model.

The locale-specific work should mainly be:

- supplying/reading the locale’s official Bethesda strings;
- applying any documented locale composition rules;
- generating the locale overlay;
- verifying closure.

---

## 6.2 Current Japanese overlay shape

The Japanese generated overlay contains:

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

It resolves all 4,818 qualified Japanese IDs/components.

Future locale tooling should aim to reproduce the same canonical population, unless the canonical reference universe itself changes.

---

## 6.3 Locale-oriented command shape

Reference-name generation and repository verification select an explicit tracker locale:

```text
npm run localization:reference-names:build -- --locale fr-FR
npm run localization:reference-names:build -- --locale fr-FR --write
npm run localization:reference-names:verify -- --locale fr-FR
```

Each complete generated locale has one module and one versioned sidecar named
with that tracker locale. French and German have no committed overlays until
their later reference-name work closes.

---

# 7. Official terminology onboarding

For each new locale:

1. identify tracker concepts that deliberately use official Starfield terminology;
2. resolve the official localized wording from approved Bethesda evidence;
3. record source-qualified evidence;
4. distinguish canonical-content evidence from terminology-only evidence;
5. preserve tracker-owned terminology where official wording does not fit the tracker concept;
6. verify that retired/superseded tracker wording no longer appears in active user-facing messages.

Current terminology provenance includes official evidence for terms such as:

- Cargo Link;
- Inter-System Cargo Link;
- Inter-System;
- X-Tech;
- X-Tech Power Core;
- relevant Starfield skill names.

Do not assume that a term’s English source relationship guarantees a mechanically equivalent translation in another locale.

---

# 8. Search onboarding

## 8.1 One entity, multiple searchable aliases

Search must keep one visible result per stable entity.

Each entity may have multiple searchable aliases:

```text
localized display name
canonical English name
abbreviation
explicit curated alternates
```

The result display remains in the active locale.

Submitting any alias returns the same stable entity ID.

---

## 8.2 Canonical English aliases

Canonical English names should remain searchable under non-English locales.

This is intentional product behavior.

A user may know a Starfield item by its English name even while using a localized UI.

English alias search must not change the displayed result back to English.

---

## 8.3 Curated alternates

Explicit alternates may be added when there is clear evidence.

Example:

```text
Aluminum
Aluminium
```

Do not generate broad synonym lists, fan/wiki vocabulary, romaji, transliterations, fuzzy edit-distance aliases, or punctuation variants without demonstrated need.

---

## 8.4 Ranking

Current principle:

1. localized exact;
2. abbreviation exact;
3. localized prefix;
4. localized substring;
5. canonical English exact;
6. canonical English prefix/substring;
7. curated alternate matches;
8. locale-aware visible-name tie-break;
9. stable-ID final tie-break.

Future locales may require small evidence-based adjustments, but localized presentation should continue to rank ahead of hidden aliases.

---

# 9. Collation and ordering

Locale-aware collation belongs only in genuinely alphabetical **presentation** lists.

Current localized-collation targets include:

- star-system selector;
- cargo export candidates;
- alphabetical Planned Supply groups;
- search result tie-breaking.

Use the shared locale collator and a deterministic stable-ID fallback.

Do **not** locale-sort lists whose order has domain meaning.

Preserve:

```text
body/orbit/source order
biome occurrence/index order
resource-family/topology order
persisted outpost order
cargo link user order
validation severity/rule order
history chronology
explicit source-class order
```

Bodies are currently not alphabetized. A future inner-to-outer orbital ordering may be introduced as a separate domain feature.

---

# 10. Typography and font policy

## 10.1 General rule

A supported locale should have an explicit typography decision.

Possible outcomes include:

- baseline Latin UI stack is suitable;
- explicit locale-specific system font stack is needed;
- tracking/case rules need locale-specific adjustment;
- brand/technical tokens retain deliberate Latin faces.

Do not rely unknowingly on accidental per-glyph fallback.

Do not ship locale font binaries unless there is a strong product reason.

Do not add network web-font dependencies merely to solve localization.

---

## 10.2 Semantic font roles

Current conceptual roles:

### UI font

Ordinary human-language interface text.

### Brand font

Intentional product-title/branding treatment.

### Technical mono font

Stable IDs, FormIDs, abbreviations, counts, and genuinely technical tokens.

Do not render whole translated sentences in mono merely because they appear in a technical panel.

---

# 11. Composition and grammar

Most reference names should be used exactly as supplied by Bethesda.

Some game names are composed from independently localized components.

Where composition occurs:

- document component order;
- document separator policy;
- document omission/empty-component behavior;
- prefer first-party rendered evidence where available;
- do not infer prose grammar from English structure without evidence.

Locale Profiles must record any locale-specific composition rule.

---

# 12. Layout hardening

Every locale should receive a focused layout pass after real localized strings are available.

Check at least:

- title/header;
- network controls;
- outpost navigation;
- outpost details;
- system/body selectors;
- Resource Matrix;
- Planned Supply;
- Cargo Links;
- Search;
- Validation;
- dialogs;
- About/settings;
- import/export/status feedback.

Look specifically for:

- document-level horizontal overflow;
- pathological breakpoint discontinuities;
- controls that become unusably narrow;
- excessive sticky-header height;
- labels that wrap unnecessarily;
- clipped focus indicators;
- hidden essential text;
- tooltips becoming the only way to understand a control.

Fix structural layout problems cross-locale where possible.

Do not add locale-specific breakpoints merely because one language exposed the defect first.

---

# 13. Accessibility and release verification

Japanese onboarding exposed several global accessibility weaknesses that have now been corrected for every locale.

Current global expectations include:

- visible focus indicators;
- selected-state focus contrast;
- pointer-only drag handles excluded from keyboard tab order;
- keyboard reorder alternatives through native move buttons;
- Search keyboard operation and direct focus hand-off to portalled results;
- modal focus containment/restoration;
- explicit compact-control accessible names;
- robust noninteractive semantics for the Inter-System marker;
- visible and programmatic validation severity;
- cargo operational-state descriptions;
- polite/asertive status announcement infrastructure;
- deferred post-file-picker assertive import-failure announcement where required;
- readable muted text separated from disabled/unavailable presentation;
- no essential state communicated by color alone.

Future locale onboarding should verify these remain intact rather than rebuilding them.

A new locale may still expose language-specific accessibility issues through string length, font choice, punctuation, or screen-reader pronunciation.

---

# 14. Muted and disabled presentation

Do not conflate:

```text
readable muted text
```

with:

```text
disabled / unavailable content
```

Readable muted text remains information the user is expected to read and must maintain normal readable-text contrast on its intended surfaces.

Disabled/unavailable presentation may deliberately recede further, provided state remains understandable and essential information is not hidden.

Current readable muted token work was verified against the major solid surfaces during Japanese release hardening.

This distinction should remain a general UI rule, not a Japanese-specific rule.

---

# 15. Automated closure and verification

## 15.1 Existing core commands

Current release verification uses at least:

```text
npm test
npm run test:components
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

Run any locale-specific generator/verifier added for the new locale.

Ordinary repository verification must not require game files.

---

## 15.2 Desired unified closure report

A useful future improvement is a locale-oriented orchestration command such as:

```text
npm run localization:verify -- --locale ja-JP
```

which would report a concise closure summary, for example:

```text
Locale: ja-JP

Semantic messages:        exact en-US key/placeholder parity
Reference names:         3561 / 3561
Provenance rows:         4818
Unresolved references:      0
Terminology verification: PASS
Missing placeholders:       0
Search alias collisions:    0
Generated drift:            0
```

This should orchestrate existing authoritative checks rather than replace them.

Do not build this command merely to satisfy documentation; add it when it materially simplifies the next onboarding exercise.

---

# 16. Manual verification checklist

After automated closure, perform a focused manual pass.

## Required representative checks

### Locale switching

- switch between all supported locales;
- confirm selected network/outpost remains unchanged;
- confirm history depth/Undo/Redo remains unchanged;
- confirm stable IDs and exported JSON remain unchanged.

### Layout

- normal desktop width;
- narrower desktop width;
- 125% zoom;
- 150% zoom;
- long strings;
- major panels/dialogs.

### Keyboard

- Search;
- Add/remove controls;
- selectors;
- Planned Supply;
- Cargo Links;
- Validation;
- dialogs;
- reshuffle/move controls;
- visible focus.

### Screen reader smoke test

Where practical:

- compact Add controls;
- Search;
- locale selector;
- validation rows;
- Inter-System marker;
- cargo states;
- import/export feedback;
- dialog close controls.

### Platform/font sanity

Use available platforms.

Do not claim support for an unavailable platform merely because source-level fallback looks correct.

Record unavailable platform testing as a limitation/deferred check rather than silently marking it passed.

---

# 17. Recommended onboarding sequence for a new locale

The expected future workflow is:

## Step 1 — register the locale

Add locale metadata and decide whether it is:

- full catalogue;
- sparse override.

Record the locale in the status inventory and create its Locale Profile.

## Step 2 — semantic catalogue

Translate tracker-authored messages.

Reach exact key/placeholder parity.

Freeze one deterministic RFC 4180 review CSV per locale from the exact `en-US`
source. Every row records its stable semantic key, exact-source SHA-256, UI
context, `LOW`/`MEDIUM`/`HIGH` review risk, placeholders, protected tokens, and
official/glossary constraints. Changed English source invalidates only the
affected row; approval must never survive source drift silently.

Create the Codex draft before reading the independent DeepL draft. Export the
same frozen rows as XLIFF 1.2, retaining the semantic key as `trans-unit` ID and
`resname`. Put disambiguation and terminology guidance in XLIFF metadata rather
than expanding or rewriting the true English source. Inline XLIFF placeholder
codes protect named parameters and plural syntax while leaving plural branch
wording translatable.

Import returned XLIFF by stable key, never row position. Reject locale mismatch,
unknown/duplicate/missing keys, stale source text or hash, empty translations,
and placeholder/protected-token corruption. Compare the independent drafts as
`IDENTICAL`, `TYPOGRAPHIC_ONLY`, `SUBSTANTIVE`, `MISSING`, or
`INVALID_TOKENS`, then editorially adjudicate every substantive difference,
every high-risk row, and every terminology-constrained row.

Independent machine-translation sources are evidence, not authorities. Neither
source is a default winner: every substantive disagreement requires an explicit
editorial decision, recorded decision provenance, and a decision-specific
rationale against source meaning, UI context, risk, grammar, and approved
terminology.

Strict import remains the default. If a translation provider returns otherwise
complete XLIFF but has converted protected inline codes into translated brace
text, first prove that strict import rejects it. The explicit
`--record-invalid-tokens` evidence mode may then retain the provider wording as
`INVALID_TOKENS` for adjudication; such text must never flow directly into a
catalogue. The final row requires a separately token-valid translation and a
reviewer note describing the repair or independent fallback.

The committed generated source XLIFF is the deterministic **current handoff
representation** of the frozen semantic source and current review metadata. It
may change when context or glossary-constraint metadata is corrected, so it is
not immutable proof of the exact bytes historically submitted to a translation
provider. A translated XLIFF returned by a provider is an exchange file: import
its values into the review CSV. The review CSV is the durable evidence of the
actual returned provider wording and the resulting editorial decisions. Do not
retain additional provider output unless it supplies evidence not captured
there.
If sentence-level review disproves a tracker-owned glossary choice, update the
glossary once and apply the correction consistently; do not diverge one message
at a time. Official Bethesda-backed terminology remains authoritative subject
to its documented contextual limits.

The current commands are:

```sh
npm run localization:review -- --locale fr-FR
npm run localization:review -- --locale de-DE
npm run localization:review -- --locale fr-FR --import-xliff path/to/translated-fr-FR.xliff
npm run localization:review -- --locale de-DE --import-xliff path/to/translated-de-DE.xliff
npm run localization:review:adjudicate -- --locale fr-FR
npm run localization:review:adjudicate -- --locale de-DE
```

Do not begin reference-name work by embedding official names directly into semantic UI messages.

## Step 3 — official Bethesda strings

Acquire the locale’s official game-string inputs for the approved canonical sources.

Confirm encoding/string-table handling.

Do not broaden canonical source scope incidentally.

## Step 4 — generate reference overlay

Produce the locale overlay for the canonical 3,561-entity population, or the then-current canonical population.

Verify zero unresolved targets and zero unintended drift.

## Step 5 — terminology

Audit official tracker-relevant terms and record evidence.

Include terminology-only evidence sources where policy allows them.

## Step 6 — runtime integration

Register the locale overlay through the existing stable reference-name resolver.

Verify locale switching remains presentation-only.

## Step 7 — search

Confirm:

- localized display names;
- canonical English aliases;
- abbreviations;
- curated alternates;
- deterministic collisions;
- stable-ID submission.

## Step 8 — typography

Decide explicit font/case/tracking policy.

Do not assume the baseline font is suitable simply because glyphs render.

## Step 9 — collation

Apply active-locale collation only at approved presentation boundaries.

Preserve domain order elsewhere.

## Step 10 — focused product-hardening audit

Audit:

- search;
- typography;
- composition;
- layout;
- long strings;
- punctuation;
- collation.

Avoid re-auditing settled architecture without evidence.

## Step 11 — accessibility/release audit

Run the standard release-readiness checks.

Most accessibility infrastructure should now be reusable globally.

## Step 12 — manual verification

Perform the concise manual checklist.

Record genuine platform limitations.

## Step 13 — close the Locale Profile

Record:

- final policies;
- evidence-backed composition rules;
- accepted limitations;
- unusual terminology;
- platform/manual verification status.

Do not record every intermediate failed experiment.

---

# 18. Locale Profile template

Use the following structure for each onboarded locale.

```markdown
## <Language> — `<locale>`

### Role/status
- Tracker status:
- Full catalogue or sparse override:
- Bethesda support class:

### Semantic catalogue
- Key count:
- Fallback behavior:
- Notable message/grammar rules:

### Official reference names
- Overlay status:
- Canonical population:
- Locale-specific extraction/encoding notes:

### Official terminology
- Important official terms:
- Terminology-only evidence:
- Tracker-owned exceptions:

### Typography
- UI font stack:
- Brand exceptions:
- Mono/technical exceptions:
- Tracking/case rules:

### Search
- Canonical English alias policy:
- Locale-specific aliases:
- Transliteration/reading policy:
- Collision notes:

### Collation
- Locale/collator:
- Locale-specific ordering rules:

### Composition/grammar
- Dynamic composition rules:
- Separator rules:
- First-party rendering evidence:

### Layout findings
- Locale-specific issues discovered:
- Shared/global fixes triggered:

### Accessibility findings
- Locale-specific findings:
- Shared/global fixes triggered:

### Manual verification
- Platforms checked:
- Outstanding platform checks:
- Evidence-backed visual checks:

### Known limitations
- ...
```

---

# 19. Locale Profiles

## 19.1 English baseline — `en-US`

### Role/status

- Tracker status: **Supported**
- Catalogue model: full baseline
- Bethesda language target: English
- Role: canonical semantic fallback and canonical English search alias source

### Semantic catalogue

- Current tracker-authored baseline: **the current `en-US` key set**
- Every full locale must match this key/placeholder contract.
- The exact count is expected to grow over time; parity is the invariant.

### Official reference names

English canonical reference values remain the fallback used when a localized overlay does not resolve.

History/reference descriptors use stable identity plus canonical English fallback rather than storing whatever localized presentation string happened to be visible when the action occurred.

### Search

Canonical English reference names are first-class searchable aliases under every supported non-English locale.

### Typography

Baseline UI:

```text
Barlow Semi Condensed
Arial Narrow
system-ui
sans-serif
```

Technical tokens use IBM Plex Mono where appropriate.

### Notes

`en-US` is not merely “another translation.” Changes to its semantic keys define the contract all full locales must satisfy.

---

## 19.2 British English override — `en-GB`

### Role/status

- Tracker status: **Supported**
- Catalogue model: sparse override
- Bethesda language target: not a separate Bethesda Starfield language
- Fallback: `en-US`

### Semantic catalogue

At the current closure point, no active semantic-message overrides are required.

An empty sparse catalogue is valid because all baseline keys resolve through `en-US`.

### Search

`Aluminium` is an important precedent for curated alternate search behavior.

The resource stable identity remains:

```text
resource:aluminium
```

Canonical/alternate English spelling is search presentation only.

Do not create locale-specific stable identities for spelling variants.

### Notes

`en-GB` demonstrates that a supported tracker locale may be intentionally sparse.

---

## 19.3 Japanese — `ja-JP`

### Role/status

- Tracker status: **Supported**
- Catalogue model: full locale
- Bethesda support class: Interface/Text + Voice
- First non-English full tracker locale
- Chosen early as an architectural stress test

### Semantic catalogue

Current closure:

```text
exact parity with the current `en-US` tracker-authored messages
0 empty Japanese values
exact key/placeholder parity
```

All new tracker-authored user-facing text must continue to receive a Japanese value.

### Official reference names

Generated Japanese overlay:

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

All 4,818 qualified localized IDs/components resolve.

Canonical content providers remain:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

`SFBGS050.esm` remains terminology evidence only.

### Official terminology

Important settled Japanese terms include:

```text
Planned Supply                 供給予定
Present                        存在
Producing                      生産中
Logistics                      物流
Inputs                         必要素材
Resource Matrix                資源マトリックス
Poor                           低
Very Poor                      極低
Import                         インポート
Export                         エクスポート
Cargo Link                     貨物リンク
Inter-System Cargo Link        星系間貨物リンク
Inter-System                   星系間
X-Tech Power Core              X-テックパワーコア
Starfield                      スターフィールド
Outpost Engineering            拠点エンジニアリング
```

Tracker presentation has retired:

```text
Cargo Pad
cargo-related Interstellar wording
```

Internal domain identifiers remain unchanged:

```text
CargoPad
CargoPadId
cargoPads
cargoPadId
interstellar
```

Do not rename these merely to match presentation terminology.

### Typography

Japanese ordinary UI text uses an explicit language-sensitive stack:

```css
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

The app/product title deliberately retains Barlow through the brand font token.

IBM Plex Mono remains deliberate for genuine technical tokens.

Ordinary Japanese human-language text should not be forced into mono.

Japanese labels/headings reduce Latin-oriented letter spacing where needed.

Do not ship Japanese font binaries.

Do not add a web-font dependency merely for Japanese.

### Search

Japanese search supports:

- Japanese localized display names;
- canonical English names;
- abbreviations;
- explicit curated alternates.

Example:

```text
アルミニウム       -> resource:aluminium
アルミ             -> resource:aluminium
Aluminum            -> resource:aluminium
Aluminium           -> resource:aluminium
AL / al             -> resource:aluminium
順応型フレーム     -> product:adaptive-frame
adaptive frame      -> product:adaptive-frame
```

The visible result remains Japanese under `ja-JP`.

Do **not** generate:

- romaji;
- kana transliteration;
- hiragana/katakana equivalence;
- broad punctuation folding;
- fan/wiki aliases.

Add such behavior only if future evidence demonstrates a real need.

### Collation

Use active Japanese collation for genuinely alphabetical presentation lists, including:

- star systems;
- search tie-breaking;
- cargo export candidates;
- applicable Planned Supply alphabetical groups.

Do not alphabetize bodies.

Do not reorder resource topology, history, validation severity, user-defined order, or other domain sequences.

### Fauna composition

Japanese dynamically composed fauna names join non-empty components using literal:

```text
U+0020 SPACE
```

This policy is no longer merely inferred.

Manual first-party in-game Japanese screenshots confirmed visible spaces between fauna-name components, including three-component names.

Therefore:

```text
component + U+0020 + component
```

is an evidence-backed Japanese composition rule.

Do not remove those spaces merely because ordinary Japanese prose often omits inter-word spaces.

### Layout findings and global fixes triggered

Japanese exposed several layout weaknesses that were corrected globally:

- header reflow occurred too late;
- Outpost Details overflowed before a breakpoint;
- long Add labels unnecessarily consumed width;
- cargo UI benefitted from compact contextual controls.

Current compact visual controls use:

```text
+ Add
＋ 追加
```

while the full semantic action remains in localized tooltip/accessibility text.

Japanese-specific breakpoints were deliberately avoided.

### Inter-System marker

Visible marker:

```text
✷⇄✷
```

It is intentionally localization-neutral and currently provisional visual polish.

Semantics are localized separately.

Narrator manual verification confirmed it is announced as:

```text
Inter-System Cargo Link - graphic
```

when directly inspected, and it does not enter keyboard tab order.

A future custom SVG may replace the font glyph if cross-platform appearance warrants it, without changing localization/domain semantics.

### Accessibility and global release-hardening lessons

Japanese release hardening triggered global fixes for:

- readable muted text vs disabled/unavailable presentation;
- per-row validation severity;
- live status announcements;
- deferred failed-import alert announcement after native file-picker focus restoration;
- drag-handle tab semantics;
- clipped focus rings;
- selected-state focus-ring contrast;
- Search Results portal focus hand-off;
- cargo operational-state accessible descriptions;
- Inter-System marker semantics.

These are now baseline application behavior and should not need to be rediscovered for every locale.

### Manual verification

Completed on the primary Windows/Chromium environment:

- locale switching;
- keyboard Search;
- Search Results focus hand-off/restoration;
- major keyboard workflows;
- visible focus indicators;
- selected-state focus contrast;
- import/export status announcements with Narrator;
- Inter-System marker semantics;
- Japanese fauna U+0020 separator against first-party in-game rendering;
- representative layout/zoom checks.

Apple/WebKit verification was not completed.

An iPhone local/dev attempt loaded only the page background. A temporary online Safari environment loaded enough of the app to create/name an outpost and select system/body before the trial ended, but this was insufficient for release certification.

### Known Japanese/platform limitation

Apple/WebKit compatibility verification is deferred to backlog:

- re-test the public production build in Safari/WebKit;
- verify Japanese font fallback on iPhone/iPad/macOS Safari;
- investigate the iPhone blank-page behavior if reproducible against the public build;
- treat Apple mobile devices as compatibility/font sanity targets, not a commitment to mobile-responsive support.

No macOS desktop visual test is currently available.

---

## 19.4 French terminology profile — `fr-FR`

### Role/status

- Tracker status: **Not onboarded; semantic catalogue complete and inactive**
- Catalogue model: complete source catalogue, not registered at runtime
- Bethesda support class: Interface/Text + Voice
- Bethesda string-table token: `fr` (strict UTF-8)

### Official reference names and runtime exposure

No French reference-name overlay is committed or registered. `fr-FR` is not in
the runtime catalogue registry, locale selector, browser-language resolution,
or persisted locale preference contract.

### Official terminology

The 37 qualified evidence identities across 19 terms are resolved in
`official-terminology-values-fr-FR.csv`. Direct official terms include
`Avant-poste`, `Liaison`, `Liaison intersystème`, the five official skill names,
`X-Tech`, and `Noyau d'énergie X-Tech`. Contextual variants and tracker-owned
choices are governed by `FRENCH-GLOSSARY.md`.

Notable constraints:

- use the official standalone `Noyau d'énergie X-Tech` for the named concept;
  dialogue variants such as `noyau de X-Tech` remain contextual;
- keep product name `Starfield` invariant despite the qualified string's
  ordinary-language French value `Cosmos étoilé`;
- `SFBGS050.esm` remains terminology evidence only;
- French grammar is sentence-owned; do not assemble prose from glossary terms.

### Known limitations

The frozen 414-key semantic review CSV contains independent Codex and DeepL
drafts, comparison status, final editorial translations, and reviewer notes.
The complete 414-key `fr-FR` source catalogue has exact key, placeholder,
plural-syntax, and protected-token parity with `en-US`. It remains intentionally
unregistered. The official reference-name overlay, composed-fauna proof, search
review, layout/accessibility review, and release verification remain future
work. This profile does not make French a supported locale.

---

## 19.5 German terminology profile — `de-DE`

### Role/status

- Tracker status: **Not onboarded; semantic catalogue complete and inactive**
- Catalogue model: complete source catalogue, not registered at runtime
- Bethesda support class: Interface/Text + Voice
- Bethesda string-table token: `de` (strict UTF-8)

### Official reference names and runtime exposure

No German reference-name overlay is committed or registered. `de-DE` is not in
the runtime catalogue registry, locale selector, browser-language resolution,
or persisted locale preference contract.

### Official terminology

The 37 qualified evidence identities across 19 terms are resolved in
`official-terminology-values-de-DE.csv`. Direct official terms include
`Außenposten`, `Frachtlink`, `Intersystem-Frachtlink`, the five official skill
names, `X-Tech`, and `X-Tech-Energiekern`. Contextual inflection and
tracker-owned choices are governed by `GERMAN-GLOSSARY.md`.

Notable constraints:

- preserve official compounds and noun capitalization; article/case changes do
  not create competing glossary terms;
- keep product name `Starfield` invariant despite the qualified string's
  ordinary-language German value `Sternenmeer`;
- `SFBGS050.esm` remains terminology evidence only;
- do not shorten correct German labels merely to avoid layout pressure.

### Known limitations

The frozen 414-key semantic review CSV contains independent Codex and DeepL
drafts, comparison status, final editorial translations, and reviewer notes.
The complete 414-key `de-DE` source catalogue has exact key, placeholder,
plural-syntax, and protected-token parity with `en-US`. It remains intentionally
unregistered. The official reference-name overlay, composed-fauna proof, search
review, layout/accessibility review, and release verification remain future
work. This profile does not make German a supported locale.

---

# 20. Future-locale planning notes

These are planning considerations only, not implementation commitments.

## Latin-script locales

French, German, Spanish (Spain), Italian, and Portuguese (Brazil) are likely to reuse most of the baseline typography stack, but this must be verified rather than assumed.

Potential issues include:

- longer labels;
- grammatical gender/number;
- punctuation spacing;
- compound words;
- abbreviations;
- translated official terminology;
- overflow at established breakpoints.

The purpose of onboarding a comparatively straightforward locale next would be to prove that the current process is routine.

## Polish

Polish is a long-term target and may reasonably be left until later if desired.

Potential concerns to investigate only when onboarding begins:

- inflection and grammatical case in tracker-authored parameterized messages;
- string length;
- official terminology consistency;
- diacritic rendering;
- whether current message composition assumes English-like grammar.

Do not implement Polish-specific grammar machinery in advance.

## Simplified Chinese

Simplified Chinese is a long-term target and is likely to be one of the more demanding remaining locales.

Likely areas requiring explicit verification include:

- CJK font stack;
- tracking/case behavior;
- official string extraction/encoding;
- punctuation;
- dynamically composed names;
- search aliases;
- collation;
- line breaking;
- compact-control density.

Japanese work gives the project a strong starting point, but Japanese-specific policies must not be copied mechanically into Chinese.

For example, the Japanese fauna U+0020 rule is evidence for Japanese only until equivalent Chinese evidence is obtained.

---

# 21. Cross-locale backlog

Current localization/release items that are intentionally deferred rather than incomplete:

- Apple/WebKit public-build compatibility verification;
- optional replacement of `✷⇄✷` with a custom SVG if cross-platform visual consistency warrants it;
- import-summary locale collation if/when presentation/domain boundaries are refactored cleanly;
- true inner-to-outer body ordering if orbital-order data becomes an explicit domain feature;
- unified locale-closure command/report;
- future generalization of locale-specific reference-name build commands;
- native-speaker review for supported non-English locales where available.

Backlog items should not silently become release blockers unless new evidence shows they affect correctness or usability.

---

# 22. Maintenance rule

Whenever a locale-specific implementation decision is added or changed:

1. update the locale’s profile here;
2. update shared sections if the lesson is truly cross-locale;
3. keep historical audit reports unchanged;
4. add or update automated verification where practical;
5. record first-party evidence for composition/terminology rules when available.

The objective is that a future maintainer should be able to answer:

```text
What does a supported locale require?
Where does this translation/name come from?
Why is this locale handled differently?
Which rules are shared?
Which rules are evidence-backed?
What remains unverified?
```

without reconstructing the answer from old conversations or implementation archaeology.

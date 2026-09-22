# Simplified Chinese Locale Onboarding Plan

Audit date: 2026-09-21

Runtime integration update: 2026-09-22

Target tracker locale: `zh-Hans`

Bethesda token: `zhhans`

Installed game version inspected: `1.16.244.0`

## Runtime integration status

Runtime activation is implemented through the shared localization architecture.
`zh-Hans` is registered with selector label `简体中文`, the complete 414-key
semantic catalogue, and the verified 3,561-entry official reference-name
overlay. Locale metadata now records `runtimeAvailable: true`.

Automatic browser selection accepts bare `zh`, explicit `zh-Hans` and its
descendants, and the `zh-CN` / `zh-SG` regional forms. Explicit `zh-Hant` and
its descendants plus `zh-TW`, `zh-HK`, and `zh-MO` continue to later browser
preferences. An explicit script controls the result, so `zh-Hans-TW` selects
Simplified Chinese while `zh-Hant-CN` does not.

The active locale sets `document.lang` to exactly `zh-Hans`. Locale-aware
sorting uses the shared `Intl.Collator` path with `sensitivity: 'base'` and
`numeric: true`. Search policy is unchanged: localized exact, prefix, and
substring matches coexist with English aliases, abbreviations, and existing
curated alternates; no pinyin, transliteration, or Simplified/Traditional
conversion was added. Accessible shortcut speech retains `Control`, `Alt`, and
`Shift`, and uses `加`, `上箭头`, `下箭头`, `左箭头`, and `右箭头`.

The locale-scoped `:lang(zh-Hans)` font stack is `'Microsoft YaHei UI'`,
`'Microsoft YaHei'`, `'PingFang SC'`, `'Noto Sans CJK SC'`, `system-ui`, and
`sans-serif`, in that order. No font was bundled or fetched specifically for
Chinese, and no geometry or line-breaking rules changed.

Focused and repository-wide automated verification passed for this runtime
integration. Manual normal-scale, true 200% zoom, keyboard-only, Windows
Narrator, glyph/typography, and layout-capacity QA remains pending and is
required before the locale is described as fully supported. Final selector
ordering and Apple/WebKit work also remain separate follow-up tasks.

## 1. Executive summary

Simplified Chinese is ready to enter the established locale-onboarding process. The correct contract is:

```text
zh-Hans -> zhhans -> strict UTF-8 -> full catalogue
```

No new localization architecture is required. The locale can reuse the full semantic-review, official-terminology, qualified-provenance, reference-overlay, stable-ID runtime, search-alias, collation, preference, and closure pipelines used by the seven completed non-English locales.

The work is not entirely mechanical. Four focused risks need explicit treatment:

1. the current accidental-English detector is disabled for unregistered locales and its Unicode-word intersection can miss a Latin residue directly adjacent to Han text;
2. the current UI font has no CJK glyphs and only Japanese has an explicit CJK system-font policy;
3. composed fauna preserve the current semantic component order, but Chinese bracketed components make the exact U+0020 separator an evidence question;
4. fixed/nowrap compact surfaces still need real-catalogue testing at 1366 px and 200% zoom.

None is evidence of a program-level blocker. Search does not require pinyin, fuzzy matching, word segmentation, or Simplified/Traditional conversion. Chinese exact substring matching plus canonical English aliases and abbreviations is sufficient for V1.

## 2. Exact locale/token/encoding contract

The later metadata entry should have this shape:

```json
{
  "trackerLocale": "zh-Hans",
  "bethesdaToken": "zhhans",
  "stringTableEncoding": "utf-8",
  "catalogueRole": "full",
  "runtimeAvailable": false
}
```

`runtimeAvailable` should remain `false` while contracts, terminology, review, catalogue, overlay, composition evidence, and runtime QA are incomplete, then change to `true` in the runtime-integration stage.

`zh-Hans` is the canonical tracker identity. It specifies the Simplified Han script without asserting a country. `zh-CN` would unnecessarily make the product country-specific and would not describe Simplified Chinese used outside mainland China. `Intl.getCanonicalLocales('zh-Hans')` returns `zh-Hans`; `Intl.NumberFormat`, `Intl.ListFormat`, `Intl.PluralRules`, and `Intl.Collator` all resolve successfully. Runtime activation must set `document.lang` to exactly `zh-Hans`.

This contract does not imply `zh-Hant` support.

## 3. Installed input coverage

The installed-language inventory remains valid and was checked against the current installed game:

- `Starfield.esm`: `.strings`, `.dlstrings`, `.ilstrings` complete;
- `ShatteredSpace.esm`: all three table types complete;
- `SFBGS00D.esm`: all three table types complete;
- `SFBGS050.esm`: all three terminology-evidence table types complete.

The broader installed inventory contains 30 `zhhans` plugin populations, each with all three table types. Strict UTF-8 decoded all 90 tables and 238,048 values with zero failures and zero C1 controls. Windows-1252 technically decoded the bytes but produced 622,298 C1 controls, confirming that it is not the correct interpretation.

The audit did not commit or redistribute any Bethesda table.

## 4. Current pipeline readiness

The current pipeline is substantially ready:

- locale metadata already drives token, encoding, artifact names, and staged/runtime state;
- review artifacts derive deterministically from the tracker locale;
- XLIFF 1.2 preserves keys, source hashes, context, constraints, parameters, and protected tokens;
- adjudication is neutral and records the chosen source plus rationale;
- provenance is locale-neutral and already identifies every required qualified string;
- reference materialization closes for Chinese without rediscovery;
- runtime reference names remain stable-ID overlays;
- shared formatting and collation use `Intl`;
- search already separates localized display names from canonical English aliases;
- locale closure delegates to terminology and reference-overlay verifiers.

The Chinese audit materialized 3,561 entities from all 4,818 qualified provenance rows with zero unresolved rows:

| Kind | Count |
| --- | ---: |
| Biomes | 428 |
| Bodies | 1,776 |
| Species | 1,121 |
| Official terms/skills | 5 |
| Products | 30 |
| Resources | 78 |
| Systems | 123 |

## 5. Remaining hard-coded assumptions

### Ordinary locale extension

The implementation must extend the following existing registration points:

- `reference-source/localization-locale-metadata.json`;
- `SupportedLocale`/`supportedLocaleIds` in `src/localization/types.ts`;
- semantic catalogue import and entry in `src/localization/registry.ts`;
- review draft import/routing in `scripts/localization/review-routing.ts`;
- Chinese glossary constraint values in `src/localization/reviewPackage.ts`;
- official terminology values artifact;
- generated reference overlay and sidecar;
- overlay import/registration in `src/localization/referenceNames.ts`;
- browser resolution in `src/localization/locale.ts`;
- accessible shortcut speech in `src/ui/keyboardShortcuts.ts`;
- build-time explicit overlay verification in `package.json`;
- parameterized metadata, review, search, collation, shortcut, reference, switching, and closure tests;
- durable locale status/profile documentation.

Fauna evidence eligibility already derives from full-locale metadata and will include Chinese once staged. Artifact naming, output paths, terminology verification, input extraction, materialization, sidecar generation, and closure commands are already locale-oriented.

### Narrow generalization needed

The accidental-English detector needs a Chinese registration and a narrow ASCII-run check. Today an unknown locale returns no residue findings, while `wordsOf()` groups adjacent Unicode letters and can treat a Han-plus-Latin run as one token. For Chinese, strip placeholders/protected tokens first, then compare ordinary `[A-Za-z]+` runs against source English regardless of Han adjacency. Preserve explicit technical-token exceptions. This is a review-validator improvement, not a translation framework.

The build script still enumerates overlay-verification commands explicitly. Adding Chinese is sufficient for this tranche; replacing the list with metadata-driven orchestration is optional cleanup, not a prerequisite.

## 6. Script/orthography observations

The qualified official overlay is NFC-stable: zero names changed under NFC. It intentionally contains mixed writing systems and source punctuation:

- 966 names contain ASCII U+0020 spaces, commonly before Roman numerals or between name components;
- 1,580 names contain ASCII letters, heavily influenced by Roman numerals, suffixes, abbreviations, and some source/internal-looking names;
- 892 names contain ASCII hyphens;
- 15 names each contain `【` and `】`;
- no full-width ASCII-range characters appeared in the qualified overlay.

Examples such as `蛇夫座泽塔 III-a`, `玻尔VI-b`, and official source values containing `X技术` show that spacing and mixed-script style are data, not cleanup opportunities. Some qualified official values resemble internal identifiers, such as `_RL082Orbital`; onboarding must preserve them and use the existing provenance/display-review route rather than silently rewrite them.

Official Bethesda names must be emitted literally. Tracker-authored copy should follow modern Simplified Chinese conventions described in section 24.

The inspected official terminology and representative names consistently use Simplified forms, for example `货运链接`, `跨星系货运链接`, `行星体`, and `X技术`. Han characters common to both scripts and proper names make a naïve character-count claim inappropriate. Any isolated traditional-shaped official glyph discovered later should be preserved as shipped and reviewed as source evidence, not converted mechanically.

## 7. Chinese grammar/semantic risks

Chinese avoids the inflection burden seen in Polish, but semantic role is still important:

- **Planned Supply** must denote unresolved intended future supply, not a completed supply plan or procurement order.
- **Present** is a resource-state label (exists at the body/outpost), not a person being present or an action to present something.
- **Producing** is an active state and must remain distinct from a manufacturing configuration.
- **Inputs** means recipe/material requirements, not form fields or user input.
- **Logistics** means an actually configured routed export, not general transport availability.
- **Manufacturing** is the fabrication/configuration area; it must not collapse into the active **Producing** state.
- **Validation** is application checking and its issue set, not legal validation, approval, or permission.
- **Resource Matrix** is the dense resource-status table, not a mathematical matrix.
- **Reshuffle** means deliberate reordering, never random shuffle.
- **Lock** freezes the relevant UI arrangement/editing state; it is not account or security locking.
- **Active Production** is selected/configured current output, not merely possible production.
- **Source** and **Destination** are directional logistics endpoints and need paired terminology.
- **Undo** and **Redo** are commands; established software UI wording should be preferred.
- **Inorganic** and **Organic** are resource classes, not value judgments or food-label claims.

Chinese can often use one compact invariant label for singular/plural and omit subjects naturally. Commands, state labels, headings, and explanatory prose must nevertheless be reviewed separately; an invariant word should not be reused where the English source changes grammatical role.

## 8. Plural-system analysis

`Intl.PluralRules('zh-Hans')` reports only `other`; 0, 1, 2, and 10 all select `other`. The current narrow `one / other` formatter is therefore sufficient and must not be expanded.

For the four structurally pluralized keys—`cargo.pad.count`, `validation.issueCount`, `validation.plannedSupplyUnresolved`, and `search.results.found`—natural Chinese can use identical wording in both branches while retaining the positive plural-structure contract. Suitable classifiers should be chosen by editorial review: typically `条` for links, `项`/`个` for issues or unresolved entries, and `个` for outposts. The `one` branch will be unreachable under Chinese plural rules, but keeping both identical branches preserves shared validation and XLIFF structure without awkward visible wording.

## 9. Official terminology readiness

All 37 evidence rows across 19 term IDs resolve: 33 textual rows, four intended absences, zero unresolved. Strong direct defaults include:

| Concept | Official evidence | Readiness |
| --- | --- | --- |
| Outpost | `哨站` | direct default |
| Cargo Link | `货运链接` | direct default |
| Inter-System Cargo Link | `跨星系货运链接` | direct default |
| Biome | `生物群系` in a UI label | strong, with contextual variants elsewhere |
| Planet | `行星`/`星球` in contextual evidence | context review required |
| Planetary Body | `行星体` in exact phrase | strong technical default |
| Star System | `星系` | strong default |
| X-Tech | `X技术` | direct official default; preserve Latin `X` |
| X-Tech Power Core | `X技术能量核心` | direct official default |
| Starfield | `星空` | official localized product title; preserve `Starfield` only where the product intentionally uses the English brand token |

Official skill names resolve directly as `哨站管理`, `哨站工程`, `行星居住`, `研究方法`, and `特殊项目`.

Capitalization is relevant only to embedded Latin/technical tokens. Compact suitability must be checked in real controls; official evidence does not authorize abbreviating a term merely to fit.

## 10. Tracker-owned terminology risks

The glossary must define tracker meaning and UI role for Planned Supply, Present, Producing, Inputs, Logistics, Manufacturing, Validation, Resource Matrix, Reshuffle, Lock, Network, Active Production, Source, Destination, Undo, Redo, Inorganic, and Organic.

Particular review traps are literal calques for Planned Supply and Resource Matrix; confusing Manufacturing with Producing; interpreting Inputs as UI input; rendering Reshuffle as randomness; and rendering Lock as security. Network must be scoped to the player's outpost network rather than computer networking. Compact matrix headings may use shorter wording only when the full concept remains available in headers, accessible names, or contextual help.

This audit does not approve final Chinese translations for these tracker-owned concepts.

## 11. Glossary strategy

Create `docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md` in the terminology stage, with three explicit classes:

1. official Bethesda terms, with qualified evidence and exact official value;
2. tracker-owned preferred terms, with concise definition and UI role;
3. context-sensitive concepts, listing permitted variants and the contexts that select them.

The existing locale-keyed constraint model is expressive enough. It supports exact values, required variants, and per-key/source matching. Chinese needs new values and contexts, not a new constraint language.

## 12. Semantic review/XLIFF readiness

The current independent draft -> review CSV -> XLIFF 1.2 -> DeepL import -> neutral adjudication -> final catalogue flow is suitable. Stable keys, source hashes, context notes, constraints, placeholders, protected tokens, invalid-token recording, stale-source detection, and positive plural validation all remain applicable.

Required Chinese hardening:

- activate accidental-English detection for `zh-Hans`;
- add the ASCII-run residue check described in section 5;
- allow only reviewed invariants such as `JSON`, `FormID`, `Starfield`, `X-Tech`, HTTP/file extensions, shortcut key names, and placeholders;
- require Han or otherwise intentionally localized content for ordinary prose, so a complete English fallback cannot pass merely because the residue detector is narrow;
- test mixed Chinese/Latin strings and Latin text directly adjacent to Han characters;
- retain exact placeholder and protected-token validation.

Chinese does not require whitespace tokenization for translation or search. The word-intersection concern is confined to the English-residue quality gate.

## 13. DeepL workflow

Use one deterministic `zh-Hans` XLIFF handoff. Do not split by surface and do not establish a default winner between the independent Codex draft and DeepL.

DeepL currently supports Simplified Chinese through its translation language inventory, and its XLIFF file-translation documentation supports XLIFF 1.2 or higher through document translation. Sources: [DeepL API supported languages](https://developers.deepl.com/docs/getting-started/supported-languages) and [DeepL XLIFF translation support](https://support.deepl.com/hc/en-us/articles/7507376697500-Translate-XLIFF-files).

Before the real handoff, run a small disposable round trip to confirm that DeepL preserves the current `<ph>` representation and whether it rewrites target-language casing (`zh-Hans` versus `ZH-HANS` or `ZH`). If it does, add only BCP-47-equivalent canonicalization at import; do not weaken source-hash, stable-key, or token checks. Do not call DeepL until the glossary and independent draft are frozen.

### Source-blinded re-adjudication record

After the initial semantic adjudication, two source-blinded passes reviewed all 268 structurally valid, Chinese-quality-valid substantive disagreements: 72 unconstrained tracker strings and 196 terminology-constrained tracker strings. Candidate origin was hidden in both passes, while approved terminology constraints remained visible in the constrained pass. Reconciliation produced 16 material catalogue corrections; 49 rows judged equivalent retained their existing acceptable finals to avoid stylistic churn.

The original adjudication and blind reviewer both used the GPT-5.6 Sol model family and configuration. This evidence is therefore source-blinded re-adjudication, not independent-model or native-speaker validation, and does not establish objective linguistic correctness. The accepted V1 process retains that limitation explicitly.

## 14. Reference-overlay readiness

The generalized builder can produce the expected artifacts without provenance regeneration:

```text
src/localization/generated/zh-Hans-reference-names.ts
reference-source/localized-reference-names-zh-Hans-manifest.json
```

The audit's in-memory materialization closed at 3,561 entities, 4,818 qualified rows, and zero unresolved. The later sidecar should record `zh-Hans`, `zhhans`, strict UTF-8, exact manifested table hashes, counts, tool/game versions, and the reviewed fauna composition policy.

Official names include intentional Han/Latin mixtures, ASCII spaces, hyphens, Roman numerals, bracketed text, and source abbreviations. No normalization beyond the existing safe decoding/serialization boundary is warranted.

## 15. Fauna composition risks/evidence plan

The provenance population remains 922 composed fauna with 2,179 ordered components and the established shapes:

- 267 prefix + species;
- 335 prefix + species + diet;
- 320 species + diet.

Chinese components preserve the semantic slots, but their form differs visibly from prose. Prefixes and diets are commonly bracketed, for example `[畜牧]`, `[群聚]`, `[食草者]`, and `[食腐动物]`; the components themselves contain no whitespace in the inspected population. Consequently, both `[畜牧] 滑翔者 [食草者]` and `[畜牧]滑翔者[食草者]` are mechanically plausible. Component order appears reusable, but separator fidelity is not established by string tables alone.

Use the established evidence policy: opportunistic first-party screenshots, no target hunting, no rigid quota, and no Creation Kit requirement. The most informative screenshots are:

- one example of each of the three shapes;
- a three-component name with both bracketed prefix and diet;
- a two-component prefix + species name;
- a two-component species + diet name;
- a long component to expose scanner wrapping/truncation;
- an example from Shattered Space if naturally encountered.

Record exact observed text, body/fauna identity, component order, separators, punctuation, truncation, and screenshot reference. A contradiction reopens only Chinese composition. Until observed, evidence status should remain `pending-opportunistic-screenshots` rather than pretending the U+0020 rule is proven.

## 16. Search normalization

V1 should support:

```text
exact/substring localized Simplified Chinese names
canonical English aliases
abbreviations
existing explicitly curated alternates
```

Current NFC normalization, whitespace collapse, and locale case folding are adequate. Exact Chinese substring matching works without segmentation. Case folding matters only to embedded Latin text. NFC changed zero qualified official names.

Do not add pinyin, fuzzy matching, transliteration, Simplified/Traditional equivalence, punctuation folding, space removal, or general width folding. Pinyin would require alias sourcing, ranking, collision policy, editorial maintenance, and UI explanation—a separate product feature. Removing spaces would conflate intentionally spaced astronomical names; punctuation folding could conflate bracketed fauna roles; broad NFKC/width normalization has no corpus evidence because no full-width ASCII appeared in the qualified overlay.

Add tests for Chinese exact/prefix/substring matches, English alias matches returning Chinese display, embedded Latin case folding, intentional spaces, punctuation, Roman numerals, and stable-ID collision tie-breaks. Measure collisions before accepting any future normalization.

## 17. Simplified/Traditional boundary

The product boundary is explicit:

```text
zh-Hans supported
zh-Hant unsupported
Traditional Chinese is not automatically mapped
```

Do not use OpenCC or any automatic character conversion. Do not generate Traditional aliases. Do not treat `zh-TW`, `zh-HK`, `zh-MO`, or explicit `zh-Hant` as Simplified Chinese. Preserve any exceptional glyph in an official Bethesda value literally and review it as source data.

## 18. Collation

`Intl.Collator('zh-Hans', { sensitivity: 'base', numeric: true })` resolved successfully with locale `zh-Hans`, default Chinese collation, numeric ordering, and stable results over representative real names. The observed order was useful and consistent with a pinyin-oriented default, while equal visible names remained deterministically ordered by stable ID.

The shared collator is sufficient. The product should not promise a specific pinyin/stroke standard beyond the platform `Intl` result, and it should not introduce a manual Chinese sort table. Apply it only at existing alphabetical presentation boundaries; preserve domain, orbital, topology, persisted, severity, and chronological ordering.

## 19. Browser mapping

Recommended conservative resolution, evaluated in preference order:

| Browser tag | Result |
| --- | --- |
| `zh-Hans`, `zh-Hans-CN` | `zh-Hans` |
| `zh-CN`, `zh-SG` | `zh-Hans` by region inference |
| bare `zh` | `zh-Hans` (recommended default-script interpretation) |
| `zh-Hant` | unsupported; continue to later browser preference |
| `zh-TW`, `zh-HK`, `zh-MO` | unsupported; continue to later preference |

An explicit script subtag must outrank region inference. Any tag containing `Hant` must not map even if it also contains an unusual Simplified-associated region. Normalize casing/underscores consistently with existing policy and continue scanning `navigator.languages` after unsupported Traditional preferences.

## 20. Locale selector label

Use the self-identifying label `简体中文` for both short and display contexts unless the final selector design distinguishes them. Do not append `（中国）`: the locale is script-specific, not country-specific, and `zh-SG` is also mapped. Final global selector ordering remains a post-onboarding decision.

## 21. Shortcut speech

Recommended accessible spoken tokens:

| Token | Spoken form |
| --- | --- |
| Control | `Control` |
| Alt | `Alt` |
| Shift | `Shift` |
| plus | `加` |
| Arrow Up | `上箭头` |
| Arrow Down | `下箭头` |
| Arrow Left | `左箭头` |
| Arrow Right | `右箭头` |

The modifier names deliberately match familiar physical-key labels; visible chord text remains unchanged. Verify the composed phrases with Windows Narrator because pronunciation of embedded English key names and punctuation pauses is a manual accessibility question.

## 22. Typography

`Barlow Semi Condensed`, `Arial Narrow`, and `IBM Plex Mono` do not provide the required general Simplified Chinese glyph coverage. Today Chromium/Windows must perform per-glyph fallback, likely to a Microsoft CJK UI font, while Latin characters can remain Barlow. That is readable in principle but accidental, may create mixed metrics inside one label, and is not an acceptable final documented policy.

Add a reviewed `:lang(zh-Hans)` UI stack during runtime integration, likely starting with:

```css
'Microsoft YaHei UI', 'Microsoft YaHei', 'PingFang SC',
'Noto Sans CJK SC', system-ui, sans-serif
```

Do not ship fonts or add web-font dependencies. Keep genuine IDs, FormIDs, abbreviations, counts, and keycaps in the technical mono role; do not put full Chinese sentences in mono. Brand-only Latin may retain the brand face. Reduce Latin-oriented tracking/text-transform on ordinary Chinese headings as Japanese already does, after visual measurement rather than by assumption.

Manual Windows/Chromium inspection is required for glyph coverage, punctuation placement, mixed `X技术`/`JSON` strings, weight availability, and vertical metrics. Typography is the largest visual uncertainty, not a current stop condition.

## 23. Line breaking/wrapping

Default browser CJK line breaking is a sufficient baseline for ordinary prose, validation messages, Help, About, and tooltips. Do not globally apply `word-break: break-all`, forced spacing, or English hyphenation.

Risk is concentrated in existing compact/fixed surfaces with `white-space: nowrap`, ellipsis, fixed line-height, tight uppercase/tracking, or narrow columns: search results, status text, matrix headers/cells, cargo summaries, validation badges, planned-supply chips, and header controls. Chinese is often horizontally compact, but CJK fallback metrics and legal break opportunities can increase vertical pressure.

Test real catalogue content first. If a defect appears, use the smallest surface-specific rule (`overflow-wrap`, `white-space`, or `line-break`) and review it as a UI task. No special CJK line-breaking CSS is currently justified by evidence.

## 24. Punctuation/spacing policy

For tracker-authored prose:

- use `，`, `。`, `：`, and `；` in Chinese sentences;
- use Chinese quotation marks and ellipsis where normal editorial style requires them;
- use Chinese parentheses/brackets for prose unless a technical syntax requires ASCII;
- do not insert spaces between ordinary Chinese lexical items;
- normally do not add spaces between Chinese and adjacent numbers or short Latin technical tokens, unless readability, a product name, or literal syntax requires one;
- preserve exact `JSON`, `FormID`, `X-Tech`, file extensions, key names, placeholders, IDs, and code-like punctuation;
- keep list, number, and percent punctuation delegated to `Intl`.

Do not mechanically convert Bethesda names. The official qualified corpus demonstrably uses ASCII spaces, hyphens, square brackets, Roman numerals, and mixed forms; these remain literal.

## 25. Layout/accessibility risks

High-risk surfaces are the page header and locale selector, Navigation, Outpost Details, Resource Matrix, Planned Supply, Cargo, Search/Results, Validation, Help, About, status/import/export messages, and Solar/Wind quality controls.

Required final matrix:

```text
1366 px
1600 px
200% browser zoom
keyboard-only
Windows Narrator
typography/glyph review
import/export
```

Accessibility checks must confirm `document.lang=zh-Hans`, understandable Narrator output for Chinese plus Latin technical tokens, punctuation pauses, shortcut speech, compact-control accessible names, tooltip/help descriptions, focus restoration, and locale switching without persisted-domain changes. Chinese text must not gain artificial visible spaces solely to improve speech; use accessible descriptions when a spoken distinction is needed.

Preserve the geometry freeze during earlier stages. Any structural capacity defect should be fixed cross-locale in a separately reviewed UI batch.

## 26. Bundle impact

The in-memory Chinese overlay serialized to approximately 104 KiB of raw UTF-8 JSON. Existing generated TypeScript overlays are about 119–148 KiB on disk; the Chinese module is therefore likely to land in the same broad range, with a semantic catalogue around the existing 31–33 KiB non-English catalogues. Expect roughly 150–190 KiB additional unminified source before bundling/compression, plus small registry/metadata changes.

Chinese repeats many keys and Han substrings, so production compression should materially reduce transfer size; measure rather than infer the final gzip/Brotli result. Do not add lazy loading during onboarding. Because this is the final V1 locale, bundle/startup composition review becomes immediately due after Chinese release closure.

## 27. Automated test plan

Prefer parameterized additions covering:

- metadata identity, staged/runtime boundary, strict UTF-8, and artifact names;
- exact semantic key/placeholder/protected-token parity;
- official terminology value coverage and glossary constraints;
- four positive plural structures with Chinese `other` behavior;
- review CSV and XLIFF 1.2 generation/import, source hashes, locale canonicalization, invalid-token recording, and adjudication;
- Chinese accidental-English cases: spaced residue, residue adjacent to Han, whole English fallback, and allowed technical tokens;
- 3,561/4,818 reference closure and sidecar drift;
- 922/2,179 fauna closure, three shapes, evidence schema, and reviewed separator;
- exact Chinese search plus English aliases, abbreviations, mixed Latin case, spaces, punctuation, and no Traditional equivalence;
- browser mapping including every tag in section 19 and preference continuation after Traditional tags;
- real-name collation, numeric behavior, duplicate-name stable-ID tie-break, and protected domain order;
- accessible shortcut speech;
- number/list/percent formatting and `document.lang`;
- selector/persistence/runtime switching and presentation-only behavior;
- glyph coverage sanity where browser/system integration can test it, while retaining manual visual review;
- locale closure and the production build's explicit overlay check.

## 28. Recommended implementation sequence

1. **Locale contracts/tooling extension:** add staged metadata, types/artifact contracts, review routing, English-residue hardening, and parameterized tests.
2. **Official terminology and glossary:** resolve all 37 evidence rows into Chinese values and create the three-class glossary/constraints.
3. **Independent semantic draft and XLIFF:** create the draft, 414-key (or current baseline-count) review CSV, validate parity, and freeze one XLIFF 1.2 handoff.
4. **DeepL import/adjudication/final catalogue:** validate the round trip, record invalid output, adjudicate neutrally, and generate the complete catalogue.
5. **Reference overlay and fauna evidence:** generate the 3,561-name overlay/sidecar, create evidence support, and record opportunistic screenshots without changing provenance.
6. **Runtime integration:** register catalogue/overlay, browser policy, selector label, search tests, collation, shortcut speech, `document.lang`, and explicit Chinese system-font policy.
7. **Layout/accessibility/release closure:** run automated closure plus the 1366/1600/200%/keyboard/Narrator/typography/import-export matrix; document the locale profile.
8. **Post-localization cleanup:** final selector ordering, XLIFF relocation/cleanup, bundle/startup review, cross-locale capacity review, and deferred global/platform work.

Stages 1 and 2 may share one implementation brief if the reviewer wants a single tooling/terminology tranche; stages 3 and 4 should remain separated by the external DeepL handoff; overlay evidence and runtime activation should remain reviewable boundaries.

## 29. Complexity estimate

These are effort bands, not deadlines:

| Area | Estimate | Notes |
| --- | --- | --- |
| Engineering/tooling | Medium | mostly ordinary extension; narrow residue-detector hardening and tests |
| Editorial/translation | High | complete semantic catalogue, glossary, context review, native review desirable |
| DeepL turnaround | Low external elapsed effort | one XLIFF handoff plus import validation; service/account dependent |
| Reference overlay | Low–medium | closure already proven; review source oddities and sidecar |
| Fauna evidence | Unbounded/opportunistic | no quota or target hunting; exact separator evidence is the uncertainty |
| Manual QA | Medium–high | CJK typography, 200% reflow, Narrator, dense surfaces |

The largest uncertainty is typography/compact-layout behavior with real Chinese strings and Windows fallback metrics. Fauna separator evidence is the largest data-specific uncertainty. Search is low risk under the conservative policy.

## 30. Stop conditions

Pause the affected stage only if evidence shows one of the following:

- the explicit Windows CJK stack produces unusable glyphs or metrics;
- essential controls remain unusable after narrow, reviewed wrapping fixes;
- the hardened English-residue gate cannot distinguish ordinary residue from protected technical tokens;
- basic search usability demonstrably requires a broader alias product decision;
- browser resolution cannot keep explicit Traditional preferences out of Simplified mapping;
- first-party fauna rendering contradicts component order or cannot be represented by a locale-scoped separator/composition policy;
- real consumer lists show unsuitable or unstable ICU collation despite stable-ID tie-breaks;
- placeholders/protected tokens cannot survive the XLIFF round trip;
- another hidden Latin-script assumption requires a cross-locale redesign.

No stop condition was met during this audit.

## 31. Post-localization cleanup implications

After Chinese release closure, immediately schedule the program-level work already deferred until all locales exist:

- decide final selector ordering across all supported locales;
- move working XLIFF handoffs to the ignored location and update defaults/docs/tests while retaining durable review evidence;
- measure production bundle composition, transfer size, parse/startup cost, and only then consider lazy locale loading;
- review shared compact-layout capacity across all real catalogues;
- re-evaluate remaining global Narrator/shortcut/focus debt without reopening settled Chinese-independent issues gratuitously;
- perform Apple/WebKit rendering and VoiceOver smoke tests when suitable hardware is available;
- simplify localization tooling only where the completed nine-locale set demonstrates repeated maintenance cost.

## 32. Explicit user decisions/blockers before implementation

There is no architecture blocker. A separate implementation brief should explicitly approve or confirm:

1. the recommended browser policy, especially bare `zh -> zh-Hans`;
2. selector label `简体中文` without a country;
3. the reviewed Chinese system-font stack after Windows visual sampling;
4. whether release may carry `pending-opportunistic-screenshots` fauna evidence or requires an observed match before activation;
5. who performs final Chinese editorial/native review and the authorized DeepL handoff;
6. acceptance of official source strings that look internal or unusually mixed, unless provenance review identifies a real source defect.

Do not proceed into Simplified Chinese implementation without that separate brief.

## Audit diagnostics and provenance

Read-only diagnostics performed:

- inspected all durable localization, architecture, domain, UX, backlog, and workflow policy documents named by the brief;
- inspected locale metadata, review/adjudication, input extraction, provenance/materialization, fauna evidence, runtime registry, browser mapping, search, collation, shortcut speech, CSS, and relevant tests;
- re-read the installed-language inventory results for all 90 Chinese tables;
- materialized the Chinese overlay in memory from the installed required plugin tables;
- measured script/punctuation/spacing/NFC characteristics, terminology values, fauna components, raw overlay size, `Intl` behavior, and representative real-name collation;
- checked current DeepL Simplified Chinese and XLIFF documentation.

Temporary ignored diagnostics live only under `.local-work/localization/zh-Hans-audit/`. No Bethesda corpus is tracked.

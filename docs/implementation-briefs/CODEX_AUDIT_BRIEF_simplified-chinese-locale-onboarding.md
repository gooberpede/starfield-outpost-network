# Codex Audit Brief — Simplified Chinese Locale Onboarding Plan

## Objective

Perform a **read-only audit and implementation-planning pass** for onboarding Simplified Chinese into the Starfield Outpost Tracker.

Target locale:

```text
Simplified Chinese
Tracker locale: zh-Hans
Bethesda token: zhhans
```

This is the final remaining V1 localization target.

The recent localization-language inventory audit already established that the installed game ships a complete `zhhans` text population, that it decodes as strict UTF-8, and that the existing provenance/terminology identities fully resolve.

This audit should therefore focus on **Simplified-Chinese-specific language, script, typography, search, collation, punctuation, line-breaking, accessibility, and fauna-composition risks**, while reusing the existing localization pipeline wherever possible.

This is **not** an implementation task.

Do not add the locale to runtime support, create the semantic catalogue, generate committed overlays, change browser mapping, alter search, modify CSS/UI geometry, or commit/push.

---

# Product goal

Determine the exact Simplified Chinese onboarding plan using the now-proven localization pipeline established across:

```text
Japanese
French
German
Spanish (Spain)
Italian
Portuguese (Brazil)
Polish
```

Simplified Chinese should be treated as a focused single-locale tranche.

The audit should identify:

- what can be reused unchanged;
- what genuinely differs because of Simplified Chinese script/language behavior;
- whether any tooling generalization is required;
- whether current typography and line-breaking behavior are sufficient;
- whether search needs anything beyond exact localized names and canonical English aliases;
- whether shared collation behaves usefully;
- whether fauna composition needs locale-specific rules;
- the recommended implementation sequence.

---

# Known facts already established

Treat these as starting assumptions to verify against current repository state, not hypotheses to rediscover unnecessarily:

```text
Tracker locale: zh-Hans
Bethesda token: zhhans
Encoding: strict UTF-8
```

Installed localization coverage is complete for:

```text
.strings
.dlstrings
.ilstrings
```

across the current required plugin set.

The existing canonical provenance population resolves:

```text
3,561 canonical entities
4,818 qualified provenance rows
0 unresolved
```

The existing terminology evidence resolves:

```text
37 evidence rows
19 term IDs
33 textual evidence rows
4 intended absences
0 unresolved
```

Do not regenerate canonical provenance.

---

# Primary durable documentation

Read and treat as current policy:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/audits/STARFIELD-LOCALIZATION-LANGUAGE-INVENTORY.md
docs/BACKLOG.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
AGENTS.md
```

Also inspect representative completed locale artifacts from:

```text
docs/localization/
reference-source/
src/localization/
scripts/localization/
tests/
```

Pay particular attention to:

- Japanese onboarding and its non-Latin-script lessons;
- French/German generalized pipeline;
- Spanish/Italian/Portuguese locale-keyed review constraints;
- Polish grammar/plural handling;
- composed-fauna evidence records;
- runtime locale registry/browser resolver;
- search normalization policies;
- shortcut speech;
- final locale closure tooling.

---

# 1. Confirm Simplified Chinese metadata contract

Verify the intended contract:

```text
zh-Hans -> zhhans -> utf-8 -> full catalogue
```

Recommend the exact metadata entry shape required later.

Do not edit metadata in this audit.

Confirm BCP-47 and `Intl` suitability for:

```text
zh-Hans
```

including:

- number formatting;
- list formatting;
- plural rules;
- collation;
- `document.lang`.

Explicitly confirm whether `zh-Hans` is the correct canonical tracker tag rather than a region-specific tag such as `zh-CN`.

Do not infer Traditional Chinese support.

---

# 2. Inspect remaining hard-coded locale assumptions

Audit current tooling for assumptions that still enumerate only existing supported/staged locales.

Identify every area Simplified Chinese onboarding will need to extend, including:

- metadata;
- full-locale types/registries;
- review draft routing;
- glossary constraints;
- adjudication/output naming;
- terminology values;
- reference-overlay generation;
- fauna evidence eligibility;
- runtime registration;
- browser mapping;
- search normalization;
- collation tests;
- shortcut speech;
- build verification;
- locale closure;
- parameterized tests.

Distinguish:

```text
ordinary locale extension
```

from:

```text
real architecture/generalization need
```

Prefer no new framework unless evidence requires it.

---

# 3. Script and orthography policy

Audit the actual Chinese corpus and current app assumptions for:

- Han-script rendering;
- use of Simplified versus Traditional characters;
- ASCII versus Chinese punctuation;
- full-width punctuation;
- quotation marks;
- brackets/parentheses;
- colons/semicolons;
- ellipsis;
- middle dot;
- slash/hyphen behavior;
- spacing between Chinese and Latin/technical tokens;
- use of ASCII spaces inside official names;
- mixed-script labels such as `X-Tech`, `JSON`, `FormID`, `Starfield`.

Do not normalize official Bethesda strings away from their shipped forms.

Document which punctuation/spacing behavior should be preserved literally and which belongs to tracker-authored semantic copy.

---

# 4. Chinese grammar and semantic-review risk

Chinese avoids many inflectional problems seen in Polish, but may expose different semantic risks.

Audit current semantic catalogue for:

- English noun/verb ambiguities;
- state labels versus commands;
- singular/plural distinctions;
- classifier/count constructions;
- overly literal subject/object structure;
- compact-label ambiguity;
- pronoun/subject omission;
- resultative/state wording;
- aspectual ambiguity;
- technical versus user-facing terminology.

Pay particular attention to tracker concepts such as:

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
Active Production
Source
Destination
Undo
Redo
Inorganic
Organic
```

Do not translate yet.

The audit should identify where Chinese may permit a cleaner invariant label and where context-specific wording remains necessary.

---

# 5. Plural-system review

Chinese plural rules are much simpler than Polish and may often be effectively count-neutral.

Audit the current four explicit pluralized semantic keys:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

Determine whether the existing narrow `one / other` engine is sufficient without awkward Chinese.

Report:

- whether the same wording can naturally serve both branches;
- whether one/other distinctions should collapse to identical Chinese text;
- whether classifiers or count words are needed;
- whether current syntax can remain unchanged.

Do not expand the formatter unless a concrete current key requires it.

---

# 6. Official terminology readiness

Resolve the existing official terminology evidence read-only for `zhhans`.

Inspect representative values and determine:

- which official terms are strong direct tracker defaults;
- which need contextual handling;
- which are tracker-owned abstractions;
- capitalization relevance;
- compact-label suitability.

Pay particular attention to:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Biome
Planet
Planetary Body
Star System
X-Tech
X-Tech Power Core
Starfield
official skill names
```

Do not create terminology CSVs yet.

---

# 7. Tracker-owned terminology risks

Identify likely Simplified Chinese terminology choices requiring glossary context for:

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

Focus on:

- whether the term is ordinary Chinese or a technical calque;
- distinction between state and action;
- distinction between manufacturing and producing;
- “Inputs” meaning recipe/material requirements rather than form input;
- “Validation” feature terminology;
- whether `Reshuffle` could be mistaken for random shuffle;
- whether `Lock` reads as security/account lock;
- whether concise matrix headings remain unambiguous.

Do not finalize translations unless needed as evidence examples.

---

# 8. Glossary strategy

Recommend a Simplified Chinese glossary artifact analogous to:

```text
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
```

The glossary should later distinguish:

1. official Bethesda terminology;
2. tracker-owned preferred terminology;
3. context-sensitive concepts.

Determine whether the current generalized constraint model is expressive enough.

Do not create the glossary now.

---

# 9. Semantic review/XLIFF readiness

Assess whether the current review pipeline can support Simplified Chinese without new architecture.

Verify:

- independent Codex draft;
- review CSV;
- XLIFF 1.2 handoff;
- DeepL import;
- neutral adjudication;
- glossary constraints;
- stale-source/constraint detection;
- invalid-token recording;
- accidental-English guard;
- positive plural-structure validator.

Pay special attention to:

- mixed English/Chinese technical tokens;
- accidental-English detection false positives/false negatives in a CJK locale;
- whether word-intersection logic assumes Latin whitespace tokenization;
- whether English residue detection needs a different strategy for Chinese.

Do not call DeepL.

---

# 10. DeepL workflow planning

Confirm current DeepL support for Simplified Chinese and XLIFF 1.2 document translation using authoritative documentation if needed.

Recommend one Simplified Chinese XLIFF handoff only.

Preserve:

- source/context notes;
- protected tokens;
- glossary constraints;
- stable keys;
- source hashes;
- no default winner.

Do not perform the handoff.

---

# 11. Official reference-overlay readiness

Confirm generalized overlay tooling can produce:

```text
src/localization/generated/zh-Hans-reference-names.ts
reference-source/localized-reference-names-zh-Hans-manifest.json
```

from unchanged provenance.

Expected closure:

```text
3,561 entities
4,818 qualified rows
0 unresolved
```

Do not generate committed outputs in the audit.

Inspect the corpus for:

- Simplified-only characters;
- any Traditional variants;
- mixed Latin/CJK names;
- punctuation;
- spaces;
- abbreviations;
- full-width forms;
- numeric/roman-numeral conventions.

---

# 12. Composed-fauna risk analysis

Audit the existing:

```text
922 fauna
2,179 components
```

composition model independently for Simplified Chinese.

Do not transfer composition assumptions from Japanese or Polish.

Determine likely risks:

- component order;
- whether spaces exist between components;
- whether components are concatenated;
- whether punctuation acts as separator;
- whether any component is omitted in composition;
- whether words mutate or shorten;
- whether diet/species/prefix order differs by shape;
- whether classifiers or particles appear;
- whether scanner display inserts formatting not present in source tables.

Recommend the same evidence policy:

- opportunistic first-party screenshots;
- no target hunting;
- no rigid quota;
- no Creation Kit requirement;
- contradictions reopen only the Chinese composition rule.

Identify what kinds of screenshot examples would be most informative.

---

# 13. Search normalization

This is a major audit question.

Start from the conservative baseline:

```text
exact localized names
canonical English aliases
abbreviations
```

Do not assume pinyin/transliteration support.

Inspect the actual Chinese resource/product/reference corpus and determine:

- whether exact Chinese matching is sufficient;
- whether Unicode normalization changes anything useful;
- whether Simplified/Traditional equivalence is warranted or explicitly out of scope;
- whether width normalization is relevant;
- whether punctuation normalization is needed;
- whether spaces in mixed-script names need equivalence;
- whether case folding matters only for embedded Latin tokens;
- whether pinyin aliases would require an entirely new product feature and should be rejected for V1.

Report collision risk for any proposed search-only normalization.

Do not implement search changes.

No fuzzy matching.

No general transliteration framework.

---

# 14. Simplified/Traditional boundary

Explicitly audit and document the product boundary:

```text
zh-Hans supported
zh-Hant not supported
Traditional Chinese not automatically mapped
```

Inspect whether the official `zhhans` corpus contains only Simplified forms or any exceptions.

Do not create automatic Simplified↔Traditional character conversion.

Do not use OpenCC-like conversion.

Do not treat Traditional browser locales as equivalent unless a future product decision explicitly says so.

---

# 15. Collation

Verify whether:

```text
Intl.Collator('zh-Hans', { sensitivity: 'base', numeric: true })
```

or the project’s current shared equivalent behaves usefully for actual Chinese presentation lists.

Test representative real corpus names.

Determine:

- whether ordering is stable/deterministic;
- whether the browser/ICU resolves a useful Chinese collation;
- whether exact ordering style (pinyin/stroke/etc.) is consistent enough for product use;
- whether current UI consumers actually need a special policy.

Do not invent a manual Chinese sort table unless actual ICU behavior is inadequate.

Preserve stable-ID final tie-breaks.

---

# 16. Browser-locale mapping

Recommend a conservative browser policy.

Evaluate at least:

```text
zh
zh-Hans
zh-Hans-CN
zh-CN
zh-SG
zh-Hant
zh-TW
zh-HK
zh-MO
```

Questions to answer:

1. Should bare `zh` map to `zh-Hans`?
2. Should `zh-CN` map to `zh-Hans`?
3. Should `zh-SG` map to `zh-Hans`?
4. Must all explicit Traditional tags continue to later preferences?
5. Should script subtags outrank region inference?

Prefer not to claim unsupported Traditional Chinese.

Do not implement mapping.

---

# 17. Locale selector label

Recommend the self-identifying label.

Likely candidates include forms equivalent to:

```text
简体中文
简体中文（中国）
```

or another convention consistent with current selector style.

Determine whether adding a region is actually appropriate given the tracker locale is script-specific `zh-Hans`, not country-specific.

Do not decide final global selector ordering.

---

# 18. Accessible shortcut speech

Recommend Simplified Chinese spoken forms for:

```text
Control
Alt
Shift
plus
Arrow Up
Arrow Down
Arrow Left
Arrow Right
```

These are screen-reader speech phrases, not visible chord text.

Do not implement them.

Flag uncertainty for later Windows Narrator verification.

---

# 19. Typography

Perform an explicit typography audit.

Assess current font stacks for required Simplified Chinese glyph coverage in:

- ordinary body text;
- headings;
- uppercase/condensed Latin-adjacent headings;
- buttons;
- tables;
- dialogs;
- technical/mono contexts;
- mixed Chinese/Latin strings.

Questions:

- Does the current UI font actually contain CJK glyphs?
- If not, what system fallback occurs on Windows?
- Is fallback consistent and readable?
- Are metrics wildly different from current Latin fonts?
- Does the fallback render punctuation naturally?
- Are there accidental mixed-font strings?
- Is a locale-specific system-font stack warranted?

Do not ship font binaries.

Do not add web-font dependencies.

Do not change CSS in the audit.

---

# 20. Line breaking and wrapping

Audit Simplified Chinese line-breaking behavior explicitly.

Inspect current CSS for assumptions based on spaces/Latin words.

Determine whether default browser CJK line breaking is sufficient for:

- buttons;
- table headers;
- status messages;
- validation text;
- Help;
- About;
- tooltips;
- Search Results;
- Cargo summaries;
- Planned Supply;
- Resource Matrix.

Look for possible need for:

```text
word-break
overflow-wrap
line-break
white-space
```

policy changes.

Do not implement geometry or typography changes during the audit.

If special CJK line-breaking CSS is truly required, identify it as a separate reviewed UI task.

---

# 21. Punctuation and spacing policy

Audit tracker-authored Chinese copy conventions for:

- Chinese comma `，`;
- full stop `。`;
- colon `：`;
- semicolon `；`;
- brackets/parentheses;
- Chinese quotation marks;
- ellipsis;
- spacing around Latin tokens;
- spacing around numbers;
- spaces between Chinese lexical items.

Recommend a semantic-copy style policy.

Do not mechanically convert official Bethesda reference names.

Do not impose English spaces where Chinese normally has none.

---

# 22. Accessibility risk

Assess Simplified-Chinese-specific accessibility concerns:

- correct `document.lang=zh-Hans`;
- Windows Narrator reading of Chinese UI;
- mixed Chinese/Latin technical terms;
- punctuation pauses;
- shortcut speech;
- compact controls;
- tooltip/accessibility descriptions;
- whether screen-reader output depends on spaces that visible Chinese does not need.

Do not reopen known global Narrator issues unless Chinese creates a distinct regression.

---

# 23. Layout risk

Chinese is often compact horizontally but may create different vertical/line-break behavior.

Identify high-risk surfaces:

- header;
- locale selector;
- Navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo;
- Search;
- Validation;
- Help;
- About;
- status/import/export;
- power-quality controls.

Preserve the geometry freeze.

Recommend the established final QA matrix:

```text
1366px
1600px
200% browser zoom
keyboard-only
Narrator
typography
import/export
```

---

# 24. Bundle impact

Estimate static bundle growth from:

- one semantic catalogue;
- one 3,561-name Chinese reference overlay.

Chinese UTF-8 source may differ materially in byte size from Latin locales.

Do not implement lazy loading.

Preserve the dedicated post-localization bundle review after Simplified Chinese completes.

Because this is the final locale, note that the post-localization review becomes immediately due **after** Chinese release closure.

---

# 25. Test strategy

Recommend minimum durable Simplified Chinese test expansion for:

- locale metadata;
- UTF-8;
- terminology values;
- glossary constraints;
- semantic parity;
- plural handling;
- XLIFF round-trip;
- adjudication;
- accidental-English detection;
- overlay closure;
- fauna evidence;
- browser mapping;
- search normalization;
- Simplified/Traditional boundary;
- collation;
- shortcut speech;
- formatter behavior;
- typography/glyph sanity where testable;
- runtime switching;
- locale closure.

Prefer parameterized tests over copied suites.

---

# 26. Implementation sequence

Recommend a bounded Simplified Chinese implementation sequence.

Use the proven pattern as baseline:

1. locale contracts/tooling extension;
2. official terminology + Simplified Chinese glossary;
3. semantic draft + XLIFF handoff;
4. DeepL import/adjudication/final catalogue;
5. official reference overlay + fauna evidence;
6. runtime integration/search/collation/speech;
7. layout/accessibility/release closure;
8. post-localization cleanup:
   - final locale-selector ordering;
   - XLIFF cleanup;
   - bundle/startup review.

Determine whether any stage can safely be combined because tooling is already generalized.

Do not combine stages merely for fewer briefs.

---

# 27. Complexity estimate

Estimate:

- engineering effort;
- editorial/translation effort;
- DeepL turnaround;
- fauna evidence;
- manual QA.

Do not present estimates as deadlines.

Explicitly identify the largest uncertainty.

Potential candidates include:

- Chinese typography/fallback;
- search policy;
- line-breaking behavior;
- fauna composition.

Use evidence to decide.

---

# 28. Stop conditions

Identify conditions that would justify pausing Simplified Chinese onboarding, such as:

- current font stack/fallback produces unusable CJK rendering;
- line breaking makes essential UI unusable;
- current accidental-English detector is not meaningful for Chinese;
- search requires a broader transliteration architecture to meet basic usability;
- browser mapping cannot distinguish Simplified/Traditional safely;
- fauna composition contradicts the current model;
- collation is unsuitable in actual consumers;
- semantic placeholders/technical tokens cannot be expressed naturally;
- tooling still contains hidden Latin-script assumptions requiring cross-locale redesign.

Do not invent blockers without evidence.

---

# 29. Final-program transfer notes

Because Simplified Chinese is the final V1 locale, end the audit with explicit notes for post-localization work:

- final locale-selector ordering;
- XLIFF working-file cleanup;
- bundle/startup composition review;
- cross-locale layout-capacity review;
- remaining global accessibility debt;
- Apple/WebKit compatibility;
- any localization tooling cleanup that should wait until onboarding is finished.

Do not implement any of these in the audit.

---

# Audit constraints

Do not:

- implement Simplified Chinese;
- edit locale metadata;
- create Chinese catalogues;
- create terminology values;
- create a Chinese glossary;
- generate committed overlays;
- activate runtime;
- alter search;
- alter collation;
- alter browser mapping;
- alter shortcut speech;
- change UI/CSS;
- change persistence/schema;
- move XLIFF files;
- optimize bundle;
- commit Bethesda corpora;
- commit or push.

Temporary ignored diagnostics may live under:

```text
.local-work/localization/zh-Hans-audit/
```

---

# Durable audit report

Create:

```text
docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md
```

Recommended structure:

1. Executive summary
2. Exact locale/token/encoding contract
3. Installed input coverage
4. Current pipeline readiness
5. Remaining hard-coded assumptions
6. Script/orthography observations
7. Chinese grammar/semantic risks
8. Plural-system analysis
9. Official terminology readiness
10. Tracker-owned terminology risks
11. Glossary strategy
12. Semantic review/XLIFF readiness
13. DeepL workflow
14. Reference-overlay readiness
15. Fauna composition risks/evidence plan
16. Search normalization
17. Simplified/Traditional boundary
18. Collation
19. Browser mapping
20. Locale selector label
21. Shortcut speech
22. Typography
23. Line breaking/wrapping
24. Punctuation/spacing policy
25. Layout/accessibility risks
26. Bundle impact
27. Automated test plan
28. Recommended implementation sequence
29. Complexity estimate
30. Stop conditions
31. Post-localization cleanup implications
32. Explicit user decisions/blockers before implementation

---

# Verification

At minimum:

```text
git diff --check
```

Report any read-only diagnostics run.

Confirm:

- only the audit report is tracked/changed;
- no implementation files changed;
- no Bethesda corpus was committed;
- no commit/push occurred.

---

# Completion response

Return:

1. branch;
2. files changed;
3. recommended tracker locale ID;
4. Bethesda token;
5. encoding;
6. official input coverage;
7. provenance closure readiness;
8. terminology closure readiness;
9. whether new localization architecture is required;
10. script/orthography findings;
11. Chinese grammar/semantic risks;
12. plural-system conclusion;
13. glossary strategy;
14. DeepL/XLIFF readiness;
15. reference-overlay readiness;
16. fauna evidence plan;
17. search-normalization recommendation;
18. Simplified/Traditional boundary;
19. collation result;
20. browser-mapping recommendation;
21. selector label;
22. shortcut-speech recommendation;
23. typography result;
24. line-breaking result;
25. punctuation/spacing policy;
26. layout/accessibility risks;
27. bundle impact;
28. implementation stages;
29. effort estimate;
30. stop conditions;
31. user decisions needed before implementation;
32. post-localization cleanup implications;
33. audit report path;
34. `git diff --check` result;
35. confirmation no implementation/commit/push occurred;
36. suggested documentation commit message.

Do not proceed into Simplified Chinese implementation without a separate brief.

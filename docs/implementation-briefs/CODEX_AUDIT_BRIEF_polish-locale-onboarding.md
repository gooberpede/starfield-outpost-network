# Codex Audit Brief — Polish Locale Onboarding Plan

## Objective

Perform a **read-only audit and implementation-planning pass** for onboarding Polish into the Starfield Outpost Tracker.

Target locale:

```text
Polish
Tracker locale: pl-PL
Bethesda token: pl
```

The recent localization inventory audit already established that the installed game ships a complete Polish text population, that `pl` decodes as strict UTF-8, and that the unchanged tracker provenance/terminology identities fully resolve.

This audit should therefore focus on **language-specific onboarding risk and implementation planning**, not re-proving basic availability from scratch.

This is **not** an implementation task.

Do not add the locale to runtime support, create the semantic catalogue, generate committed overlays, change browser mapping, alter search, modify CSS/UI geometry, or commit/push.

---

# Product goal

Determine the exact Polish onboarding plan using the now-proven localization pipeline established across:

```text
Japanese
French
German
Spanish (Spain)
Italian
Portuguese (Brazil)
```

Polish should be treated as a focused single-locale tranche.

The audit should identify:

- what can be reused unchanged;
- what needs bounded Polish-specific policy;
- what grammar/search/layout risks deserve explicit handling;
- whether any additional tooling generalization is needed before implementation;
- the recommended implementation sequence.

---

# Known facts already established

Treat these as starting assumptions to verify against current repository state, not hypotheses to rediscover unnecessarily:

```text
Tracker locale: pl-PL
Bethesda token: pl
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

- French/German generalized pipeline;
- Spanish/Italian/Portuguese locale-keyed review constraints;
- composed-fauna evidence records;
- runtime locale registry and browser resolver;
- search normalization policies;
- accessible shortcut speech;
- final locale closure tooling.

---

# 1. Confirm Polish metadata contract

Verify the intended contract:

```text
pl-PL -> pl -> utf-8 -> full catalogue
```

Recommend the exact metadata entry shape required later.

Do not edit metadata in this audit.

Confirm BCP-47 and `Intl` suitability for:

```text
pl-PL
```

including:

- number formatting;
- list formatting;
- plural rules;
- collation;
- `document.lang`.

---

# 2. Inspect remaining hard-coded locale assumptions

Audit current tooling for assumptions that still enumerate only existing supported/staged locales.

Identify every area Polish onboarding will need to extend, such as:

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

# 3. Polish grammar risk analysis

Polish is expected to be grammatically more demanding than the previous Latin-script locales.

Audit the tracker catalogue and identify where Polish may require special editorial care for:

- grammatical case;
- gender;
- number;
- adjective agreement;
- noun/adjective order;
- prepositions;
- verbal aspect;
- imperative labels;
- inflection around placeholders;
- count/plural-sensitive phrasing;
- sentence structure in parameterized messages.

Pay special attention to placeholders that may participate in inflected phrases, for example:

```text
{item}
{resource}
{product}
{outpost}
{skill}
{count}
{name}
{system}
{body}
```

The audit should identify keys where English word order or invariant noun insertion is likely to produce awkward Polish.

Do not translate the catalogue yet.

---

# 4. Plural-system review

Polish plural rules are materially more complex than the currently supported narrow:

```text
one / other
```

message syntax.

Audit the actual current English catalogue and determine whether existing messages that use:

```text
{count, plural, one {...} other {...}}
```

can remain semantically acceptable in Polish under the tracker’s deliberately narrow formatting system, or whether real Polish UI quality requires richer plural categories.

This is an important audit decision.

Report:

- every current pluralized semantic key;
- whether Polish can accept a grammatically neutral wording under current `one/other`;
- whether wording can be restructured to avoid category-sensitive noun inflection;
- whether current syntax is sufficient without degrading naturalness;
- whether richer ICU/FormatJS-style plural support would actually be required.

Do **not** expand the formatting engine in this audit.

Prefer wording strategies that preserve the current architecture where natural Polish permits them.

If richer plural support is truly necessary, explain the exact keys and why.

---

# 5. Official terminology readiness

Resolve the existing official terminology evidence read-only for `pl`.

Inspect representative values and determine:

- which official terms are likely direct tracker defaults;
- which need contextual handling;
- which are likely unsuitable as tracker-owned abstractions;
- capitalization behavior;
- compact-label suitability.

Pay particular attention to:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Planetary Body
Star System
X-Tech
X-Tech Power Core
Starfield
official skill names
```

Do not create terminology CSVs yet.

---

# 6. Tracker-owned terminology risks

Identify likely Polish translations/senses requiring strong glossary context for:

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

- semantic ambiguity;
- grammatical category;
- compact-label viability;
- likely case/number inflection;
- whether one invariant phrase is safe;
- whether key/context-scoped constraint strategies will be needed.

Do not finalize translations in the audit unless needed as illustrative evidence.

---

# 7. Glossary strategy

Recommend a Polish glossary artifact analogous to:

```text
docs/localization/POLISH-GLOSSARY.md
```

The glossary should later distinguish:

1. official Bethesda terminology;
2. tracker-owned preferred terminology;
3. context-sensitive concepts.

The audit should recommend which Polish concepts belong in each class and whether the existing generalized constraint model is expressive enough.

Do not create the glossary now.

---

# 8. Semantic review/XLIFF readiness

Assess whether the current review pipeline can support Polish without new architecture.

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

Pay special attention to whether the current accidental-English detector needs Polish-specific allowlists or whether cognates/shared technical vocabulary pose new false-positive risks.

Do not call DeepL.

---

# 9. DeepL workflow planning

Confirm whether DeepL supports Polish as a document-translation target for the existing XLIFF 1.2 flow.

If external verification is required, use current authoritative documentation.

Recommend one Polish XLIFF handoff only.

Preserve:

- source/context notes;
- protected tokens;
- glossary constraints;
- stable keys;
- source hashes;
- no default winner.

Do not perform the handoff.

---

# 10. Official reference-overlay readiness

Confirm that the generalized overlay tooling can produce:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

from unchanged provenance.

Expected closure:

```text
3,561 entities
4,818 qualified rows
0 unresolved
```

Do not generate committed outputs in the audit.

Identify any Polish-specific reference-name concerns such as:

- diacritics;
- punctuation;
- capitalization;
- abbreviations;
- declension appearing or not appearing in official standalone names.

---

# 11. Composed-fauna risk analysis

Audit the existing:

```text
922 fauna
2,179 components
```

composition model for Polish.

The current generic prediction is:

```text
prefix + species + diet
U+0020 separators
```

Assess likely Polish-specific risks:

- adjective agreement;
- case;
- number;
- inflection of species names;
- adjective/noun ordering;
- component mutation;
- punctuation/hyphenation.

Do not assume the simple model fails.

Recommend the same practical evidence policy:

- opportunistic in-game screenshots;
- no target hunting;
- no rigid quota;
- no Creation Kit requirement;
- contradictions reopen only the Polish composition rule.

The audit should identify what kinds of naturally encountered examples would be most informative.

---

# 12. Search normalization

Inspect actual Polish official-name corpus characteristics.

Determine which characters appear, likely including:

```text
ą ć ę ł ń ó ś ź ż
```

Assess whether current NFD combining-mark folding is sufficient.

Important:

```text
ł
```

does not decompose to `l` under ordinary NFD/NFKD behavior in the same way accents do.

The audit must explicitly determine:

- whether `ł -> l` search-only equivalence is desirable;
- whether `ó -> o`, `ą -> a`, `ę -> e`, etc. should use lower-ranked folding;
- behavior for `ź`/`ż`;
- collision risk;
- whether exact Polish spelling remains highest-ranked;
- punctuation/apostrophe/hyphen observations.

Do not implement search changes.

No fuzzy search.

No broad transliteration framework.

---

# 13. Collation

Verify:

```text
Intl.Collator('pl-PL', { sensitivity: 'base', numeric: true })
```

or the project’s current shared equivalent.

Test representative Polish ordering, particularly:

```text
a / ą
c / ć
l / ł
n / ń
o / ó
s / ś
z / ź / ż
```

Determine whether the shared collator is sufficient.

Do not invent manual sort tables unless actual ICU behavior is inadequate.

---

# 14. Browser-locale mapping

Recommend a conservative browser policy.

Likely policy:

```text
pl
pl-PL
descendants of pl-PL
    -> pl-PL
```

Consider whether explicit regional tags such as:

```text
pl-UA
pl-LT
```

should map automatically or continue to the next preference.

Given the current product philosophy, default toward not claiming unsupported regional variants.

Do not implement mapping.

---

# 15. Locale selector label

Recommend the self-identifying label.

Likely:

```text
Polski (Polska)
```

Verify natural convention and current selector style.

Do not decide final global selector ordering.

---

# 16. Accessible shortcut speech

Recommend Polish spoken forms for the existing shortcut-token policy:

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

These are screen-reader phrases, not visible chord text.

Do not implement them.

Flag any uncertainty that should be verified with Narrator later.

---

# 17. Typography

Assess whether the current Latin stack adequately covers Polish glyphs:

```text
Ą Ć Ę Ł Ń Ó Ś Ź Ż
ą ć ę ł ń ó ś ź ż
```

Check for likely fallback risks in:

- normal UI;
- headings;
- uppercase text;
- technical mono contexts.

Do not add fonts or CSS.

Preserve geometry freeze.

---

# 18. Layout risk

Polish may produce longer inflected phrases.

Identify likely high-risk surfaces:

- header;
- network/character controls;
- Navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo;
- Search;
- Validation;
- Help/Keyboard Shortcuts;
- About;
- status/import/export;
- Solar/Wind quality controls.

Do not propose geometry changes as part of onboarding.

Recommend the established QA matrix:

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

# 19. Accessibility risk

Assess whether Polish introduces any specific accessibility concerns beyond string length and pronunciation.

Consider:

- Narrator pronunciation of Polish shortcut speech;
- `document.lang=pl-PL`;
- accessible names containing inflected phrases;
- punctuation/diacritics;
- current global Narrator shortcut issues already in backlog.

Do not reopen global accessibility work.

---

# 20. Bundle impact

Estimate static bundle growth from:

- one semantic catalogue;
- one 3,561-name reference overlay.

Do not implement lazy loading.

Preserve the decision to perform the dedicated bundle review after Simplified Chinese is complete.

Only recommend pulling it forward if there is evidence of a concrete runtime problem.

---

# 21. Test strategy

Recommend minimum durable Polish test expansion for:

- locale metadata;
- UTF-8;
- terminology values;
- glossary constraints;
- semantic parity;
- plural handling;
- XLIFF round-trip;
- adjudication;
- accidental-English guard;
- overlay closure;
- fauna evidence;
- browser mapping;
- search normalization;
- collation;
- shortcut speech;
- formatter behavior;
- runtime switching;
- locale closure.

Prefer parameterized tests over copied suites.

---

# 22. Implementation sequence

Recommend a bounded Polish implementation sequence.

Use the proven pattern as baseline:

1. locale contracts/tooling extension;
2. official terminology + Polish glossary;
3. semantic draft + XLIFF handoff;
4. DeepL import/adjudication/final catalogue;
5. official reference overlay + fauna evidence;
6. runtime integration/search/collation/speech;
7. layout/accessibility/release closure.

Determine whether any stage can safely be combined because tooling is already generalized.

Do not combine stages merely for fewer briefs.

---

# 23. Complexity estimate

Estimate:

- engineering effort;
- editorial/translation effort;
- DeepL turnaround;
- fauna evidence;
- manual QA.

Do not present estimates as deadlines.

Explicitly identify the largest uncertainty.

---

# 24. Stop conditions

Identify conditions that would justify pausing Polish onboarding, such as:

- current plural model proves inadequate;
- search normalization requires broader transliteration architecture;
- fauna composition contradicts simple model;
- typography cannot render required glyphs reliably;
- tooling still contains hidden assumptions that require cross-locale redesign.

Do not invent blockers without evidence.

---

# 25. Simplified Chinese transfer lessons

End the audit with a short section recording which Polish lessons should transfer to the final Simplified Chinese tranche and which should not.

Do not conflate Polish and Chinese risks.

Examples of things **not** to assume transferable:

- Latin search normalization;
- Latin font stack;
- word-boundary assumptions;
- Polish grammar strategies;
- fauna composition behavior.

---

# Audit constraints

Do not:

- implement Polish;
- edit locale metadata;
- create Polish catalogues;
- create terminology values;
- create a Polish glossary;
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
.local-work/localization/pl-PL-audit/
```

---

# Durable audit report

Create:

```text
docs/audits/POLISH-LOCALE-ONBOARDING-PLAN.md
```

Recommended structure:

1. Executive summary
2. Exact locale/token/encoding contract
3. Installed input coverage
4. Current pipeline readiness
5. Remaining hard-coded assumptions
6. Polish grammar risks
7. Plural-system analysis
8. Official terminology readiness
9. Tracker-owned terminology risks
10. Glossary strategy
11. Semantic review/XLIFF readiness
12. DeepL workflow
13. Reference-overlay readiness
14. Fauna composition risks/evidence plan
15. Search normalization
16. Collation
17. Browser mapping
18. Locale selector label
19. Shortcut speech
20. Typography
21. Layout/accessibility risks
22. Bundle impact
23. Automated test plan
24. Recommended implementation sequence
25. Complexity estimate
26. Stop conditions
27. Transferable lessons for Simplified Chinese
28. Explicit user decisions/blockers before implementation

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
10. Polish grammar risks;
11. plural-system conclusion;
12. glossary strategy;
13. DeepL/XLIFF readiness;
14. reference-overlay readiness;
15. fauna evidence plan;
16. search-normalization recommendation;
17. collation result;
18. browser-mapping recommendation;
19. selector label;
20. shortcut-speech recommendation;
21. typography result;
22. layout/accessibility risks;
23. bundle impact;
24. implementation stages;
25. effort estimate;
26. stop conditions;
27. user decisions needed before implementation;
28. Simplified Chinese transfer notes;
29. audit report path;
30. `git diff --check` result;
31. confirmation no implementation/commit/push occurred;
32. suggested documentation commit message.

Do not proceed into Polish implementation without a separate brief.

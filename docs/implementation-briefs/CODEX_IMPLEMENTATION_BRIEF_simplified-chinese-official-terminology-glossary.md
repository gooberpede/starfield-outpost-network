# Codex Implementation Brief — Simplified Chinese Official Terminology and Glossary

## Objective

Implement the second Simplified Chinese onboarding batch by creating and reviewing:

1. the Simplified Chinese official-terminology values artifact; and
2. the Simplified Chinese glossary and locale-keyed review constraints.

Target locale:

```text
Tracker locale:   zh-Hans
Bethesda token:   zhhans
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This task establishes the approved Simplified Chinese terminology policy that later semantic translation/adjudication must follow.

Do not create the Simplified Chinese semantic draft, review CSV, XLIFF, final semantic catalogue, reference overlay, fauna evidence, runtime registration, browser mapping, search normalization, collation wiring, shortcut speech, or Chinese CSS/font-stack changes in this task.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Follow:

```text
docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md
```

and the already implemented staged Simplified Chinese locale contract.

The key product rule for this parcel is:

> Where Starfield already has an official Simplified Chinese term for the same concept, the tracker should use that term wherever the tracker context genuinely matches. Users should not encounter an unnecessary mismatch between the game and the tracker. Context-specific tracker wording may diverge only where the tracker meaning differs or ordinary Chinese grammar/editorial style makes literal reuse inappropriate.

This rule applies both to exact official terms and to contextual variants.

---

# Settled policy before implementation

Treat the following as already decided.

## Official Bethesda terminology

Use official Starfield Simplified Chinese wording as the default when:

- the tracker concept is the same;
- the grammatical/semantic role is compatible;
- the official wording is suitable for the tracker surface.

Do not replace official game terminology with an invented tracker synonym merely for style.

## Outpost

Preferred official default:

```text
哨站
```

## Cargo Link

Preferred official default:

```text
货运链接
```

## Inter-System Cargo Link

Preferred official default:

```text
跨星系货运链接
```

Allow contextual variants only if the tracker sentence genuinely requires different syntax while preserving the named Starfield construct.

## Biome

Preferred official default:

```text
生物群系
```

Allow contextual variants only where evidence or Chinese sentence structure warrants them.

## Planetary Body

Preferred official default:

```text
行星体
```

Use this as the primary tracker term unless evidence in this parcel exposes a genuine context mismatch.

## Star System

Preferred official default:

```text
星系
```

## X-Tech

Preferred official default:

```text
X技术
```

Preserve the Latin `X`.

## X-Tech Power Core

Preferred official default:

```text
X技术能量核心
```

## Official skills

Carry over official Bethesda Simplified Chinese skill names exactly when used as skill display names.

Expected evidence includes:

```text
哨站管理
哨站工程
行星居住
研究方法
特殊项目
```

Verify against generated evidence rather than copying blindly from this brief.

## Starfield game title

Use:

```text
星空
```

for ordinary localized references to the game itself where Bethesda's localized product title is appropriate.

Preserve:

```text
Starfield
```

where it is intentionally part of:

- the tracker/product's own fixed brand/title;
- a technical identifier;
- a URL/project identifier;
- attribution text where the English brand is intentional;
- another invariant token defined by the actual key/context.

This must be encoded as a **context-sensitive rule**, not one universal replacement.

## Planet

Do not pre-commit to one invariant translation.

Official evidence contains contextual forms including:

```text
行星
星球
```

The terminology/glossary parcel should determine:

- preferred standalone tracker form;
- contexts where either official form is appropriate;
- whether one should be avoided on technical selector surfaces.

If genuinely ambiguous, flag for user review rather than guessing.

---

# 1. Generate official Simplified Chinese terminology values

Create:

```text
reference-source/official-terminology-values-zh-Hans.csv
```

using the existing deterministic terminology pipeline and unchanged evidence identities.

Expected evidence closure:

```text
37 evidence rows
33 textual evidence rows
4 intended absences
0 unresolved
```

Requirements:

- preserve exact evidence identity/order;
- preserve source/plugin provenance;
- preserve intended absence rows;
- decode strictly as UTF-8;
- no manual re-keying of evidence IDs;
- no guessed strings where the official source has no value;
- no community/wiki substitutions;
- no normalization that changes Bethesda wording;
- preserve mixed Han/Latin text literally.

The values artifact is evidence, not yet the semantic catalogue.

---

# 2. Review and classify every terminology identity

For each of the existing 19 term IDs, classify its Simplified Chinese handling as one of:

```text
A. direct official standalone default
B. official term requiring context-sensitive handling
C. tracker-owned concept informed by official evidence
D. evidence-only / not suitable as tracker UI default
```

Record the rationale in the glossary.

Do not create extra classification categories unless a genuine need is demonstrated.

---

# 3. Official terms expected to be strong defaults

At minimum review and likely approve:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Biome
Planetary Body
Star System
X-Tech
X-Tech Power Core
official skill names
```

Expected evidence includes:

```text
Outpost                  -> 哨站
Cargo Link               -> 货运链接
Inter-System Cargo Link  -> 跨星系货运链接
Biome                    -> 生物群系
Planetary Body           -> 行星体
Star System              -> 星系
X-Tech                   -> X技术
X-Tech Power Core        -> X技术能量核心
```

Verify all values from the generated official evidence.

If generated values disagree materially with the onboarding audit, stop and report the discrepancy.

---

# 4. Official terms requiring contextual treatment

Review at least:

```text
Planet
Starfield
Inter-System
Moon
Orbital
Cargo Pad
```

and any other term whose evidence is contextual rather than a clean standalone label.

For each, record:

- official evidence forms;
- whether a safe standalone form exists;
- preferred tracker standalone form, if any;
- permitted contextual variants;
- excluded/misleading forms;
- compact-label guidance;
- source/evidence notes.

Do not mechanically promote contextual prose fragments into canonical tracker labels.

---

# 5. Create Simplified Chinese glossary

Create:

```text
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
```

Use the same three-class structure as previous locales.

## Class 1 — Official Bethesda terminology

Include direct/default official concepts such as:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Biome
Planetary Body
Star System
X-Tech
X-Tech Power Core
official skill names
```

For each entry record:

- English concept/key name;
- official Simplified Chinese evidence;
- recommended standalone tracker form;
- allowed contextual variants;
- excluded senses;
- compact-label guidance;
- source/evidence notes.

## Class 2 — Tracker-owned preferred terminology

Include at minimum:

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

For each entry propose:

- preferred Simplified Chinese term/phrase;
- intended tracker meaning;
- excluded meanings;
- state/action distinction where relevant;
- compact/full form if useful;
- keys/surfaces where guidance applies;
- whether contextual variants are expected.

These are tracker-owned proposals, not claims of Bethesda authorship.

Do not invent a tracker synonym where an official Bethesda term already expresses the same concept.

## Class 3 — Context-sensitive concepts

Include at minimum:

```text
Planet
Starfield game title versus tracker/technical brand token
Inter-System
Moon
Orbital
Present
Producing
Inputs
Reshuffle
Lock
Source
Destination
Inorganic
Organic
```

and any concept where one invariant Chinese string would misrepresent different key contexts.

---

# 6. Tracker-owned terminology review principles

The following semantic distinctions must be preserved.

## Planned Supply

Must mean:

- intended/virtual future supply;
- unresolved planned supply state;
- not completed delivery;
- not procurement order;
- not actual inventory.

## Present

Must mean that a resource/product is present/available at the relevant outpost/body.

Avoid wording meaning:

- "presenting" something;
- attendance/presence of a person;
- merely "current" if that obscures the matrix-state meaning.

## Producing

Must represent configured/active production state.

Keep distinct from:

```text
Manufacturing
```

which is the broader manufacturing/fabrication domain or configuration.

## Inputs

Must mean:

- recipe/material requirements;
- manufacturing inputs.

Do not default to a term whose primary reading is:

- form input;
- user text input;
- keyboard input.

## Logistics

Means the item is actually configured on routed cargo/export logistics.

Do not make it mean merely:

- transport in general;
- potentially exportable;
- available for logistics.

## Manufacturing

Means the fabrication/manufacturing area or configuration.

Do not collapse it into the state label:

```text
Producing
```

## Validation

Means application checking and the resulting issue set.

Avoid wording that primarily implies:

- legal validation;
- approval;
- authorization/permission.

Different wording may be appropriate between:

- the Validation panel/feature;
- prose describing issues/checking.

## Resource Matrix

Must mean the dense tracker resource-status table.

Do not translate it as a mathematical matrix if that sounds unnatural or misleading.

## Reshuffle

Means deliberate manual reordering mode.

It must not imply random shuffle.

## Lock

Means finish/prevent reordering or editing of ordering state.

It must not imply:

- account lock;
- security lock;
- permanent immutability.

## Network

Means the player's outpost network.

Do not default to a computer-network sense unless context demands it.

## Active Production

Means selected/configured current production.

It does not mean theoretical capability or measured throughput.

## Source / Destination

Use paired directional logistics endpoint terminology where relevant.

Do not conflate `Source` with evidentiary/source-document meanings on cargo/supply surfaces.

## Undo / Redo

Prefer established Chinese software UI command terminology.

## Inorganic / Organic

These are resource classes.

Do not introduce food-label/value-judgment meanings.

---

# 7. Planet terminology decision

Review all official Simplified Chinese evidence for:

```text
Planet
Planetary Body
Moon
```

Determine:

- preferred standalone tracker term for Planet;
- whether `行星` should be the technical selector/default;
- where `星球` is acceptable or preferable;
- whether compact UI context changes the choice;
- whether user-facing prose should permit both.

If one form is clearly preferable by surface, encode that in the glossary/constraints.

If genuinely ambiguous, mark:

```text
USER REVIEW REQUIRED
```

and do not pretend certainty.

`Planetary Body` remains expected to use:

```text
行星体
```

unless evidence contradicts that policy.

---

# 8. Starfield title policy

The glossary must explicitly distinguish two contexts.

## Localized game reference

Use:

```text
星空
```

when ordinary localized UI refers to Bethesda's game title.

## Invariant tracker/product/technical context

Preserve:

```text
Starfield
```

where the actual key/context intentionally uses the English brand token.

Examples may include:

- tracker product title;
- project/site title;
- attribution;
- URLs;
- technical references;
- filenames/identifiers.

Do not convert all `Starfield` occurrences mechanically.

Do not force `Starfield` everywhere either.

The later semantic review constraints should be key/context aware.

---

# 9. Chinese punctuation and spacing policy

Record editorial policy for tracker-authored prose.

Default Chinese prose should use normal Simplified Chinese punctuation:

```text
，
。
：
；
```

and Chinese quotation/bracket conventions where natural.

Do not insert spaces between ordinary Chinese lexical items.

Normally do not add spaces between Chinese and short Latin technical tokens unless:

- readability requires it;
- a product name convention requires it;
- literal technical syntax requires it.

Preserve exactly where technical:

```text
JSON
FormID
X-Tech
HTTP/HTTPS
file extensions
key names
placeholders
IDs
code-like punctuation
```

Official Bethesda reference names remain literal and must not be mechanically converted to Chinese punctuation/spacing style.

---

# 10. Mixed Han/Latin terminology

The official corpus contains mixed forms such as:

```text
X技术
```

and many official names with:

- Latin letters;
- Roman numerals;
- ASCII spaces;
- ASCII hyphens;
- brackets;
- abbreviations.

The glossary must distinguish:

```text
tracker-authored prose policy
```

from:

```text
official reference-name preservation
```

Do not "clean up" official mixed-script data merely because it looks inconsistent with prose style.

---

# 11. Build Simplified Chinese review constraints

Populate the Simplified Chinese locale-keyed constraint data used by the review pipeline.

Use the existing constraint types only:

```text
phrase
key-scoped
semantic-concept
approved variants
```

Do not add:

- segmentation machinery;
- transliteration constraints;
- Chinese grammar generation;
- regex-heavy style enforcement.

The goal is useful review guidance and fail-closed stale-key detection.

---

# 12. Constraint strategy

Use:

## Phrase constraints

Only where the Simplified Chinese value genuinely should remain invariant in the relevant context.

Examples may include:

```text
哨站
货运链接
跨星系货运链接
行星体
星系
X技术
X技术能量核心
```

where appropriate.

## Key-scoped constraints

Use for exact surface-specific labels such as:

- Resource Matrix headings;
- Planned Supply heading;
- compact/full Cargo Link terms;
- selector labels;
- validation headings;
- specific buttons/actions.

## Semantic-concept constraints

Use where wording can vary by context but meaning must remain stable.

Examples:

```text
Present
Producing
Inputs
Reshuffle
Lock
Source
Destination
Starfield title/brand
Planet
```

## Variant lists

Keep them finite and evidence-backed.

Do not invent broad synonym lists.

---

# 13. Accidental-English allowlist review

Review the currently approved invariant handling for Simplified Chinese.

Shared handling may legitimately allow:

```text
JSON
FormID
Starfield
X-Tech
HTTP
HTTPS
file extensions
shortcut key names
IDs
placeholders
```

Do not automatically whitelist ordinary English words.

If terminology/glossary work produces a real false positive, add only the narrowest justified exception.

Remember that the new Han-adjacent ASCII-run detector must still catch ordinary English residue such as:

```text
资源Validation状态
```

---

# 14. Whole-English-fallback guard

Preserve the staged Simplified Chinese prose-presence quality guard.

Terminology/glossary constraints must not make ordinary complete English fallback acceptable.

Do not require Han characters for intentionally invariant technical-only keys where the source itself is appropriately invariant.

Keep the policy context-sensitive.

---

# 15. Plural-language guidance

Do not expand plural syntax.

`Intl.PluralRules('zh-Hans')` uses only:

```text
other
```

for visible Chinese behavior.

The four existing pluralized keys should later retain the structural:

```text
one / other
```

catalogue form while using natural Chinese wording, likely identical visible branches.

Keys:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

The glossary may suggest appropriate classifiers such as:

```text
条
项
个
```

only where semantically natural.

Do not finalize complete semantic messages in this parcel unless needed as terminology examples.

---

# 16. Official source oddities

Preserve official evidence even when it appears unusual.

The audit observed mixed/internal-looking values and forms such as:

```text
_RL082Orbital
```

as well as mixed Han/Latin/numbered names.

Do not "correct" them during terminology extraction.

If a value looks suspicious:

1. preserve raw official evidence;
2. classify whether it is suitable as tracker UI;
3. use provenance/context review;
4. flag real source defects rather than silently rewriting.

---

# 17. Capitalization policy

Chinese itself has no case distinction.

Record guidance for embedded Latin tokens:

- preserve official/technical capitalization;
- do not uppercase/lowercase Latin substrings merely to imitate English heading style;
- do not apply English title-case assumptions to Chinese UI.

Actual typography/text-transform behavior remains a later runtime/CSS stage.

---

# 18. Compact labels

For terms likely to appear in narrow controls or matrix headings, record whether:

- the official/full term is already compact enough;
- a context-safe shorter form exists;
- shortening would change meaning.

Do not invent abbreviations merely to fit current geometry.

Do not modify UI dimensions.

Any later clipping/layout issue belongs to runtime/closure QA.

---

# 19. Terminology verification

Add/extend tests for Simplified Chinese terminology values.

At minimum verify:

- 37 evidence rows;
- 33 textual values;
- 4 intended absences;
- zero unresolved rows;
- deterministic evidence order;
- strict UTF-8;
- expected direct defaults;
- exact skill names;
- Planetary Body policy;
- Starfield localized-title versus invariant-brand distinction;
- X-Tech mixed-script preservation.

Do not make tests brittle to harmless context-sensitive variants.

---

# 20. Glossary/constraint verification

Add/extend tests proving:

- Simplified Chinese constraints are no longer empty;
- stale keys fail closed;
- official terms route to the intended constraint class;
- tracker-owned concepts receive Chinese semantic guidance;
- context-sensitive terms permit approved variants;
- `星空` versus `Starfield` is key/context aware;
- ordinary English residue remains rejected;
- technical Latin tokens remain allowed where intended;
- constraint output is deterministic.

Do not test prose style by exact whole-sentence equality.

---

# 21. No semantic draft yet

Do not create:

```text
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
docs/localization/zh-Hans-deepl.xliff
src/localization/locales/zh-Hans.ts
```

Terminology/glossary/constraints must be approved first.

---

# 22. No DeepL protocol test yet unless tooling requires terminology freeze

The audit recommended a small disposable XLIFF round trip before the real handoff.

Do **not** perform that test in this terminology parcel.

It belongs immediately before or within the semantic-draft/XLIFF handoff stage, after glossary and constraints are frozen.

Do not call DeepL here.

---

# 23. No reference overlay yet

Do not generate:

```text
src/localization/generated/zh-Hans-reference-names.ts
reference-source/localized-reference-names-zh-Hans-manifest.json
```

That remains a later stage.

---

# 24. No fauna evidence yet

Do not create:

```text
reference-source/localized-fauna-evidence-zh-Hans.json
```

Fauna separator evidence remains a later first-party screenshot task.

---

# 25. No typography/CSS changes

Do not add the later approved Chinese system-font stack yet.

Do not modify:

```text
font-family
letter-spacing
line-height
text-transform
line-break
word-break
white-space
```

or geometry.

This task is terminology/glossary/review constraints only.

---

# 26. Runtime remains inactive

Hard requirement:

```text
runtimeAvailable: false
```

must remain unchanged.

Simplified Chinese must remain absent from:

- runtime selector;
- semantic registry;
- browser mapping;
- search;
- collation consumers;
- shortcut speech;
- `document.lang`;
- Chinese font CSS.

---

# 27. Durable documentation

Create:

```text
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
```

plus the terminology values CSV and necessary implementation/test changes.

Do not add a final Chinese Locale Profile yet.

Do not mark Simplified Chinese Supported.

Do not perform:

- final selector ordering;
- XLIFF cleanup;
- post-localization bundle review.

---

# 28. Tests and verification

Run at minimum:

```text
npm test
npm run test:components
npm run localization:terminology:verify
npm run localization:provenance:test
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Run any focused terminology/glossary/review-package commands already established.

Expected:

- all existing locales remain unchanged;
- Simplified Chinese terminology resolves exactly;
- Simplified Chinese constraints are valid/deterministic;
- accidental-English hardening remains correct;
- runtime remains inactive;
- no semantic draft artifacts are required yet.

---

# 29. Scope discipline

Expected tracked changes may include:

```text
reference-source/official-terminology-values-zh-Hans.csv
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
src/localization/reviewPackage.ts
terminology tooling/tests
review constraint tests
```

Potentially small helper changes if genuinely needed.

Unexpected changes to:

```text
src/localization/locales/*
src/localization/generated/*
src/ui/*
CSS
runtime registry
browser resolver
search
persistence/domain code
```

should be treated as scope creep.

---

# 30. Completion criteria

This parcel is complete when:

- official Simplified Chinese terminology values exist and fully close;
- all 19 term IDs have an explicit A/B/C/D classification;
- `SIMPLIFIED-CHINESE-GLOSSARY.md` exists with the three agreed classes;
- official Starfield terminology is carried over wherever tracker context matches;
- Planet terminology is responsibly settled or explicitly flagged for user review;
- `行星体`, `星系`, `X技术`, and `X技术能量核心` are correctly handled;
- `星空` versus invariant `Starfield` contexts are explicitly documented;
- tracker-owned terminology proposals are recorded with excluded senses;
- Chinese punctuation/spacing policy is documented;
- mixed Han/Latin policy is documented;
- Simplified Chinese review constraints are populated and fail closed;
- runtime remains inactive;
- no semantic translation artifacts are created prematurely.

---

# Completion response

Return:

1. branch;
2. files changed;
3. terminology artifact path;
4. evidence-row closure;
5. list of all 19 term IDs and A/B/C/D classification;
6. direct official defaults approved;
7. context-sensitive official terms;
8. Planet recommendation and rationale;
9. Planetary Body final policy;
10. Star System final policy;
11. Starfield `星空` versus `Starfield` policy;
12. X-Tech policy;
13. tracker-owned terminology proposals;
14. ambiguous tracker-owned terms requiring user review, if any;
15. glossary path;
16. constraint types used;
17. Chinese accidental-English allowlist result;
18. whole-English-fallback guard result;
19. punctuation/spacing policy;
20. mixed Han/Latin policy;
21. capitalization policy;
22. compact-label guidance;
23. plural guidance;
24. terminology verification results;
25. constraint verification results;
26. full automated test results;
27. `git diff --check` result;
28. confirmation runtime remains inactive;
29. confirmation no semantic draft/XLIFF/catalogue was created;
30. confirmation no reference overlay/fauna evidence was created;
31. confirmation no CSS/font changes occurred;
32. deviations from brief;
33. unresolved user decisions, if any;
34. recommended next stage;
35. suggested commit message;
36. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.

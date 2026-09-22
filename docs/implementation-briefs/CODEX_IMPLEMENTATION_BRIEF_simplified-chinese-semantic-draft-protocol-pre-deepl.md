# Codex Implementation Brief — Simplified Chinese Semantic Draft, Disposable XLIFF Protocol Check, and Pre-DeepL Handoff

## Objective

Implement the next Simplified Chinese onboarding batch by:

1. performing a **small disposable XLIFF 1.2 protocol round-trip check** for Simplified Chinese;
2. applying only any narrow importer compatibility fix that the probe proves necessary;
3. creating the complete independent Simplified Chinese semantic draft;
4. generating the deterministic review CSV;
5. generating one frozen real Simplified Chinese XLIFF 1.2 handoff for later DeepL translation.

Target locale:

```text
Tracker locale:   zh-Hans
Bethesda token:   zhhans
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This parcel must stop **before** the real 414-key XLIFF is sent to DeepL.

The real handoff must come back for review first.

Do not adjudicate against DeepL yet.

Do not create the final runtime catalogue.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Use the settled Simplified Chinese policy from:

```text
docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
reference-source/official-terminology-values-zh-Hans.csv
```

and the staged Simplified Chinese locale/tooling already committed.

Key product rule:

> Reuse official Starfield Simplified Chinese terminology when concept and context match. Use natural Chinese tracker wording where the context differs. Preserve official reference-name data literally. Keep technical/invariant Latin tokens only where they are genuinely intended.

DeepL is comparative evidence only.

The independent Codex draft must be genuinely independent.

---

# Hard checkpoints

This parcel has two checkpoints.

## Checkpoint A — disposable protocol probe

Before freezing the real handoff, verify that DeepL can round-trip the repository's XLIFF 1.2 structure for Simplified Chinese without breaking the assumptions the importer relies on.

The protocol probe is disposable and must not become translation evidence.

## Checkpoint B — pre-DeepL review

The parcel must end with:

```text
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
docs/localization/zh-Hans-deepl.xliff
```

The user will provide the diff and frozen real XLIFF for review **before** uploading that real file to DeepL.

Do not proceed beyond that point.

---

# 1. Build a disposable synthetic XLIFF probe

Create temporary ignored files under:

```text
.local-work/localization/zh-Hans-protocol/
```

Do not commit them.

Use a tiny XLIFF 1.2 document shaped like the real handoff, with approximately 5–8 synthetic trans-units.

The probe should exercise:

1. plain prose;
2. a simple placeholder such as `{item}`;
3. the current split-`<ph>` representation of one `one / other` plural expression;
4. a protected mixed-script token such as `X-Tech`;
5. a Chinese target expected to preserve `JSON`;
6. context/terminology notes and source-hash props;
7. one ordinary technical placeholder/protected-token combination.

Use synthetic source text where possible.

Do not use the probe translations as semantic evidence later.

---

# 2. Run one disposable DeepL round trip

Use the project's normal user-mediated DeepL workflow.

If Codex cannot directly call DeepL in its environment, generate the probe XLIFF and stop at the user handoff point for that probe.

If the user can supply the returned probe within the same task context, continue the analysis.

The probe must answer:

- Does DeepL accept `target-language="zh-Hans"`?
- What target-language tag/casing does it return?
- Are stable `id` / `resname` values preserved?
- Is source text preserved?
- Are `<ph>` nodes preserved structurally?
- Are simple placeholder names preserved?
- Are plural wrapper `<ph>` fragments preserved or translated/mangled?
- Are protected tokens such as `X-Tech` and `JSON` preserved?
- Are context notes and props retained sufficiently for importer validation?
- Does DeepL reorder units?

Record exact evidence.

Do not infer behavior from documentation alone if a returned probe exists.

---

# 3. Narrow locale-tag compatibility rule

Pre-authorized narrow compatibility fix:

If DeepL returns a target-language tag that is **BCP-47 canonical-equivalent** to the expected tag, update the importer to compare canonicalized tags rather than raw string casing/spelling.

Use:

```ts
Intl.getCanonicalLocales(...)
```

or the repository's equivalent canonicalization boundary.

Examples of acceptable differences are only those that canonicalize to the same tag.

Do **not** treat these as equivalent to `zh-Hans` merely because they are related:

```text
zh
zh-CN
zh-SG
zh-Hant
zh-TW
zh-HK
zh-MO
```

unless BCP-47 canonicalization itself proves exact equivalence, which it generally will not.

Do not weaken:

- source-language validation;
- source hashes;
- stable keys;
- placeholder validation;
- protected-token validation;
- plural validation.

If no locale-tag adjustment is needed, do not change importer behavior.

---

# 4. Protocol stop conditions

Stop before the real handoff if the probe demonstrates that DeepL:

- drops or rewrites stable unit IDs;
- rewrites English source text;
- drops source hashes/context props needed by the importer;
- irreparably destroys `<ph>` placeholders;
- cannot preserve simple placeholders;
- rewrites protected tokens in a way the importer cannot classify as invalid evidence;
- cannot round-trip XLIFF 1.2 reliably.

Do not redesign the handoff format silently.

Report the failure for review.

A machine translation changing ordinary target prose is expected and not a protocol failure.

---

# 5. Create the independent Simplified Chinese semantic draft

After the protocol check is satisfactory, create:

```text
src/localization/reviewDrafts/zh-Hans.ts
```

Requirements:

- exact key parity with current `en-US`;
- exact placeholder-name parity;
- no empty values;
- no accidental English residue outside approved technical/invariant tokens;
- no complete English fallback on ordinary prose;
- no copying from DeepL;
- use the approved glossary and official terminology;
- natural Simplified Chinese punctuation and spacing for tracker-authored prose;
- preserve technical syntax literally;
- preserve semantic distinctions in tracker-owned terminology;
- do not apply English title-case conventions.

The draft is an independent editorial candidate, not the final catalogue.

---

# 6. Official terminology conformance

Where the glossary marks an official term as the direct/default tracker term, use it unless a specific sentence context justifies a documented variant.

At minimum respect:

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

and all five official skill names.

For Planet:

- use `行星` for technical/selectors/compact surfaces unless the approved context calls for `星球`;
- do not vary arbitrarily.

For Starfield:

- use `星空` for ordinary localized references to Bethesda's game;
- preserve `Starfield` in the approved tracker/product/technical contexts.

---

# 7. Tracker-owned terminology conformance

Apply the approved glossary carefully for:

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

Preserve the established semantic distinctions.

Do not choose a shorter synonym merely because Chinese permits one if it changes the tracker concept.

---

# 8. Chinese punctuation and spacing

Tracker-authored prose should follow the approved Simplified Chinese style:

- use `，` `。` `：` `；` where natural;
- use Chinese quotation/bracket conventions where appropriate;
- do not insert English-style spaces between ordinary Chinese words;
- normally do not add spaces around short Latin technical tokens unless readability/product syntax requires it.

Preserve exact technical syntax such as:

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

Do not mechanically rewrite official Bethesda reference names.

---

# 9. Mixed Han/Latin quality checks

The Chinese draft must pass the hardened accidental-English quality gate.

Specifically verify:

- English residue with spaces fails;
- English residue directly adjacent to Han fails;
- a complete English fallback fails;
- approved technical mixed-script text passes;
- ordinary Chinese prose contains localized content;
- invariant-only technical keys remain permitted where appropriate.

Do not broaden the Chinese allowlist unless an actual false positive appears.

Any new exemption must be reported with rationale.

---

# 10. Four plural keys

The current catalogue syntax remains:

```text
one / other
```

The four pluralized keys are:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

Simplified Chinese uses only `other` at runtime, but both structural branches must remain valid for shared tooling.

Use natural Chinese wording, likely identical visible text in both branches.

The glossary may guide appropriate classifiers such as:

```text
条
项
个
```

but the final wording should be chosen per message context.

Do not introduce:

```text
few
many
```

or any new formatter architecture.

Test representative counts:

```text
0
1
2
10
```

The visible Chinese should remain natural for all.

---

# 11. Placeholder safety

Preserve all required placeholder names exactly.

High-risk examples include:

```text
{item}
{resource}
{product}
{outpost}
{system}
{body}
{skill}
{name}
{previousName}
{count}
{itemList}
{contents}
{destination}
```

Do not translate placeholder identifiers.

Do not add Chinese classifiers inside placeholder names.

Do not mutate protected tokens.

If natural Chinese requires classifiers or explanatory nouns, place them outside the placeholder.

---

# 12. Review high-risk surfaces

Perform a bounded semantic review of keys involving:

```text
Outpost / Cargo Link / Inter-System
Planned Supply
Present / Producing / Inputs / Logistics
Manufacturing
Validation
Resource Matrix
Reshuffle / Lock
Search
import/export
history
skills
X-Tech
Planet / Planetary Body / Star System
Help / shortcuts
status/live-region messages
Starfield / 星空 references
```

Look for:

- literal English syntax;
- mistranslated state/action distinction;
- incorrect official terminology;
- accidental English residue;
- poor punctuation;
- unnecessary spaces;
- over-short compact labels;
- placeholder grammar problems;
- inappropriate use of `Starfield` versus `星空`.

Do not change UI geometry.

---

# 13. Create deterministic review CSV

Generate:

```text
docs/localization/zh-Hans-review.csv
```

through the existing review-package pipeline.

It should preserve the established fields for:

- stable key;
- English source;
- Simplified Chinese Codex draft;
- context;
- risk;
- placeholders/parameters;
- protected tokens;
- terminology/glossary constraints;
- source hash;
- other review metadata.

Do not hand-edit the generated CSV unless the existing workflow explicitly expects regeneration from source artifacts.

---

# 14. Create one real XLIFF 1.2 handoff

Generate:

```text
docs/localization/zh-Hans-deepl.xliff
```

Requirements:

- XLIFF 1.2;
- exact current semantic key set;
- one trans-unit per semantic key;
- stable IDs/resnames;
- unchanged English source;
- target-language `zh-Hans`;
- blank targets for independent DeepL translation;
- source hashes/context/constraints preserved;
- placeholders/protected tokens represented with the established `<ph>` structure;
- deterministic ordering.

Do not split the catalogue into multiple XLIFFs.

---

# 15. Real handoff must remain independent

The real XLIFF must not contain the Codex Simplified Chinese draft as target text.

The Codex draft remains in:

```text
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
```

The DeepL handoff should retain blank targets so DeepL produces an independent translation.

Do not bias the handoff toward Codex wording.

---

# 16. Pre-DeepL review checkpoint

The completion response must explicitly state that:

```text
docs/localization/zh-Hans-deepl.xliff
```

is ready for review but must **not yet be uploaded to DeepL**.

Expected workflow:

1. protocol probe completed satisfactorily;
2. Codex independent Chinese draft created;
3. real review CSV/XLIFF generated;
4. user provides diff/XLIFF for review;
5. only after approval does the user upload the exact frozen XLIFF to DeepL;
6. returned XLIFF is handled in a later neutral-adjudication parcel.

Do not bypass this checkpoint.

---

# 17. No final semantic catalogue

Do not create:

```text
src/localization/locales/zh-Hans.ts
```

The final catalogue belongs to the post-DeepL adjudication stage.

---

# 18. No runtime activation

Hard requirement:

```text
runtimeAvailable: false
```

must remain unchanged.

Simplified Chinese must remain absent from:

- selector;
- runtime semantic registry;
- browser mapping;
- search;
- runtime collation;
- shortcut speech;
- `document.lang`;
- Chinese font CSS.

---

# 19. No reference overlay/fauna work

Do not create:

```text
src/localization/generated/zh-Hans-reference-names.ts
reference-source/localized-reference-names-zh-Hans-manifest.json
reference-source/localized-fauna-evidence-zh-Hans.json
```

Those remain later stages.

---

# 20. No CSS/font changes

Do not add the approved Chinese system-font stack yet.

Do not modify:

```text
font-family
letter-spacing
line-height
text-transform
word-break
overflow-wrap
line-break
white-space
```

or geometry.

Typography policy is implemented during runtime integration after real Chinese content exists.

---

# 21. Tests

Add/extend tests for:

- disposable probe XLIFF generation shape;
- target-language canonicalization if the probe requires it;
- source-language/version validation remains strict;
- stable key/source/hash preservation;
- `<ph>` placeholder preservation;
- protected tokens;
- Chinese draft key parity;
- placeholder parity;
- Chinese prose-presence guard;
- accidental-English detection;
- Han-adjacent residue;
- plural syntax;
- glossary/constraint coverage;
- deterministic review CSV;
- deterministic real XLIFF;
- XLIFF locale identity;
- one trans-unit per semantic key;
- blank real targets;
- no final catalogue creation;
- runtime remains inactive.

Do not weaken existing DeepL-invalid evidence behavior.

---

# 22. Verification

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

Run focused review/XLIFF/protocol tests as applicable.

Expected:

- existing locales unchanged;
- Chinese draft passes all quality gates;
- review CSV and XLIFF generate deterministically;
- protocol fix, if any, is narrow and evidenced;
- runtime remains inactive;
- no later-stage artifacts appear.

---

# 23. Scope discipline

Expected tracked changes may include:

```text
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
docs/localization/zh-Hans-deepl.xliff
scripts/localization/review-routing.ts
review/XLIFF tooling tests
possibly a narrow XLIFF locale-tag canonicalization fix if probe evidence requires it
```

Disposable probe artifacts must remain under:

```text
.local-work/localization/zh-Hans-protocol/
```

Unexpected changes to:

```text
src/localization/locales/*
src/localization/generated/*
src/ui/*
CSS
runtime locale registry
browser resolver
search
persistence/domain code
```

should be treated as scope creep.

---

# 24. Stop conditions

Stop before the real handoff if:

- the protocol probe reveals incompatible DeepL XLIFF behavior;
- the independent Chinese draft cannot pass the hardened English-residue/prose-presence guard without broad allowlisting;
- a required semantic key cannot be translated naturally under existing placeholder/plural contracts;
- glossary constraints prove insufficient;
- the handoff cannot preserve stable IDs/source hashes/placeholders;
- a new product terminology decision is required.

Do not invent policy merely to complete the parcel.

---

# 25. Completion criteria

This parcel is complete when:

- the disposable protocol probe has been completed and documented;
- any importer fix is narrow and evidence-based;
- a full independent Simplified Chinese draft exists;
- all current semantic keys are present;
- placeholder/protected-token parity passes;
- Chinese prose/English-residue quality gates pass;
- plural keys are natural under the existing syntax;
- approved terminology/glossary policy is applied;
- deterministic review CSV exists;
- deterministic real XLIFF 1.2 handoff exists;
- real XLIFF targets are blank;
- no final Chinese catalogue exists;
- runtime remains inactive;
- the real XLIFF has **not** been sent to DeepL.

---

# Completion response

Return:

1. branch;
2. files changed;
3. disposable protocol probe path(s);
4. whether DeepL accepted `zh-Hans`;
5. returned target-language tag;
6. locale-tag canonicalization result;
7. stable ID preservation result;
8. source preservation result;
9. `<ph>` preservation result;
10. plural-wrapper preservation result;
11. protected-token preservation result;
12. note/prop preservation result;
13. importer change made, if any;
14. Polish/other-locale importer regression result;
15. Simplified Chinese draft path;
16. semantic key count;
17. exact key/placeholder parity result;
18. accidental-English detector result;
19. Han-adjacent residue result;
20. whole-English-fallback guard result;
21. new Chinese allowlist additions, if any;
22. four plural-key final draft wordings;
23. plural validation result;
24. official terminology conformance;
25. tracker-owned terminology conformance;
26. Starfield/星空 handling summary;
27. high-risk keys manually corrected during drafting;
28. review CSV path;
29. review row count;
30. real XLIFF path;
31. XLIFF version;
32. trans-unit count;
33. blank-target confirmation;
34. source-hash/constraint validation result;
35. protected-token validation result;
36. deterministic-generation result;
37. confirmation no final `zh-Hans` catalogue exists;
38. confirmation no reference overlay/fauna evidence exists;
39. confirmation runtime remains inactive;
40. automated verification results;
41. `git diff --check` result;
42. deviations from brief;
43. explicit instruction that the real XLIFF is ready for review but **must not yet be uploaded to DeepL**;
44. recommended next action after review approval;
45. suggested commit message;
46. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.

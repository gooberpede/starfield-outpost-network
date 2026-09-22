# Codex Implementation Brief — Simplified Chinese DeepL Import, Neutral Adjudication, and Final Catalogue

## Objective

Import the user-supplied Simplified Chinese XLIFF returned from DeepL, validate it against the frozen pre-DeepL handoff, neutrally adjudicate every semantic row against:

- the English source;
- the independent Codex Simplified Chinese draft;
- the returned DeepL translation;
- the approved Simplified Chinese glossary;
- official Bethesda terminology evidence;
- key/context/risk metadata;
- placeholder and protected-token requirements;

and generate the final approved Simplified Chinese semantic catalogue.

Target locale:

```text
Tracker locale:   zh-Hans
Bethesda token:   zhhans
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This parcel must **not** activate Simplified Chinese at runtime.

Do not generate the Simplified Chinese reference-name overlay or fauna evidence in this task.

Do not add Chinese font/CSS runtime policy yet.

Do not commit or push unless explicitly instructed.

---

# Returned DeepL input

Use the user-supplied returned XLIFF corresponding to:

```text
docs/localization/zh-Hans-deepl.xliff
```

The frozen real pre-DeepL handoff had SHA-256:

```text
BC518F69FAAF9D57FF09181E3AC5BCAF9FD71E6D5B2051148F99095C20F075B9
```

The returned file supplied by the user is:

```text
zh-Hans-deepl zh-Hans.xliff
```

Copy/use it through the repository's established ignored translation-working location as appropriate.

Do not overwrite the frozen source handoff.

Do not treat the returned target text as authoritative merely because it came from DeepL.

---

# Pre-import review findings

The returned XLIFF has already received an independent structural/manual pre-review.

Observed:

```text
XLIFF version:          1.2
source-language:        en-US
target-language:        zh-Hans
trans-units:            414
unique IDs/resnames:    414
non-empty targets:      414
source-hash metadata:   present on all rows
source hashes correct:  414 / 414
terminology-note rows:  277
```

No new product-policy decision is required before import/adjudication.

However, the returned DeepL text contains expected machine-translation failures that **must be preserved and adjudicated rather than silently accepted**.

The repository importer is authoritative for the exact final counts.

---

# 1. Expected structural DeepL failures

A bounded independent scan of the returned file found approximately:

```text
46 rows with at least one structural token failure
```

Breakdown from the pre-review:

```text
PLACEHOLDERS:     45 rows
PLURAL_SYNTAX:     4 rows
PROTECTED_TOKEN:   1 row
```

The four plural rows overlap the placeholder count, so these numbers are not additive.

Observed combinations were approximately:

```text
41 PLACEHOLDERS only
4  PLURAL_SYNTAX + PLACEHOLDERS
1  PROTECTED_TOKEN only
```

Do not hard-code these counts unless the repository importer independently produces them.

Use the project's actual validator result in the completion report.

---

# 2. Placeholder corruption

DeepL translated or renamed many placeholder identifiers.

Examples observed include transformations conceptually like:

```text
{outpost}     -> {前哨站}
{pad}         -> {停机坪}
{contents}    -> {内容}
{destination} -> {目的地}
```

and similar Chinese substitutions.

These are structurally invalid.

Do not silently translate them back and pretend DeepL supplied a valid candidate.

Preserve the raw DeepL candidate as evidence and use the existing invalid-evidence/adjudication pathway.

---

# 3. Plural syntax corruption

All four structurally pluralized keys were observed to have their formatter syntax translated/corrupted by DeepL.

The source contract is:

```text
{count, plural, one {...} other {...}}
```

DeepL translated structural tokens such as:

```text
plural
one
other
```

and/or introduced Chinese placeholder-like branch content that is not valid application syntax.

Treat these rows as structurally invalid DeepL evidence.

Do not add Chinese-specific plural syntax.

The final catalogue must retain the existing supported:

```text
one / other
```

format.

Simplified Chinese visible wording may remain identical in both branches.

---

# 4. Protected-token corruption

The pre-review found at least one protected-token failure.

Notably, the attribution source:

```text
Cosmos icons created by gravisio - Flaticon
```

is a protected token/string under current review-package policy, while DeepL translated part of it.

The importer is authoritative for the exact protected-token failures.

Do not weaken protected-token rules to accommodate machine output.

---

# 5. Chinese quality-gate failures

The returned DeepL XLIFF also contains machine output that may be structurally valid but fails the Chinese editorial quality guard.

The pre-review found three clear accidental-English residue examples:

```text
shortcuts.action.focusSearchResults
-> Focus 搜索结果

shortcuts.group.cargoLinks
-> Cargo 链接

status.import.invalidCargoPad
-> 所选文件包含一个无效的 cargo 链接。
```

These are not structural placeholder/token failures, but they must not be approved unchanged as final Simplified Chinese text.

Use the hardened Chinese quality validation during adjudication/final-catalogue approval.

Important lifecycle rule:

- DeepL candidates with Chinese quality defects remain importable comparative evidence;
- Codex/final translations must fail closed if those defects remain;
- do not turn these quality defects into whole-file XLIFF import failures.

Do not broaden the Chinese ordinary-English allowlist to accept these examples.

---

# 6. Terminology drift

DeepL frequently ignored or replaced approved Starfield/tracker terminology despite the embedded terminology notes.

Examples observed in the returned file include:

## Starfield title and Outpost

For the ordinary localized game reference:

```text
about.description
```

DeepL produced wording using:

```text
《星域》
前哨站
```

instead of approved:

```text
《星空》
哨站
```

## Cargo Link

DeepL uses variants including:

```text
货运航线
货物链接
货运通道
系统间货运链接
星系间货运航线
```

where the named Starfield construct should normally use:

```text
货运链接
跨星系货运链接
```

## Resource Matrix

DeepL produced:

```text
资源矩阵
```

where the approved tracker term is:

```text
资源状态表
```

## Official skills

DeepL drifted from some official Bethesda skill names, including examples such as:

```text
行星栖息
特别项目
```

instead of approved:

```text
行星居住
特殊项目
```

## Planetary Body

Some targets use unrelated/body-word senses instead of:

```text
行星体
```

These are adjudication differences under already-settled policy.

Do not reopen terminology decisions merely because DeepL supplied understandable synonyms.

---

# Source of truth

Use:

```text
docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
reference-source/official-terminology-values-zh-Hans.csv
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
```

and the exact current `en-US` catalogue.

The already reviewed independent Codex draft remains the Codex candidate.

Do not replace it wholesale with DeepL output.

---

# 7. Import the returned XLIFF through the existing validator

Use the existing generalized returned-XLIFF import path.

Validate at minimum:

- XLIFF version/shape;
- `source-language="en-US"`;
- `target-language="zh-Hans"`;
- exact 414-key identity;
- no missing/duplicate/unknown keys;
- exact current English source;
- exact source SHA-256;
- placeholder names;
- protected tokens;
- supported plural structure;
- non-empty targets;
- stale review/constraint detection.

No locale-tag canonicalization change should be necessary: the real returned file uses exact:

```text
zh-Hans
```

as did the disposable protocol probe.

Do not change importer locale semantics without new evidence.

---

# 8. Record invalid DeepL rows explicitly

Do not discard malformed DeepL rows.

The review/adjudication artifact should preserve:

- raw DeepL target;
- machine validation status;
- invalid reason;
- repaired/final candidate;
- substantive adjudication rationale.

Use the established decision/status model, including the project equivalent of:

```text
INVALID_DEEPL_REPAIRED
```

where appropriate.

Invalid DeepL output is useful comparative evidence but can never be selected verbatim.

---

# 9. Neutral row-by-row adjudication

Adjudicate **all 414 rows**.

Do not default to:

- Codex;
- DeepL;
- shortest wording;
- literal English;
- official terminology where the tracker context genuinely differs.

Use the repository's established decision classes, likely including:

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

Every non-trivial choice must have a substantive rationale.

The final catalogue must be generated from approved adjudication rows.

Do not hand-edit the generated catalogue independently.

---

# 10. Adjudication priority

For each row consider:

1. semantic fidelity to the English source and actual tracker behavior;
2. approved official Bethesda terminology where concept/context match;
3. approved tracker-owned terminology;
4. natural Simplified Chinese;
5. placeholder safety;
6. Chinese punctuation and spacing policy;
7. mixed Han/Latin technical-token policy;
8. context/risk/accessibility metadata;
9. compactness appropriate to the actual surface;
10. Codex-vs-DeepL wording quality.

Do not choose wording solely because it sounds smoother if it changes product meaning.

---

# 11. Official terminology enforcement

Important approved defaults include:

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

plus the five approved official skill names:

```text
哨站管理
哨站工程
行星居住
研究方法
特殊项目
```

Contextual policy for Planet:

```text
行星
```

for technical/selectors/compact surfaces, with:

```text
星球
```

allowed in approved natural prose contexts.

Do not accept DeepL synonyms merely because they are understandable Chinese when they unnecessarily differ from Starfield.

---

# 12. Starfield / 星空 policy

Enforce the key/context-aware policy.

Use:

```text
星空
```

for ordinary localized references to Bethesda's game.

Preserve:

```text
Starfield
```

for the fixed tracker/product/technical contexts approved by the glossary.

DeepL's use of:

```text
星域
```

is not an approved alternative for the game title.

Do not promote it.

---

# 13. Tracker-owned terminology

Review DeepL against the glossary for:

```text
计划供应
存在
生产中
所需材料
物流
制造
检查
资源状态表
调整顺序
锁定顺序
哨站网络
当前生产
来源
目的地
撤销
重做
无机
有机
```

and their approved contextual variants.

Preserve semantic distinctions:

- Planned Supply is virtual/intended future supply;
- Present is a state, not an action;
- Producing differs from Manufacturing;
- Inputs means material/recipe requirements;
- Logistics means configured/routed cargo use;
- Validation is application checking;
- Resource Matrix is a tracker status table, not a mathematical matrix;
- Reshuffle means deliberate reorder, not randomness;
- Lock means finish/prevent reordering;
- Network means the player's outpost network;
- Active Production means configured production, not throughput.

---

# 14. Placeholder safety

The final value for every row must preserve required placeholder names exactly.

Do not translate placeholder identifiers.

Do not infer Chinese classifiers by changing parameter names.

If Chinese needs a classifier or noun, place it outside the placeholder.

Legitimate repeated placeholder occurrences remain allowed under the existing global rule.

Final catalogue generation must pass exact required-name parity.

---

# 15. Four pluralized keys

The four pluralized keys are:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

DeepL's returned versions are structurally invalid and must not be selected verbatim.

Preserve:

```text
one / other
```

syntax.

Do not add:

```text
few
many
```

or Chinese-specific plural syntax.

The reviewed independent draft currently uses identical visible Chinese branch wording.

Adjudicate the wording itself, but preserve the structural contract.

Test representative counts:

```text
0
1
2
10
```

Natural visible Chinese is the acceptance criterion.

---

# 16. Preserve the reviewed count/spacing corrections

The pre-DeepL Codex draft was already corrected for Chinese number/classifier spacing and one plural sentence.

Pay particular attention to:

```text
validation.plannedSupplyUnresolved
validation.counts
character.level.rejectedRestored
character.level.rejectedEmpty
character.skillRank.rejectedRestored
character.skillRank.rejectedEmpty
validation.outpostNameLength
```

Do not regress to English-style spaces such as:

```text
1 至 999
25 个字符
{errors} 个错误
```

when the approved editorial style uses:

```text
1至999
25个字符
{errors}个错误
```

unless a specific Chinese typography/context reason is established.

---

# 17. Chinese punctuation and spacing

Final tracker-authored prose should use the approved Simplified Chinese editorial style.

Use Chinese punctuation where natural:

```text
，
。
：
；
```

Avoid routine spaces between ordinary Chinese lexical items.

Preserve technical/invariant syntax literally.

Do not mechanically convert official Bethesda reference-name punctuation.

During adjudication, treat DeepL's spacing/punctuation differences as substantive when they affect the approved Chinese style.

---

# 18. Mixed Han/Latin technical text

Preserve legitimate technical tokens such as:

```text
JSON
FormID
X-Tech
HTTP
HTTPS
IDs
file extensions
key names
```

where the source/context requires them.

Do not allow ordinary English residue such as:

```text
Focus
Cargo
cargo
```

merely because mixed Han/Latin text is generally permitted.

The hardened Chinese residue detector remains authoritative for candidate/final text.

---

# 19. Chinese quality validation

DeepL candidate quality defects remain importable evidence.

However, `CodexTranslation` and `FinalTranslation` must fail closed on:

- accidental English residue;
- missing Chinese prose for ordinary messages;
- invalid structural tokens;
- stale constraints/source;
- protected-token mutation.

Do not weaken the quality gate to increase the number of selectable DeepL rows.

---

# 20. Semantic quality audit after adjudication

After all rows have decisions, perform a bounded whole-catalogue pass for:

- accidental English residue;
- wrong `Starfield` / `星空` handling;
- glossary contradictions;
- inconsistent `哨站`;
- inconsistent `货运链接`;
- inconsistent `跨星系货运链接`;
- wrong official skill names;
- `资源矩阵` drift where `资源状态表` is intended;
- wrong Planet/Planetary Body terminology;
- placeholder translations;
- plural syntax;
- unnecessary English-style spaces;
- ASCII punctuation in ordinary Chinese prose where Chinese punctuation is expected;
- literal/calqued English sentence structure;
- over-short labels that lose tracker meaning.

Correct through adjudication, not by silently editing the generated final catalogue.

---

# 21. Generate final Simplified Chinese semantic catalogue

Only after all 414 rows are approved, generate:

```text
src/localization/locales/zh-Hans.ts
```

Requirements:

- exact 414-key parity with `en-US`;
- exact required placeholder-name parity;
- no empty values;
- valid plural syntax;
- protected tokens preserved;
- glossary/terminology policy satisfied;
- Chinese prose-presence guard passes;
- accidental-English detector passes;
- deterministic generation from adjudication evidence.

Do not register this catalogue at runtime yet.

---

# 22. Preserve review evidence

Update/generate the Simplified Chinese review/adjudication artifact using the established generalized workflow.

It must retain:

- English source;
- independent Codex draft;
- raw DeepL candidate;
- DeepL structural status;
- final decision;
- final value;
- rationale;
- context/risk;
- terminology constraints;
- source hash.

Do not overwrite the independent Codex draft with DeepL output.

Do not erase invalid DeepL evidence.

---

# 23. Decision statistics

Report counts for actual project decision labels, including:

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

Also report:

- structurally valid DeepL rows;
- structurally invalid rows;
- Chinese quality-invalid-but-structurally-valid rows;
- identical Codex/DeepL rows;
- typographic-only differences if supported;
- substantive differences.

These are evidence summaries, not quality scores.

---

# 24. Returned-XLIFF structural report

Report exact importer results for:

- trans-unit count;
- duplicate IDs;
- missing IDs;
- unknown IDs;
- source/hash mismatches;
- placeholder-invalid rows;
- protected-token-invalid rows;
- plural-structure-invalid rows;
- empty targets;
- locale/version/source-language failures.

If importer counts differ from the independent pre-review, use the importer result and explain the difference.

---

# 25. No runtime activation

Hard requirement:

```text
runtimeAvailable: false
```

must remain unchanged.

Do not add Simplified Chinese to:

- selector;
- runtime semantic registry;
- browser mapping;
- search;
- runtime collation;
- shortcut speech;
- `document.lang`;
- Chinese font CSS.

The existence of a final catalogue does not authorize runtime exposure.

---

# 26. No reference overlay/fauna work

Do not create:

```text
src/localization/generated/zh-Hans-reference-names.ts
reference-source/localized-reference-names-zh-Hans-manifest.json
reference-source/localized-fauna-evidence-zh-Hans.json
```

Those remain the next separate stage.

---

# 27. No CSS/font work

Do not add the Simplified Chinese system-font stack in this parcel.

Do not change line breaking or geometry.

Typography implementation belongs to runtime integration after reference/fauna work.

---

# 28. Tests

Add/extend tests for:

- returned-XLIFF import;
- exact key/source/hash matching;
- invalid placeholder detection;
- invalid plural syntax;
- protected tokens;
- Chinese candidate quality defects remaining importable;
- defective DeepL candidate not approvable unchanged;
- neutral decision completeness;
- rationale requirements;
- final catalogue generation;
- exact final key/placeholder parity;
- Chinese accidental-English detection;
- Han-adjacent residue;
- Chinese prose presence;
- terminology/glossary conformance;
- `Starfield` / `星空` routing;
- four plural keys across representative counts;
- reviewed numeric/classifier spacing;
- deterministic final-catalogue generation;
- runtime remains inactive.

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

Run all focused review/XLIFF/adjudication/final-catalogue tests available.

---

# 29. Scope discipline

Expected changes may include:

```text
docs/localization/zh-Hans-review.csv
src/localization/locales/zh-Hans.ts
review/adjudication tests
small generalized importer/validator fixes only if a genuine bug is exposed
```

Returned DeepL working material should remain ignored/local according to the established workflow.

Do not modify:

```text
src/localization/generated/*
src/ui/*
CSS
runtime locale registry
browser resolver
search
persistence/domain code
```

Unexpected runtime/UI changes are scope creep.

---

# 30. Stop conditions

Stop before final catalogue generation if:

- the returned XLIFF does not correspond to the frozen 414-key handoff;
- source hashes do not close;
- invalid DeepL evidence cannot be retained safely;
- the Chinese quality gate cannot distinguish technical Latin from accidental English without broad allowlisting;
- glossary constraints prove insufficient;
- a plural message cannot be expressed naturally under the existing contract;
- a new terminology/product decision is required;
- final Chinese text cannot satisfy placeholder/protected-token rules.

Do not invent policy merely to finish the parcel.

---

# 31. Completion criteria

This parcel is complete when:

- the returned DeepL XLIFF is imported and fully validated;
- malformed/poor DeepL candidates remain recorded as evidence;
- all 414 rows are neutrally adjudicated;
- every final value has a substantive basis;
- official terminology and tracker glossary policy are applied;
- placeholders/protected tokens/plural syntax close exactly;
- Chinese quality gates pass on the final catalogue;
- final `zh-Hans.ts` is generated deterministically;
- Simplified Chinese remains runtime-inactive;
- no reference-overlay/fauna/CSS work is performed.

---

# Completion response

Return:

1. branch;
2. files changed;
3. returned XLIFF used;
4. imported trans-unit count;
5. source/hash closure;
6. structurally valid DeepL row count;
7. structurally invalid DeepL row count;
8. invalid-placeholder count;
9. invalid-protected-token count;
10. invalid-plural count;
11. empty/missing/duplicate/unknown row counts;
12. Chinese quality-invalid structurally-valid row count;
13. notable accidental-English DeepL rows;
14. Codex/DeepL identical count;
15. typographic-only difference count, if supported;
16. substantive difference count;
17. decision-class counts;
18. notable DeepL official-terminology failures;
19. notable tracker-terminology failures;
20. notable placeholder/grammar failures;
21. final four plural-key values;
22. final reviewed count/number-spacing values;
23. `Starfield` / `星空` conformance result;
24. official terminology conformance;
25. tracker-owned terminology conformance;
26. any new Chinese accidental-English allowlist additions;
27. final catalogue path;
28. final catalogue key/placeholder parity;
29. Chinese prose-presence result;
30. deterministic-generation result;
31. automated verification results;
32. `git diff --check` result;
33. confirmation runtime remains inactive;
34. confirmation no reference overlay/fauna evidence was created;
35. confirmation no CSS/font changes occurred;
36. deviations from brief;
37. unresolved user decisions;
38. recommended next stage;
39. suggested commit message;
40. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.

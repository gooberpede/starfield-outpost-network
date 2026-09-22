# Codex Correction Brief — Simplified Chinese Blind-Audit Reconciliation

## Objective

Apply the **16 material Simplified Chinese catalogue corrections** identified by the completed two-pass blinded adjudication audit.

This is a **narrow reconciliation task**.

Do not reopen the full Simplified Chinese translation.

Do not change rows that the blind audits judged `EQUIVALENT`.

Do not change the two previously adjudicated custom finals that remained preferable after unblinding.

Do not activate `zh-Hans` at runtime.

Do not create reference-name overlays, fauna evidence, CSS/font changes, selector entries, browser-locale routing, or runtime registration.

Do not commit or push.

---

# Audit context

The Simplified Chinese catalogue was originally adjudicated from:

- an independent Codex draft;
- a DeepL comparative translation;
- approved Bethesda terminology evidence;
- tracker-owned terminology/glossary policy.

Because the original result strongly favored Codex, two blinded audits were performed.

## Blind audit 1 — unconstrained tracker strings

Reviewed:

```text
72 structurally valid
Chinese-quality-valid
SUBSTANTIVE
unconstrained
tracker-authored strings
```

After unblinding:

```text
Codex preferred:   51
DeepL preferred:    5
Equivalent:         14
Custom:              2
```

Five material final-string changes were identified.

## Blind audit 2 — terminology-constrained tracker strings

Reviewed:

```text
196 structurally valid
Chinese-quality-valid
SUBSTANTIVE
terminology-constrained
tracker-authored strings
```

After unblinding:

```text
Codex preferred:  148
DeepL preferred:    6
Equivalent:         35
Custom:              7
```

Eleven material final-string changes were identified.

Two apparent reversals in the constrained audit (`help.biomes` and `validation.unresolvedCargoExport`) were **not** catalogue changes because the blind reviewer had not seen the already-adjudicated custom final values. Preserve those existing custom finals.

Across both audits:

```text
Codex preferred:  199
DeepL preferred:   11
Equivalent:        49
Custom:              9
```

The audits therefore support the general quality of the Codex draft while also identifying 16 concrete improvements.

---

# Methodological note

The original draft/adjudication and the blinded reviewer were both performed using GPT-5.6 Sol.

Therefore the blind audit should **not** be described as fully independent model validation.

It is best described as:

```text
source-blinded re-adjudication using the same model family/configuration
```

The audit successfully removed knowledge of whether Candidate A/B came from Codex or DeepL, but it did not remove shared-model stylistic or linguistic preferences.

Do not claim that the audit proves objective linguistic correctness or substitutes for native-speaker review.

The user accepts this limitation for the V1 release process.

If durable audit documentation is updated, record this limitation plainly and neutrally.

---

# Frozen sources

Use the current:

```text
docs/localization/zh-Hans-review.csv
src/localization/reviewDrafts/zh-Hans.ts
src/localization/locales/zh-Hans.ts
```

and the completed blind-audit reconciliation evidence supplied by the user.

The current final catalogue SHA-256 before this correction was reported as:

```text
AB895F9A8E5B47325FD9C92770D3AFE4088ED33722C17D7BA086C61ECEE0AD11
```

The current review CSV SHA-256 before correction was reported as:

```text
46A4179D94F5B7C3A414281B7EAC06F7F3F4BFE4369B4F90C9301DCE52FB56C8
```

Do not treat the hashes as substitutes for checking the actual working tree.

---

# Scope

Apply **exactly 16 material final-string corrections**.

They consist of:

```text
5 corrections from the unconstrained blind audit
11 corrections from the constrained blind audit
```

No other translation wording should change unless required mechanically to keep deterministic generated artifacts synchronized.

---

# Part A — 5 corrections from the unconstrained blind audit

## 1. `matrix.section.imports`

Current final:

```text
导入
```

Corrected final:

```text
进口
```

Rationale:

In the Resource Matrix logistics context, `进口` denotes incoming/imported goods/resources. `导入` strongly suggests importing files/data in software UI and conflicts semantically with the tracker's file-import feature.

---

## 2. `matrix.tooltip.export.inactive`

Current final:

```text
{item}未在导出。
```

Corrected final:

```text
{item}未被导出。
```

Rationale:

The corrected wording is idiomatic passive Chinese and clearly means the item is not being exported.

Preserve exact placeholder:

```text
{item}
```

---

## 3. `status.drag.reorder`

Current final:

```text
放下以调整顺序 · 按 Esc 取消
```

Corrected final:

```text
拖放以重新排序 · 按 Esc 取消
```

Rationale:

`拖放` is the conventional drag-and-drop UI instruction and `重新排序` directly communicates reordering.

Preserve protected token:

```text
Esc
```

---

## 4. `matrix.tooltip.import.active`

Current final is to be replaced with the blind-audit custom wording:

```text
{item}正在被导入。
```

Rationale:

The passive construction makes clear that the item is being imported. `{item}正在导入` can imply that the item itself performs the action.

Preserve exact placeholder:

```text
{item}
```

---

## 5. `referenceFatal.reason.buildMismatch`

Replace the current final with:

```text
参考数据属于应用的另一构建版本。
```

Rationale:

The custom wording clearly communicates that the reference data belongs to another build of the same application and avoids ambiguity about what is mismatched.

---

# Part B — 11 corrections from the constrained blind audit

## 6. `matrix.manufacturing.add`

Current final:

```text
添加制造产品
```

Corrected final:

```text
添加制成品
```

Rationale:

`制成品` is a more natural noun for a manufactured product/output in this control.

---

## 7. `plannedSupply.section.products`

Current final:

```text
制造产品
```

Corrected final:

```text
制成品
```

Rationale:

Use the same natural manufactured-product noun consistently in this section.

---

## 8. `shortcuts.group.importExport`

Current final:

```text
导入 / 导出
```

Corrected final:

```text
导入/导出
```

Rationale:

Chinese UI style does not require spaces around the slash here.

This is a tracker file-import/export label, so `导入/导出` is correct in this context.

---

## 9. `status.import.invalidExplicitPresence`

Current final:

```text
所选文件包含无效的明确资源存在状态数据。
```

Corrected final:

```text
所选文件包含无效的显式资源存在数据。
```

Rationale:

`显式` better expresses “explicit” in the technical data-model sense. The corrected sentence is also less cumbersome.

---

## 10. `validation.remediation.harvesting`

Current final:

```text
可养殖的生物群系：{biomes}
```

Corrected final:

```text
可在以下生物群系中采集：{biomes}
```

Rationale:

The remediation applies broadly to organic resource harvesting, not only animal husbandry/farming. `采集` preserves the generic harvesting sense.

Preserve exact placeholder:

```text
{biomes}
```

---

## 11. `matrix.tooltip.xTech.add`

Replace current final with:

```text
将{resource}标记为存在。如果有可用的X技术能量核心，即可在任意哨站开采该资源。
```

Rationale:

This preserves the approved tracker action `标记为存在`, the approved official X-Tech terminology, and the condition that extraction becomes possible at any outpost when an X-Tech Power Core is available.

Preserve exact placeholder:

```text
{resource}
```

Preserve approved terms:

```text
X技术
X技术能量核心
哨站
```

---

## 12. `status.import.aggregateLimitExceeded`

Replace current final with:

```text
此导入文件包含的条目过多，无法安全打开。
```

Rationale:

This directly explains that the imported file as a whole contains too many entries to open safely.

---

## 13. `status.import.arrayLimitExceeded`

Replace current final with:

```text
此导入文件的某个部分包含过多条目。
```

Rationale:

This distinguishes a per-array/per-section limit from the aggregate file limit without exposing internal implementation terminology unnecessarily.

---

## 14. `validation.activeProductionOrganicInvalid`

Replace current final with:

```text
{resource}已标记为生产中，但无法在{biomes}通过哨站采集获得。
```

Rationale:

`采集获得` keeps the organic acquisition language generic. It must not narrow all organics to animal husbandry/farming.

Preserve placeholders:

```text
{resource}
{biomes}
```

Preserve approved term:

```text
哨站
```

---

## 15. `validation.activeProductionOrganicInvalidMany`

Replace current final with:

```text
{resource}已标记为生产中，但无法在{biomes}这些生物群系通过哨站采集获得。
```

Rationale:

Same semantic correction as the generic row, with wording appropriate to the many-biome variant.

Preserve placeholders:

```text
{resource}
{biomes}
```

Preserve approved terms:

```text
生物群系
哨站
```

---

## 16. `validation.activeProductionOrganicInvalidOne`

Replace current final with:

```text
{resource}已标记为生产中，但无法在{biomes}生物群系通过哨站采集获得。
```

Rationale:

Same semantic correction as the generic row, with wording appropriate to the one-biome variant.

Preserve placeholders:

```text
{resource}
{biomes}
```

Preserve approved terms:

```text
生物群系
哨站
```

---

# Rows explicitly NOT to change

## `help.biomes`

The constrained blind reviewer preferred one of the A/B candidates, but the current original adjudication had already selected a separate custom final that was not visible during blind review.

Preserve the existing custom final.

Do not replace it with either blind candidate solely because of the blind result.

---

## `validation.unresolvedCargoExport`

Same situation as `help.biomes`.

Preserve the existing custom final.

---

# Equivalent rows

Across the two blind audits, 49 rows were judged:

```text
EQUIVALENT
```

Do **not** change those final translations merely to match whichever blind candidate appeared stylistically preferable during discussion.

The audit conclusion for those rows is:

```text
current final remains acceptable
```

If review metadata is updated, it may record that the blind audit found no material superiority between the candidates.

Do not create catalogue churn.

---

# Adjudication evidence updates

Update:

```text
docs/localization/zh-Hans-review.csv
```

so that the 16 corrected rows accurately record the final blind-audit outcome.

Requirements:

1. Preserve the original `CodexTranslation`.
2. Preserve the original `DeepLTranslation`.
3. Preserve `EnglishSource`, hashes, context, risk, parameters, protected tokens, and constraints.
4. Update `AdjudicationDecision` only as needed to truthfully represent the final outcome.
5. Update `FinalTranslation` to the exact corrected value.
6. Replace stale boilerplate `ReviewerNote` text for these corrected rows with a concise concrete explanation tied to the blind audit.
7. Do not falsify a blind result by labelling a custom value as `CODEX` or `DEEPL`.

Recommended decision semantics:

- if the corrected value is exactly the DeepL candidate:
  ```text
  DEEPL
  ```
- if it is exactly the Codex candidate:
  ```text
  CODEX
  ```
- if it is a new value:
  ```text
  CUSTOM
  ```

If the repository has an existing explicit convention for blind-audit corrections, follow that instead, but report it.

Do not invent new global decision-class vocabulary unless required.

---

# Blind-audit provenance

If there is an appropriate existing durable audit/provenance document for Simplified Chinese semantic adjudication, update it with a short note covering:

- two blind review passes were performed;
- 268 structurally valid substantive disagreements were reviewed blind;
- candidate origin was hidden;
- terminology constraints remained visible in the constrained pass;
- 16 material catalogue changes resulted;
- 49 rows were judged equivalent and retained without churn;
- the blind reviewer used the same GPT-5.6 Sol model family/configuration as the original Codex adjudication;
- therefore this is source-blinded re-adjudication, **not independent-model or native-speaker validation**.

Do not create a broad new documentation system if no appropriate audit/provenance document exists.

If no existing durable home is appropriate, report that and keep the methodological note in the completion summary only.

---

# Final catalogue regeneration

Regenerate:

```text
src/localization/locales/zh-Hans.ts
```

using the existing deterministic workflow.

Do not hand-edit generated output if the repository expects it to be generated from review evidence.

Requirements:

- 414/414 keys;
- exact placeholder parity;
- no accidental English regressions;
- Chinese prose-presence gate passes;
- terminology verification passes;
- runtime remains inactive.

---

# Review draft

Do **not** rewrite the independent draft merely to make it match the final catalogue.

The purpose of:

```text
src/localization/reviewDrafts/zh-Hans.ts
```

is to preserve the independent Codex draft used for comparison.

It should remain unchanged unless the existing architecture explicitly requires otherwise.

Report its hash before/after.

---

# Frozen DeepL evidence

Do not alter:

```text
docs/localization/zh-Hans-deepl.xliff
```

The returned DeepL evidence must remain frozen.

Do not retroactively repair the DeepL candidate source.

---

# Runtime boundary

Keep:

```text
runtimeAvailable: false
```

No runtime activation.

Do not add:

- locale selector entry;
- locale registry activation;
- browser-locale mapping;
- Chinese collator changes;
- `document.lang`;
- Chinese font stack;
- Chinese CSS;
- reference overlay;
- fauna localization.

Those belong to later stages.

---

# Validation

Run at minimum:

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

Also run the focused Simplified Chinese localization/review tests used in the previous adjudication stage.

Verify explicitly:

- exactly 16 intended final strings changed;
- no unintended final catalogue keys changed;
- 414/414 final key parity;
- exact placeholder parity;
- no new accidental-English allowlist additions;
- official terminology conformance;
- tracker-owned terminology conformance;
- deterministic regeneration;
- final catalogue hash changes as expected;
- review draft remains unchanged;
- frozen DeepL XLIFF remains unchanged;
- runtime remains inactive.

If any supposedly unrelated final catalogue values change due to generator nondeterminism or collateral edits, stop and investigate.

---

# No reference/fauna work

Do not create or modify:

```text
zh-Hans reference-name overlay
reference-name manifest
fauna evidence
fauna component ordering
Bethesda reference translations
```

The next planned localization stage remains reference overlay + fauna evidence after this semantic correction is committed.

---

# No UI/CSS work

Do not make:

- font changes;
- CJK CSS changes;
- geometry changes;
- spacing/layout changes;
- selector changes;
- accessibility changes.

This correction is semantic evidence/catalogue only.

---

# Git operations

Do not commit.

Do not push.

---

# Completion response

Return:

1. branch;
2. files changed;
3. exact count of semantic final-string changes;
4. list of the 16 changed keys;
5. old → new value for each changed key;
6. adjudication decision class for each corrected row;
7. confirmation `help.biomes` remained unchanged;
8. confirmation `validation.unresolvedCargoExport` remained unchanged;
9. confirmation no `EQUIVALENT` row was changed solely due to the blind audit;
10. review CSV old/new SHA-256;
11. final catalogue old/new SHA-256;
12. review draft old/new SHA-256;
13. frozen DeepL XLIFF old/new SHA-256;
14. final catalogue key parity;
15. placeholder parity result;
16. accidental-English quality result;
17. official terminology verification result;
18. tracker-owned terminology verification result;
19. deterministic regeneration result;
20. focused Simplified Chinese test result;
21. `npm test` result;
22. `npm run test:components` result;
23. `npm run typecheck:tests` result;
24. `npm run localization:terminology:verify` result;
25. `npm run localization:provenance:test` result;
26. `npm run build` result;
27. `npm run lint` result;
28. `git diff --check` result;
29. confirmation `runtimeAvailable` remains `false`;
30. confirmation no reference/fauna/runtime/UI/CSS work occurred;
31. any durable audit/provenance note updated, or explanation why none was appropriate;
32. explicit statement acknowledging that the blind re-adjudication used the same GPT-5.6 Sol model family/configuration and therefore was source-blinded but not independent-model validation;
33. deviations from brief;
34. unresolved user decisions;
35. suggested commit message;
36. confirmation no commit/push occurred.

Suggested commit message:

```text
fix: reconcile Simplified Chinese blind audit
```

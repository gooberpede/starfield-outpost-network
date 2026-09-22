# CODEX CORRECTION BRIEF — Post-Localization Cleanup Audit Corrections

## Objective

Correct the current uncommitted **post-localization cleanup foundation** parcel before commit so that its durable audit/benchmark conclusions accurately reflect the user's manual evidence.

The implementation work for:

- final locale-selector ordering; and
- XLIFF relocation/tooling updates

is not being reopened by this correction unless a direct inconsistency is discovered.

This correction is focused on the **new durable reports and backlog conclusions** produced by the cleanup-foundation parcel.

Do not implement the follow-up UI, accessibility, Undo/presentation-state, lazy-loading, or bandwidth optimizations in this correction.

---

# 1. Background

The cleanup-foundation parcel added three durable reports:

```text
docs/benchmarks/LOCALIZATION-BUNDLE-AND-STARTUP-REVIEW.md
docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
```

After reviewing the diff, the user supplied additional manual evidence showing that several of the report conclusions are too strong or incorrect.

The durable reports must be corrected before commit.

Use the user's manual observations below as authoritative evidence for this correction.

---

# 2. Bundle/startup review — separate startup performance from bandwidth

## Current issue

The current bundle/startup review concludes that lazy loading is not currently justified.

That conclusion is too broad because the report primarily establishes that **startup performance is acceptable**, while the user has raised a separate product concern:

> How much data is transferred to a user's device on a cold visit, and can that transfer footprint be reduced without sacrificing performance?

The measured main-JS values remain valid:

```text
1,484,485 bytes raw
367,128 bytes gzip
236,262 bytes Brotli
```

Do not discard or reinterpret those measurements.

However:

- raw bundle size is not equivalent to transfer bytes;
- local Brotli/gzip estimates are not the same as actual Cloudflare cold-load transfer;
- warm local startup latency does not answer the bandwidth question;
- localization data that is not used in the active session may still contribute to the initial bundle.

## Required correction

Update:

`docs/benchmarks/LOCALIZATION-BUNDLE-AND-STARTUP-REVIEW.md`

so that it clearly distinguishes:

```text
startup/perceived-load performance
network transfer/bandwidth footprint
```

The durable conclusion should become approximately:

> Current startup performance does not justify an architecture change by itself. Further transfer-size and loading-strategy profiling is warranted before deciding whether locale-on-demand loading would provide worthwhile bandwidth savings without harming startup or locale-switch performance.

Use equivalent wording if clearer.

Do not state that lazy loading is required.

Do not state that lazy loading is unwarranted.

The correct durable outcome is:

```text
Further profiling/design warranted before architecture change.
```

or the existing report's equivalent decision category.

## Follow-up measurement to record

Recommend a later focused investigation covering:

- actual deployed Cloudflare cold-load transfer bytes;
- compression actually delivered over HTTP;
- cache behavior on repeat visits;
- contribution of statically bundled semantic catalogues;
- contribution of statically bundled localized reference-name overlays;
- feasibility of loading only the active locale's catalogue/overlay;
- cost of additional requests/module loading;
- locale-switch latency after on-demand loading;
- browser caching of previously loaded locale assets.

Do not implement dynamic imports/lazy loading in this correction.

---

# 3. Cargo Link Removal → Undo presentation-state regression

## User reproduction

The user reproduced this reliably in Edge:

1. Navigate to an outpost with at least two Cargo Links.
2. Expand at least two Cargo Links.
3. Remove one Cargo Link.
4. The remaining Cargo Links retain their previous expanded/collapsed presentation state.
5. Click Undo.
6. The removed Cargo Link returns in a collapsed state.
7. **All other Cargo Links also revert to collapsed state.**

## Current audit problem

The accessibility reconciliation currently treats the older Cargo Undo collapse issue as not reproduced/superseded.

That conclusion is incorrect.

Architectural reasoning about presentation state being keyed by stable IDs must not override direct runtime evidence.

## Required correction

Update:

`docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md`

and any affected backlog wording.

Classify this as:

> **Confirmed presentation-state regression**

It is primarily a history/presentation-state issue, not inherently an accessibility defect.

Durable wording should record:

- the exact reproduction sequence above;
- unaffected Cargo Links retain their state immediately after deletion;
- invoking Undo collapses all Cargo Links;
- this is current runtime evidence in Edge;
- the issue warrants a separate correction brief;
- the desired correction should preserve unrelated Cargo Link presentation state through Undo where consistent with the established history/presentation contract.

Do not implement the fix here.

Do not decide in this correction whether the restored Cargo Link itself should return expanded or collapsed. That can be settled in the later dedicated fix brief.

---

# 4. Resource Matrix localized column-header capacity

## User evidence

The user manually inspected the Resource Matrix in:

```text
French
German
Italian
Polish
Spanish (Spain)
```

and supplied screenshots showing visible column-heading pressure.

Observed examples include:

- French production heading wrapping awkwardly;
- German long localized headings expanding to multiple lines;
- Italian localized headings creating a tall/irregular header row;
- Polish headings creating dense multi-line alignment;
- Spanish `MATERIALES DE ENTRADA` wrapping across three lines.

The controls remain usable, but the visual header grammar is visibly degraded compared with the intended compact/aligned Resource Matrix presentation.

## Clarify "Compact Matrix context"

The accessibility reconciliation may refer to **compact Matrix context**.

That phrase concerns assistive-technology semantic context inside the compact Matrix and is separate from this visual layout issue.

Do not conflate:

```text
screen-reader semantic context
```

with:

```text
localized visible column-header capacity
```

The semantic-context item may remain superseded/closed if its accessibility evidence supports that conclusion.

The visible header-capacity issue is a separate finding.

## Required correction

Update:

`docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md`

to classify the localized Resource Matrix header problem as a real cross-locale visual-capacity defect, rather than merely harmless/expected pressure.

Recommended classification:

> **Shared cross-locale Resource Matrix header capacity defect**

with differing severity by locale.

Record that:

- the issue is observed manually in at least French, German, Italian, Polish, and Spanish;
- no evidence indicates the translations themselves are incorrect;
- the current column/heading geometry was effectively optimized around shorter English labels;
- the issue should be addressed by a later cross-locale UI/design brief;
- no locale-specific geometry workaround is approved here.

Possible future solution classes may be noted only as investigation options:

```text
column-width rebalance
surface-specific heading typography adjustment
controlled two-line/line-break treatment
approved compact visible labels with full accessible names
```

Do not choose or implement one in this correction.

---

# 5. Polish Solar/Wind vertical alignment

## User evidence

The user supplied a Polish Outpost Details screenshot showing:

- `ENERGIA SŁONECZNA`
- `ENERGIA WIATROWA`

wrapping to two lines and causing the Solar/Wind controls to sit visibly lower than adjacent System, Body, and Biome controls.

The user has not observed the same vertical-alignment break in other locales.

## Current audit problem

The capacity review currently states that previously described Polish-specific compact/header pressure was not reproduced as Polish-specific.

That conclusion is contradicted by current manual evidence.

## Required correction

Update:

`docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md`

and any relevant `docs/BACKLOG.md` entry.

Record this as:

> **Polish-specific Outpost Details heading-height / control-alignment defect**

or, if the report prefers conservative wording:

> **Observed in Polish; not currently reproduced in other manually checked locales.**

Keep it distinct from the separate `Very Poor` value-width/capacity issue.

Do not shorten the Polish translations merely to fit.

Do not implement a CSS/layout correction in this parcel.

Recommend a later cross-locale Outpost Details capacity/layout brief.

---

# 6. Backlog reconciliation

Update `docs/BACKLOG.md` only where needed to reflect corrected durable findings.

At minimum ensure that:

- Cargo Link Removal → Undo collapse is present as an active confirmed presentation-state regression;
- Resource Matrix localized column-header capacity is recorded as real shared cross-locale UI debt/defect;
- Polish Solar/Wind vertical alignment is recorded as a current observed issue;
- bandwidth/locale-loading architecture investigation is retained as a measurement/design follow-up rather than closed by the current startup review.

Do not duplicate the same issue in multiple backlog sections unnecessarily.

Prefer one canonical backlog item with references to the durable audit/report where useful.

---

# 7. Screenshot evidence

The user supplied manual screenshots for:

```text
final sorted locale menu
Resource Matrix — French
Resource Matrix — German
Resource Matrix — Italian
Resource Matrix — Polish
Resource Matrix — Spanish
Outpost Details Solar/Wind — Polish
```

Use these as supplied manual evidence when correcting the reports.

Do not add the screenshots to Git unless the repository already has an established convention requiring durable image artifacts and the current brief clearly supports doing so.

The preferred correction is textual durable evidence:

- locale;
- affected surface;
- observed behavior;
- classification;
- follow-up boundary.

Do not invent pixel measurements from the screenshots unless actually measured.

---

# 8. Preserve accepted cleanup-foundation implementation

Do not unnecessarily alter the accepted implementation work:

## Locale selector

Preserve the final selector order:

```text
English (US)
English (UK)
French
German
Italian
Japanese
Polish
Portuguese (Brazil)
Simplified Chinese
Spanish (Spain)
```

The user's screenshot confirms the sorted menu is correct.

## XLIFF relocation

Preserve the relocation of working XLIFF handoffs to ignored:

```text
.local-work/localization/<locale>/
```

Preserve removal of tracked working handoff copies from `docs/localization/`.

Preserve durable review evidence.

Do not regenerate translations or alter accepted locale content.

---

# 9. Scope boundary

This correction is documentation/audit/backlog reconciliation only unless a tiny test/document reference update is strictly required by changed wording.

Do not implement:

- locale lazy loading;
- dynamic imports;
- bundle architecture changes;
- Resource Matrix layout fixes;
- Solar/Wind layout fixes;
- Cargo Link Undo/presentation-state fixes;
- Narrator fixes;
- shortcut changes;
- focus fixes;
- accessibility-runtime changes.

Those belong to later dedicated briefs.

---

# 10. Planning-identifier convention

Respect `AGENTS.md`.

Do not leak temporary numbered Steps, Parcels, Batches, Phases, or Tranches into unrelated durable documentation.

Describe the actual finding/work directly.

---

# 11. Verification

After correction:

1. Review the complete uncommitted diff.
2. Run `git diff --check`.
3. Confirm only intended durable reports/backlog/docs changed in this correction.
4. Confirm selector-order implementation remains unchanged.
5. Confirm XLIFF relocation implementation remains unchanged.
6. Confirm no translation/reference-name values changed.
7. Confirm the bundle report no longer equates acceptable startup latency with a closed bandwidth question.
8. Confirm Cargo Undo collapse is no longer marked not reproduced/superseded.
9. Confirm Resource Matrix localized header capacity is recorded as a real shared visible defect.
10. Confirm Polish Solar/Wind alignment is recorded as current manual evidence.
11. Confirm no speculative fixes were implemented.
12. Confirm no temporary planning identifiers leaked into new durable wording.

No full production test suite is required solely for documentation edits unless Codex changes code unexpectedly.

If code changes occur, run the relevant suites and explain why the code change was necessary.

---

# 12. Expected Codex summary

Report:

1. branch used;
2. files modified by the correction;
3. bundle/startup conclusion before and after correction;
4. bandwidth/locale-loading follow-up now recorded;
5. Cargo Undo reproduction now recorded;
6. Resource Matrix header-capacity finding now recorded;
7. Polish Solar/Wind alignment finding now recorded;
8. backlog reconciliation performed;
9. confirmation selector/XLIFF implementation was left unchanged;
10. commands/checks run;
11. any additional contradiction found in the three new reports;
12. any pre-existing stale wording noticed but deliberately left outside scope;
13. suggested commit message;
14. confirmation that no commit or push was performed.

Suggested commit message remains:

`chore: complete post-localization cleanup foundation`

unless the user later chooses to split implementation and documentation corrections into separate commits.

# CODEX IMPLEMENTATION BRIEF — Release Verification Corrections

## Purpose

Implement the focused correction batch identified by the completed release-verification and accessibility audit.

This is a **release-hardening pass**, not a redesign.

Primary goals:

1. correct readable muted-text contrast without conflating muted and disabled states;
2. improve accessibility semantics for validation, status feedback, Inter-System marker, and cargo operational states;
3. remove pointer-only drag handles from keyboard focus while preserving keyboard reordering through existing move buttons;
4. close stale localization documentation;
5. tighten accessibility-sensitive and release-regression test coverage without turning the repository into a testing-framework project.

Do **not** commit or push.

---

# Source audit

Follow:

```text
docs/audits/codex-release-verification-accessibility-audit.md
```

Audit disposition:

```text
Outcome B — minor corrections required
0 BLOCKER
1 HIGH
8 MEDIUM
5 LOW
0 COSMETIC
```

Treat the audit as authoritative for current findings.

Do not reopen settled localization/reference/provenance architecture unless a concrete defect requires it.

---

# Scope classification

**Medium cross-cutting release-hardening implementation.**

Expected touched areas:

- shared UI color tokens;
- validation row presentation/accessibility;
- status bar live-region semantics;
- Inter-System marker semantics;
- cargo operational-state accessibility descriptions;
- Outpost/Cargo Link drag-handle focus behavior;
- localization catalogues for any new accessible/state text;
- targeted accessibility/component tests;
- small release-regression tests;
- active architecture/localization/backlog documentation.

Do not modify:

- domain model;
- persistence schema;
- import/export schema;
- history snapshot model;
- reference-data generation;
- localization provenance;
- terminology provenance;
- body/resource/topology ordering;
- cargo domain semantics;
- manual/device verification state.

---

# Naming guidance

Avoid transient roadmap identifiers in durable code or filenames.

Do not introduce names such as:

```text
F1
F2
F3
```

Use functional names such as:

```text
muted text
disabled text
validation severity
status feedback
cargo operational state
accessible marker
release regression
```

---

# Correction 1 — separate readable muted text from disabled/unavailable presentation

## Goal

Fix the HIGH contrast finding without flattening the visual hierarchy.

The audit found that the existing shared muted text token is too weak on several common surfaces, especially for small readable secondary text.

Important product decision:

```text
muted != disabled
```

Do not solve this by treating all low-emphasis text as one color/state.

---

## Semantic distinction

Define two separate concepts:

### Readable muted text

Used for:

- secondary metadata;
- validation context;
- explanatory copy;
- supporting labels;
- readable low-priority information.

This text is still intended to be read normally.

It should meet normal readable-text contrast against every solid surface on which it is intentionally used.

### Disabled / unavailable presentation

Used for:

- controls/items that are unavailable;
- visually receded inactive options;
- deliberately de-emphasized catalogue states.

This state may remain much quieter visually, provided the state remains understandable and essential information is not hidden.

Do not automatically require the same contrast treatment as ordinary readable secondary text.

---

## Token strategy

Prefer an explicit semantic split such as:

```css
--ui-text-muted
--ui-text-disabled
```

Exact naming may differ if the repository already has a better convention.

Do not proliferate many background-specific text tokens unless measurement shows they are necessary.

Preferred approach:

1. make readable `--ui-text-muted` dark enough to meet normal-text contrast on the intended solid backgrounds;
2. introduce/use a separate disabled/unavailable token for intentionally receded states;
3. only add a panel-specific muted token if a single readable muted token genuinely harms the visual hierarchy.

---

## Contrast measurement

Measure final foreground/background combinations used by readable muted text.

At minimum check the solid surfaces corresponding to:

```text
--ui-background
--ui-surface
--ui-panel
--ui-highlight
```

Do not claim WCAG conformance based only on source assumptions.

Record measured ratios in the final Codex report.

Use ordinary normal-text criteria for readable muted text.

---

## Planned Supply / unavailable catalogue states

Do not blindly darken all unavailable Planned Supply controls to the same level as readable muted metadata.

Preserve the strong scan hierarchy that allows the user to identify active/planned rows at a glance.

The currently very pale unavailable items may be adjusted if needed, but they must remain visibly subordinate.

Existing non-color cues should remain available:

- dashed/patterned treatment;
- borders;
- disabled semantics;
- state styling.

Do not make disabled text the sole carrier of unavailable state.

---

## Logistics column visual simplification

Investigate whether logistics cells/widgets for resources that are **not being exported** can be omitted entirely rather than shown as a muted inactive widget.

This is an approved product option.

Preferred behavior if implementation is clean:

```text
exported resource -> logistics widget/state visible
not exported      -> no logistics widget rendered
```

The absence itself communicates non-participation and improves row scanning.

Constraints:

- do not change domain state;
- do not change persisted logistics/export semantics;
- do not remove controls needed to initiate/configure logistics;
- only remove passive/inactive visual chrome if the interaction remains clear;
- preserve accessibility semantics for actual active logistics/export states.

If omission would make the interaction ambiguous or require broader restructuring, retain the current widget and use the separate disabled token instead.

Report which approach was used.

---

# Correction 2 — validation severity semantics

## Goal

Restore explicit per-row severity information in addition to the color-coded bar.

The audit found that each validation issue visually communicates severity through color/striping but does not expose the severity text itself per issue.

Approved direction:

- keep the colored severity bar;
- add localized severity text for each row;
- make the severity available both visually and programmatically.

---

## Severity text

Use localized values such as:

```text
Error
Warning
Info
```

and Japanese equivalents through the localization layer.

Do not hard-code English strings in the component.

Prefer a compact treatment that does not overwhelm the issue text.

Examples of acceptable patterns:

```text
ERROR · issue message
WARNING · issue message
```

or a small severity label adjacent to the context line.

Do not rely on color alone.

---

# Correction 3 — import/export status live-region semantics

## Goal

Ensure asynchronous status feedback is announced to assistive technology.

Current problem:

- success/error text appears visually;
- screen readers may not be notified when it changes;
- transient success messages can disappear before a non-visual user notices them.

---

## Status semantics

Use a single robust announcement region.

Preferred behavior:

### Routine success / informational feedback

Use a polite status semantic, for example:

```html
role="status"
aria-live="polite"
```

### Failure

Use stronger semantics only where justified, for example:

```html
role="alert"
```

or equivalent assertive behavior.

Avoid duplicate announcements.

Do not add multiple nested live regions for the same message.

Do not change visible wording unless a localization defect is discovered.

---

# Correction 4 — Inter-System marker semantics

## Goal

Keep the existing visual marker while making its accessible semantics robust.

Current marker:

```text
✷⇄✷
```

This remains approved for now.

Do not replace it with SVG in this pass unless a concrete implementation blocker requires it.

---

## Required behavior

The marker must:

- remain noninteractive;
- remain out of Tab order;
- not announce the literal glyph sequence;
- expose one localized semantic name;
- retain localized tooltip text;
- retain internal `interstellar` discriminator unchanged.

Preferred implementation:

```html
<span role="img" aria-label="Inter-System Cargo Link">
  <span aria-hidden="true">✷⇄✷</span>
</span>
```

A visually hidden localized text solution is also acceptable if it is more robust within the existing codebase.

Do not add an unnecessary focus stop.

---

# Correction 5 — cargo operational-state descriptions

## Goal

Expose operational state that is currently visible but not reliably announced.

Two cases are explicitly in scope.

---

## Fuelled / unfuelled Inter-System state

The current UI already uses distinct visual stripe patterns and color.

Do not redesign the visual state.

Add a localized assistive description so non-visual users can determine whether the Inter-System Cargo Link is:

```text
fuelled
unfuelled
```

Prefer a concise associated description rather than bloating the visible button label.

Possible mechanisms:

```text
aria-describedby
visually hidden state text
computed accessible description
```

Use whichever fits the current component architecture best.

---

## Stale selected export

A selected export that is stale/unavailable is visually dimmed/styled.

Add a localized assistive description that communicates the stale/unavailable condition.

Do not leave its accessible meaning as only:

```text
Toggle export for X
```

A user should be able to understand both:

```text
what the control does
current operational/state problem
```

Do not change export domain semantics.

---

# Correction 6 — pointer-only drag handles must not receive keyboard focus

## Goal

Remove misleading keyboard focus from drag handles that cannot be activated by keyboard.

Approved decision:

```text
do not implement keyboard drag-and-drop
```

The existing move-up/down buttons are the keyboard reordering mechanism.

---

## Required behavior

For Outpost and Cargo Link drag handles:

- preserve mouse/pointer drag behavior;
- remove them from sequential keyboard focus;
- do not advertise button semantics;
- do not add Enter/Space handlers;
- retain their accessible/decorative behavior appropriately for pointer users.

Existing move-up/down buttons must:

- remain keyboard-focusable;
- remain native buttons;
- retain clear localized accessible names;
- preserve enabled/disabled boundary behavior.

Do not remove the move buttons.

---

# Correction 7 — documentation closure

## Goal

Update only stale active documentation that still describes completed localization/reference work as provisional.

Target the stale paragraphs identified by the audit in:

```text
docs/ARCHITECTURE.md
docs/localization/JAPANESE-GLOSSARY.md
docs/BACKLOG.md
```

Update them to reflect:

- official Japanese reference overlays are implemented;
- official terminology provenance is implemented;
- Free Lanes terminology-only boundary is settled;
- current localization closure is complete at 331/331;
- remaining limitations are manual/native-speaker/platform verification rather than missing architecture.

Do not rewrite historical audit reports.

Do not erase genuine remaining limitations.

Do not reopen settled terminology decisions.

---

# Correction 8 — targeted DOM/component accessibility testing

## Goal

Improve confidence in accessibility-sensitive rendered behavior without overhauling the whole test architecture.

The audit found that source/regex guards can confirm that attributes exist without proving that the rendered DOM exposes useful semantics.

This allowed issues such as:

- generic span with `aria-label` but weak semantics;
- focusable drag handle with no keyboard action.

---

## Test-harness policy

If the repository does not already have a DOM/component test environment, introduce the smallest clean solution that fits the current toolchain.

A lightweight DOM test capability is approved.

Do not turn this pass into a large test-infrastructure migration.

Do not add a broad end-to-end framework solely for this work.

If adding a DOM harness would require disproportionate dependency/configuration changes, stop short of a large overhaul and strengthen the highest-value source/pure tests instead.

Report the decision.

---

## Required DOM/component tests

Prefer rendered tests for:

### Compact Add controls

Verify:

- visible label is `+ Add` / `＋ 追加`;
- computed accessible name is the full contextual action;
- tooltip/title remains localized;
- button remains operable by keyboard.

### Inter-System marker

Verify:

- marker is not focusable;
- literal glyph is hidden from accessibility tree;
- computed accessible name is localized and semantic;
- no `[INT]` appears.

### Drag handles

Verify:

- pointer drag handle is not in sequential Tab order;
- move-up/down buttons are focusable;
- move buttons retain accessible names.

### Validation severity

Verify:

- each issue row exposes localized severity;
- severity is not color-only.

### Status feedback

Verify:

- success/informational feedback is exposed through one polite live region;
- failure is exposed through the chosen error semantics;
- no duplicate live region is created.

### Cargo operational states

Verify:

- fuelled/unfuelled state is available in the computed accessible description/name;
- stale selected export exposes its stale/unavailable condition.

---

# Correction 9 — Search DOM accessibility regression

## Goal

Add one or more rendered tests for the existing Search combobox/listbox behavior.

Do not rewrite Search.

Verify:

- input has correct accessible name;
- combobox/listbox relationship is valid;
- visible localized option names are exposed;
- English aliases under Japanese do not become visible/announced labels;
- category disambiguation remains understandable;
- Arrow Up/Down changes active option;
- Enter submits the highlighted option;
- Escape behavior remains correct.

Keep existing pure search-ranking/alias tests.

---

# Correction 10 — small release-regression tests

## Goal

Add the low-cost regression coverage identified by the audit.

These are not blockers individually but should be added while release-hardening is active.

---

## Locale-switch integration regression

Add a mounted/provider-level or nearest-practical test that switches among:

```text
en-US
en-GB
ja-JP
```

and verifies:

- selected network remains unchanged;
- selected non-null outpost remains unchanged;
- no domain data changes;
- no history entry is created.

---

## Locale-independent import/export regression

Add a table-driven regression where the same fixture is exercised under all supported locale preferences.

Verify:

- serialized data is identical;
- import acceptance/resulting stable IDs are identical;
- locale only changes presentation messages.

Do not introduce locale into serialization code.

---

## Collation-boundary regression

Add a regression test that jointly verifies:

```text
star systems -> localized alphabetical order
bodies -> existing order unchanged
resource topology -> unchanged
persisted outpost order -> unchanged
validation severity order -> unchanged
history chronology -> unchanged
```

Use stable IDs as deterministic tie-breakers where relevant.

---

# Explicit non-goals

Do not:

- redesign the overall palette;
- perform a broad visual refresh;
- implement keyboard drag-and-drop;
- replace `✷⇄✷` with final SVG work unless necessary;
- redesign mobile layout;
- claim mobile support;
- claim full WCAG compliance;
- regenerate localization provenance without cause;
- alter persistence/schema/history/domain architecture;
- rewrite historical audit documents;
- implement manual verification in code.

---

# Localization requirements

All new user-facing text must route through the localization layer.

Potential new strings include:

```text
Error
Warning
Info
Fuelled
Unfuelled
Unavailable
Stale
```

Use existing keys where semantically correct.

Do not duplicate existing terminology unnecessarily.

Maintain exact en-US / ja-JP key parity.

Update en-GB only if a genuine British-English override is needed.

---

# Verification commands

Run at minimum:

```text
npm test
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

Also run any newly added DOM/component test command.

If a new test command is introduced, document it in the final report.

Do not require game files for ordinary repository verification.

---

# Acceptance criteria

The correction pass is complete when:

1. readable muted text and disabled/unavailable presentation are semantically separated;
2. readable muted text meets normal readable-text contrast on its intended solid backgrounds;
3. disabled/unavailable presentation remains visually subordinate and is not conflated with readable muted text;
4. Planned Supply row-scanning hierarchy is preserved;
5. logistics passive widgets for non-exported resources are omitted if this can be done cleanly without interaction ambiguity, otherwise retained with the dedicated disabled treatment;
6. validation rows expose localized severity text in addition to color;
7. async import/export success feedback is announced through one polite status region;
8. failures use an appropriate stronger announcement without duplication;
9. Inter-System marker remains visually `✷⇄✷` unless fallback is required;
10. Inter-System marker exposes one robust localized semantic name;
11. Inter-System marker remains noninteractive and out of Tab order;
12. fuelled/unfuelled Cargo Link state is programmatically exposed;
13. stale selected export state is programmatically exposed;
14. pointer-only drag handles are removed from sequential keyboard focus;
15. existing move-up/down controls remain keyboard-focusable and fully labelled;
16. no keyboard drag-and-drop system is introduced;
17. stale active localization docs are corrected without rewriting historical audits;
18. localization closure remains exact at 331/331;
19. no new hard-coded user-facing prose is introduced;
20. targeted DOM/component accessibility tests cover the corrected semantics where practical;
21. Search receives rendered keyboard/accessibility regression coverage where practical;
22. locale-switch, import/export, and collation-boundary regressions are strengthened;
23. no persistence/schema/history/domain migration is introduced;
24. reference/provenance/terminology verifiers remain clean;
25. all tests/build/lint/verifiers pass;
26. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- final muted/disabled token strategy;
- measured contrast ratios for readable muted text on intended solid surfaces;
- whether Planned Supply disabled styling changed;
- whether non-exported logistics widgets were omitted or retained;
- exact validation severity presentation;
- status/live-region implementation;
- Inter-System semantic implementation;
- cargo operational-state descriptions added;
- drag-handle Tab behavior;
- move-button keyboard behavior;
- documentation passages updated;
- whether a DOM/component test harness was added;
- new test dependencies/configuration, if any;
- accessibility/component tests added;
- release-regression tests added;
- localization key count after changes;
- all verifier/test/build/lint results;
- confirmation that no schema/persistence/history/domain work occurred.

Do not proceed to the final manual verification checklist until separately instructed.

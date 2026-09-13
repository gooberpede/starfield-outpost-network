# CODEX AUDIT BRIEF — Release Verification and Accessibility Readiness

## Purpose

Open the release-verification phase with a repository-first audit of release readiness and accessibility.

This audit should verify that the localized application is coherent, accessible, internally consistent, and ready for final manual checks.

The audit should **not** begin with manual browser/device verification. Manual checks should be bundled into a final section and performed only after the repository/source/test audit is complete.

Primary goals:

- identify release-blocking defects;
- identify accessibility defects;
- verify localization closure;
- verify stable-ID/persistence invariants;
- verify no user-facing text bypasses localization;
- verify keyboard/focus/accessibility semantics;
- verify tooltip/icon/compact-control semantics;
- verify release-state test coverage;
- produce a final manual-check checklist for the user.

Do **not** implement fixes yet.

Do **not** commit or push.

Write the audit report to:

```text
docs/audits/codex-release-verification-accessibility-audit.md
```

---

# Naming guidance

Avoid transient roadmap identifiers such as:

```text
F
F1
F2
```

in durable implementation names.

Use functional names such as:

```text
release verification
accessibility readiness
localization closure
manual verification checklist
```

Roadmap labels may remain in planning prose only.

---

# Scope classification

**Medium cross-cutting release-readiness audit.**

Expected inspection areas:

- localization completeness;
- canonical reference-name closure;
- official terminology closure;
- locale switching invariants;
- persistence/import/export/history stability;
- keyboard navigation;
- focus visibility;
- accessible names and labels;
- tooltip-dependent controls;
- compact `+ Add` controls;
- Inter-System marker;
- form controls;
- validation semantics;
- disabled states;
- color dependence;
- search semantics;
- status/error messaging;
- source-level hard-coded strings;
- release test coverage;
- browser/platform/manual-check preparation.

No implementation changes.

---

# Upstream invariants

Treat the following as completed upstream work that should be verified, not redesigned:

```text
330 / 330 Japanese semantic messages populated
3,561 / 3,561 official Japanese reference names generated
3,561 official Japanese reference names integrated at runtime
official terminology provenance implemented
Cargo Pad presentation retired in favor of Cargo Link
cargo-related Interstellar presentation retired in favor of Inter-System
X-Tech Power Core officially localized
Japanese search aliases implemented
Japanese language-sensitive font stack implemented
compact + Add controls implemented
[INT] retired
Inter-System marker prototype implemented
layout breakpoint defects corrected
targeted locale-aware collation implemented
```

Do not reopen architecture unless a concrete release defect requires it.

---

# Audit order

Perform the audit in this order:

1. repository/test/localization closure;
2. accessibility/source audit;
3. release-state regression audit;
4. browser/platform coverage plan;
5. manual verification checklist LAST.

Do not start with manual interaction unless needed to confirm a source-level ambiguity.

---

# Audit question 1 — localization closure

Verify exact closure for semantic messages.

Confirm:

```text
en-US baseline complete
en-GB sparse overrides valid
ja-JP complete for all tracker-authored semantic keys
```

Check:

- key parity;
- placeholder parity;
- ICU validity;
- protected tokens;
- no empty Japanese values;
- no accidental stale English where Japanese is expected;
- no duplicate or orphaned message keys.

Report exact counts.

---

# Audit question 2 — reference-name closure

Verify:

```text
3,561 canonical entities
3,561 Japanese generated reference names
4,818 qualified provenance rows
0 unresolved
0 generated drift
```

Run the existing provenance/reference-name verifiers.

Confirm that:

- `SFBGS050.esm` remains terminology-only;
- canonical reference population is still limited to the intended three-plugin content universe;
- no Free Lanes entity ingestion occurred accidentally.

---

# Audit question 3 — terminology closure

Run the official terminology verifier.

Confirm:

- terminology policy is valid;
- provenance row count is stable;
- `SFBGS050.esm` is terminology evidence only;
- `X-Tech Power Core` remains record-qualified;
- no active user-facing semantic value contains retired `Cargo Pad`;
- no active cargo-related semantic value contains retired `Interstellar`;
- no superseded terminology guidance remains active in implementation docs.

Report any mismatch as release-relevant.

---

# Audit question 4 — user-facing localization bypasses

Search the source for user-facing literals that bypass localization.

Classify findings:

```text
intentional non-language symbol
brand/proper title
technical token
developer-only text
user-facing hard-coded text
```

Examples of intentional non-language content may include:

```text
×
+
-
arrows
disclosure glyphs
technical IDs
```

Any tracker-authored user-facing prose or label outside the localization layer should be reported.

Do not mechanically treat every literal as a defect.

---

# Audit question 5 — locale switching invariants

Verify switching among:

```text
en-US
en-GB
ja-JP
```

does not mutate:

- `NetworkCollection`;
- selected network;
- selected outpost;
- outpost/cargo data;
- history length;
- Undo/Redo snapshots;
- import/export payloads;
- stable IDs;
- schema versions;
- persisted domain state.

Use tests where possible.

Locale switching must remain presentation-only.

---

# Audit question 6 — persistence and import/export integrity

Verify that localization/presentation work did not alter serialized data.

Check:

- export payload is locale-independent;
- imports accept the same schema under all locales;
- error/status messages localize without changing raw diagnostics;
- stable internal `CargoPad` / `interstellar` identifiers remain unaffected;
- no localized names are persisted where stable IDs should be used.

Report any locale-dependent persistence as a blocker.

---

# Audit question 7 — history relocalization

Reverify the history correctness fix.

Confirm:

- descriptors store stable kind + stable ID + canonical English fallback;
- Japanese-created actions can render later in English;
- English-created actions can render later in Japanese;
- locale switching does not create history entries;
- no localized presentation name leaks into persisted/session history fallback.

---

# Audit question 8 — keyboard navigation

Audit keyboard interaction across major controls:

- locale selector;
- search;
- outpost navigation;
- Add/Remove/Reshuffle controls;
- system/body selectors;
- biome controls;
- Resource Matrix interactions;
- Planned Supply;
- Cargo Links;
- validation panel;
- dialogs;
- About/settings controls.

Check:

- Tab order is logical;
- interactive elements are reachable;
- Enter/Space activation behaves correctly;
- focus is not trapped unintentionally;
- hidden/collapsed controls are not focusable when unavailable;
- no mouse-only essential action exists.

Source-level evidence is acceptable where browser automation is limited.

---

# Audit question 9 — visible focus

Inspect CSS/components for focus-visible behavior.

Verify:

- focused buttons/links/selects/inputs have a visible indicator;
- focus indicator is not removed without replacement;
- dark/selected states still show focus;
- compact `+ Add` controls retain visible focus;
- Inter-System marker is not focusable unless it is actually interactive.

Report weak or absent focus treatment.

---

# Audit question 10 — accessible names and labels

Audit all interactive controls for accessible naming.

At minimum inspect:

- compact `+ Add` controls;
- icon-only controls;
- close/delete/remove buttons;
- reshuffle controls;
- expand/collapse controls;
- locale selector;
- search field;
- dialogs;
- Cargo Link controls.

Confirm that visible shorthand does not replace the semantic name.

Examples:

```text
visual: + Add
accessible name: Add Outpost
```

```text
visual: ✷⇄✷
accessible name: Inter-System Cargo Link
```

Report any control where `title` is the only semantic label when an explicit accessible name is warranted.

---

# Audit question 11 — tooltip dependence

Identify controls where meaning is only discoverable via hover.

For each:

- state visible content;
- tooltip;
- accessible name;
- whether keyboard users can discover equivalent meaning.

Tooltip-only disclosure should not be the sole means of understanding an essential action.

Do not require every decorative tooltip to become focusable.

---

# Audit question 12 — Inter-System marker

Audit the current marker prototype.

Verify:

- visible `[INT]` is gone;
- symbol itself is not read literally by screen readers;
- container/badge has localized accessible name;
- tooltip is localized;
- internal `interstellar` remains unchanged;
- marker does not rely on color alone;
- marker does not create an unnecessary tab stop.

The final SVG substitution remains optional polish unless the current symbol is materially problematic.

---

# Audit question 13 — compact Add controls

Verify:

- visual labels are `+ Add` / `＋ 追加`;
- full semantic action remains in `aria-label`;
- full semantic action remains available in tooltip/title if intended;
- click target size did not shrink;
- disabled behavior remains correct;
- context makes object type visually unambiguous;
- no language hard-coding was introduced.

---

# Audit question 14 — form labeling

Audit:

- system selector;
- body selector;
- biome controls;
- outpost name;
- search input;
- cargo destination selectors;
- any text/number inputs;
- locale selector.

Determine whether each control has a programmatic label or equivalent accessible name.

Do not assume placeholder text is an adequate label.

---

# Audit question 15 — validation/error semantics

Inspect validation/status surfaces.

Verify:

- errors/warnings are textually distinguishable, not color-only;
- severity is available in text or accessible semantics where appropriate;
- messages remain understandable when read without layout;
- IDs/context labels do not become unreadable under Japanese;
- validation rows expose full issue text;
- localized names resolve through stable IDs.

If ARIA live regions/status roles are absent, evaluate whether they are actually needed before calling it a defect.

---

# Audit question 16 — color dependence

Audit places where color indicates:

- present/producing states;
- warnings/errors;
- active/selected items;
- disabled state;
- cargo/link status;
- validation severity.

Determine whether meaning is also conveyed by:

- text;
- icon;
- shape;
- border;
- label;
- state semantics.

Report any case where color is the only carrier of essential meaning.

---

# Audit question 17 — contrast

Perform a source/style-level contrast audit for major text/control states.

Prioritize:

- primary body text;
- muted text;
- disabled text;
- selected rows;
- validation warning/error text;
- buttons;
- focus indicators;
- tooltip text;
- status text.

If automated contrast tooling exists in the repository/browser, use it.

Otherwise identify suspicious combinations and defer exact manual measurement to the final manual checklist.

Do not claim WCAG conformance without actual measurement.

---

# Audit question 18 — zoom/reflow readiness

From source/layout rules, inspect likely behavior at:

```text
125%
150%
```

browser zoom.

The previous tooling could not observe zoom reliably.

For now:

- identify components at risk;
- verify no fixed-height clipping in CSS;
- verify no text is hidden solely because of absolute dimensions;
- prepare manual checks for the user.

Do not mark untested zoom behavior as passed.

---

# Audit question 19 — iPhone/WebKit readiness

Do not treat iPhone as a supported mobile layout target unless the product already claims that.

Use it as a **WebKit/font sanity check** only.

Audit whether:

- the `:lang(ja)` stack will sensibly fall through to Hiragino/system fonts;
- no desktop-only hover assumption blocks core semantics;
- no viewport meta/config issue would make the page completely unusable for a brief sanity check.

The actual iPhone check belongs in the final manual checklist.

---

# Audit question 20 — search accessibility

Verify search behavior remains accessible after alias expansion.

Check:

- search input has a proper label;
- result rows expose localized display names;
- duplicate aliases do not create duplicate options;
- stable identity is preserved;
- category disambiguation is understandable;
- keyboard selection works;
- no hidden English alias is announced as if it were the visible name unless intentionally exposed.

---

# Audit question 21 — locale-aware collation regression

Verify the presentation-layer collation changes did not alter domain semantics.

Confirm:

- star systems sort by localized display name;
- bodies remain in existing order;
- resource topology remains fixed;
- X-Tech placement remains fixed;
- persisted outpost order remains fixed;
- validation severity remains fixed;
- history chronology remains fixed.

---

# Audit question 22 — generated/reference drift

Run all localization/reference verification commands.

Any drift in:

```text
localized-name provenance
reference-name overlay
terminology provenance
```

must be treated as release-significant.

Do not regenerate/accept drift during the audit.

---

# Audit question 23 — test-suite release coverage

Review current automated tests against release-critical invariants.

Identify gaps in:

- locale switching;
- search aliases;
- history relocalization;
- persistence locale-independence;
- compact-control accessible names;
- terminology closure;
- collation;
- generated-reference zero drift.

Classify missing tests as:

```text
BLOCKER
HIGH
MEDIUM
LOW
```

Do not add tests during the audit.

---

# Audit question 24 — release-blocker classification

Classify all findings:

```text
BLOCKER
HIGH
MEDIUM
LOW
COSMETIC
```

Definitions:

- BLOCKER: data corruption, broken core workflow, inaccessible essential function, invalid localization state, or release integrity failure;
- HIGH: major accessibility/usability defect affecting common tasks;
- MEDIUM: clear product-quality/accessibility defect with workaround;
- LOW: minor inconsistency or edge-case weakness;
- COSMETIC: polish only.

---

# Audit question 25 — accepted limitations

Create an explicit list of limitations that are known but acceptable for release if unchanged.

Candidates may include:

- no macOS desktop visual test;
- iPhone used only as WebKit/font sanity check;
- composed-fauna final in-game separator not byte-confirmed;
- provisional Inter-System symbol awaiting possible SVG replacement;
- import-summary locale collation deferred;
- full independent outpost-navigation scrolling deferred.

Do not automatically classify these as defects.

---

# Audit question 26 — implementation slicing if defects are found

If the audit finds issues, recommend the smallest correction slices.

Prefer:

```text
accessibility semantics fixes
release-blocking localization fixes
focus/label fixes
contrast fixes
small test gaps
```

Avoid reopening large architecture.

---

# Manual verification checklist — LAST

Only after completing all repository/source/test audit work, produce a manual verification section for the user.

Do not perform or report these as complete unless actually observed.

The checklist should be concise and actionable.

---

## Manual check 1 — Windows primary browser

Verify on the user’s normal Windows browser:

- en-US;
- en-GB;
- ja-JP;
- locale switching;
- search;
- matrix;
- Planned Supply;
- Cargo Links;
- validation;
- history;
- About/settings.

Record any visual or interaction regression.

---

## Manual check 2 — browser zoom

At:

```text
100%
125%
150%
```

check representative screens:

- header;
- outpost details;
- matrix;
- cargo editor;
- validation panel;
- dialogs.

Look for:

- clipping;
- hidden controls;
- horizontal document overflow;
- unreadable overlap;
- lost focus ring.

---

## Manual check 3 — iPhone Safari sanity check

Use iPhone Safari only as a WebKit/font fallback sanity check.

Verify:

- Japanese glyphs render cleanly;
- no tofu;
- Hiragino/system fallback looks coherent;
- app title remains intentional;
- tooltip-dependent meaning is not the only way to understand essential controls;
- page is not catastrophically broken.

Do not treat this as mobile-support certification.

---

## Manual check 4 — keyboard-only pass

Using keyboard only:

- Tab through major controls;
- activate Add buttons;
- operate search;
- open/close dialogs;
- use selectors;
- reach cargo controls;
- confirm visible focus;
- confirm no trap.

---

## Manual check 5 — optional screen-reader smoke test

If practical on Windows, use Narrator or another available screen reader for a short smoke test.

Focus on:

```text
+ Add
Inter-System marker
search
locale selector
validation summary
dialog close controls
```

This is desirable but should not be mandatory if tooling familiarity is low.

---

## Manual check 6 — composed-fauna evidence

If the user later finds a first-party Japanese screenshot or in-game display of a dynamically composed fauna name, compare separator behavior.

Do not block release solely on this if current rendering remains legible and no contradictory evidence exists.

---

## Manual check 7 — marker prototype

Confirm `✷⇄✷` still looks acceptable after font/platform checks.

If it looks inconsistent, retain semantics and schedule a later custom SVG replacement.

Do not reopen the cargo domain model.

---

# Required report sections

## Executive summary

Include:

```text
release readiness outcome
finding count by severity
localization closure status
reference/provenance closure status
accessibility blocker count
whether any core workflow is inaccessible
whether any user-facing hard-coded prose remains
whether any persistence invariant failed
```

## Localization/release integrity table

```text
Area
Expected
Observed
Status
Severity
```

## Accessibility findings table

```text
Component
Issue
Evidence
RecommendedChange
Severity
```

## Accepted limitations

List known non-blocking limitations separately.

## Manual verification checklist

Place this section last.

## Recommended correction slices

Only if needed.

---

# Audit disposition

End with one of:

## Outcome A — release ready pending manual checks

No repository/source-level blocker remains. Only the final manual checklist is outstanding.

## Outcome B — minor corrections required

A small number of focused fixes should be made before final manual verification.

## Outcome C — release blockers remain

One or more core accessibility, localization, persistence, or release-integrity defects must be corrected before release.

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

Run any existing accessibility/static-analysis command if the repository already has one.

Do not add dependencies during the audit.

---

# Final report requirements

The report must state:

1. exact finding count by severity;
2. whether localization is numerically complete;
3. whether reference/provenance/terminology verification is clean;
4. whether locale switching is presentation-only;
5. whether persistence/import/export/history invariants hold;
6. whether any essential workflow has an accessibility blocker;
7. whether keyboard navigation is structurally sound;
8. whether focus treatment is adequate;
9. whether compact controls have proper accessible names;
10. whether the Inter-System marker is correctly exposed;
11. whether color-only meaning exists;
12. whether any user-facing hard-coded prose remains;
13. known accepted limitations;
14. smallest correction scope, if any;
15. the final manual verification checklist;
16. release recommendation.

Do not proceed to implementation unless separately instructed.

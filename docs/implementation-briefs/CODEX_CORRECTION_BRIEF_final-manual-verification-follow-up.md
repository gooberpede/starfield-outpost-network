# CODEX CORRECTION BRIEF — Final Manual-Verification Follow-Up

## Purpose

Apply one final narrow correction pass based on completed manual accessibility testing.

This pass addresses exactly three issues:

1. Search Results focus hand-off after successful keyboard search.
2. Partially clipped focus indicators in Planned Supply and Cargo Link reshuffle controls.
3. Import live-region announcements not being spoken by Narrator.

Everything else from the previous release-accessibility work should remain unchanged.

Do **not** commit or push.

---

# Manual verification findings

Treat these as observed facts:

## Search

Search keyboard mechanics pass:

```text
Arrow Up / Arrow Down
Enter
Escape
```

However, after a successful search, the Search Results palette is visually adjacent to Search but its controls occur at the end of the document tab order.

Result:

```text
keyboard user executes a search
-> Search Results opens
-> user must Tab through many unrelated controls
-> eventually focus reaches Search Results
```

This is a real keyboard usability defect.

## Focus indicators

Focus indicators are present, but some are partially clipped by container boundaries.

Observed areas:

- Planned Supply controls.
- Cargo Link reshuffle move buttons near the right edge.

The ring is technically visible but not fully rendered.

## Screen reader / status feedback

Manual Narrator smoke test:

- Export success/failure announcements worked.
- Import success was not announced.
- Import failure was not announced.
- On failed import, Narrator announced only that the status message could be dismissed with a button.

The status UI exists, but import outcome text is not being announced correctly.

---

# Explicit passes / non-issues

Do not change these:

- `✷⇄✷` collapsed Inter-System marker:
  - remains out of keyboard focus;
  - Narrator announces `Inter-System Cargo Link - graphic` when directly inspected;
  - PASS.
- Search arrows/Enter/Escape behavior:
  - PASS.
- Existing export live-region behavior:
  - PASS unless harmless shared consolidation is required.
- Validation severity placement:
  - PASS.
- Muted/disabled contrast work:
  - PASS.
- Drag-handle keyboard semantics:
  - PASS.
- Fauna U+0020 separator:
  - PASS, confirmed against in-game Japanese screenshots.
- Safari/iPhone sanity check:
  - DEFERRED to backlog due unavailable suitable test environment;
  - not a release failure.

---

# Correction 1 — Search Results focus hand-off

## Goal

After a successful explicit keyboard search, move keyboard focus directly into the Search Results surface so the user can interact with it immediately.

Do not require a user to traverse the remainder of the application tab order first.

## Preferred behavior

```text
Search input
-> choose/submit result with Enter
-> Search Results opens
-> focus moves to Search Results surface
```

From there:

- the user can Tab through Search Results controls;
- closing the palette restores focus to Search.

## Portal behavior

Do **not** remove the existing portal merely to fix tab order.

Fix focus explicitly rather than trying to force DOM source order across the portal.

## Focus target

Choose the most semantically appropriate first target.

Preferred order:

1. Search Results region/container if intentionally focusable and clearly labelled.
2. Otherwise the first actionable control inside Search Results.

If focusing the region itself, use a deliberate programmatic-focus mechanism such as:

```text
tabIndex={-1}
```

Do not place the region into normal sequential tab order unnecessarily.

## Focus restoration

When Search Results closes through its close control or Escape:

```text
focus -> Search input
```

Preserve existing Escape priority.

Do not steal focus on unrelated rerenders.

## Pointer behavior

If practical, make the hand-off specific to keyboard-originated submission.

If that adds unnecessary complexity, an unconditional focus hand-off after explicit submit is acceptable provided it does not create an obvious pointer regression.

Report which approach was used.

---

# Correction 2 — prevent focus-ring clipping

## Goal

Ensure keyboard focus indicators remain fully visible when controls sit against container edges.

Observed clipping exists in:

- Planned Supply.
- Cargo Link reshuffle move buttons near the right margin.

## Preferred strategy

Do not change control geometry unless necessary.

Prefer a consistent focus treatment that renders inside the control bounds where clipping is possible, for example:

```css
outline-offset: -2px;
```

or an equivalent inset focus ring.

The required result is:

```text
focused control
-> complete visible focus indicator
-> no clipping at container boundary
```

## Scope

Audit the shared focus treatment for the affected control families.

If one shared focus rule/token solves the issue consistently, prefer that.

Do not add component-specific padding hacks unless unavoidable.

Do not weaken focus-ring contrast or visibility.

## Regression checks

Verify at least:

- Planned Supply first/last items in a row.
- Planned Supply selected/unavailable states.
- Cargo Link reshuffle top/bottom move buttons.
- Right-edge move buttons.
- Compact Add controls.
- Selected/dark-state controls.

Do not create layout shifts.

---

# Correction 3 — import live-region announcements

## Goal

Make import success and import failure announcements actually reach screen readers.

Current manual result:

```text
Export -> announced
Import -> not announced
```

So the live-region architecture exists, but the import lifecycle is not triggering it correctly.

## Investigation

Inspect the exact import status lifecycle.

Possible causes include:

- live region mounting with already-populated text;
- live region being replaced instead of updated;
- message appearing before the live region exists;
- import success/failure using a different DOM branch from export;
- `role="status"` / `role="alert"` attached to a wrapper that does not receive the changing text;
- remounting preventing announcement.

Do not assume the cause. Confirm it from the rendered structure.

## Required behavior

### Import success

Announce the success text once through a polite live-region pattern.

### Import failure

Announce the failure text once through an appropriate assertive/alert pattern.

The dismiss button remains independently focusable and labelled.

Do not announce only the dismiss control.

## Announcement architecture

Prefer one stable live-region node whose text content updates.

Avoid:

- mounting a pre-populated live region;
- duplicate nested live regions;
- duplicate announcements;
- mixing polite and assertive semantics on the same update.

If export and import share the same status infrastructure, keep them unified.

Do not regress export announcements.

## Visible UI

Do not change visible import/export wording unless required for the fix.

Do not extend message duration merely to compensate for broken live semantics.

---

# Tests

Update or add the smallest useful rendered/component coverage.

## Search focus

Verify:

- successful keyboard submission opens Search Results;
- focus moves into Search Results;
- close restores focus to Search;
- Escape restores focus appropriately;
- portal behavior remains intact.

Test the explicit focus-hand-off contract rather than browser tab-order internals.

## Focus clipping

CSS clipping itself may be difficult to validate in JSDOM.

Do not add brittle pixel/layout tests.

Rely on manual browser verification for final visual confirmation.

## Import announcements

Rendered tests should verify:

- success uses polite status semantics;
- failure uses error/alert semantics;
- live-region node remains stable while text updates, if that is the implementation;
- export semantics still pass;
- no duplicate live region exists.

JSDOM cannot prove actual speech; test the DOM pattern that supports it.

---

# Manual re-check after implementation

Retest only these three areas.

## Search

- keyboard-only search;
- submit with Enter;
- verify focus lands in Search Results;
- close and verify focus returns to Search.

## Focus indicators

- Planned Supply edge cells;
- Cargo Link reshuffle right-edge buttons;
- confirm ring is fully visible.

## Narrator

Test:

- successful import;
- failed import;
- successful export;
- failed export.

Expected:

```text
import success announced once
import failure announced once
export success still announced once
export failure still announced once
dismiss button remains separately accessible
```

---

# Backlog note

Do not attempt Safari/iPhone compatibility work in this pass.

Suggested backlog wording:

```text
Apple/WebKit compatibility verification
- Re-test public production build in Safari/WebKit.
- Verify Japanese font fallback on iPhone/iPad/macOS Safari.
- Investigate current iPhone blank-page behavior if reproducible against the public build.
- Treat Apple mobile devices as compatibility/font sanity targets, not a mobile-support commitment.
```

---

# Verification commands

Run at minimum:

```text
npm test
npm run test:components
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

No game files should be required.

---

# Acceptance criteria

The pass is complete when:

1. successful keyboard search transfers focus into Search Results;
2. closing Search Results returns focus to Search;
3. the portal remains in place unless a concrete blocker requires otherwise;
4. Search arrows/Enter/Escape remain unchanged and working;
5. Planned Supply focus rings are fully visible at container edges;
6. Cargo Link reshuffle move-button focus rings are fully visible at the right edge;
7. no focus-indicator contrast regression is introduced;
8. import success is announced through a polite live-region pattern;
9. import failure is announced through an assertive/alert pattern;
10. export announcements continue to work;
11. dismiss controls remain separately accessible;
12. no duplicate announcements are introduced;
13. no Safari/mobile work is introduced;
14. no unrelated accessibility/domain/layout changes are made;
15. all tests/build/lint/verifiers pass;
16. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- Search Results focus-hand-off implementation;
- whether focus hand-off is keyboard-only or unconditional;
- focus restoration behavior;
- focus-ring CSS strategy used;
- affected control families;
- exact import live-region root cause;
- exact import live-region fix;
- confirmation export announcements remain intact;
- tests added/updated;
- manual re-check results if performed;
- full verification results;
- confirmation that Safari/iPhone work was deferred and not implemented.

# CODEX MINI-CORRECTION BRIEF — Final Accessibility Fixes

## Purpose

Apply exactly two final accessibility corrections discovered in manual verification.

Do **not** reopen any other Parcel F work.

Do **not** commit or push.

---

# Correction 1 — selected Planned Supply focus ring contrast

## Current state

The inset focus-ring change successfully fixed clipping at container edges.

However, when a Planned Supply cell is in the dark selected/planned state, the current inset focus ring is too dark against the dark button fill and becomes effectively invisible.

Observed:

- unselected/light cells: current inset ring works;
- unavailable cells: current inset ring works;
- selected/planned dark cells: focus ring disappears visually.

## Required fix

Keep the current inset focus treatment.

Do **not** revert to an external outline.

Add a contrasting light focus treatment specifically for dark selected/planned Planned Supply cells.

Conceptually:

```css
.planned-supply__item:focus-visible {
  outline: 2px solid var(--ui-structural-dark);
  outline-offset: -2px;
}

.planned-supply__item--planned:focus-visible {
  outline-color: <measured light focus color>;
}
```

Exact selector/token may differ.

Requirements:

- focus ring remains inset;
- selected/planned cells get a clearly visible light ring;
- light/unselected/unavailable states retain the existing dark inset ring if appropriate;
- no layout shift;
- no clipping;
- do not weaken selected-state readability.

Prefer an existing suitable light UI token if one already provides strong contrast.

Do not introduce a new token unless needed.

## Manual re-check

Verify:

- selected Europium/planned cell;
- normal selectable cell;
- unavailable cell.

All three must show a complete, obvious focus indicator.

---

# Correction 2 — stable separate live regions for success and error

## Current problem

Import success is now announced by Narrator.

Import failure is still not announced.

The current implementation appears to use one live-region node whose semantics change dynamically between:

```text
role="status" / aria-live="polite"
```

and:

```text
role="alert" / aria-live="assertive"
```

when the message kind changes.

That role/live-mode mutation is not proving reliable in Narrator.

## Required fix

Replace the dynamic-role approach with **two stable, pre-mounted live regions**:

```html
<div role="status" aria-live="polite">
  <!-- success/info text only -->
</div>

<div role="alert" aria-live="assertive">
  <!-- error text only -->
</div>
```

Behavior:

- success/info message -> populate polite region, clear assertive region;
- error message -> populate assertive region, clear polite region;
- both nodes remain mounted;
- visible Status Bar presentation stays separate;
- dismiss button remains separately focusable/labelled;
- no duplicate announcement.

Do not change visible import/export wording.

Do not change message duration.

Do not regress export announcements.

## Important

Do not merely swap one conditional live-region node for another conditional node.

The intent is that both semantic regions exist stably before messages arrive.

---

# Tests

Update the smallest relevant component tests.

## Planned Supply focus

Do not attempt pixel-level JSDOM visual testing.

A source/class regression is sufficient if useful.

Manual browser verification remains authoritative for visible focus contrast.

## Live regions

Verify rendered DOM contains:

- one stable polite status region;
- one stable assertive alert region;
- success text appears only in polite region;
- error text appears only in assertive region;
- inactive region is empty;
- visible dismiss control remains outside the live regions;
- no duplicate message node is exposed in multiple live regions.

Preserve existing export status tests.

---

# Explicit non-goals

Do not change:

- Search focus hand-off;
- Search portal behavior;
- Cargo reshuffle focus treatment;
- validation severity;
- muted/disabled tokens;
- Inter-System marker semantics;
- drag-handle behavior;
- Safari/WebKit backlog;
- localization architecture;
- domain/persistence/history/import-export schema.

---

# Verification

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

---

# Acceptance criteria

Complete when:

1. selected/planned Planned Supply cells show a clearly visible light inset focus ring;
2. unselected/unavailable Planned Supply cells retain a clearly visible complete inset ring;
3. focus rings remain unclipped;
4. import success remains announced once;
5. import failure is announced once;
6. export success/failure announcements still work;
7. polite and assertive live regions are both stable/pre-mounted;
8. no duplicate announcements are introduced;
9. dismiss control remains separately accessible;
10. all tests/build/lint/verifiers pass;
11. no unrelated changes are made;
12. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- selected-state focus-ring implementation;
- exact light token/color used;
- live-region structure after correction;
- confirmation both regions remain mounted;
- test updates;
- full verification results;
- confirmation no unrelated Parcel F work changed.

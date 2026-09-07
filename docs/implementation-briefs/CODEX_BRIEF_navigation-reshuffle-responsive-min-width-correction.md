# Codex Correction Brief — Navigation Reshuffle Minimum Width

## Objective

Correct the responsive workspace behavior introduced in the recent responsive-layout pass so that the Navigation pane remains usable while **reshuffle mode** is active.

The responsive layout itself is otherwise successful and should be preserved.

The specific defect is:

> At the narrowest browser width before normal-mode Matrix horizontal overflow appears, entering Navigation reshuffle mode compresses outpost names so aggressively that they become nearly unreadable.

This makes reshuffling impractical because the user cannot reliably identify the outposts being reordered.

The fix should be narrow and mode-specific.

---

## 1. Preserve the successful responsive layout

Do **not** revert the recent responsive workspace changes.

Preserve:

- proportional Navigation / Matrix / Cargo resizing;
- current ordinary-mode Matrix overflow threshold as closely as possible;
- current Cargo responsive sizing;
- current Matrix responsive sizing;
- thin technical scrollbars;
- existing Cargo and Matrix behavior.

The problem is specifically the Navigation pane's minimum width while reshuffling.

---

## 2. Current behavior to correct

The new Navigation track currently allows a minimum approximately equivalent to:

```css
minmax(10rem, ...)
```

That minimum is acceptable in normal navigation mode.

It is **not** sufficient in reshuffle mode, where each row must accommodate:

```text
drag handle | outpost name | move up | move down
```

At the current narrow minimum, the controls consume most of the available horizontal space and the outpost names collapse to only a few characters.

---

## 3. Required behavior

Use a **larger functional minimum width for Navigation only while reshuffle mode is active**.

### Normal mode

Navigation should continue to contract aggressively.

Preserve the current responsive gain.

### Reshuffle mode

Navigation must remain wide enough that outpost names are still meaningfully readable alongside:

- drag handle;
- move-up control;
- move-down control.

Do not require full untruncated names, but do require enough visible text to distinguish outposts reliably.

---

## 4. Measure before choosing the value

Do not blindly use a fixed value from this brief.

Measure the actual row geometry in reshuffle mode and determine a practical minimum.

A rough range such as:

```text
12–14rem
```

may be a useful starting point, but the final value should come from runtime measurement.

The minimum should be the smallest width that preserves useful outpost identity.

---

## 5. Preferred implementation

Use the least invasive mode-aware layout mechanism available in the existing component structure.

Possible approaches include:

- a reshuffle-state class on the Navigation/workspace container;
- a CSS variable controlling the Navigation minimum;
- an existing mode/state class already present in the DOM;
- another simple state-aware CSS mechanism.

Avoid unnecessary architectural changes.

Do not add a new global state system for this.

Do not use brittle DOM-dependent selectors if a cleaner existing state hook is available.

---

## 6. Important design principle

Treat this as a **mode-dependent functional minimum**.

The intended rule is:

> Navigation may shrink to its normal minimum when locked, but entering reshuffle mode increases the minimum width enough to preserve outpost identity.

It is acceptable for Matrix horizontal scrolling to begin at a somewhat wider browser width while reshuffle mode is active.

That is preferable to unreadable navigation rows.

---

## 7. Do not solve this by shrinking controls

Do **not** fix the problem by:

- making the move buttons materially smaller;
- hiding move-up or move-down controls;
- removing drag handles;
- reducing text to two or three visible characters;
- adding horizontal scrolling to Navigation;
- reducing row hit areas below their current usable size.

The current reorder controls are acceptable.

The pane needs more width while the mode is active.

---

## 8. Preserve current row behavior

Keep existing:

- drag/drop behavior;
- arrow-button reorder behavior;
- first/last disabled move controls;
- selected-row behavior;
- outpost ordering semantics;
- visual styling of drag handles and arrows.

Only adjust layout/minimum-width behavior as needed.

---

## 9. Interaction between mode and width

Verify the following transition explicitly:

### Start in normal mode at a narrow-but-valid width

- Navigation is compact.
- Matrix has no horizontal scrollbar.

### Enter reshuffle mode

Expected:

- Navigation expands to its reshuffle minimum if needed.
- Matrix may give up width.
- If necessary, Matrix horizontal overflow may appear.
- Outpost names remain useful/readable.

### Exit reshuffle mode

Expected:

- Navigation returns to the normal responsive minimum.
- Matrix reclaims width.
- Any reshuffle-only Matrix scrollbar disappears if no longer needed.

No full-page horizontal scroll should appear.

---

## 10. Responsive layout scope

Do not change Cargo minimums or proportional behavior unless measurement reveals a direct dependency.

Do not redesign the three-pane fraction system.

This should be a narrow Navigation correction.

---

## 11. Visual target

The Navigation pane in reshuffle mode should still look compact, but rows should resemble:

```text
[handle]  Feynman VI-b Al Be...  [↑] [↓]
```

rather than:

```text
[handle]  Fe...  [↑] [↓]
```

Exact visible character count is not prescribed.

The requirement is practical distinguishability.

---

## 12. Testing

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

### Browser smoke tests

Test at least:

1. wide viewport;
2. ordinary viewport;
3. the current normal-mode just-before-Matrix-overflow width;
4. slightly narrower than that.

At each width verify both:

```text
normal Navigation mode
reshuffle mode
```

Record:

- viewport width;
- Navigation computed width;
- Matrix computed width;
- Cargo computed width;
- whether Matrix horizontal overflow exists;
- approximate useful text width available to an outpost name in reshuffle mode.

---

## 13. Specific regressions to check

Verify:

- entering reshuffle mode does not cause page-level horizontal scrolling;
- outpost names remain distinguishable;
- move controls do not overlap names;
- drag handles do not overlap names;
- row height does not change unexpectedly;
- Navigation selection still works after leaving reshuffle mode;
- drag/drop still works;
- arrow reordering still works;
- Matrix remains usable if its scrollbar appears;
- Cargo remains unchanged;
- no console warnings/errors.

---

## 14. Completion report

Report:

```text
files changed
mechanism used to apply reshuffle-specific minimum
normal-mode Navigation minimum
reshuffle-mode Navigation minimum
measured Navigation widths at representative viewports
normal-mode Matrix overflow threshold
reshuffle-mode Matrix overflow threshold
tests/checks run
browser smoke-test results
```

Explicitly state whether:

- the ordinary responsive layout changed;
- Cargo sizing changed;
- Matrix sizing logic changed;
- Navigation reorder semantics changed;
- any out-of-scope styling changed.

Do not commit or push unless explicitly asked.

---

## 15. Suggested commit message

If accepted together with the responsive-layout pass:

```text
fix: preserve navigation width during reshuffle
```

---

## 16. Final instruction

Keep the successful responsive-layout work.

Only add the missing rule:

> **Reshuffle mode requires a larger Navigation functional minimum than locked mode.**

Readable outpost identity is more important than preserving the last few pixels of Matrix width while reshuffling.

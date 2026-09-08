# Codex Research Brief — Cargo Pad Header Remote-Outpost Name Width Audit

## Objective

Audit the Cargo Pad header to determine how to preserve more of the **remote outpost name** before ellipsis occurs, while keeping the header compact and stable.

This is a research/measurement task first.

Do **not** immediately redesign the Cargo Pad header or broader workspace.

The specific design target is:

> Preserve as much of a normal Starfield outpost name as practical in the Cargo Pad header, using **25 characters** as the standard in-game design envelope, while still degrading gracefully for longer modded names.

Ellipsis remains acceptable as a fallback. The goal is to reduce how often it occurs and to avoid truncating names so aggressively that similar outposts become hard to distinguish.

---

## 1. Read project guidance first

Inspect:

```text
AGENTS.md
README.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
```

Inspect especially:

```text
Cargo Pad editor / summary component(s)
Cargo Pad CSS
workspace layout CSS that constrains the Cargo pane
any shared compact-summary styles
```

Find the exact components and styles responsible for:

- Cargo Pad header layout;
- remote outpost name display;
- ellipsis/truncation;
- pad ordinal;
- cargo type / Inter-System indicator;
- expand/collapse or edit controls;
- any other content sharing the same horizontal row.

Report the relevant file paths.

---

# PART A — CURRENT HEADER GEOMETRY

## 2. Identify the current layout model

Document the current Cargo Pad header structure.

For example, determine whether it uses:

```text
CSS Grid
Flexbox
fixed widths
min-width / max-width
flex-basis
gap
padding
auto-sized controls
```

Describe the current visible order conceptually, e.g.:

```text
Pad identifier | remote outpost name | type/status | controls
```

Use the actual current implementation rather than assuming this example is correct.

---

## 3. Measure where the width goes

At representative Cargo-pane widths, measure:

```text
total header width
horizontal padding
gaps
remote-outpost-name width
width of every sibling control/label
unused/free space
```

Identify which elements are:

- genuinely fixed by usability;
- fixed only by current CSS;
- flexible;
- allowed to shrink;
- currently refusing to shrink;
- consuming more width than necessary.

Report whether the remote outpost name is currently receiving the remaining width efficiently.

---

# PART B — NAME DESIGN TARGET

## 4. Standard game envelope

Treat:

```text
25 characters
```

as the normal Starfield maximum outpost-name design target.

The audit should answer:

> At normal Cargo-pane widths, how much space is required to display representative 25-character outpost names fully or nearly fully?

Do not use character count alone as a pixel measurement; use the actual UI font because character widths vary.

---

## 5. Representative test names

Test several categories:

### Short

Examples around:

```text
8–12 characters
```

### Medium

Examples around:

```text
15–20 characters
```

### Standard maximum

Examples at or near:

```text
25 characters
```

### Shared-prefix names

Use names where distinguishing information is late in the string, such as conceptually:

```text
Feynman III Sealant U V Ir
Feynman III Manufacturing
Feynman III Cargo Gateway
```

The exact strings may be adjusted to fit the 25-character target.

The key failure mode to test is:

> Multiple names become visually indistinguishable because ellipsis hides their distinguishing suffixes.

### Modded / stress case

Test names longer than 25 characters.

These do **not** need full display.

Expected behavior:

```text
preserve as much as practical
ellipsis cleanly
full name remains available via title/tooltip
```

---

# PART C — TYPOGRAPHIC WIDTH AUDIT

## 6. Measure real 25-character cases

Using the actual Cargo Pad header font and font size, report the rendered widths of a representative set of 25-character names.

Include:

```text
narrow-character-heavy case
average/mixed case
wide-character-heavy case
shared-prefix realistic case
```

The purpose is to determine a practical width target rather than assume all 25-character strings occupy the same space.

Report:

```text
typical 25-char width
90th-ish percentile practical width among tested cases
worst tested 25-char width
```

Do not overfit the header to pathological all-wide-glyph strings unless they are realistic.

---

# PART D — SIBLING-CONTROL AUDIT

## 7. Determine what can compress

For every other element in the Cargo Pad header, assess whether it can safely:

```text
shrink
use less padding
use a smaller gap
move to another row
change alignment
use a shorter visible label
be grouped differently
```

Do **not** implement these changes yet.

Report which changes would recover the most width with the least UX cost.

Important principle:

> The remote outpost name performs identification work and should receive meaningful width priority.

Do not sacrifice essential control clarity or accessibility merely to eliminate all ellipsis.

---

## 8. Check whether wrapping/reflow is appropriate

Determine whether any non-name header elements could move or wrap under constrained widths without damaging the compact Cargo Pad summary.

Potential possibilities may include:

```text
secondary status below the main row
controls grouped at the far edge
conditional second line
```

Do not assume this is preferable.

The audit should compare it against a simpler flex/grid rebalance.

---

# PART E — ELLIPSIS BEHAVIOR

## 9. Confirm truncation semantics

Verify:

- the name uses ellipsis rather than clipping;
- the full remote outpost name is available via `title` or tooltip;
- keyboard/focus behavior remains sensible if the name itself is interactive;
- truncation does not affect stable Cargo Pad geometry.

If the full name is not currently discoverable, report this as a defect.

Do not implement a heavyweight tooltip system for this audit.

---

## 10. Determine acceptable truncation threshold

Distinguish:

### Preferred

Most normal 25-character names display fully.

### Acceptable

A few wider 25-character names ellipsize slightly but remain distinguishable.

### Poor

Names with common prefixes lose their distinguishing suffixes too often.

### Stress fallback

Names over 25 characters ellipsize cleanly.

The implementation recommendation should aim for the first two states.

---

# PART F — PANE-WIDTH CONTEXT

## 11. Audit within the current Cargo pane

Measure the header at:

```text
current normal workspace width
narrow workspace width
near the current Cargo-pane minimum
```

Do not redesign the Cargo pane itself.

This audit should answer whether the name-width problem can be materially improved **inside the current pane geometry**.

If the Cargo pane itself is the dominant constraint, say so explicitly.

---

# PART G — DO NOT SOLVE NAVIGATION YET

## 12. Explicitly out of scope

Do not implement or audit in detail:

```text
Navigation pane widening
Navigation slide-away/collapse
Navigation keyboard shortcuts
manual workspace resizing
Cargo pane slide-away
global pane resizing
resource-matrix changes
```

The Navigation pane will receive its own later audit.

The only shared principle to carry forward is:

> Normal outpost names should remain distinguishable, with 25 characters as the standard game design envelope and longer modded names handled gracefully.

---

# PART H — RECOMMENDATION FORMAT

## 13. Deliver a concrete header width model

Report a table like:

| Element | Current width/behavior | Minimum practical width | Can compress? | Notes |
|---|---:|---:|---|---|
| Pad ordinal / identifier | ... | ... | ... | ... |
| Remote outpost name | ... | ... | yes | 25-char design target |
| Cargo type/status | ... | ... | ... | ... |
| Header action(s) | ... | ... | ... | ... |
| Padding/gaps | ... | ... | ... | ... |

Also report:

```text
current name width at representative pane sizes
recommended protected name width
expected 25-character coverage
remaining ellipsis frequency
```

---

## 14. Recommend the simplest implementation strategy

After measurement, recommend the smallest robust fix.

Possible strategies may include:

```text
better flex-grow / flex-shrink allocation
revised CSS Grid tracks
smaller sibling gaps/padding
protected min-width for the name
moving a secondary element
two-line behavior at narrow widths
another CSS-only approach
```

Prefer:

```text
CSS-only
stable
content-independent
minimal structural change
```

Do not dynamically measure the current outpost name and resize the header around it.

---

# PART I — ACCESSIBILITY / STABILITY

## 15. Verify preserved behavior

Any recommended implementation must preserve:

```text
full-name discoverability
focus-visible behavior
expand/collapse controls
reshuffle/reorder controls if present
Cargo Pad identity
stable layout
```

Do not trade accessibility for width.

---

# PART J — TEMPORARY EXPERIMENTS

## 16. Browser-only experiments

Use temporary DevTools/local CSS experiments as needed to test:

```text
alternative flex allocations
reduced gaps
reduced padding
larger protected name region
alternative grid tracks
```

Do not commit experimental values.

Take screenshots at useful thresholds if practical.

---

# PART K — REPOSITORY CLEANLINESS

## 17. Research task only

At the end:

```text
revert temporary source changes
git diff --check
git status
```

No commit or push.

Build/tests are optional unless source files are temporarily changed and need verification.

---

# PART L — COMPLETION REPORT

## 18. Report

Provide:

```text
files/components inspected
current header structure
current width allocation
root cause of premature ellipsis
25-character typography measurements
shared-prefix failure findings
modded-name stress findings
which sibling elements can safely compress
recommended name-width target
recommended implementation strategy
remaining unavoidable ellipsis cases
screenshots/measurements taken
git status
```

Explicitly state:

- whether the current Cargo pane is wide enough to materially improve the name display without pane resizing;
- whether most normal 25-character names can be preserved;
- whether any sibling element is consuming avoidable width;
- whether a structural reflow is actually necessary or a simple CSS rebalance is sufficient.

---

## 19. Final instruction

This audit should answer:

> **How can the Cargo Pad header preserve substantially more of the remote outpost name—designing around Starfield's normal 25-character limit—without making the header unnecessarily wide or eliminating ellipsis as a graceful fallback?**

Measure first, then recommend.

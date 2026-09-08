# Codex Research Brief — Navigation Pane Width Audit

## Objective

Audit the Outpost Navigation pane to determine how wide it should be in its normal visible state so that **standard Starfield outpost names remain distinguishable and, where practical, fully visible even in Reshuffle mode**.

Use **25 characters** as the normal in-game outpost-name design envelope.

This is a measurement/research task first.

Do **not** implement pane collapse, keyboard shortcuts, or broader workspace behavior yet.

The audit should answer:

> **How wide must the Navigation pane be so that a realistic 25-character outpost name can display fully even when the pane is in Reshuffle mode?**

Because the Navigation pane is planned to gain a slide-away/collapse option later, do not optimize for the narrowest permanently-visible pane. When visible, it should be properly useful.

---

## 1. Read project guidance first

Inspect:

```text
AGENTS.md
README.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect especially the current Navigation / Outpost-list components and styles, including:

```text
Navigation component(s)
Navigation CSS
WorkspaceLayout CSS
shared button/reorder styles
```

Report the exact relevant file paths.

Also review the current UX principle:

```text
Adapt before overflowing
```

and the 25-character design-envelope principle already applied to Cargo Pad destination names.

---

# PART A — CURRENT NAVIGATION GEOMETRY

## 2. Identify the current pane model

Document the current Navigation pane structure.

At minimum, identify:

```text
pane width / workspace track
heading/count row
Add Outpost control
Reshuffle / Lock order control
drag-handle gutter
outpost-name column
move-up control
move-down control
selected-row marker
row padding/gaps
```

State whether the pane uses:

```text
CSS Grid
Flexbox
fixed track
minmax()
fractional track
fixed width
intrinsic sizing
```

Describe the current row geometry in both:

```text
Locked mode
Reshuffle mode
```

---

## 3. Measure current width allocation

At representative viewport/workspace widths, measure:

```text
total Navigation pane width
usable inner width
left/right padding
drag-handle width
selected marker width
name-column width
move-up width
move-down width
inter-column gaps
```

Do this for both Locked and Reshuffle modes.

Report whether any fixed width or minimum is currently causing the name column to become unnecessarily narrow.

---

# PART B — OUTPOST-NAME DESIGN TARGET

## 4. Use 25 characters as the normal envelope

Treat:

```text
25 characters
```

as the standard Starfield outpost-name limit.

The design goal is stronger here than for Cargo Pad headers:

> In the normal visible Navigation pane, realistic 25-character names should display fully even in Reshuffle mode where practical.

Why:

- many outposts may begin with the body name;
- bodies may repeat the system name;
- distinguishing information often appears near the end;
- ellipsizing the suffix can make multiple outposts visually indistinguishable.

Do not design around pathological all-wide-glyph strings.

Longer modded names may ellipsize gracefully.

---

## 5. Test representative names

Use several categories.

### Short

Around:

```text
8–12 characters
```

### Medium

Around:

```text
15–20 characters
```

### Standard maximum

Realistic names at or near:

```text
25 characters
```

### Shared-prefix cases

Use examples where distinguishing information is late in the name, such as conceptually:

```text
Feynman III Sealant U V Ir
Feynman III Manufacturing
Feynman III Cargo Gateway
Feynman VII-b Nd Al He3
```

Adjust exact strings to remain realistic and within the normal design envelope.

The critical failure case is:

> multiple outposts become indistinguishable because ellipsis hides the suffix.

### Modded / stress case

Test names over 25 characters.

Expected:

```text
ellipsis allowed
full name discoverable
layout remains stable
```

---

# PART C — TYPOGRAPHIC WIDTH AUDIT

## 6. Measure 25-character name widths

Use the actual Navigation font, size, weight, and letter spacing.

Report rendered widths for representative 25-character names, including:

```text
narrow-glyph-heavy case
average realistic mixed case
wide realistic mixed case
shared-prefix realistic case
```

Report:

```text
typical realistic 25-char width
practical 90th-ish width among tested realistic names
worst realistic 25-char width
pathological wide-glyph stress width
```

Do not use character count alone as a pixel-width proxy.

---

# PART D — RESHUFFLE MODE AS THE SIZING CASE

## 7. Treat Reshuffle as the demanding visible state

The pane should be sized around the more demanding Reshuffle state.

Measure the width consumed by:

```text
drag handle
move-up control
move-down control
associated gaps/padding
```

Then calculate the pane width required so that the remaining name column can still accommodate realistic 25-character names.

Report:

```text
minimum practical pane width in Locked mode
minimum practical pane width in Reshuffle mode
recommended visible pane width
```

The **recommended visible pane width should be based on Reshuffle**, not Locked mode.

---

## 8. Do not solve by miniaturizing controls unless necessary

Do not assume the correct answer is to shrink:

```text
drag handle
arrow controls
font size
row height
focus outlines
```

First determine whether the real solution is simply to make the pane wider.

Only recommend control-size reductions if measurements show they are disproportionately large and can be reduced without harming usability/accessibility.

---

# PART E — NAME COLUMN BEHAVIOR

## 9. Audit current ellipsis

Confirm:

```text
overflow
text-overflow
white-space
title/tooltip/full-name discovery
```

for outpost names.

If full names are not discoverable when ellipsized, report that as a defect.

Do not add a heavyweight tooltip system in this audit.

---

## 10. Define acceptable truncation behavior

Distinguish:

### Preferred

Realistic 25-character names display fully in Reshuffle mode.

### Acceptable

Very wide but realistic 25-character names may ellipsize by a small amount while remaining distinguishable.

### Poor

Shared-prefix names lose their distinguishing suffix.

### Stress fallback

Names over 25 characters ellipsize cleanly.

The recommended pane width should target Preferred/Acceptable.

---

# PART F — PANE WIDTH VS WORKSPACE COST

## 11. Quantify the workspace tradeoff

Because the pane is expected to gain a future slide-away/collapse behavior, measure:

```text
current visible Navigation width
recommended wider visible Navigation width
difference in pixels/rem
effect on Resource Matrix available width
effect on Cargo pane if any
```

Do not redesign the workspace yet.

The purpose is to understand the cost of making Navigation genuinely useful while visible.

Also report how much width the main workspace would recover if Navigation were later fully hidden.

This is research only; do not implement collapse.

---

# PART G — CURRENT WORKSPACE CONSTRAINTS

## 12. Inspect WorkspaceLayout interaction

Determine how Navigation currently participates in the outer workspace grid.

Report:

```text
current grid-template track
minimum
fractional sizing
whether widening Navigation causes Matrix/Cargo compression
whether any breakpoint changes behavior
```

Do not modify it.

The later implementation may need to update this track, but this audit should only establish the correct target.

---

# PART H — DO NOT IMPLEMENT COLLAPSE YET

## 13. Explicitly out of scope

Do not implement:

```text
Navigation slide-away/collapse
Navigation reopen affordance
keyboard shortcut for Add Outpost
keyboard shortcuts for Previous/Next Outpost
manual pane resizing
Cargo pane collapse
workspace persistence of pane state
Resource Matrix changes
Cargo Pad changes
```

Those belong to later steps.

This audit is only about:

```text
what width the visible Navigation pane genuinely needs
```

---

# PART I — RECOMMENDATION FORMAT

## 14. Deliver a concrete width model

Report a table like:

| Element | Current width | Minimum practical width | Can compress? | Notes |
|---|---:|---:|---|---|
| Drag gutter | ... | ... | ... | ... |
| Name column | ... | ... | yes | 25-char target |
| Move-up control | ... | ... | ... | ... |
| Move-down control | ... | ... | ... | ... |
| Gaps/padding | ... | ... | ... | ... |

Also report:

```text
current pane width
Locked-mode practical width
Reshuffle-mode practical width
recommended visible pane width
expected 25-character coverage
```

---

## 15. Recommend the simplest future implementation

After measurement, recommend the smallest robust strategy.

Possible outcomes may include:

```text
increase Navigation track min-width
increase Navigation fixed/minmax width
rebalance row grid tracks
reduce avoidable gaps
combination of pane-width increase + minor row rebalance
```

Prefer:

```text
CSS-only
stable
content-independent
no runtime text measurement
```

Do not optimize the pane per selected outpost.

---

# PART J — FUTURE COLLAPSE CONTEXT

## 16. Keep later slide-away design in mind

The later plan is:

```text
visible Navigation = wide enough to be genuinely useful
hidden Navigation = fully out of the way
```

Therefore, do not constrain the recommended visible width merely because the pane is permanently visible today.

The audit may explicitly state:

```text
recommended visible width
expected recovered workspace width when hidden later
```

But do not design the collapse affordance yet.

---

# PART K — ACCESSIBILITY / INTERACTION

## 17. Preserve control usability

Any future recommendation must preserve:

```text
keyboard access
focus-visible outlines
drag-handle usability
move-arrow usability
selected-row marker
row readability
```

Do not trade these away for name width.

---

# PART L — TEMPORARY EXPERIMENTS

## 18. Browser-only measurement

Use DevTools or temporary local CSS to test candidate pane widths.

Test both:

```text
Locked mode
Reshuffle mode
```

At useful thresholds, verify:

```text
full name visibility
shared-prefix distinguishability
Matrix compression side effect
Cargo pane side effect
```

Take screenshots if practical.

Do not commit experimental values.

---

# PART M — REPOSITORY CLEANLINESS

## 19. Research task only

At completion:

```text
revert temporary source changes
git diff --check
git status
```

No commit or push.

Build/tests are optional unless source files are temporarily changed and need verification.

---

# PART N — COMPLETION REPORT

## 20. Report

Provide:

```text
files/components inspected
current pane/grid geometry
current Locked name width
current Reshuffle name width
25-character typography findings
shared-prefix failure findings
recommended visible pane width
Locked vs Reshuffle width requirements
which controls/gaps are truly fixed
workspace cost of widening the pane
future workspace width recovered when hidden
whether current row geometry also needs rebalancing
recommended implementation strategy
screenshots/measurements
git status
```

Explicitly state:

- whether Reshuffle mode can support realistic 25-character names without shrinking controls;
- whether the current pane is simply too narrow;
- whether minor gap/padding changes are also useful;
- how much wider the Navigation pane should become;
- whether the later collapse feature makes that wider visible pane a sensible tradeoff.

---

## 21. Final instruction

This audit should answer:

> **How wide should the visible Navigation pane be so that realistic 25-character outpost names remain fully readable even in Reshuffle mode, while preserving the existing reorder controls and preparing for a later slide-away Navigation design?**

Measure first, then recommend.

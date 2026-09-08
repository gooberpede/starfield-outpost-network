# Codex Implementation Brief — Resource Matrix Compression

## Objective

Implement the Resource Matrix compression improvements identified by the completed audit.

The goal is to postpone horizontal scrolling until the Matrix reaches a genuinely unusable width, rather than the current arbitrary `49rem` floor.

This is a focused Matrix-layout pass.

Do **not** implement workspace pane resizing, pane show/hide controls, or broader workspace behavior yet.

---

## 1. Read project guidance first

Inspect:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect especially:

```text
src/ui/components/OutpostStatusMatrix.css
src/ui/components/OutpostStatusMatrix.tsx
src/ui/layout/WorkspaceLayout.css
```

Also review the completed Matrix compression audit and its measured thresholds.

---

# PART A — LOCKED AUDIT FINDINGS

## 2. Current problem

The Matrix currently has:

```css
.outpost-status-matrix__table {
  min-width: 49rem;
  width: 100%;
}
```

This is the decisive scrollbar threshold.

The audit found that:

- the Matrix can remain usable substantially below 49rem;
- `49rem` is not a usability-derived minimum;
- the practical hard floor is approximately `38rem`;
- the most recoverable width is in Inputs and some excess Item/Source/Logistics allocation;
- Present and Producing actually need larger minimums because of their help controls.

Do not preserve `49rem` as a separate arbitrary floor.

---

## 3. Recommended column model

Use the audit as the baseline.

Target approximate minima:

```text
Item        7.5rem
Source      6rem
Present     6rem
Producing   7rem
Inputs      4.25rem
Logistics   7.25rem
```

The implementation may adjust these slightly if browser verification shows a small improvement is needed.

Do not materially exceed the audited values without a concrete reason.

---

# PART B — COLUMN BEHAVIOR

## 4. Item

Goals:

- reduce minimum from current 9rem;
- keep stable across outposts;
- preserve ellipsis/title behavior;
- avoid runtime sizing based on selected outpost content.

Preferred minimum:

```text
~7.5rem
```

The column may remain fractionally flexible above its minimum.

---

## 5. Source

Goals:

- retain stable width behavior;
- allow long species names to ellipsize;
- keep full names available via existing title/tooltips.

Preferred minimum:

```text
~6rem
```

Do not widen the column merely to fit every species name.

---

## 6. Present

The audit found the current minimum too small for:

```text
Present label
ContextHelp button
padding/focus clearance
```

Preferred minimum:

```text
~6rem
```

Do not shrink the help control.

---

## 7. Producing

Likewise, preferred minimum:

```text
~7rem
```

This should prevent header/help overlap.

---

## 8. Inputs

This should carry most of the compression.

Preferred hard floor:

```text
~4.25rem
```

Allow:

- wrapping;
- one control per row at the tightest widths;
- current state-control dimensions to remain unchanged.

Do not force the column to retain a 10rem minimum.

---

## 9. Logistics

Preferred minimum:

```text
~7.25rem
```

This should support two state controls on one row when compressed padding is active.

Do not preserve large unused right-side space under width pressure.

---

# PART C — TABLE MINIMUM

## 10. Replace the 49rem floor

Lower the Matrix hard minimum from:

```text
49rem
```

to approximately:

```text
38rem
```

Treat `38rem` as the audited practical threshold, not an immutable magic number.

If runtime verification shows that a nearby value such as `38.5rem` or `39rem` materially improves layout without sacrificing the intended compression benefit, use that value and report why.

Horizontal scrolling should begin only once further compression would genuinely harm usability.

---

# PART D — COMPRESSED PADDING MODE

## 11. Normal-width spacing

At normal/comfortable widths, preserve current Matrix cell spacing:

```css
padding: 0.1rem 0.5rem;
```

Do not make the entire Matrix permanently denser.

---

## 12. Compressed-width spacing

Near the compressed range, reduce horizontal cell padding to approximately:

```text
0.3rem
```

The audit suggests introducing this near:

```text
~41rem Matrix/container width
```

Use a scoped Matrix/container-based condition if practical.

Preferred approaches include:

```text
container query
Matrix-scoped media/query logic based on actual available width
```

Avoid coupling this to unrelated viewport widths if a local/container approach is available.

Do not change vertical padding unless required.

---

# PART E — STATE LIST GAP

## 13. Preserve current state-list gap

Keep:

```css
gap: 0.25rem;
```

Do not reduce it.

The audit found that smaller gaps save very little width while crowding 2px focus outlines with 2px offsets.

---

# PART F — STABLE GEOMETRY

## 14. Keep column positions content-independent

At a given Matrix width, column positions must remain the same across outposts.

Do not:

```text
measure current row content at runtime
resize based on selected outpost
resize based on longest currently visible source/item
```

Use a stable CSS template.

---

## 15. Preserve sticky Item behavior

The Item column remains sticky during horizontal scroll.

Verify:

- sticky positioning;
- header alignment;
- row alignment;
- no visual gaps at compressed widths.

---

# PART G — ACCESSIBILITY

## 16. Focus behavior

At the new compressed threshold, verify:

- Present/Producing focus outlines remain fully visible;
- ContextHelp buttons do not overlap labels;
- Inputs/Logistics controls remain individually focusable;
- ellipsized Item/Source names retain full-name title/tooltips.

Do not trade away focus visibility for a few pixels of compression.

---

# PART H — EXPLICITLY OUT OF SCOPE

## 17. Do not implement

Do not change:

```text
manual pane resizing
pane show/hide
Navigation collapse
Cargo collapse
outpost keyboard switching
workspace scrolling model
Cargo Pad summary ellipsization
Matrix control sizes
ContextHelp dimensions
resource/product/species naming
Matrix semantics
validation behavior
```

This pass is only about Matrix width/compression behavior.

---

# PART I — BROWSER VERIFICATION

## 18. Verify three width bands

Test at representative widths for:

### Comfortable

Approximately:

```text
48–49rem
```

Expected:

- current visual comfort largely preserved;
- no unnecessary crowding.

### Compressed but usable

Approximately:

```text
41rem
```

Expected:

- reduced horizontal padding active;
- Inputs may wrap more tightly;
- Item/Source ellipsis acceptable;
- no header overlap;
- no horizontal scrollbar yet.

### Hard floor

Approximately:

```text
38rem
```

Expected:

- no overlap;
- Present/Producing headers intact;
- Inputs may be one-control-per-row;
- Logistics still usable;
- focus outlines visible;
- horizontal scrolling begins only below this point.

Take screenshots if practical.

---

## 19. Verify representative content

Use outposts containing:

```text
long resource/product names
long species/source names
multiple Inputs controls
two Logistics controls
organic and inorganic rows
manufacturing rows
imports
```

Do not verify only on sparse/simple outposts.

---

# PART J — TESTING

## 20. Automated checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Add focused layout/unit tests only if there is an existing suitable mechanism.

Do not create brittle pixel-perfect DOM tests solely for this change.

---

# PART K — DOCUMENTATION

## 21. Update UX documentation if needed

If the implementation establishes a durable compression rule, update `docs/UX-DESIGN.md` concisely.

Capture that:

- Matrix columns remain stable across outposts;
- the Matrix compresses before scrolling;
- scarce width may use tighter padding/wrapping;
- horizontal scroll is reserved for the genuine hard floor.

Do not document every rem value unless the project normally stores such implementation detail there.

---

# PART L — COMPLETION REPORT

## 22. Report

On completion, report:

```text
files changed
final grid-template values
final Matrix min-width
compressed-padding trigger
whether container queries were used
comfortable/compressed/hard-floor browser results
focus/accessibility verification
tests/checks run
screenshots taken
```

Explicitly state whether:

- workspace pane sizing changed;
- Cargo Pane behavior changed;
- ContextHelp dimensions changed;
- Matrix control sizes changed;
- any domain logic changed.

Do not commit or push unless explicitly asked.

---

## 23. Suggested commit message

If accepted:

```text
style: improve resource matrix compression
```

---

## 24. Final instruction

Implement the audited Matrix width model.

The intended outcome is:

> **The Matrix should compress substantially further before requiring horizontal scrolling, while preserving stable columns, readable headers, accessible controls, and acceptable ellipsis/wrapping.**

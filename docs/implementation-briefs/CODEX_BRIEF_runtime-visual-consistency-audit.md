# Codex Runtime Audit Brief — Whole-App Visual Consistency

## Objective

Perform a focused **runtime visual consistency audit** of the current Starfield Outpost Network UI.

This is an audit/reporting pass first. Do not make broad visual changes unless the brief explicitly says a finding may be corrected during the audit. The purpose is to identify the remaining live inconsistencies after the recent visual-language redesign.

The static source audit has already narrowed the likely problem areas. The runtime audit should verify those suspects in Chromium, inspect computed styles and interaction states, and report only genuine remaining issues.

---

## 1. Read repository guidance first

Before testing, inspect relevant project guidance, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
```

Also review the current styling/runtime implementation for:

```text
PageHeader
StatusBar
OutpostList
OutpostDetails
OutpostStatusMatrix
CargoPadsEditor
CargoPadEditor
PlannedSupplyEditor
ValidationSummary
ConfirmDialog
index.css
```

---

# PART A — AUDIT SCOPE

## 2. Areas already settled / out of scope

Do **not** spend time re-auditing these as design problems:

```text
responsive pane minimums / overflow thresholds
scrollbar consistency
ellipsis/truncation rules
manual pane resizing
manufactured-product availability semantics
validation click navigation
Delete Network vs Reset Network wording
```

Responsive sizing and scrollbar work are already accepted for now.

Cargo remote-outpost ellipsis behavior is explicitly deferred.

---

## 3. Runtime targets

Audit the app in its current normal working state plus the following interaction states:

```text
normal navigation mode
navigation reshuffle mode
cargo normal mode
cargo reshuffle mode
cargo pad expanded
Inter-System toggle selected + fuelled
Inter-System toggle selected + unfuelled
matrix editable state
matrix disabled/read-only state
Planned Supply collapsed
Planned Supply expanded
Validation panel open
Reset Network confirmation dialog open
PageHeader controls enabled/disabled
StatusBar normal state
```

Use a representative desktop viewport and a moderately narrow desktop viewport where appropriate.

---

# PART B — STATIC AUDIT SUSPECTS TO VERIFY

## 4. Cargo reshuffle old-theme remnants

Static inspection found clear legacy styling in `CargoPadsEditor.css`.

Verify at runtime:

### Drop insertion marker

Current source uses:

```text
background: var(--accent)
border-radius: 999px
```

This is expected to appear as the old bright purple rounded insertion line.

Confirm:

- actual rendered color;
- thickness;
- radius;
- whether it visibly clashes with the current B1 visual language.

### Cargo drag handle

Current source uses:

```text
color: var(--text-h)
```

and focus styling:

```text
outline: 2px solid var(--accent)
outline-offset: 1px
border-radius: 3px
```

Verify whether the runtime handle/focus ring visibly differs from:

```text
Navigation drag handle
current application focus treatment
flat/square geometry
Structural-dark focus language
```

Document all discrepancies.

---

## 5. Interstellar cargo toggle state grammar

Audit the `Inter-System` control in all relevant states.

The current screenshots indicate:

### Selected + unfuelled

It currently resembles a normal selected dark toggle and does not clearly communicate that Helium-3 is missing.

### Selected + fuelled

It currently uses a muted hard-coded green treatment that can look weaker than the unfuelled state.

Audit and report:

- selected/unselected distinction;
- fuelled/unfuelled distinction;
- whether unfuelled reads clearly as a warning;
- whether fuelled still reads as selected/active;
- whether the hard-coded green clashes with the B1 palette;
- whether the two states create a reversed or confusing visual hierarchy.

Do not redesign the logic.

### Desired semantic direction for later implementation

Use this as the audit benchmark:

```text
unselected / regular
= neutral pale control

selected + fuelled
= clearly selected/valid, restrained positive cue

selected + unfuelled
= clearly selected but operationally problematic, warning treatment
```

Warning should likely use the established amber language rather than Critical red.

No icon system is required.

---

## 6. Legacy token leakage

Static inspection found old raw tokens still present in `index.css`:

```text
--text
--text-h
--bg
--border
--accent
--accent-bg
--accent-border
--shadow
--sans
--heading
--mono
```

Also present:

```text
old dark-mode overrides
generic global h1/h2/code rules
```

Most current components use `--ui-*`, so these may be dormant.

Runtime audit should identify any **visible live UI** still resolving through legacy tokens or system-font defaults.

Look specifically for:

- old purple accent;
- old text colors;
- old background colors;
- old shadow;
- old rounded geometry;
- generic system font instead of Barlow;
- generic mono instead of IBM Plex Mono.

Do not propose deleting the raw token layer unless a visible problem actually depends on it.

---

## 7. Native form-control leakage

Inspect live:

```text
select controls
text inputs
number inputs
disabled controls
focus states
browser-native arrows
```

Across:

```text
PageHeader
OutpostDetails
CargoPadEditor
Matrix product selector
```

Look for:

- native blue focus rings;
- native bevels/inset rendering;
- inconsistent arrow appearance;
- browser-grey disabled rendering;
- mismatched font;
- height mismatch;
- border-radius mismatch.

The goal is not to custom-draw select arrows unless there is an actual visible problem.

---

# PART C — CONSISTENCY CHECKS

## 8. Mode/action controls

Compare equivalent control families at runtime:

```text
Add Outpost
Add Cargo Pad
Expand all / Collapse all
Reshuffle / Lock order
Edit
Remove
Import / Export
Delete controls
```

Audit:

- height;
- border;
- background;
- typography;
- hover;
- focus;
- disabled state;
- active/mode state.

Do not force all buttons to look identical.

Only report mismatches where controls with equivalent semantic roles clearly diverge.

---

## 9. Hover / focus / disabled states

This is a high-priority runtime check.

Inspect:

```text
PageHeader buttons/inputs
Navigation rows/buttons
Navigation drag handles
Cargo summary disclosure
Cargo drag handles
Cargo move controls
Cargo selectors
Inter-System toggle
Matrix editable cells
Matrix action buttons
OutpostDetails selectors/biomes/name field
Planned Supply buttons
Validation trigger
ConfirmDialog actions
```

Look for:

- old accent focus rings;
- inconsistent outline width;
- inconsistent outline offset;
- rounded focus rings in otherwise square geometry;
- hover states that use the wrong color family;
- disabled controls that resemble selected states;
- selected controls that resemble disabled states.

The established focus benchmark is broadly:

```text
2px Structural-dark outline
~2px offset
square / near-square geometry
```

---

## 10. Selected / unavailable / derived state grammar

Verify that current runtime states remain visually distinct.

### Matrix

Confirm separation between:

```text
editable unselected
editable selected
derived lit
derived dimmed
disabled
```

### Planned Supply

Confirm separation between:

```text
available/selectable
planned
already available / unavailable for selection
```

### Navigation

Confirm selected navigation row does not look disabled.

### Cargo

Confirm selected export buttons, stale state if present, and Inter-System states are semantically readable.

Only report genuine collisions.

---

## 11. Typography consistency

Audit live typography for:

- Barlow Semi Condensed where expected;
- IBM Plex Mono where expected;
- uppercase structural labels;
- consistent tracking;
- no stray Arial/system UI text;
- no inappropriate mono usage.

Check especially conditional/editing states that may not have been visible in the static screenshots.

---

## 12. Geometry consistency

Look for:

```text
rounded corners
pill shapes
shadows
glow
native bevels
heavy inset borders
```

that conflict with the established flat square language.

Known expected exception to verify:

```text
cargo insertion marker currently rounded
```

Confirm whether any others remain.

---

## 13. Border / rule hierarchy

Audit whether the runtime UI maintains the intended hierarchy:

```text
major region boundary
ordinary separator rule
control border
```

Check:

```text
Navigation / workspace divider
Matrix / Cargo headings
Matrix section bars
Cargo pad boundaries
Planned Supply staging surface
Validation panel
ConfirmDialog
StatusBar
```

Report only cases where boundaries are visually too heavy, too weak, duplicated, or inconsistent.

---

## 14. Spacing and density outliers

Do not perform generic tightening.

Look only for genuine outliers such as:

- unusually tall controls among siblings;
- large unexplained blank gaps;
- one editor section much looser/tighter than similar sections;
- controls misaligned vertically;
- row rhythm inconsistencies.

Treat current Matrix, Planned Supply, Cargo and shell densities as intentionally different unless runtime evidence shows a mismatch.

---

## 15. Shell / StatusBar consistency

With reference-data diagnostics now hidden, verify:

- StatusBar still looks intentional;
- Validation trigger alignment is clean;
- no leftover empty region feels broken;
- PageHeader / TitleBar / StatusBar use consistent rules/surfaces;
- sticky/fixed shell regions do not show mismatched backgrounds or borders.

---

## 16. Overlay / popup consistency

Compare:

```text
Validation diagnostic panel
Reset Network confirmation dialog
```

They intentionally differ behaviorally:

- Validation = anchored, non-modal;
- ConfirmDialog = centered, modal.

Audit whether they still share a coherent visual vocabulary:

```text
surface
border
typography
square geometry
no shadow
focus treatment
```

Do not try to make them identical.

---

# PART D — RUNTIME METHODOLOGY

## 17. Use computed-style inspection

For each suspected inconsistency, record the actual computed runtime style where useful:

```text
font-family
font-size
border-radius
border-color
background-color
outline
outline-offset
box-shadow
color
opacity
```

This audit should distinguish:

- static source suspicion;
- actual runtime inconsistency.

Do not report dormant CSS as a visual bug if it does not affect live UI.

---

## 18. Verify conditional states directly

Do not rely only on source inspection.

Manually activate:

```text
navigation reshuffle
cargo reshuffle
cargo drag target/insertion marker
fuelled interstellar pad
unfuelled interstellar pad
disabled buttons
selected toggles
validation panel
reset confirmation dialog
```

If sample data does not naturally produce a required state, use temporary runtime/test state as needed, but restore all changes before completion.

---

# PART E — OUTPUT

## 19. Deliverable format

Produce a concise audit report grouped as:

### A. Confirmed inconsistencies
Only live, visible issues.

For each:

```text
component
state
what looks wrong
computed/runtime evidence
likely source rule
severity: high / medium / low
recommended correction direction
```

### B. Suspected but not reproduced
Static issues that did not visibly manifest.

### C. Confirmed consistent
Short list of major systems that passed inspection.

### D. Deferred / out-of-scope
Explicitly note:

```text
responsive sizing
scrollbars
ellipsis allocation
manual pane resizing
manufacturing-feasibility bug
validation navigation
Delete vs Reset wording
```

---

## 20. Do not implement broad fixes yet

This is primarily an audit.

You may make **only trivial instrumentation or temporary test-state changes** needed to inspect runtime states.

Do not perform the final visual cleanup during the audit unless explicitly asked afterward.

Restore any temporary changes before completion.

---

## 21. Checks

If any repository files are touched for temporary inspection, ensure they are restored.

Run at minimum:

```text
git diff --check
```

If no files are modified, say so.

No commit or push.

---

## 22. Final instruction

The goal is not to find as many issues as possible.

The goal is to identify the **small set of remaining live visual inconsistencies** after the redesign, with enough runtime evidence that a final cleanup pass can be narrowly scoped and low-risk.

Pay particular attention to:

```text
Cargo reshuffle old accent styling
Inter-System fuelled/unfuelled grammar
native form-control leakage
focus/disabled consistency
legacy token leakage
```

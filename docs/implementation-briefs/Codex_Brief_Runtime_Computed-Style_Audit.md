# Codex Brief — Runtime / Computed-Style Audit

## Objective

Perform a **read-only runtime/computed-style audit** of the current `starfield-outpost-network` UI.

The purpose is to verify how the application's existing semantic control families actually render in the browser, including states that cannot be understood reliably from source CSS alone.

This is **not** a styling, refactoring, cleanup, or design task.

Do not change the application.

The output should give us enough evidence to combine:

```text
existing source-level semantic audit
+
actual runtime/computed styles and state behaviour
=
future visual-language/design-system plan
```

---

# 1. Repository/context preparation

Before beginning:

1. Read the repository guidance relevant to architecture, UX and implementation conventions, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
BACKLOG.md
```

2. Inspect the current UI/component/CSS implementation sufficiently to map the semantic families below to their actual components and selectors.

3. Run the application in its normal local development environment.

Do not modify source files, generated files, configuration, fixtures or persisted data merely to make the audit easier.

If temporary browser interaction is required to expose states, that is expected.

---

# 2. Hard scope constraint

This task is **audit only**.

Do **not**:

* change CSS;
* add shared classes;
* introduce design tokens;
* rename selectors;
* alter markup;
* replace native controls;
* adjust spacing;
* change typography;
* alter button appearance;
* fix visual inconsistencies;
* refactor components;
* change domain behaviour;
* update documentation;
* commit or push anything.

If you notice an obvious defect or consolidation opportunity, record it as an observation only.

The working tree should remain unchanged at the end of the task.

---

# 3. Semantic control taxonomy to verify

Audit the following existing semantic families.

## A. Primary selector

Examples:

```text
Outpost navigation buttons
```

Important states:

```text
normal
hover
selected/current
focus-visible
disabled, if distinct from selected
```

Important caveat:

The current selected outpost is represented using disabled behaviour. Do not assume that means its visual semantics are identical to an unavailable control.

---

## B. Drop-down selector

Examples:

```text
System
Body
cargo destination outpost
cargo destination pad
manufacturing/product selectors
```

States:

```text
normal
hover, if browser exposes one
focus
disabled
invalid/recovery value, where present
```

Pay particular attention to how much appearance currently comes from browser/native styling versus explicit application CSS.

---

## C. Binary toggle

Examples:

```text
Biome buttons
Cargo Inter-System
cargo export items
```

States:

```text
off
on / aria-pressed
hover
focus-visible
disabled/stale/non-actionable where applicable
```

These may have very different densities, so record geometry separately even if their state grammar is similar.

---

## D. Three-state catalogue control

Example:

```text
Planned Supply cells/items
```

Capture the visual treatment of the meaningful states, including approximately:

```text
neutral/selectable
planned/selected
available but not selectable
hover
focus-visible
```

Do not assume this is equivalent to an ordinary binary toggle.

---

## E. Matrix state control

Examples:

```text
Present
Producing
Inputs
Logistics
```

Capture both interactive and derived/read-only cells.

Important states include:

```text
neutral
lit/active
dimmed/inactive
editable pressed/on
editable off
disabled/non-actionable if present
focus-visible
```

Record differences among interactive state cells and derived state indicators.

---

## F. Passive indicator

Examples:

```text
Solar
Wind
```

States/values:

```text
known qualitative value
unknown —
```

Record carefully:

* dimensions;
* typography;
* borders/background;
* alignment relative to adjacent Biome controls;
* the effect of `font: -webkit-small-control` or equivalent native-font coupling;
* whether the element visually resembles an interactive button despite being passive.

---

## G. Secondary passive indicator / metadata

Examples:

```text
[INT]
[9/16]
[1/6]
```

Distinguish where possible between:

```text
categorical status badge
capacity/count metadata
```

Do not force them into one family if runtime treatment is materially different.

---

## H. Mode button

Examples:

```text
Reshuffle
Lock order
```

in both:

```text
Outposts
Cargo Pads
```

States:

```text
inactive
active
hover
focus-visible
disabled
```

Compare the two panes directly.

They should be recorded as one semantic family even if current CSS differs.

---

## I. Disclosure control

Examples:

```text
Planned Supply disclosure
individual Cargo Pad summary/disclosure
```

States:

```text
collapsed
expanded
hover
focus-visible
```

Record both the control box and disclosure indicator treatment.

---

## J. Bulk disclosure action

Examples:

```text
Expand All
Collapse All
```

States:

```text
enabled
hover
focus-visible
disabled
```

Record whether these visually behave like ordinary action buttons or something distinct.

---

## K. Reorder handle

Examples:

```text
Outpost ⠿
Cargo Pad ⠿
```

States:

```text
inactive/unavailable
enabled
hover
focus-visible
dragging
```

Compare geometry and computed styles between the two panes.

---

## L. Move control

Examples:

```text
↑
↓
```

States:

```text
enabled
hover
focus-visible
boundary-disabled
```

Audit both sortable collections.

---

## M. Create action

Examples:

```text
+ Add Outpost
+ Add Cargo Pad
```

States:

```text
normal
hover
focus-visible
disabled, if applicable
```

Compare typography, geometry and native/browser dependence.

---

## N. Ordinary command

Examples include:

```text
Undo
Redo
Export
Import
Reload Reference Data
```

States:

```text
normal
hover
focus-visible
disabled
```

This family is particularly important because several controls may still depend strongly on browser defaults.

---

## O. Destructive action

Examples:

```text
Delete Network
Delete Outpost
Remove Cargo Pad
```

States:

```text
normal
hover
focus-visible
disabled
```

Record whether there is currently any consistent destructive visual grammar.

Do not redesign it.

---

## P. Editable text field

Examples:

```text
Character
outpost name
```

Audit generic fields separately from the heading-like outpost-name editor if their computed styling differs.

States:

```text
normal
hover
focus
editing
invalid, if visually represented
```

For the outpost-name field, record how it relates visually to nearby heading typography.

---

## Q. Editable numeric/rank field

Examples:

```text
Outpost Management
Planetary Habitation
other visible compact ranks/skills
```

States:

```text
normal
hover
focus
invalid draft/reset if observable
```

Compare these with ordinary text inputs.

---

## R. Status-summary trigger

Example:

```text
Validation: N issues
```

States:

```text
closed
open
zero issues
non-zero issues
hover
focus-visible
```

This is semantically both status and disclosure; record whether its current runtime appearance aligns with either family.

---

## S. Transient dismiss / icon action

Example:

```text
footer ×
```

States:

```text
normal
hover
focus-visible
```

Record its relationship to other icon-only controls.

---

# 4. Heading and text-role taxonomy

Also audit the current visual hierarchy of text roles.

Do not infer hierarchy solely from HTML heading level.

Record representative examples of:

```text
application identity
editable workspace/outpost title
pane title
major collapsible section
subsection heading
matrix/data-column heading
field label
indicator label
cargo object title
badge/status annotation
count/capacity metadata
footer status
validation severity
interaction hint
transient feedback
empty/help copy
```

For each, capture actual computed typography and relevant spacing.

The audit should explicitly note places where different HTML elements currently render at effectively the same visual level, or the same HTML element renders differently because of local styles.

---

# 5. Computed properties to capture

For each representative control/text role, record the relevant computed values.

At minimum:

## Typography

```text
font-family
font-size
font-weight
line-height
letter-spacing, where non-default/relevant
text-transform, if any
```

## Geometry

```text
rendered width, where fixed or semantically meaningful
rendered height
min-height / min-width where relevant
padding
margin where it materially determines control rhythm
gap where the component relies on it
```

## Box treatment

```text
background-color
color
border width
border style
border color
border radius
box-shadow
outline
outline-offset
```

## Behaviour / browser origin

Record whether appearance appears to be:

```text
explicitly application-styled
partly application-styled
largely native/browser-rendered
```

Where useful, identify the source selector/rule responsible for important computed values.

Do not exhaustively dump every computed CSS property.

The goal is a useful comparison, not a browser-devtools data export.

---

# 6. Runtime states to exercise

Where practical, interact with the running application to capture:

```text
hover
focus-visible
pressed / selected
disabled
expanded
collapsed
reshuffle-active
drag-enabled
dragging
boundary-disabled move controls
known vs unknown indicator values
validation panel closed/open
zero vs non-zero validation state
```

If a state cannot be reached safely from the current sample/default UI without changing application source or corrupting meaningful persisted data:

* do not manufacture it through source edits;
* record that the state was not runtime-verified;
* inspect source styling only as secondary evidence.

---

# 7. Cross-component comparisons

The audit should explicitly compare these known semantic duplicates.

## Drag handles

```text
Outposts ⠿
Cargo Pads ⠿
```

Are they actually the same dimensions, typography, focus state and inactive state?

---

## Reshuffle / Lock Order

Compare:

```text
Outposts
Cargo Pads
```

Record both visual and state differences.

---

## Move controls

Compare:

```text
Outpost ↑ / ↓
Cargo Pad ↑ / ↓
```

---

## Create actions

Compare:

```text
+ Add Outpost
+ Add Cargo Pad
```

---

## Pressed/accent state

Compare representative examples from:

```text
Biome
Inter-System
Cargo Export
Planned Supply
Matrix editable state
```

Determine whether the apparent shared grammar:

```text
accent border
accent text
accent background
```

is actually identical at runtime or merely similar.

---

## Focus treatment

Compare representative dense controls.

Record:

```text
outline width
outline color
outline offset
whether :focus or :focus-visible is used
```

---

## Section/subsection headings

Compare representative examples from:

```text
matrix sections
Planned Supply subsections
Cargo Exports
pane titles
```

Record whether current visual hierarchy is already effectively shared despite different markup and local selectors.

---

# 8. Existing global token usage

Inspect how the current raw global tokens participate in actual computed styling:

```text
--text
--text-h
--bg
--border
--code-bg
--accent
--accent-bg
--accent-border
--shadow

--sans
--heading
--mono
```

Do not propose replacement values in this task.

Instead report:

* which semantic families already rely on them;
* where equivalent controls bypass them;
* where browser/native values dominate instead.

---

# 9. Missing-family check

While auditing the running application, identify any meaningful semantic control or text family that the source-level taxonomy missed.

For each candidate missing family:

```text
name / proposed description
examples
why it is semantically distinct from the existing families
important states
```

Do not create a new family merely because one component has different padding.

The distinction should be semantic/interaction-based.

---

# 10. Output format

Produce a concise but sufficiently detailed audit report.

A useful structure would be:

## 1. Executive summary

Approximately 5–10 key findings.

Focus on:

```text
where runtime confirms the source taxonomy
where supposedly shared semantics currently differ
where native-browser styling is significant
where the current visual language is already consistent
highest-risk areas for future consolidation
```

---

## 2. Control-family audit table

One row per semantic family, with fields such as:

```text
Semantic family
Representative components
Runtime selectors/elements
Computed typography
Height / padding
Border / radius
Normal appearance
State appearance
Native vs explicit styling
Notable inconsistencies
```

Use additional rows where compact/dense variants need to be distinguished.

---

## 3. Heading/text-role audit table

Record:

```text
role
examples
HTML element
computed font
size
weight
line-height
spacing
notes
```

---

## 4. Shared-state comparison

Summarise runtime findings for:

```text
selected/pressed
focus-visible
disabled
dimmed
expanded
active mode
dragging
```

Identify which treatments are actually shared and which merely look similar in source.

---

## 5. Cross-component duplicate comparison

Specifically report on:

```text
drag handles
reshuffle buttons
move controls
create actions
section headings
pressed state
focus state
dense resource/state cells
```

---

## 6. Native/browser dependency

List controls whose appearance materially depends on browser-native rendering.

Pay particular attention to:

```text
ordinary buttons
selects
inputs
Biome controls if applicable
Solar/Wind's native-control font matching
```

---

## 7. Missing semantic families

If none, say so explicitly.

---

## 8. Candidate consolidation observations

This section is observational only.

For each promising future consolidation, state:

```text
what appears safe to share
what should probably remain a variant
what runtime evidence supports that conclusion
```

Do **not** implement or provide a replacement CSS architecture yet.

---

# 11. Evidence discipline

Distinguish clearly among:

```text
runtime observed
computed-style verified
source-code inferred
not runtime reachable
```

If browser-native behaviour makes an exact value platform/browser-specific, say so.

Do not present an inferred similarity as verified identity.

---

# 12. Completion criteria

The audit is complete when:

* every known semantic family has at least one representative runtime inspection;
* major variants have been compared where relevant;
* important interactive states have been exercised where practical;
* heading/text roles have been measured;
* native/browser-dependent controls have been identified;
* known cross-component duplicates have been compared;
* any missing semantic family has been reported;
* no application code or documentation has been changed.

At the end, confirm the working tree is unchanged.

---

# 13. Final instruction

Do not begin a visual redesign.

Do not create the semantic CSS layer yet.

The next design step will happen **after** this report is reviewed alongside the existing source-level semantic audit.

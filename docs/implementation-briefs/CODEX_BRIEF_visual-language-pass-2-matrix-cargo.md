# Codex Implementation Brief — Visual Language Pass 2: Resource Matrix + Cargo Pads

## Objective

Implement the **second visual-language pass** for `starfield-outpost-network`, focused on the two operationally central areas of the selected outpost:

- `Resource Matrix`
- `Cargo Pads`

Treat them as **visual siblings**. The Resource Matrix describes the operational state of an outpost; Cargo Pads describe how that state connects to the rest of the network. They should look related without merging into one panel or allowing one to dominate the other.

Build directly on the already committed shell visual language:

- B1 cool sage-grey palette
- Barlow Semi Condensed for UI typography
- IBM Plex Mono for dense technical/code content
- pale surfaces
- sparse use of structural dark
- square / near-square geometry
- restrained rules and boxing
- application-owned focus styling

This pass should bring the operational core into the same visual language **without changing its established information architecture or behavior**.

---

## 1. Read repository guidance first

Before editing, inspect the repository and read the relevant durable guidance, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
BACKLOG.md
```

Also inspect the current implementation and CSS for:

```text
Resource Matrix
Cargo Pads
pane layout
matrix state cells
cargo summaries
expanded cargo pads
global / shell visual tokens
```

Preserve existing domain, persistence, validation, Undo/Redo, and interaction behavior.

---

## 2. Hard scope boundary

### In scope

Visual and tightly scoped layout work for:

```text
Resource Matrix
Cargo Pads pane
compact cargo-pad summaries
expanded cargo-pad visual treatment
pane-width balance between Matrix and Cargo
matrix section hierarchy
matrix column-header treatment
interactive vs derived state-cell differentiation
operational heading treatment
cargo row separators / surfaces
typography and state styling within these two regions
removal of visible "Pad N" labels from compact summaries
```

### Out of scope

Do **not** redesign:

```text
TitleBar
PageHeader
StatusBar
Outpost navigation pane
Planned Supply
System / Body / Biome controls
Solar / Wind
network lifecycle controls
validation architecture
manufacturing workflow semantics
drag/drop behavior
reorder mode behavior
```

Do not make broad application-wide layout changes.

Do not alter the domain model or cargo semantics.

Do not change the ordering or placement of controls inside expanded cargo pads except where strictly required to support the approved visual treatment.

---

## 3. Preserve the current operational information architecture

A major constraint for this pass is:

> **Visual redesign first; layout redesign only where explicitly agreed.**

The current Matrix and Cargo layouts were refined deliberately in earlier work.

Do not reshuffle controls merely because another arrangement looks more modern.

Preserve:

- current Matrix column structure;
- current Cargo compact-summary information pattern;
- current expanded Cargo Pad control order and grouping;
- current local-left / remote-right cargo-summary relationship;
- current collapse/expansion behavior;
- current ordering/reordering behavior.

---

## 4. Matrix and Cargo as sibling operational regions

The two panes should share:

```text
operational heading language
rule / border hierarchy
typography
focus / state grammar
surface family
spacing rhythm
```

They should **not**:

```text
merge into one boxed region
share one giant enclosing card
use flowchart / connector arrows
visually imply that Cargo is subordinate to Matrix
```

Preferred impression:

```text
RESOURCE MATRIX      CARGO PADS
     sibling operational regions
```

rather than:

```text
MAIN PANEL           SIDEBAR
```

---

## 5. Pane width balance

The existing layout may be adjusted modestly so Cargo Pads receive slightly more horizontal room.

Guidance:

```text
Cargo Pads may gain approximately 5% of the shared width
```

This is not a hard numeric requirement.

The real constraint is:

> **Do not introduce automatic horizontal scrolling in the Resource Matrix.**

Preferred process:

1. inspect the current Matrix/Cargo split;
2. give Cargo a modest width increase;
3. verify the Matrix still fits cleanly at the expected desktop viewport;
4. if the Matrix begins to require horizontal scrolling, back off.

Do not aggressively rework matrix column widths in this pass. Small adjustments are acceptable only if clearly necessary after the pane rebalance.

---

## 6. Operational heading treatment

Both major regions should use related top-level treatment:

```text
RESOURCE MATRIX
CARGO PADS
```

Use:

- Barlow Semi Condensed;
- uppercase structural labeling;
- sparse structural-dark anchoring;
- square geometry;
- restrained horizontal rules.

Avoid full-width dark bars if they make the page feel striped.

Preferred Starfield-inspired pattern:

> partial-width dark structural anchor / rail with the rest of the pane remaining pale.

Structural dark remains:

```text
#2A3E3A
```

Use it sparingly.

---

## 7. Resource Matrix hierarchy

Retain the current compact structure and density.

The hierarchy is:

```text
Resource Matrix
column headers
subsections:
    Inorganic
    Organic
    Manufacturing
    Imports
rows
```

### Resource Matrix heading

Use the strongest operational heading treatment in the pane.

It should act as a structural anchor, not a large banner.

### Column header row

The column header should be technical and legible without becoming another dark stripe.

Preferred treatment:

- pale tint or light structural band;
- uppercase Barlow Semi Condensed;
- restrained tracking;
- clear bottom rule;
- no heavy filled bar.

### Subsection headings

Subsections such as:

```text
INORGANIC
ORGANIC
MANUFACTURING
IMPORTS
```

should be quieter than the Matrix heading.

Preferred treatment:

- uppercase Barlow Semi Condensed;
- pale tint, or text plus fine rule;
- no full structural-dark fill;
- enough spacing to make section boundaries immediately scannable;
- minimal added vertical padding.

Hierarchy should come mostly from:

```text
placement
rules
spacing
tone
```

rather than large font-size jumps.

### Rows

Keep rows dense.

Avoid:

```text
extra vertical padding
card-like row boxes
rounded row containers
heavy alternating row backgrounds
```

Fine separators and the existing grid structure are preferred.

Guiding principle:

> **Dense by information design, not by miniaturisation.**

---

## 8. Matrix typography

Use **Barlow Semi Condensed** for:

```text
full resource/product names
source names
column headings
subsection headings
ordinary explanatory text
```

Use **IBM Plex Mono** for compact technical/code-like content such as:

```text
resource abbreviations
state-cell abbreviations/codes
compact derived-state markers
other short technical values where alignment benefits
```

Do not convert ordinary prose or full item names to monospace.

---

## 9. Interactive vs derived Matrix state cells

This is one of the most important goals of the pass.

Some Matrix states are interactive; others are derived/read-only.

The redesign should make that distinction visually clearer.

### Interactive state cells

Interactive state cells should continue to read as controls.

Use:

- compact square / near-square containment;
- clear border;
- obvious hover/focus treatment;
- selected state with a decisive contrast shift;
- sufficient hit area even if the visible control is compact.

Selected/active should not be communicated only by a slightly darker border.

Preferred selected grammar:

```text
background: Structural dark
text: Highlight
border: Structural dark
```

or the closest existing operational equivalent consistent with current semantics.

### Derived / read-only state cells

Derived state cells should occupy the same grid footprint so alignment remains stable, but should look **less button-like**.

Preferred treatment:

- flatter background;
- less emphatic border or no enclosing border where safe;
- no hover affordance;
- no pointer-like visual treatment;
- same IBM Plex Mono data language where appropriate;
- clear active/lit vs inactive/dimmed treatment.

Goal:

> a user should be able to infer clickability from appearance without sacrificing matrix alignment.

Do not change what is actually interactive.

Do not add interaction where none exists.

---

## 10. Matrix state language

Carry forward the agreed semantics.

### Available / neutral

```text
pale or transparent background
Primary text
restrained rule/border
```

### Selected / active interactive

```text
clear contrast shift
Structural dark fill where appropriate
Highlight text
```

### Unavailable

```text
reduced contrast
Muted text
lighter border
still legible
```

### Derived inactive / dimmed

Should look subdued without implying "disabled input".

Do not make unavailable interactive state and derived inactive state visually identical if this erases their semantic distinction.

### Focus

Use the application-owned focus language already established in the shell.

Target:

```text
2px solid Structural dark
consistent offset
```

Keep keyboard focus clearly visible.

---

## 11. Preserve the current compact Cargo Pad summary structure

Do **not** replace the current compact summary with a single-line layout.

Do **not** shuffle outbound, inbound, destination, or disclosure positions.

The current conceptual pattern should remain:

```text
row 1:
    disclosure control on left
    remote outpost / "Unlinked" on right

row 2:
    outbound summary on left
    inbound summary on right
```

The local-left / remote-right relationship is deliberate and must be preserved.

---

## 12. Remove visible `Pad N` labels from compact summaries

Approved layout change:

```text
Pad 1
Pad 2
Pad 3
...
```

should no longer be shown as the visible compact-summary title.

Reason:

- the remote outpost is the meaningful identity of the link;
- pad numbering is mostly redundant in the collapsed scan view;
- removing it gives destination names more usable width;
- an unlinked pad already communicates its state through `Unlinked`.

Important:

- do **not** remove pad identity/order from the underlying model;
- do **not** remove pad numbering from selectors or contexts where explicit pad identity is needed;
- this change applies only to the visible compact summary.

---

## 13. `[INT]` placement

The `[INT]` indicator may move into the visual area vacated by the former `Pad N` label.

This is an approved small layout change.

Goal:

- give `[INT]` a stable home;
- avoid leaving it visually floating between unrelated summary content;
- preserve remote-name alignment;
- avoid reducing destination-name width unnecessarily.

Keep `[INT]` visually secondary to the remote outpost name.

It should remain a compact categorical indicator, not become a prominent badge.

---

## 14. Remote destination name

Preserve the remote destination name as the main visible identity of a linked Cargo Pad.

Requirements:

- remain right-aligned in the compact summary;
- benefit from the width freed by removing `Pad N`;
- reduce unnecessary ellipsis where possible;
- do not alter persisted/exported values;
- preserve `Unlinked` in the same position for unlinked pads.

Do not replace `Unlinked` with an empty field.

Its explicit presence is already useful.

---

## 15. Cargo summary lower row

Preserve:

```text
outbound summary on left
inbound summary on right
```

Do not convert the summary into a linear form such as:

```text
[Cu][Al] -> Fe [INT] Feynman VI-b
```

The established two-row layout is easier to parse.

Visual improvements may include:

- typography;
- lighter separators;
- improved spacing;
- better use of available width;
- clearer distinction between local/outbound and remote/inbound information.

Do not change the semantic arrangement.

---

## 16. Cargo compact-row geometry

Cargo summaries should feel like compact technical records, not cards.

Preferred treatment:

- pale surface;
- fine separators between pads;
- square geometry;
- minimal outer boxing;
- no large rounded containers;
- no heavy shadows;
- clear disclosure affordance;
- slightly more breathing room than a Matrix row.

Cargo is less dense than the Matrix, but still compact.

---

## 17. Expanded Cargo Pads

Preserve the current control layout and ordering.

Do **not** reshuffle:

```text
link type
destination outpost
destination pad
exports
other current controls
remove/delete control
```

Do not reorganize the editing workflow in this pass.

### Visual treatment

The expanded area may become:

> a pale inset editing region beneath the compact summary.

Preferred characteristics:

- slightly distinct pale surface;
- square geometry;
- fine top/bottom or enclosing rule;
- minimal or no shadow;
- clear relationship to the summary above;
- stronger grouping through spacing rather than nested boxes.

The expanded state should be visually obvious without becoming a large dark block.

---

## 18. Cargo controls

Controls inside expanded pads may receive shell-consistent visual treatment where local and safe.

However, do not attempt the full app-wide control consolidation in this pass.

In particular:

- avoid inventing Cargo-only button styles that will later conflict with shared control primitives;
- keep controls square / near-square;
- use the established focus language;
- preserve all interaction behavior;
- do not change control order.

If some controls remain partly native after this pass, that is acceptable.

---

## 19. Shared rule hierarchy

Use the same conceptual rule system across both sibling panes:

```text
fine rule      internal separation
control border actual interactive element
major rule     pane-level / important region boundary
```

Avoid heavy boxes around both panes.

The sibling relationship should come from shared grammar, not from enclosing them in a single container.

---

## 20. Avoid visual striping

The page should remain predominantly pale.

Do not stack:

```text
full-width dark heading
full-width dark subsection
full-width dark column header
```

within the same pane.

Use:

```text
partial-width dark anchors
pale subsection treatments
fine rules
spacing
```

to preserve hierarchy.

---

## 21. Density guardrails

Do not solve the redesign by increasing padding throughout.

The Matrix was intentionally pared down in earlier work.

Preserve its compactness.

Cargo can be modestly more spacious than Matrix rows, but should remain one-page friendly.

Avoid:

```text
large card padding
oversized form controls
large inter-section gaps
unnecessary labels
```

Prefer:

```text
removing redundancy
better alignment
better grouping
clearer state differentiation
```

over adding space.

---

## 22. No accidental one-page regression

A normal populated outpost should remain usable within the established desktop layout without introducing routine page scrolling.

This is not an absolute prohibition against scroll in exceptional expanded states, but ordinary configurations should not become materially taller.

Pay particular attention to:

```text
matrix row height
subsection spacing
cargo summary height
expanded-pad spacing
pane heading height
```

Do not reintroduce scroll solely through visual padding.

---

## 23. Continue the committed palette / tokens

Continue using the provisional canonical palette introduced in the shell pass:

```text
Background        #F1F6F4
Surface           #D9E2DD
Panel tint        #B8C8C1
Structural dark   #2A3E3A
Primary text      #2E4440
Muted text        #6E7F7A
Rule / border     #9FAFAA
Highlight         #F7FAF8
Warning           #D4A23F
Critical          #C75452
Shadow            rgba(42, 62, 58, 0.12)
```

Prefer the semantic `--ui-*` layer introduced by the shell pass rather than creating a parallel palette.

If token extension is necessary, keep it minimal and semantically named.

---

## 24. Existing shell remains authoritative

Do not regress the already committed shell visual language.

Preserve:

```text
TitleBar
PageHeader
StatusBar
page background treatment
shell typography
shell palette
```

unless a tiny shared-token correction is strictly necessary.

If such a correction affects the shell, report it explicitly.

---

## 25. No flowchart / instrumentation redesign

Do not introduce:

```text
arrows connecting Matrix to Cargo
routing lines
flow diagrams
live instrumentation motifs
animated status indicators
neon / glow effects
dense NASA-console schematics
```

The tracker records mostly static network state.

Its visual language should remain technical and disciplined without pretending to be a live systems monitor.

---

## 26. No warning-pattern expansion yet

Do not introduce hazard stripes or new critical-state motifs in Matrix/Cargo during this pass.

Warning / critical styling should remain restrained and consistent with the shell tokens.

---

## 27. Behavior must remain unchanged

Do not change:

```text
Matrix editing behavior
Present / Producing prerequisites
derived Inputs / Logistics calculation
cargo export semantics
cargo import derivation
destination selection behavior
Inter-System behavior
pad add/remove behavior
collapse/expand behavior
reordering
drag/drop
Undo/Redo
validation
persistence
```

The only approved compact-summary layout changes are:

```text
remove visible "Pad N" label
reposition [INT] into the vacated visual area
```

Everything else is visual unless explicitly required to preserve layout.

---

## 28. Verification

Run appropriate checks, at minimum where available:

```text
npm test
npm run lint
npm run build
git diff --check
```

Report any pre-existing failures separately.

### Manual browser smoke tests

Test representative outposts containing:

```text
multiple inorganic rows
organic rows
manufacturing rows
imports
multiple cargo pads
linked pads
unlinked pad
regular pad
inter-system pad
collapsed pad
expanded pad
```

Verify:

- Matrix remains readable;
- no automatic Matrix horizontal scrollbar;
- Cargo has modestly more room if pane split changed;
- Matrix and Cargo feel equal in hierarchy;
- no stripe-heavy appearance;
- Matrix sections remain easy to scan;
- interactive state cells look clickable;
- derived cells look less button-like;
- state semantics remain unchanged;
- compact Cargo summary still uses two rows;
- remote destination remains right-aligned;
- outbound remains left;
- inbound remains right;
- `[INT]` placement is stable;
- `Unlinked` remains in the remote destination position;
- long remote names ellipsize less aggressively where possible;
- expanded-pad controls remain in their existing order/layout;
- no page-level overflow regression;
- keyboard focus remains visible;
- drag/reorder behavior still works.

---

## 29. Suggested visual review cases

Where available, inspect at least:

```text
outpost with no organics
outpost with several organic species
outpost with several manufactured products
outpost with imports
outpost with 5–6 cargo pads
unlinked cargo pad
inter-system cargo pad
long remote outpost name
selected interactive Matrix state
dimmed derived Matrix state
unavailable interactive state
```

The redesign should remain stable across these cases.

---

## 30. Deliverable report

When complete, report:

```text
files changed
tokens added/changed
pane-width changes
Resource Matrix changes
state-cell changes
Cargo Pad visual changes
compact-summary layout changes
expanded-pad visual changes
behavior/layout intentionally left untouched
tests/checks run
manual smoke-test results
unexpected inherited effects
```

Explicitly state:

- whether any out-of-scope component changed visually;
- whether Matrix horizontal scrolling appears at the tested viewport;
- whether expanded-pad control order/layout remained unchanged.

Do not commit or push unless explicitly asked.

---

## 31. Suggested commit message

If the implementation is accepted:

```text
feat: restyle outpost operations workspace
```

---

## 32. Final instruction

The purpose of this pass is to make the Resource Matrix and Cargo Pads feel like a coherent, equally important operational pair while preserving the compact information architecture already established.

Do not redesign for novelty.

Prefer:

```text
clarity
restraint
technical hierarchy
state legibility
existing workflow preservation
```

over decorative complexity.

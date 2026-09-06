# Codex Implementation Brief — Visual Language Pass 1: Application Shell

## Objective

Implement the **first visual-language pass** for `starfield-outpost-network`, limited to the low-risk application shell:

- `TitleBar`
- `PageHeader` / application header area
- `StatusBar` / footer

The goal is to establish the project's new visual direction without redesigning the dense operational workspace yet.

This is the first implementation step after:

1. the source-level semantic UI audit;
2. the runtime/computed-style audit;
3. the visual-language design discussion;
4. selection of the provisional canonical palette and font direction.

The resulting shell should feel like a **Starfield technical record interface adapted for dense desktop use**: calm, pale, technical, rectilinear, restrained, and information-first.

This is **not** a general UI restyle.

---

# 1. Read repository guidance first

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
TitleBar
PageHeader / character + utility controls
StatusBar
global CSS variables / typography tokens
```

Preserve the current architecture and component responsibilities.

Do not move domain logic into presentation components.

---

# 2. Hard scope boundary

This pass is deliberately narrow.

## In scope

Visual treatment of:

```text
TitleBar
PageHeader
StatusBar
page/background shell immediately surrounding those areas
```

Supporting work needed specifically for those regions is also in scope:

```text
new visual tokens
font-family setup
shell-specific spacing/rules/surfaces
shell-specific focus treatment where controls exist in scope
very subtle page background gradient/vignette
```

## Out of scope

Do **not** redesign or materially restyle:

```text
Resource Matrix
Cargo Pads
Outpost navigation controls/list
Planned Supply
Biome controls
Solar/Wind indicators
System/Body selectors beyond what is unavoidable in PageHeader
matrix state cells
cargo export cells
drag handles
move controls
reorder modes
validation panel contents
manufacturing inline edit controls
```

Do not perform broad CSS consolidation yet.

Do not create the complete future `.ui-*` semantic component layer in this pass.

Do not refactor unrelated component structure.

Do not change domain behavior, persistence, validation, Undo/Redo, migration, or reference-data behavior.

---

# 3. Visual design target

The agreed direction is:

> **Starfield institutional/technical UI with engineering discipline, rather than a generic web dashboard or a live spacecraft instrumentation panel.**

Reference qualities:

```text
predominantly pale surfaces
cool sage-grey cast
deep green/blue-charcoal structural anchors
square / near-square geometry
thin rules and sparse boxing
strong horizontal organization
dark structural elements used sparingly
technical but calm
dense by information design, not miniaturization
minimal decorative chrome
```

The shell should feel visually related to Starfield's character-creator / institutional UI language, but it must remain an original application interface rather than a reproduction.

Avoid:

```text
rounded-card dashboard styling
large soft shadows
dark-theme sci-fi styling
neon/glow effects
decorative gradients
flowchart/connector motifs
heavy boxing around every group
oversized headings
```

---

# 4. Locked provisional palette

Use the following values as the first-pass canonical visual tokens.

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

Design intent:

- The green cast should be subtle but perceptible.
- Avoid introducing additional yellow/warm cast into pale surfaces.
- The page should read as **cool sage-grey**, not aged paper.
- Structural dark should remain scarce enough to retain emphasis.
- Warning/critical colors should not become general-purpose accents.

---

# 5. Token implementation strategy

The repository already has an existing raw token layer such as:

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

Do **not** blindly remap all existing tokens to the new palette if doing so would restyle out-of-scope workspace controls.

This pass should avoid accidental global redesign.

Preferred approach:

1. Preserve current existing tokens where changing them would ripple through the Resource Matrix, Cargo Pads, Planned Supply, navigation, or other out-of-scope controls.
2. Introduce a small **provisional semantic visual token layer** for the new shell where necessary.
3. Reuse existing raw tokens only when doing so is safe and semantically appropriate.
4. Keep token naming clear enough that a later design-system pass can consolidate them deliberately.

Conceptual semantic roles may include names along the lines of:

```text
--ui-background
--ui-surface
--ui-panel
--ui-structural-dark
--ui-text
--ui-text-muted
--ui-rule
--ui-highlight
--ui-warning
--ui-critical
--ui-shell-shadow
```

Exact names may follow repository conventions.

Do not proliferate many near-duplicate tokens.

---

# 6. Typography direction

## UI font

Primary UI/display direction:

```text
Barlow Semi Condensed
```

## Monospace font

Technical/code direction:

```text
IBM Plex Mono
```

For this shell-only pass:

- Barlow Semi Condensed should become the intended shell/UI face where practical.
- IBM Plex Mono may be introduced for shell technical codes/metadata only if there are appropriate existing examples.
- Do not force monospace into ordinary interface text.
- Do not restyle dense workspace mono content yet merely to adopt the new font.

## Font sourcing

Use a legal, project-appropriate source and avoid proprietary fonts.

Do not add NB Grotesk R or NB Architekt.

If the repository already has a font-loading convention, follow it.

If adding local webfont assets is appropriate, keep the change minimal and document the source/license in the normal repository-appropriate manner.

Do not add unnecessary weights.

A small set such as regular/medium/semibold is preferred if sufficient.

## Typographic hierarchy

Keep hierarchy modest.

The shell should not rely on dramatic size differences.

Use:

```text
placement
spacing
partial structural bars
rules
case
tracking
weight
```

before using large font-size jumps.

Short structural labels may use:

```text
uppercase
slightly increased letter spacing
```

Ordinary content remains mixed case.

---

# 7. Geometry and border language

Locked geometry rules:

```text
square or near-square corners
flat surfaces
minimal shadow
sparse borders
strong horizontal organization
```

## Corners

Do not introduce soft rounded-card styling.

Where current shell elements use noticeable radii, reduce them if doing so is safe and visually appropriate.

Near-square is acceptable if a tiny radius improves browser rendering.

## Borders

Use three conceptual levels:

```text
fine rule      ordinary separation
control border actual editable/selectable element
major rule     important region boundary
```

Heavy borders should be rare.

Do not draw a rectangle around a region merely because it is a section.

Prefer:

```text
background tone
spacing
alignment
horizontal rules
```

when they are enough.

## Shadow

Use shadow only for genuine overlays/floating panels.

The permanent shell should feel mostly flat.

---

# 8. Background treatment

A very subtle background gradient or vignette is allowed.

Purpose:

> prevent the pale page field from feeling mechanically flat.

Requirements:

- broad;
- low contrast;
- cool sage-grey;
- no visible banding;
- no glossy or decorative effect;
- no strong spotlight effect.

If the gradient is consciously noticeable during normal use, it is too strong.

A flat `#F1F6F4` fallback should remain visually acceptable.

---

# 9. Dark structural elements

Structural dark:

```text
#2A3E3A
```

is an emphasis resource, not a default header background.

Use it sparingly.

The preferred Starfield-inspired pattern is a **partial-width structural bar/rail**, not a full-width stripe for every heading.

A dark bar should act as:

```text
anchor
signpost
region identifier
```

not decoration.

Avoid creating a "striped" page.

For this pass, the TitleBar / shell may establish this motif in a restrained way.

Do not add dark bars inside Resource Matrix or Cargo Pads yet; those regions are explicitly out of scope.

---

# 10. TitleBar

The TitleBar should establish the application's identity and overall visual character.

Goals:

```text
calm
technical
horizontal
lightweight
Starfield-institutional rather than web-dashboard
```

Recommended treatment:

- pale main surface;
- one restrained dark structural anchor/partial rail;
- Barlow Semi Condensed;
- application identity clearly visible but not oversized;
- thin horizontal rule(s) where useful;
- square geometry;
- little or no shadow;
- generous enough spacing to feel intentional without consuming unnecessary height.

Do not turn it into a large hero banner.

The TitleBar should establish identity and then get out of the user's way.

---

# 11. PageHeader / application header

The PageHeader contains useful controls but belongs conceptually with navigation/application infrastructure, not the operational core.

Its role is:

```text
identity
setup
constraints
utility controls
```

not day-to-day operational emphasis.

It should therefore feel:

```text
compact
pale
technical
quiet once configured
```

Use the calmer side of the visual language.

Potential cues:

- pale `Surface` / `Background` relationship;
- restrained grouping through spacing;
- fine rules rather than boxes;
- short uppercase field labels if appropriate;
- ordinary mixed-case values;
- square inputs/selects if touched within scope;
- structural dark only in small doses.

Do not make this area compete visually with the Resource Matrix.

## Important scope caution

The PageHeader includes controls whose full shared-control redesign belongs to a later pass.

Therefore:

- avoid solving every select/input/button family here;
- make only the minimum shell-local styling needed for coherence;
- do not create a one-off visual treatment that will obstruct later shared primitives.

If native controls remain partially native after this pass, that is acceptable.

This pass is about shell character, not completing the control system.

---

# 12. StatusBar / footer

The StatusBar should normally be the quietest major region.

Normal state:

```text
low visual emphasis
muted text
thin major/fine rule as appropriate
pale or slightly darker shell surface
compact height
```

It may contain:

```text
reference-data status
validation summary trigger
interaction hints
transient messages
dismiss control
```

Normal status should not compete with the operational workspace.

## Exceptional states

Warning/error/transient status may become more prominent when relevant.

Use the locked semantic colors:

```text
Warning   #D4A23F
Critical  #C75452
```

but do not rely on color alone.

Where existing semantics support it, combine color with:

```text
label
icon
border
weight
```

Do not introduce dramatic hazard stripes in this first shell pass.

That motif may be reconsidered later for rare critical states.

---

# 13. State language within scope

The broader state language has been agreed, but only apply it to shell controls where necessary.

## Neutral / available

```text
pale/transparent background
Primary text
Rule/border where needed
```

## Selected / active

```text
clear contrast shift
Structural dark background where appropriate
Highlight text
```

Do not communicate selection merely through a slightly darker border.

## Unavailable

```text
reduced contrast
Muted text
lighter rule/border
still legible
```

## Dimmed / inactive derived state

Conceptually distinct from unavailable.

Do not collapse those semantics simply because their colors may be similar.

## Hover

Subtle.

Hover indicates interactability, not a semantic state.

## Focus

Use a consistent application-owned focus treatment for shell controls touched in this pass.

Target:

```text
2px solid Structural dark
consistent 1px or 2px offset
```

Pick one offset for shell controls and use it consistently.

Do not remove browser focus visibility without replacing it.

---

# 14. Accessibility / usability guardrails

Maintain:

- readable contrast;
- comfortable text sizes;
- clear keyboard focus;
- usable click targets;
- color-independent warning/error meaning;
- legible disabled/unavailable content;
- no critical interaction hidden behind decorative styling.

The visual target is a productivity tool influenced by a game UI, not a game screen that assumes controller navigation.

---

# 15. Do not alter application behavior

This is a visual pass only.

Do not change:

```text
component behavior
event handlers
state transitions
persistence
Undo/Redo
validation logic
network lifecycle
import/export
reference-data loading
selection semantics
drag/drop
keyboard behavior
```

If a current behavioral oddity becomes visually obvious during implementation, report it rather than fixing it unless the fix is strictly required to prevent a regression caused by this pass.

---

# 16. Existing runtime-audit caveats to respect

The runtime audit established several important facts.

Keep them in mind even though most are out of scope:

- many current controls still depend on Chromium-native styling;
- selected Outpost currently looks like a disabled native button;
- Reshuffle active mode lacks an authored active visual state;
- custom dense controls already share an accent grammar;
- focus treatment currently varies between custom and native controls;
- Solar/Wind use native small-control font metrics to visually match nearby controls;
- existing global token changes can therefore have broad unintended effects.

This is why the shell pass must avoid indiscriminate global token remapping.

---

# 17. Verification

After implementation, run appropriate repository checks.

At minimum, where available:

```text
npm test
npm run lint
npm run build
git diff --check
```

If one of these is not appropriate or fails for a pre-existing reason, report that clearly.

Also perform manual browser smoke testing at the normal development viewport.

Verify:

- TitleBar remains compact and legible;
- PageHeader controls still function normally;
- StatusBar behavior remains intact;
- validation trigger/panel still opens if it lives in the StatusBar;
- transient/dismiss behavior is unaffected where testable;
- no page-level layout regression;
- no unexpected restyling of Resource Matrix, Cargo Pads, Planned Supply, or navigation;
- no horizontal overflow introduced;
- ordinary configured outposts still fit within the expected desktop layout.

Check keyboard focus for shell controls touched by the pass.

---

# 18. Visual review checklist

Before considering the pass complete, assess the result against these questions:

1. Does the page feel predominantly pale?
2. Is the green cast subtle but visible?
3. Has the palette avoided a yellowed/aged-paper look?
4. Is structural dark used sparingly?
5. Does the shell feel flat and rectilinear rather than card-based?
6. Are boxes and borders used only where they have a clear purpose?
7. Does the TitleBar establish identity without dominating?
8. Does the PageHeader feel like quiet technical context rather than the main workspace?
9. Is the StatusBar normally subdued?
10. Does the result feel more like a Starfield institutional/technical interface without becoming a direct imitation?
11. Have the Resource Matrix and Cargo Pads remained visually and behaviorally untouched except for unavoidable inherited changes?
12. Are native/browser-control dependencies still understood rather than accidentally hidden by ad hoc local styling?

---

# 19. Deliverable report

When complete, report:

```text
files changed
new/changed tokens
font-loading changes
TitleBar changes
PageHeader changes
StatusBar changes
any unavoidable inherited effects outside scope
tests/checks run and results
manual smoke-test results
remaining visual inconsistencies deliberately deferred
```

Also explicitly state whether any out-of-scope component changed visually as a side effect.

Do not commit or push unless explicitly asked.

---

# 20. Important deferred work

Do not solve these in this pass:

```text
full semantic component CSS layer
shared button/action treatment
selected-vs-disabled Outpost navigation
mode button active state
Resource Matrix redesign
Cargo Pad redesign
removal of visible Pad 1 / Pad 2 / Pad 3 summary titles
Planned Supply redesign
shared dense state-control grammar
warning/error motif expansion
full focus-system consolidation
Solar/Wind restyling
select/input family consolidation
drag/reorder family consolidation
```

These belong to later passes after the shell establishes the visual language successfully.

---

# 21. Final instruction

This pass should establish the **visual character of the application shell**, not finish the redesign.

Prefer restrained, coherent changes over broad cleanup.

If there is tension between:

```text
perfect local visual consistency
```

and:

```text
preserving scope so later semantic-control work remains clean
```

prefer preserving scope.

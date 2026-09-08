# Codex Implementation Brief — Contextual Micro-Help and State Tooltips

## Objective

Implement a reusable contextual-help system and targeted state tooltips for the Starfield Outpost Network application.

This batch has two related goals:

1. add restrained, clickable `?` micro-help affordances beside selected app-specific concepts;
2. add state-specific tooltips where the visible state is intentionally qualitative or otherwise needs local explanation.

This is a UX/help pass, not a redesign.

The guiding principle is:

> **Contextual help explains semantics; tooltips explain the state of a particular item or indicator.**

That principle should be encoded in durable UX documentation.

---

## 1. Read project guidance first

Inspect:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect especially:

```text
src/ui/components/PlannedSupplyEditor.tsx
src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostDetails.tsx
src/ui/components/CargoPadEditor.tsx
src/ui/components/ValidationSummary.tsx
src/index.css
```

Also inspect existing tooltip/title usage and focus/popover patterns.

Do not introduce a heavyweight tooltip or popover dependency unless there is a compelling project-wide reason.

---

# PART A — DESIGN PRINCIPLES

## 2. Semantics vs state

Lock in this UX distinction:

### Contextual micro-help

Explains:

```text
what this concept/control/column means
```

Examples:

```text
Planned Supply
Logistics
Biomes
Present
Producing
Inter-System
Validation
```

### State tooltip

Explains:

```text
what this specific current value/state means
```

Examples:

```text
Solar: Poor
Wind: Good
Aluminium Present cell
Lubricant Present cell
```

Do not blur the two concepts.

---

## 3. Visual restraint

The help affordance should:

- use a conventional circled `?`;
- sit immediately to the right of the relevant label/button/column heading;
- remain visually quiet;
- use the existing B1 visual language;
- avoid badge-like color emphasis;
- avoid animation;
- avoid rounded-card dashboard styling.

The help box itself should:

- use pale/flat application surfaces;
- use existing B1 border/rule/text tokens;
- be square or nearly square;
- use no shadow unless an existing established popover pattern already requires one;
- be compact;
- contain only the short explanatory text.

Do not add redundant headings inside the help box.

---

# PART B — REUSABLE CONTEXT HELP COMPONENT

## 4. Build one reusable implementation

Create a reusable component or utility, conceptually something like:

```text
ContextHelp
```

The exact name is up to project conventions.

It should accept at minimum:

```text
help text
accessible label / context
```

All contextual-help instances in this batch should use the same implementation.

Do not duplicate open/close logic per component.

---

## 5. Open/close behavior

Clicking the `?` opens the anchored help box.

Clicking the same `?` again closes it.

Clicking elsewhere closes it.

Pressing `Escape` closes it.

Only one contextual-help box should be open at a time.

The help box is:

- non-modal;
- does not block the rest of the app;
- does not cause layout reflow.

---

## 6. Keyboard behavior

The `?` must be a real keyboard-accessible control.

Support:

```text
Tab
Enter
Space
Escape
```

Requirements:

- Tab can focus the `?`;
- Enter/Space toggles the help box;
- Escape closes the open help box;
- when Escape closes it, focus returns to the `?` trigger.

Do not make the explanatory text focusable unless it contains future interactive content.

Do not create a focus trap.

---

## 7. Placement and viewport behavior

The help box should anchor near the `?` trigger.

Prefer below or beside the trigger, but allow it to flip/reposition if needed to remain within the viewport.

Do not hard-code “always below” if that causes clipping.

The popover should overlay workspace content rather than push it around.

---

# PART C — CONTEXTUAL HELP TARGETS AND EXACT WORDING

Add a `?` immediately to the right of each target below.

Use the following wording exactly unless minor punctuation normalization is required by existing project style.

## 8. Planned Supply

> Selected items act as placeholders until local or imported supply is established.

## 9. Logistics

> Items currently assigned to cargo links are displayed here.

## 10. Biomes

> Selected biomes limit resource availability to resources that can occur in those biomes.

## 11. Present

> Shows whether a resource can be present at this outpost.

This micro-help explains only the column semantics.

Specific Present-cell meaning belongs in tooltips.

## 12. Producing

> Shows whether this outpost is currently set to produce the resource or product.

## 13. Inter-System

> Inter-System cargo pads can link outposts in different star systems and require Helium-3.

## 14. Validation

> Errors identify invalid states, warnings identify incomplete or inconsistent states, and info highlights useful follow-up items.

---

# PART D — PRESENT-COLUMN STATE TOOLTIPS

## 15. Inorganic Present tooltips

Use state-sensitive wording.

### Potentially present but not recorded

Example:

> Aluminium may be present at this outpost.

### Recorded present

Example:

> Aluminium is recorded as present at this outpost.

Use the full player-facing resource name.

Do not hard-code Aluminium; derive the resource name.

---

## 16. Organic Present tooltips

Use **domesticable species** wording.

### No biome restriction

Example:

> Lubricant is available from a domesticable species on this planet.

### One selected biome

Example:

> Lubricant is available from a domesticable species in the selected biome.

### Multiple selected biomes

Example:

> Lubricant is available from a domesticable species in the selected biomes.

Use the full player-facing resource name.

---

## 17. Prefer biome names when reliable

Where the domain/reference data allows a clear, accurate named-biome explanation, prefer a specific biome name.

Example:

> Lubricant is available from a domesticable species in Wetlands.

Be careful when:

- a domesticable species exists in multiple biomes;
- multiple selected biomes all intersect the outpost;
- more than one selected biome genuinely supports the same resource/species route.

Do **not** collapse multiple valid biome contexts into one misleading named biome.

If multiple selected biomes support the resource, prefer the plural generic wording unless a concise, unambiguous multi-biome phrase is easy to derive.

Correctness is more important than specificity.

---

## 18. Dim/inactive organic states

Audit current organic Present-cell semantics.

If a dimmed organic Present cell has a meaningful reason that can be stated reliably, provide a state tooltip consistent with actual domain logic.

Do not invent causal explanations.

If the app only knows that the resource is not available from a domesticable species in the active body/biome context, wording may be along the lines of:

> {ResourceName} is not available from a domesticable species in the selected biome(s).

Use only if fully supported by current reference data and domain logic.

If the reason cannot be stated reliably, preserve current title behavior rather than adding speculative copy.

---

# PART E — SOLAR/WIND STATE TOOLTIPS

## 19. Keep visible indicators qualitative

Do not change the visible qualitative labels.

Examples may include:

```text
Very Poor
Poor
Normal
Good
Very Good
```

The visible UI should remain qualitative.

---

## 20. Add quantitative tooltip detail

For Solar and Wind indicators, provide tooltips containing:

```text
qualitative state
exact multiplier
percentage increase/decrease
```

Preferred format:

```text
Solar: Poor · 0.75× output (−25%)
Wind: Good · 1.25× output (+25%)
Solar: Normal · 1.00× output (no modifier)
```

Use the actual canonical multiplier/value that underlies the qualitative category.

Do not invent numbers from the category label.

If current runtime state stores only qualitative buckets, inspect the authoritative reference-data source/generator that produced the bucket and use the project’s canonical multiplier mapping.

Do not expose the multiplier permanently in the visible Outpost Details strip.

---

## 21. Tooltip accessibility

Tooltips should remain discoverable for:

```text
mouse hover
keyboard focus
```

Where the existing project uses native `title`, a native tooltip is acceptable if it satisfies this requirement sufficiently.

If a small reusable app tooltip already exists or is clearly preferable, reuse it.

Do not introduce a heavyweight tooltip library.

---

# PART F — EXISTING VALIDATION WORDING CLEANUP

## 22. Organic unspecified-source validation

Fix the remaining generic validation wording for organic resources recorded as produced without a specified flora/fauna source.

Change the main message to:

```text
{organicResourceName} is recorded as produced, but no flora or fauna source has been specified.
```

Use the full player-facing resource name.

---

## 23. Add valid-source remediation line

Where reference data can reliably determine valid domesticable source species for that resource in the current outpost/body/selected-biome context, add a subordinate remediation line similar to the existing biome remediation pattern.

Preferred wording:

```text
Available from: {species1}, {species2}, ... {speciesN}
```

Requirements:

- use full player-facing species names;
- list only valid domesticable sources;
- respect current body/selected-biome context;
- sort deterministically, preferably alphabetically by display name;
- omit the remediation line entirely if no reliable source list can be derived.

Do not add punctuation-heavy prose if the concise `Available from:` form fits the existing validation presentation.

---

## 24. Preserve validation semantics

Do not change:

```text
rule severity
rule category
rule identity
validation navigation behavior
issue metadata
```

unless a small metadata addition is genuinely required to render the remediation line correctly.

If metadata changes are needed, keep them backward-compatible within the current in-memory validation model and document them.

---

# PART G — LOCALIZATION-AWARE IMPLEMENTATION DIRECTION

## 25. Avoid needless new embedded-copy debt

English remains the only/default language today.

A lightweight localization framework is deferred.

Where practical:

- centralize the new help strings so later migration is straightforward;
- do not duplicate the same literal text in multiple components;
- derive resource/species names from player-facing reference data rather than hard-coding names.

Do not implement the localization framework in this batch.

Do not change spelling conventions globally.

The future `Aluminium` / `Aluminum` distinction belongs to localization and is explicitly out of scope here.

---

# PART H — EXPLICITLY OUT OF SCOPE

## 26. Do not implement

Do not add:

```text
full user manual
in-app tutorial
tour/walkthrough system
help center screen
searchable documentation
localization framework
language selector
validation exact-target navigation
validation region highlighting
validation item highlighting
workspace scrolling changes
workspace pane resizing
multiple-network UI
planner/management explanations
throughput/power/storage diagnostics
```

Do not turn contextual help into a teaching workflow.

---

# PART I — TESTING

## 27. Automated tests

Add focused tests where practical for:

### ContextHelp

- click opens;
- second click closes;
- outside click closes;
- Escape closes;
- focus returns to trigger on Escape;
- only one help box is open at a time.

### Help text

Verify exact copy for the seven initial help targets.

### Present tooltips

Cover:

- inorganic possible;
- inorganic recorded present;
- organic no-biome context;
- organic one-biome context;
- organic multiple-biome context;
- named-biome wording where reliably derivable.

### Solar/Wind tooltips

Verify:

- qualitative label;
- multiplier;
- percentage change;
- neutral/no-modifier wording.

### Organic validation wording

Verify:

- resource name included;
- correct main sentence;
- valid domesticable species list;
- deterministic ordering;
- remediation omitted when not reliable.

Do not overfit tests to incidental DOM structure.

---

## 28. Standard checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

---

# PART J — BROWSER SMOKE TEST

## 29. Context-help runtime checks

Verify each of:

```text
Planned Supply
Logistics
Biomes
Present
Producing
Inter-System
Validation
```

Confirm:

- `?` appears to the right of the intended label/control;
- visual treatment is restrained and consistent;
- click opens;
- same-trigger click closes;
- outside click closes;
- Escape closes;
- keyboard activation works;
- help box does not reflow layout;
- help box remains within viewport.

---

## 30. Tooltip runtime checks

Verify:

```text
Solar
Wind
inorganic Present cells
organic Present cells
```

Confirm tooltip text matches actual visible/domain state.

Specifically verify at least one organic resource that spans multiple biomes so the tooltip does not misleadingly name only one biome.

---

## 31. Validation runtime check

Create or load an outpost with an organic resource recorded as produced but without a specified source.

Confirm:

```text
resource name appears in main warning
valid domesticable source species appear underneath when available
species list respects selected biome context
```

---

# PART K — DOCUMENTATION

## 32. Update UX-DESIGN.md

Add the durable design principle:

> Contextual help explains semantics; tooltips explain the state of a particular item or indicator.

Also document:

- circled `?` as the standard micro-help affordance;
- compact anchored non-modal help box;
- one help box open at a time;
- click/keyboard open;
- outside-click/Escape close;
- help is reserved for app-specific/non-obvious concepts;
- ordinary familiar controls should not be decorated with help icons unnecessarily.

Do not turn `UX-DESIGN.md` into a catalogue of every current help string.

---

## 33. Backlog maintenance

If the backlog contains a generic user-guide/help item, rewrite it so that:

- formal V1 manual remains deferred;
- contextual micro-help/tooltips are recorded as implemented once complete;
- deeper tutorial/help-center ideas are not implied as requirements.

Do not remove future formal documentation work.

---

# PART L — COMPLETION REPORT

## 34. Report

On completion, report:

```text
files changed
reusable help component/API
popover positioning approach
keyboard/focus behavior
seven help placements
exact help copy implemented
Present tooltip rules
Solar/Wind multiplier tooltip rules
organic validation wording change
organic valid-source remediation behavior
tests added/updated
browser smoke-test results
UX documentation changes
backlog changes
```

Explicitly state whether:

- any localization framework was added;
- any workspace layout behavior changed;
- any validation severity/category changed;
- any planner/throughput behavior changed;
- any persistence schema changed.

Do not commit or push unless explicitly asked.

---

## 35. Suggested commit message

If accepted:

```text
feat: add contextual help and state tooltips
```

---

## 36. Final instruction

Keep this batch focused on **small, local, highly discoverable assistance**.

The intended result is:

```text
micro-help explains unfamiliar app concepts
tooltips explain current state precisely
validation wording names the actual affected resource
quantitative Solar/Wind meaning is discoverable without cluttering the UI
```

Do not expand the work into a tutorial system or planner.

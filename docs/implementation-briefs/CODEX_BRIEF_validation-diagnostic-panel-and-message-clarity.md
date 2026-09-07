# Codex Implementation Brief — Validation Diagnostic Panel and Message Clarity Pass

## Objective

Redesign the existing Validation pop-out into a compact, flat, non-modal diagnostic panel that fits the application's established visual language and is structurally ready for future click-to-navigate behavior.

At the same time, make a **targeted message-clarity pass** for the small subset of validators whose current wording relies on vague phrases such as `this resource`, `this item`, or `this recipe input`.

This pass should:

- preserve validation logic and severities;
- preserve the current Validation trigger/header wording unless a technical reason requires otherwise;
- keep the panel non-modal and anchored to the Validation control;
- present issues as structured diagnostic rows rather than bullet paragraphs;
- introduce useful human-readable cargo-pad references as `Pad {n}` derived from current pad order;
- add only the small amount of structured issue metadata needed for clear messages and future navigation;
- establish the thin scrollbar treatment as the preferred application scrollbar language where practical.

Do **not** implement issue-row navigation yet.

---

## 1. Read repository guidance first

Before editing, inspect the repository and relevant guidance, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
```

Inspect especially:

```text
src/ui/components/ValidationSummary.tsx
src/ui/components/ValidationSummary.css
src/domain/validation/types.ts
src/domain/validation/registry.ts
src/domain/validation/rules/*
src/ui/components/CargoPadsEditor.tsx
src/ui/components/CargoPadsEditor.css
```

Also inspect the current StatusBar integration and any shared scrollbar/focus styles.

---

# PART A — VALIDATION PANEL PRESENTATION

## 2. Design intent

The Validation pop-out should no longer read like a generic white message box.

Treat it as a **compact diagnostic issue list**.

It should feel like:

```text
technical
flat
pale
square
compact
non-modal
anchored
scannable
```

It should be structurally capable of becoming a navigable menu later, but this pass must not make rows clickable.

---

## 3. Non-modal behavior

Preserve the current non-modal model.

Requirements:

- no backdrop;
- no dimming;
- no focus trapping;
- no blocking of the rest of the application;
- no animation/slide-out;
- the panel appears immediately when opened;
- the user may continue interacting with the workspace while the panel remains open.

The panel should remain anchored to the existing Validation trigger.

---

## 4. Open/close behavior

Keep the Validation button as the sole open/close control.

Requirements:

```text
click Validation trigger -> open
click Validation trigger again -> close
```

Do **not** add an `×` close button.

Do **not** dismiss automatically when the user clicks elsewhere in the application.

The panel should be able to remain open while the user fixes issues.

---

## 5. Trigger and header wording

Keep the current trigger wording:

```text
Validation: {issueCount} issue
Validation: {issueCount} issues
```

Keep the current header semantics:

```text
VALIDATION
{errorCount} errors · {warningCount} warnings · {infoCount} info
```

Minor typography/casing adjustments are allowed to fit the established visual language, but do not invent new wording unless necessary.

---

## 6. Panel surface

Use the existing application visual language:

- pale `Surface` / `Highlight`;
- thin border/rule;
- square / near-square geometry;
- no drop shadow;
- no glow;
- no rounded card treatment.

The panel should feel related to the StatusBar and existing technical surfaces.

---

## 7. Size constraints

The panel must remain compact so it does not obstruct the workspace the user may need to edit.

### Height

Set a strict practical maximum height corresponding to roughly **4–5 normal validation issue rows**.

When issue content exceeds that height:

- keep the header fixed if practical;
- scroll the issue list internally;
- do not let the panel grow indefinitely.

Tune the exact CSS value based on actual row height rather than using an arbitrary large viewport percentage.

### Width

Keep approximately the current useful width unless the redesigned row structure suggests a small adjustment.

The panel should be wide enough for readable validation sentences, but not dominate the workspace.

---

## 8. Scrollbar treatment

Use a thin Starfield-inspired scrollbar treatment:

```text
thin
low contrast
simple vertical thumb
minimal track
no chunky browser arrows/buttons
```

Use CSS-supported browser styling only.

Do **not** build a JavaScript/custom scrollbar implementation.

If a clean shared/global scrollbar rule can be introduced without disturbing unrelated components, make the treatment reusable for later application-wide consistency.

Do not perform a full application scrollbar audit in this pass.

Browser fallback is acceptable.

---

## 9. Issue sorting

Sort visible issues by severity:

1. `error`
2. `warning`
3. `info`

Within each severity, preserve existing validator output order.

Do not introduce additional alphabetical or location sorting in this pass.

---

## 10. Row anatomy

Each issue should render as a discrete diagnostic row.

Use a compact two-line baseline structure:

### Line 1 — location/context

```text
{Outpost Name}
```

or, when a cargo pad is relevant:

```text
{Outpost Name} · Pad {n}
```

### Line 2 — issue message

```text
{resolved human-readable validation message}
```

An `active-production-valid-for-body` issue may add one subordinate remediation line when reliable alternative biome information is available.

Do not return to the current single paragraph/bullet style.

---

## 11. Cargo-pad display locator

Cargo pads now expose lightweight ordinals in locked mode.

Validation presentation should resolve:

```text
cargoPadId -> current cargo pad position -> Pad {n}
```

Use the current order of `outpost.cargoPads`.

Important:

- do not persist the ordinal;
- do not treat it as identity;
- continue using stable `cargoPadId` internally;
- if the pad is reordered, the displayed validation locator should update accordingly.

If a referenced cargo pad cannot be resolved because the data is malformed, fall back gracefully to the existing stable/raw ID rather than inventing a misleading number.

---

## 12. Severity presentation

Do not repeat visible text such as:

```text
ERROR
WARNING
INFO
```

on every row.

Communicate severity through:

1. severity ordering;
2. a subtle visual marker.

Preferred marker:

- narrow vertical rail on the left edge of each issue row;
- muted Critical/red for errors;
- existing Warning amber for warnings;
- muted structural/panel tone for info.

Keep the row background pale.

Do not flood entire rows with warning/error colors.

Do not rely on color alone for the panel as a whole: header counts and ordering already provide textual severity context.

---

## 13. Row boundaries and future navigation

Rows should be structurally distinct enough that they can later become focusable/clickable menu-like items.

However, in this pass:

- do not make rows clickable;
- do not use `cursor: pointer`;
- do not add hover highlighting that falsely advertises interaction;
- do not add navigation arrows/chevrons.

Use spacing, thin rules, or subtle row separation only.

Future navigation should be able to add hover/focus behavior without redesigning row geometry.

---

## 14. Empty state and live updating

Preserve live validation updates while the panel is open.

As the user fixes issues:

- rows/counts should update;
- resolved rows should disappear;
- the panel should remain open.

If the final issue is resolved, keep the panel open and show:

```text
No validation issues.
```

Do not auto-close it.

---

# PART B — MESSAGE CLARITY PASS

## 15. Scope of message changes

Most existing validator messages are acceptable and should remain unchanged.

Only modify the validators/messages explicitly listed below.

Do not rewrite unrelated validators for style consistency.

Do not change validation triggers, rule semantics, categories, or severities.

---

## 16. `active-production-valid-for-body`

Rule ID:

```text
active-production-valid-for-body
```

### Inorganic / non-organic production route

Use:

```text
{resourceName} is marked as produced, but is not available for outpost extraction in {selectedBiomeList} biomes.
```

### Organic production route

Use:

```text
{resourceName} is marked as produced, but is not available for outpost harvesting in {selectedBiomeList} biomes.
```

Resolve `{resourceName}` from reference data.

Resolve `{selectedBiomeList}` to the human-readable currently selected biome names relevant to the outpost.

Use a compact readable list.

If singular/plural grammar can be handled cleanly, do so, but do not complicate the implementation unnecessarily.

### Remediation line

This validator alone may add a subordinate third line when reliable alternative biome information exists.

For inorganic/non-organic production:

```text
Available for extraction in: {availableBiomeList}
```

For organic production:

```text
Available for harvesting in: {availableBiomeList}
```

The alternative biome list must be derived from authoritative existing reference data for the current body and route.

If no reliable alternative list can be derived, omit the remediation line.

Do not guess.

Do not show empty/meaningless remediation text.

---

## 17. `manufacturing-inputs-unavailable`

Rule ID:

```text
manufacturing-inputs-unavailable
```

Use:

```text
{productName} requires {inputItemName}, but {inputItemName} is not available at this outpost.
```

Both names must be resolved from structured IDs/reference data.

Do not use:

```text
requires this recipe input
```

---

## 18. `organic-farming-inputs-unavailable`

Rule ID:

```text
organic-farming-inputs-unavailable
```

Use:

```text
{speciesName} requires {farmingInputItemName}, but {farmingInputItemName} is not available at this outpost.
```

Resolve both names from structured IDs/reference data.

Do not use:

```text
requires this farming input
```

---

## 19. Duplicate collection message naming

Rule ID:

```text
duplicate-collection-entry
```

Keep the existing message meanings, but replace vague demonstratives with resolved names.

### Local resource duplicate

Change to:

```text
{resourceName} appears more than once in this outpost's local resources.
```

### Active-production duplicate

Change to:

```text
{resourceName} appears more than once in this outpost's active production.
```

### Selected-biome duplicate

Change to:

```text
{biomeName} appears more than once in this outpost's biome selection.
```

### Manufacturing duplicate

Change to:

```text
{productName} appears more than once in this outpost's manufacturing list.
```

### Planned Supply duplicate

Change to:

```text
{itemName} appears more than once in this outpost's Planned Supply.
```

### Cargo-pad outbound duplicate

Change to:

```text
{itemName} appears more than once in this cargo pad's outbound items.
```

The row context line will identify the relevant outpost and `Pad {n}`.

---

## 20. Name resolution and fallbacks

Prefer resolving names in the presentation layer from structured issue metadata.

Required human-readable resolutions include as applicable:

```text
outpost name
cargo pad ordinal
resource name
product name
species name
biome name
```

If an ID cannot be resolved because the data/reference data is stale or malformed:

- fall back to the raw stable ID;
- do not suppress the issue;
- do not invent a name.

This is especially important for structural validation/recovery cases.

---

# PART C — SMALL SCHEMA EXTENSION

## 21. Why a schema extension is needed

`manufacturing-inputs-unavailable` currently carries the missing input as structured `cargoItem`, but the product being manufactured exists only inside the message string.

That is insufficient for:

- robust message composition;
- future click-to-navigate behavior;
- highlighting the relevant manufacturing row later.

Add a small structured product reference to the issue.

---

## 22. Product reference field

Extend `ValidationIssue` with one optional field representing the relevant manufactured product.

Prefer an existing project product-ID type if one exists.

A form such as:

```ts
productId?: ProductId
```

or, if product IDs are plain strings in the existing type system:

```ts
productId?: string
```

is sufficient.

Do not introduce a large generic metadata object unless the existing architecture strongly favors one.

For `manufacturing-inputs-unavailable`:

```text
productId = product being manufactured
cargoItem = missing input item
```

This gives the issue two distinct structured facts.

---

## 23. Preserve message + metadata separation

Keep validators as domain rules that emit structured facts plus readable messages.

Do not make the UI parse names or IDs back out of message strings.

Where richer presentation requires a name, use structured metadata/reference data.

Do not remove the existing `message` field in this pass.

Do not redesign the validation schema broadly.

---

# PART D — PRESENTATION DATA REQUIREMENTS

## 24. ValidationSummary reference-data access

The current presentation resolves outpost/resource/product names.

This pass may require additional reference information for:

```text
species names
body-biome/biome names
active-production alternative biome lists
productId resolution
```

Pass the minimum clean reference-data structures needed into `ValidationSummary`, or use an existing reference-data object if that is already the cleaner architecture.

Do not duplicate reference lookup logic unnecessarily.

Keep domain validation independent from React/UI concerns.

---

## 25. Context-line rules

Use the following location grammar:

### Outpost-level issue

```text
{Outpost Name}
```

### Cargo-pad issue

```text
{Outpost Name} · Pad {n}
```

### Network/character-level issue with no outpost

No fake location line is required.

For those issues, allow the message to occupy the row cleanly without an empty first line.

Do not show raw labels such as:

```text
Outpost:
Pad:
Location:
```

unless required for accessibility.

---

# PART E — VISUAL LANGUAGE

## 26. Typography

Use the established typography:

- Barlow Semi Condensed for UI text/context/messages;
- IBM Plex Mono where technically appropriate.

Suggested hierarchy:

- panel title: structural uppercase UI treatment;
- counts: compact/muted;
- context line: concise technical locator;
- message line: normal readable UI text;
- remediation line: slightly muted subordinate text.

Do not create large font-size jumps.

---

## 27. Flat appearance

Explicit requirements:

- no shadow;
- no animation;
- no rounded-card styling;
- no glow;
- no modal treatment.

Use rules, spacing, and restrained tonal contrast.

---

# PART F — TESTING

## 28. Automated checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Add/update tests where appropriate for changed validation output/schema.

---

## 29. Validation-message tests

Verify at minimum:

### Active production

- invalid inorganic route names the resource;
- invalid organic route names the resource;
- selected biome names appear correctly;
- alternative available-biome remediation appears when reliably derivable;
- remediation is omitted when no valid list exists.

### Manufacturing inputs

- message names manufactured product;
- message names missing input;
- `productId` is populated correctly;
- `cargoItem` still identifies missing input.

### Organic farming inputs

- message names species;
- message names missing farming input.

### Duplicate collections

Verify name substitution for:

```text
resource
biome
product
Planned Supply item
cargo outbound item
```

Verify raw-ID fallback where reference lookup fails.

---

## 30. Browser smoke tests

Verify:

```text
Validation trigger opens/closes panel
no animation
no modal backdrop
outside workspace remains interactive
outside clicks do not close panel
panel remains open while editing
counts update live
issues disappear when resolved
empty state remains open
errors appear before warnings
warnings before info
within-severity order is preserved
rows use two-line context/message layout
cargo-pad rows show current Pad {n}
reordering cargo pads updates Pad {n} locators
panel stops growing after ~4–5 issue rows
internal scrollbar appears
scrollbar is thin and low contrast
no false hover/click affordance exists on rows
no console errors/warnings
```

Test with:

```text
0 issues
1 issue
4–5 issues
many issues
long message
cargo-pad issue
outpost-only issue
network/character-level issue
```

---

# PART G — NON-GOALS

## 31. Do not implement yet

Do **not** implement:

```text
click issue -> navigate to outpost
click issue -> expand cargo pad
click issue -> expand Planned Supply
click issue -> highlight matrix/manufacturing row
movable panel
resizable panel
panel position persistence
menu-style auto-dismiss after selection
validation filtering
validation settings
severity toggles
icons
```

The row structure should make those future features easier, but they remain backlog work.

---

## 32. Do not alter unaffected validator wording

Leave unrelated validator messages unchanged, including but not limited to:

```text
cargo-link-endpoint-missing
cargo-pad-linked-multiple-times
cargo-pad-skill-limit
outpost-skill-limit
invalid-skill-level
invalid-character-level
self-linked-cargo-pad
regular-cargo-pad-cross-system
interstellar-cargo-helium-3
body-system-mismatch
duplicate-outpost-name
outpost-body-not-eligible
outpost-name-length
planetary-habitation-requirement
selected-biome-valid-for-body
unspecified-organic-production-source
unknown-reference-data-id
unresolved-cargo-export
```

Only presentation context around them should change as required by the new panel.

---

# PART H — DELIVERABLE REPORT

## 33. Report on completion

Report:

```text
files changed
ValidationSummary structure changes
panel styling changes
sorting implementation
max-height/scroll behavior
scrollbar implementation
cargo-pad ordinal resolution
message templates changed
schema fields added
reference-data access changes
tests added/updated
automated checks
browser smoke-test results
```

Explicitly state whether:

- any validator condition changed;
- any severity changed;
- any category changed;
- any unrelated message text changed;
- validation navigation was implemented;
- validation issue persistence/network schema changed;
- any out-of-scope component changed visually.

Do not commit or push unless explicitly asked.

---

## 34. Suggested commit message

If accepted:

```text
feat: redesign validation diagnostics
```

---

## 35. Final instruction

This pass should turn Validation from a generic message pop-out into a **compact diagnostic workspace companion**.

The priority order is:

```text
clarity
scanability
useful context
minimal obstruction
future navigability
visual consistency
```

Keep validation behavior stable. Improve how existing facts are communicated and structured.

# Codex Implementation Brief — Resource Matrix Tooltip Consistency + Localization

## Objective

Standardize Resource Matrix tooltips so that state-bearing controls consistently do two things:

1. expand/identify the abbreviated item name; and
2. explain the **current state represented by that control**.

Route all new tooltip text through the existing localization layer.

This is a small UX consistency parcel, not a tooltip-system redesign and not the full accessibility audit.

---

# PART A — READ FIRST

Review:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect the current implementation of:

```text
Resource Matrix tooltip/title text
Present column
Producing column
Manufacturing rows
Inputs column
Logistics column
Imports rows
Planned Supply
localization catalogs
reference-name localization
Intl.ListFormat helper / localized list formatting
```

Preserve existing state logic and visual behavior.

---

# PART B — TOOLTIP SEMANTIC RULE

Adopt this Resource Matrix tooltip convention:

> **Identify the item, then explain the state represented by that specific control.**

Do not turn each tooltip into a full summary of the row.

Each column should explain only its own state.

---

# PART C — PRESENT COLUMN

## 1. No change

Do not change Present-column tooltips.

Current inorganic and organic Present controls already expand the abbreviation and explain the button state correctly.

Preserve existing wording and behavior.

---

# PART D — PRODUCING COLUMN

## 2. Inorganic and organic resources

### Lit / producing

Current:

```text
{resourceName}
```

Change to:

```text
{resourceName} is being produced at this outpost.
```

### Unlit / not producing

Current:

```text
{resourceName}
```

Change to:

```text
{resourceName} is not being produced at this outpost.
```

Use the same semantic state currently driving lit/unlit presentation.

Do not change production logic.

---

## 3. Manufacturing outputs

### Lit / producing

Current:

```text
{productName}
```

Change to:

```text
{productName} is being produced at this outpost.
```

### Unlit / blocked by missing inputs

Current:

```text
{productName}
```

Change to:

```text
{productName} is not being produced at this outpost due to missing inputs.
```

Use the existing manufacturing-readiness state introduced in the recent Producing-column legibility change.

Do not re-derive recipe logic independently inside tooltip code.

---

# PART E — INPUTS COLUMN

## 4. Available input

Current:

```text
{inputName}
```

Change to:

```text
{inputName} is available at this outpost.
```

## 5. Unavailable input

Current:

```text
{inputName}
```

Change to:

```text
{inputName} is not available at this outpost.
```

Use the existing input-availability state.

Do not alter recipe/input resolution.

---

# PART F — LOGISTICS COLUMN

## 6. Exported item

Applies to:

```text
inorganic resources
organic resources
manufactured products
```

Current:

```text
{exportName}
```

Change to:

```text
{exportName} is being exported to {destinationList}.
```

Where `{destinationList}` is a localized human-readable list of destination outpost names.

Examples in en-US:

```text
Iron is being exported to Feynman I.

Iron is being exported to Feynman I and Feynman V.

Iron is being exported to Feynman I, Feynman V, and Arch III.
```

Do not manually concatenate commas or the word `and`.

Use the existing centralized `Intl.ListFormat` localization path/helper.

---

## 7. Destination-list construction

Build `{destinationList}` from the current actual export destinations for that item.

Requirements:

- use destination **outpost names**;
- preserve deterministic ordering appropriate to existing logistics data/presentation;
- collapse duplicate destination outpost names if the same item reaches the same outpost through more than one cargo path/pad;
- do not expose cargo-pad IDs or routing topology in the tooltip;
- do not include the source outpost name unless existing logic naturally requires it.

The tooltip describes **where the item is being exported**, not how many pads or links are involved.

---

## 8. Not exported

Current:

```text
{exportName}
```

Change to:

```text
{exportName} is not being exported.
```

Use the existing lit/unlit logistics state.

Do not change logistics calculations.

---

# PART G — IMPORTS ROWS

## 9. Imported item

Imports have only the lit state.

Current:

```text
{importName}
```

Change to:

```text
{importName} is being imported.
```

Do **not** repeat the source outpost name in the tooltip.

The Imports row heading already identifies the source outpost, so repeating it would be redundant.

---

# PART H — PLANNED SUPPLY

## 10. No change

Current:

```text
{itemName}
```

No tooltip wording change is proposed.

Preserve existing Planned Supply tooltips and existing disabled/hatched semantics.

---

# PART I — LOCALIZATION

## 11. Route all new strings through the localization layer

Do not inline new English sentences in React components.

Add localized message keys/entries for the new tooltip states.

Use parameterized messages for names and destination lists.

Suggested semantic key shape is up to the existing catalog conventions, e.g. conceptually:

```text
matrix.tooltip.producing.active
matrix.tooltip.producing.inactive
matrix.tooltip.manufacturing.blocked
matrix.tooltip.input.available
matrix.tooltip.input.unavailable
matrix.tooltip.export.active
matrix.tooltip.export.inactive
matrix.tooltip.import.active
```

Follow current naming conventions rather than forcing these exact names.

---

## 12. en-US baseline and en-GB behavior

The localization foundation currently uses en-US as the baseline/fallback locale.

Add the new messages to the baseline catalog.

If no wording differs in en-GB, do not duplicate overrides unnecessarily.

Resource/product display names must continue to resolve through the existing localized reference-name system.

---

## 13. Localized destination lists

Use the existing centralized localized list formatter.

Do not:

```text
.join(", ")
manually append "and"
hard-code Oxford comma behavior
```

The destination list should respect the active locale.

---

# PART J — TESTING

## 14. Producing tooltip tests

Add focused coverage for:

### Resource producing

```text
lit resource
=> "{resourceName} is being produced at this outpost."
```

### Resource not producing

```text
unlit resource
=> "{resourceName} is not being produced at this outpost."
```

### Manufacturing ready

```text
lit manufactured product
=> "{productName} is being produced at this outpost."
```

### Manufacturing blocked

```text
unlit manufactured product
=> "{productName} is not being produced at this outpost due to missing inputs."
```

Prefer helper/state tests over brittle DOM snapshots if a clean seam exists.

---

## 15. Inputs tooltip tests

Cover:

```text
available input
unavailable input
```

with the required localized wording.

---

## 16. Logistics tooltip tests

Cover at least:

### No export

```text
{exportName} is not being exported.
```

### One destination

```text
{exportName} is being exported to {Outpost A}.
```

### Two destinations

Verify localized list formatting.

### Three or more destinations

Verify localized list formatting and deterministic output.

### Duplicate destination

If multiple links/pads route the same item to the same destination outpost, that outpost name should appear only once.

---

## 17. Import tooltip test

Verify:

```text
{importName} is being imported.
```

and confirm the source outpost name is not duplicated in the tooltip.

---

## 18. Present / Planned Supply regression

Confirm no unintended tooltip changes in:

```text
Present
Planned Supply
```

Do not rewrite already-correct tooltip text as part of this parcel.

---

## 19. Localization regression

Include at least one locale-sensitive test proving:

- resource/product display names resolve through localization;
- destination lists use localized list formatting;
- no new tooltip sentence is assembled manually from English fragments in the component.

If practical, include en-US and en-GB coverage for a resource name that differs, such as the existing Aluminum/Aluminium reference-name case.

---

# PART K — ACCESSIBILITY BOUNDARY

## 20. Do not turn this into the accessibility audit

This parcel standardizes tooltip **content**.

Do not broaden into:

```text
tooltip library replacement
hover/focus behavior redesign
ARIA audit
screen-reader audit
touch tooltip behavior
keyboard tooltip activation
global title-attribute replacement
```

Those belong to the later accessibility audit.

However, do not regress any existing accessible labeling while changing tooltip strings.

---

# PART L — DOCUMENTATION

## 21. Update UX documentation if useful

Add a concise durable rule to `docs/UX-DESIGN.md` if there is an appropriate existing Resource Matrix/tooltips section:

> State-bearing Resource Matrix tooltips identify the abbreviated item and explain the current state represented by that control.

Do not create a large new documentation section.

If a matching backlog item exists, remove/close only that item.

---

# PART M — OUT OF SCOPE

Do not:

```text
change Present-column wording
change Planned Supply tooltip wording
change production logic
change manufacturing readiness logic
change input-resolution logic
change cargo-link/logistics semantics
change visual styles
change history behavior
change validation behavior
redesign tooltip infrastructure
perform the accessibility audit
change import/export
commit
push
```

---

# PART N — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also perform browser checks for:

```text
resource Producing lit/unlit
manufacturing Producing lit/unlit
Inputs lit/unlit
Logistics lit/unlit
multi-destination export tooltip
Imports tooltip
Present unchanged
Planned Supply unchanged
locale switch affecting localized item names/list formatting where applicable
```

---

# PART O — COMPLETION REPORT

Report:

### Tooltip behavior

Confirm final wording for:

```text
Producing resource lit/unlit
Manufacturing lit/unlit
Inputs lit/unlit
Logistics lit/unlit
Imports
```

### Destination list

Explain:

```text
how destination outpost names are collected
how duplicates are removed
how ordering is determined
how Intl.ListFormat/localization is applied
```

### Localization

List new message keys/catalog changes.

Confirm no new English state sentence is hard-coded in the matrix component.

### Unchanged areas

Confirm:

```text
Present tooltips unchanged
Planned Supply tooltips unchanged
```

### Tests

List focused regression coverage.

### Files changed

List all changed files.

### Verification

Report exact results for:

```text
npm test
npm run build
npm run lint
git diff --check
```

Do not commit or push.

---

## Final instruction

Implement the agreed Resource Matrix tooltip convention:

> **State-bearing controls should expand the abbreviated item name and explain the current state of that control. Route all new tooltip wording through localization, and build export destination lists with the existing localized `Intl.ListFormat` path rather than manual string concatenation.**

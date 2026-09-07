# Codex Implementation Brief — Final Visual Consistency Cleanup

## Objective

Implement the small set of confirmed runtime visual inconsistencies identified by the whole-app visual consistency audit.

This is a tightly scoped cleanup pass.

Do **not** broaden it into another redesign.

The confirmed live issues are:

1. Cargo reshuffle insertion marker still uses the old bright-purple rounded styling.
2. Cargo drag-handle focus still uses legacy text/focus colors and rounded geometry.
3. Inter-System fuelled/unfuelled visual hierarchy is reversed.
4. Disabled Cargo actions look effectively enabled.
5. The conditional “No resource reference data found for this body.” message leaks legacy typography/color.

Everything else from the audit was either confirmed consistent, not reproduced, or explicitly deferred.

---

## 1. Read repository guidance first

Before editing, inspect relevant project guidance, including as applicable:

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
src/ui/components/CargoPadsEditor.css
src/ui/components/CargoPadEditor.css
src/ui/components/OutpostList.css
src/ui/layout/PageHeader.css
src/App.tsx
src/index.css
```

Also inspect the runtime-audit findings and existing B1 token usage.

---

# PART A — CARGO RESHUFFLE CLEANUP

## 2. Cargo insertion marker

Current runtime problem:

- bright legacy purple (`--accent`);
- approximately 3px thick;
- fully rounded (`999px` radius);
- visually inconsistent with Navigation reorder markers.

### Required correction

Match the Navigation insertion-marker grammar.

Preferred:

```text
color/background = var(--ui-structural-dark)
thickness ≈ 2px
square geometry
no pill radius
```

The goal is for Cargo and Navigation reorder markers to feel like the same interaction family.

Preserve all drag/drop semantics and insertion behavior.

---

## 3. Cargo drag-handle text/focus treatment

Current runtime problem:

- handle text resolves through old `--text-h`;
- focus outline uses old purple `--accent`;
- outline offset differs from the rest of the app;
- rounded focus geometry remains.

### Required correction

Match the Navigation drag-handle treatment.

Use:

```text
handle color = var(--ui-text) or exact Navigation-equivalent value
focus outline = 2px solid var(--ui-structural-dark)
focus offset = 2px
square / 0-radius geometry
```

Do not change handle size, drag semantics, cursor behavior, or keyboard accessibility.

---

# PART B — INTER-SYSTEM STATE GRAMMAR

## 4. Semantic problem

The current `Inter-System` toggle has a reversed hierarchy:

### Selected + unfuelled

Currently appears as the strongest dark selected state and gives no warning cue.

### Selected + fuelled

Currently appears as a weaker pale green outline state.

This is backwards semantically.

The control must communicate two things at once:

1. Inter-System is selected.
2. The selected configuration is either operationally valid or operationally problematic.

---

## 5. Required state hierarchy

Use this semantic grammar:

### Regular / unselected

```text
neutral pale control
```

Preserve current behavior.

### Inter-System selected + fuelled

Must still read as clearly **selected/active**, with a restrained positive cue.

Do not make it visually weaker than an unfuelled state.

### Inter-System selected + unfuelled

Must still read as clearly **selected/active**, but also clearly **problematic**.

Use the existing warning language.

Preferred direction:

```text
selected structure retained
warning amber border and/or restrained warning-tinted fill
dark readable text or another high-contrast treatment
```

Do not use Critical red unless the existing severity semantics genuinely justify it.

The user should be able to tell immediately:

```text
Inter-System is ON
but Helium-3 is missing
```

---

## 6. Positive/success token handling

Current fuelled styling hard-codes:

```text
#3b9a63
#247344
```

These sit outside the B1 token system.

Preferred options, in order:

1. If a positive/success token already exists, use it.
2. If this state is a legitimate recurring semantic family, introduce a small reusable token such as:
   ```text
   --ui-success
   ```
   and any minimally necessary companion tint derived from it.
3. If adding a token would be excessive, derive a restrained positive treatment from the existing green/sage palette without hard-coded one-off colors.

Do not introduce a large new color family.

Document whichever approach is chosen.

---

## 7. Preserve toggle semantics

Do not change:

```text
Inter-System behavior
fuel availability logic
Helium-3 detection
aria-pressed semantics
Cargo link semantics
validation logic
```

This is visual-state cleanup only.

---

# PART C — DISABLED CARGO ACTIONS

## 8. Current problem

Disabled Cargo actions can look essentially identical to enabled actions.

Examples include:

```text
Reshuffle when fewer than two pads exist
boundary move controls in reshuffle mode
```

### Required correction

Use the established disabled grammar already present in Navigation/PageHeader.

Match as closely as practical:

```text
muted text
muted/surface background
softened border
reduced opacity
not-allowed or non-interactive cursor as appropriate
```

Do not create a new disabled-state language.

---

## 9. Controls to verify

At minimum inspect:

```text
Cargo Reshuffle
Cargo move-up
Cargo move-down
any other disabled Cargo action using the same shared rule
```

Do not alter enabled/hover/focus styling unless required for consistency.

---

# PART D — CONDITIONAL REFERENCE-DATA MESSAGE

## 10. Current problem

The message:

```text
No resource reference data found for this body.
```

currently falls through to the old global visual language:

- system font;
- old text color;
- larger generic type scale.

### Required correction

Give this message a scoped current-language informational/empty-state treatment.

Preferred:

```text
font = var(--ui-font)
color = var(--ui-text-muted)
compact size consistent with other empty-state text
flat/no box unless existing context calls for one
```

Do not redesign the surrounding component.

Do not change the message wording unless necessary.

Do not change reference-data logic.

---

# PART E — LEGACY TOKENS

## 11. Do not perform global token cleanup

The audit confirmed that most legacy root tokens are dormant.

Do **not** remove or remap globally:

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

unless one of the scoped fixes above directly benefits from replacing a live dependency.

The goal is to eliminate visible leaks, not refactor the entire stylesheet architecture.

---

# PART F — EXPLICITLY OUT OF SCOPE

## 12. Do not touch

Do not change in this pass:

```text
responsive pane sizing
scrollbar behavior
ellipsis/truncation allocation
manual pane resizing
manufactured-product availability semantics
Planned Supply manufacturing feasibility
validation navigation
Delete Network vs Reset Network wording
native select-arrow customization
global dark-mode strategy
network diagram
icons
```

Do not revisit already accepted Matrix, Planned Supply, Validation, ConfirmDialog, shell, or Navigation visual systems except where needed as comparison references.

---

# PART G — TESTING

## 13. Automated checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

---

## 14. Browser smoke tests

Verify the following runtime states:

### Cargo reshuffle

```text
insertion marker uses Structural-dark
insertion marker is square
insertion marker thickness matches Navigation closely
drag handle uses current text color
drag-handle focus uses Structural-dark
focus offset/geometry match Navigation
drag/drop still works
```

### Inter-System toggle

Verify all:

```text
unselected regular
selected + fuelled
selected + unfuelled
```

Confirm:

- fuelled still reads as selected;
- unfuelled clearly reads as selected + warning;
- the visual hierarchy is no longer reversed;
- focus/hover still work;
- no logic changes occurred.

### Disabled Cargo actions

Verify:

```text
disabled Reshuffle
disabled first move-up
disabled last move-down
```

Confirm they now read as unavailable/non-interactive.

### Conditional message

Trigger the reference-data-empty state if practical and confirm:

```text
Barlow
B1 muted text
compact informational styling
no legacy system-font/color
```

Restore temporary test state afterward.

---

## 15. Cross-check against known consistent components

Use these as visual references:

```text
Navigation insertion marker
Navigation drag handle
Navigation/PageHeader disabled controls
existing warning amber language
Validation empty-state text
```

Do not duplicate styles mechanically if context differs, but preserve the established grammar.

---

# PART H — COMPLETION REPORT

## 16. Report

On completion, report:

```text
files changed
cargo insertion-marker changes
cargo drag-handle focus changes
Inter-System fuelled styling
Inter-System unfuelled styling
whether a new success token was introduced
disabled Cargo action styling
conditional reference-data message styling
tests/checks run
browser smoke-test results
```

Explicitly state whether:

- any Cargo logic changed;
- any Helium-3 logic changed;
- any validation logic changed;
- any responsive sizing changed;
- any scrollbar styling changed;
- any deferred/out-of-scope component changed.

Do not commit or push unless explicitly asked.

---

## 17. Suggested commit message

If accepted:

```text
style: finish visual consistency cleanup
```

---

## 18. Final instruction

This is a **final visual cleanup**, not another redesign.

The intended result is:

```text
Cargo reshuffle matches Navigation
Inter-System fuelled/unfuelled states communicate correctly
disabled Cargo actions look disabled
conditional empty-state text uses the B1 language
no other accepted visual systems are disturbed
```

Prefer the smallest, lowest-risk set of changes that achieves those goals.

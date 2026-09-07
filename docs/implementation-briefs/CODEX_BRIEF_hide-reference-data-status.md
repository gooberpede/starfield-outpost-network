# Codex Implementation Brief — Hide Reference-Data Status Controls

## Objective

Hide the current reference-data status message and `Reload Reference Data` control from the StatusBar **without removing or dismantling the underlying reference-data functionality**.

Reference data is currently stable and complete, so these diagnostics no longer need to occupy permanent UI space.

The implementation should make the controls easy to restore later if reference-data development resumes, for example when throughput, power generation, storage capacity, or other additional reference datasets are introduced.

This should be a very narrow presentation-only pass.

---

## 1. Read repository guidance first

Before editing, inspect the relevant repository guidance, including as applicable:

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
src/ui/layout/StatusBar.tsx
src/ui/layout/StatusBar.css
reference-data loading/reload state and callbacks
App.tsx StatusBar integration
```

Do not remove or refactor reference-data loading behavior.

---

## 2. Desired behavior

The following StatusBar UI should no longer be visible during normal use:

```text
Reference data loaded: 123 systems, 1776 bodies, 75 resources, 30 products.
Reload Reference Data
```

Exact counts naturally vary with the data snapshot; the important point is to hide both:

- the reference-data status text;
- the reload button/control.

The Validation control and any other genuinely operational StatusBar content should remain visible and functional.

---

## 3. Preserve functionality

Do **not** delete:

```text
reference-data loading code
reference-data reload callback
reference-data state
reference-data counts
existing error/loading handling
related props or plumbing
```

unless a tiny local change is absolutely required for clean conditional rendering.

This is not a cleanup/refactor pass.

The goal is to make the current diagnostics dormant, not remove them.

---

## 4. Preferred implementation: internal feature flag

Use a small internal developer-facing feature flag or equivalent clearly reversible condition around the reference-data StatusBar diagnostics.

Conceptually:

```ts
const SHOW_REFERENCE_DATA_STATUS = false
```

or an equally simple local mechanism consistent with repository conventions.

The flag should control rendering of both:

```text
reference-data status text
Reload Reference Data control
```

Prefer conditional rendering over CSS-only hiding.

Do not introduce a user-facing setting.

Do not add an environment-variable/configuration system unless one already exists and is clearly the natural fit.

---

## 5. Add a clear maintenance comment

Place a short explanatory comment beside the flag/condition.

Suggested intent:

```ts
// Reference-data diagnostics are hidden while the current catalogue is stable.
// Re-enable when reference-data development/debugging resumes.
```

Exact wording may follow project comment style.

The purpose is to prevent the dormant code from later being mistaken for dead code.

---

## 6. StatusBar layout after hiding

After the diagnostics are suppressed, ensure the remaining StatusBar still looks intentional.

Requirements:

- Validation control remains in its current location unless a very small alignment adjustment is needed;
- no awkward empty gap where the reference-data message/button used to be;
- preserve the established flat, pale, technical StatusBar styling;
- do not redesign the StatusBar.

If the existing layout naturally collapses cleanly after conditional rendering, make no CSS changes.

Only adjust CSS if needed to remove leftover spacing/alignment artifacts.

---

## 7. Accessibility

Because the reference-data diagnostics are hidden from normal UI:

- do not leave them rendered with `visibility: hidden`;
- do not leave hidden focusable controls in the tab order;
- conditional rendering or equivalent true omission is preferred.

The remaining StatusBar controls must retain existing keyboard/focus behavior.

---

## 8. No reference-data behavior changes

Do not change:

```text
when reference data loads
how reference data is loaded
reload semantics
error handling
reference-data schema
reference-data source files
validation/reference-data integration
```

Do not alter application startup behavior.

---

## 9. No broader debug UI

Do not add:

```text
developer menu
debug panel
settings toggle
reference-data diagnostics drawer
keyboard shortcut
hidden gesture
```

If such functionality is useful later, it can be designed separately.

For now, restoring the diagnostics should require only a trivial source-code flag change.

---

## 10. Testing

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

### Browser smoke tests

Verify:

```text
reference-data status text is absent
Reload Reference Data control is absent
Validation control remains visible and functional
StatusBar has no awkward blank space
reference data still loads normally
validation still has access to reference data
no console warnings/errors
```

If practical, temporarily flip the internal flag to `true` during verification and confirm the original diagnostics return without further code changes, then restore it to `false` before completion.

---

## 11. Deliverable report

Report:

```text
files changed
feature-flag/condition location
whether StatusBar CSS changed
confirmation that reference-data loading/reload code remains intact
tests/checks run
browser smoke-test results
```

Explicitly state whether:

- reference-data behavior changed;
- reload semantics changed;
- any reference-data plumbing was removed;
- any other StatusBar controls changed;
- any out-of-scope component changed visually.

Do not commit or push unless explicitly asked.

---

## 12. Suggested commit message

If accepted:

```text
chore: hide reference data diagnostics
```

---

## 13. Final instruction

Treat this as **reversible presentation suppression**, not feature removal.

The desired end state is:

```text
reference-data diagnostics hidden
underlying reference-data functionality preserved
one simple path to re-enable later
remaining StatusBar clean and intentional
```

# CODEX CORRECTION BRIEF — Release Accessibility Follow-Up

## Purpose

Apply a narrow correction pass to the release-accessibility implementation before it is committed.

The previous implementation is broadly accepted. Do **not** reopen the contrast work, live-region architecture, drag-handle keyboard behavior, Inter-System marker semantics, documentation closure, or test-harness architecture except where directly required by the three corrections below.

Do **not** commit or push.

---

# Scope

This correction pass contains exactly three product fixes:

1. move validation severity text inline with the validation message;
2. add state-aware visible tooltips to the Inter-System toggle;
3. add state-aware visible tooltips to stale export controls.

Retain the existing accessible descriptions already added for assistive technology.

This is a small UI/accessibility polish pass, not a redesign.

---

# Correction 1 — validation severity must be inline

## Current problem

Validation items currently render conceptually as:

```text
WARNING
Codos Fe Solv
Adaptive Frame requires Aluminium, but Aluminium is not available at this outpost.
```

This introduces an unnecessary third line and wastes vertical space.

The intended design is:

```text
Codos Fe Solv
WARNING: Adaptive Frame requires Aluminium, but Aluminium is not available at this outpost.
```

Likewise:

```text
ERROR: {message}
INFO: {message}
```

---

## Required behavior

Keep:

- the existing color-coded severity rail;
- the outpost/context line;
- localized severity text;
- programmatic accessibility semantics.

Change only the visual placement of the severity label.

The severity label must appear **inline with the validation message**, followed by a colon and a space.

Conceptually:

```tsx
<p className="validation-summary-panel__message">
  <span className="validation-summary-panel__severity">
    {localizedSeverity}:
  </span>{' '}
  {message}
</p>
```

Exact structure may differ.

Do not render severity as its own block/line.

Do not remove the severity rail.

Do not hard-code `ERROR`, `WARNING`, or `INFO`; continue using the localization layer.

---

## Styling

Severity may retain a stronger weight than the message body.

Avoid introducing extra vertical margin before the message.

The row should return to the compact two-line structure where applicable:

```text
context
severity + message
```

If the context is absent, the item may naturally be one line.

---

# Correction 2 — Inter-System toggle needs a visible state-aware tooltip

## Current problem

The Inter-System control now has accessible descriptions for fuelled/unfuelled state, but a sighted mouse user receives no equivalent tooltip when hovering the toggle.

The accessibility correction should benefit both assistive-technology users and pointer users.

---

## Required behavior

Keep the existing:

- accessible name;
- `aria-describedby` or equivalent accessible description;
- fuelled/unfuelled semantic state;
- visible Inter-System label;
- internal `interstellar` discriminator.

Add a localized `title` tooltip to the Inter-System toggle itself.

The tooltip must be state-aware.

Preferred semantic shape:

### Standard / not currently Inter-System

```text
Enable Inter-System Cargo Link
```

### Inter-System and fuelled

```text
Inter-System Cargo Link — Helium-3 is available at this outpost.
```

### Inter-System and unfuelled

```text
Inter-System Cargo Link — Helium-3 is not available at this outpost.
```

Exact wording should reuse existing localization messages where possible.

Do not duplicate nearly identical strings unnecessarily.

If the existing accessible description already provides the fuel state sentence, compose the tooltip from:

```text
localized Inter-System Cargo Link label
+
localized state description
```

Do not hard-code punctuation/English sentence fragments in JSX if composition can remain cleanly localized.

---

## Accessibility relationship

The visible tooltip does **not** replace the accessible description.

Retain the programmatic state description.

Avoid creating duplicate screen-reader announcements from `title` plus `aria-describedby`.

The control should still expose a concise accessible name and a distinct state description.

---

# Correction 3 — stale export controls need a visible state-aware tooltip

## Current problem

Stale selected exports now expose their stale/unavailable state through assistive semantics, but the visible tooltip remains only the resource/product name.

A sighted pointer user should receive the same operational explanation.

---

## Required behavior

For a normal export control, preserve the existing normal tooltip behavior.

For a stale selected export, make the tooltip explicitly mention the stale/unavailable condition.

Preferred semantic shape:

```text
Iron — unavailable at this outpost.
```

or, if the existing localized message is more specific:

```text
Iron — no active source at this outpost.
```

Use the same underlying localized state wording as the accessible description where practical.

Do not introduce a second independent terminology path.

Do not change:

- export selection semantics;
- stale-state logic;
- resource/product identity;
- visual stale styling;
- persisted data.

---

# Localization

All new visible tooltip text must remain in the localization layer.

Prefer reuse/composition of existing keys.

Only add new keys if the current catalogue cannot express the needed tooltip semantics cleanly.

Maintain exact en-US / ja-JP parity.

Update en-GB only if a genuine wording override is required.

Do not change official-reference or terminology provenance.

---

# Tests

Update the rendered/component tests added in the previous pass.

At minimum verify:

## Validation

- localized severity is present;
- severity and message render on the same message line/element;
- severity rail remains;
- no separate standalone severity block remains.

## Inter-System toggle

Verify state-aware `title` behavior for:

```text
standard
fuelled
unfuelled
```

Also verify the existing accessible description remains intact.

Do not test only the tooltip and accidentally regress assistive semantics.

## Stale exports

Verify:

- normal export tooltip remains normal;
- stale selected export tooltip includes the localized stale/unavailable explanation;
- accessible description remains present.

---

# Regression boundaries

Do not alter:

- muted/disabled color tokens;
- measured contrast behavior;
- Logistics-column omission behavior;
- status-bar live-region semantics;
- Inter-System marker `✷⇄✷`;
- marker `role="img"` semantics;
- drag-handle `tabIndex={-1}` behavior;
- move-button keyboard behavior;
- test-harness architecture;
- documentation closure already implemented;
- persistence/schema/history/domain behavior.

---

# Verification

Run at minimum:

```text
npm test
npm run test:components
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
```

No game files should be required.

---

# Acceptance criteria

The correction is complete when:

1. validation severity renders inline as `WARNING: {message}`, `ERROR: {message}`, or `INFO: {message}`;
2. validation rows no longer waste a dedicated severity line;
3. the color-coded severity rail remains;
4. severity strings remain localized;
5. Inter-System toggle exposes a state-aware visible tooltip;
6. fuelled and unfuelled tooltips use the correct localized state description;
7. the existing accessible description remains intact;
8. stale export controls expose a visible localized stale/unavailable tooltip;
9. normal export tooltips remain unchanged unless needed for consistency;
10. no hard-coded user-facing English is introduced;
11. component tests cover the new tooltip behavior and inline severity layout;
12. all existing tests/verifiers/build/lint pass;
13. no unrelated implementation changes are made;
14. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- exact validation row structure after correction;
- exact Inter-System tooltip behavior for standard/fuelled/unfuelled states;
- exact stale-export tooltip behavior;
- whether any new localization keys were added;
- component tests updated;
- full verification results;
- confirmation that no unrelated accessibility/layout/domain work was changed.

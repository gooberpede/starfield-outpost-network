# Codex Implementation Brief — Planned Supply Validation + Manufacturing State Legibility + Interstellar Fuel Styling

## Objective

Implement one small correctness/UX parcel covering:

1. a **Planned Supply cargo-export validation bug**;
2. **Manufacturing Producing-column state styling** in the Resource Matrix;
3. **Interstellar Cargo Pad fueled/unfueled state styling**.

These changes are related by one principle:

> **State should be semantically correct and visually legible without inventing conflicting visual grammars.**

Do not broaden this into a matrix redesign, validator rewrite, or cargo-pane redesign.

## Part A — Read first

Review:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect the current implementation of:

- Planned Supply
- cargo export/source validation
- validation issue presentation
- Resource Matrix Producing column
- manufacturing readiness/input resolution
- resource Producing-state styling
- Planned Supply disabled/hatched styling
- Cargo Pad interstellar fuel-state calculation
- Inter-System / Interstellar button styling

Preserve existing architecture and domain rules.

## Part B — Bug: Planned Supply must count as a valid cargo source

### Current incorrect behavior

If an item is selected in Planned Supply and selected as an outbound cargo export, the validator currently may emit:

`This cargo export has no actual source.`

That is incorrect.

Planned Supply is intentionally a **virtual source mechanism**. A cargo export backed by Planned Supply is valid.

### Correct source rule

For cargo-export source validation, treat an item as sourced when any of the following is true:

- locally produced/extracted/manufactured;
- imported under the existing source-resolution logic; or
- present in Planned Supply.

Do not weaken the validator beyond this.

An export with no actual source and no Planned Supply entry must still receive the existing warning.

### Preserve virtual-item information

Planned Supply should continue to generate its existing informational message indicating that the item is virtual/planned.

Expected result for an exported Planned Supply item:

- **No** `cargo export has no actual source` warning.
- **Yes** existing informational message about the virtual item.

Do not suppress or downgrade the virtual-item info message.

### Stable identity

Match Planned Supply entries and cargo items using the existing stable `type + ID` identity model.

Do not match by localized display name.

Do not introduce locale-sensitive validator logic.

## Part C — Resource Matrix: Manufacturing Producing state

### Current problem

A selected manufactured item currently appears muted in the Producing column even when all of its required inputs are available.

This makes it look blocked or inactive despite production being valid.

Conversely, when required inputs are missing, the current faint-text treatment differs from the established “not available” treatment used by resource rows.

This creates two visual grammars for essentially the same Producing-column question.

### Producing-column semantic grammar

Use this matrix-wide visual meaning:

- **dark filled** = active and actually producing;
- **light outlined** = configured/selected, but not currently available or producible;
- **dimmed + hatched** = unavailable as a selection / invalid choice.

Important:

- the hatch treatment is **not** a generic unavailable style;
- it remains the Planned Supply “invalid selection because already locally satisfied” treatment;
- do not reuse that hatch treatment for blocked manufacturing output.

### Manufacturing output when all inputs are satisfied

If a manufactured item is selected and all required inputs are currently available, its Producing-column widget must use the same **strong dark filled treatment** as an actually producing resource.

Example semantic result:

- Iron → Producing: dark `Fe`
- Solvent → Producing: dark `Slv`
- Adaptive Frame → Producing: dark `AFr` when all inputs are satisfied

Do not create a special manufacturing-success color/style.

### Manufacturing output when inputs are missing

If a manufactured item is selected and one or more required inputs are unresolved, its Producing-column widget must use the same **light outlined “not currently producing” treatment** already used elsewhere in the matrix.

Example:

- Alkanes → Producing: outlined `HnCn`
- Adaptive Frame → Producing: outlined `AFr` when a required input is missing

The Inputs column and validator remain responsible for explaining why production is blocked.

Do not encode a separate manufacturing-specific failure style.

### Do not change manufacturing selection semantics

This is a presentation/state-legibility change.

Do not change:

- what counts as selected manufacturing;
- recipe resolution;
- input requirements;
- manufacturing quantities;
- validation behavior beyond the Planned Supply cargo-source bug.

## Part D — Interstellar Cargo Pad fuel state

### Current problem

The Inter-System / Interstellar control currently distinguishes fuel state mainly through a subtle border:

- green border = fueled;
- orange border = unfueled.

The distinction is too weak, especially for the fueled state.

### Replace subtle border-only signaling with stronger patterned treatment

Use a bold patterned treatment inspired by the existing Planned Supply hatch vocabulary.

Desired semantic distinction:

**Fueled**
- green-tinted patterned treatment;
- visibly stronger than current border-only state.

**Unfueled**
- orange-tinted patterned treatment;
- visibly stronger than current border-only state.

Keep the control compact.

Do not add glow, shadow, rounded badges, separate status strips, extra status rows, or large icon treatments.

### Do not rely on color alone

The fueled and unfueled states should differ in pattern/density as well as hue.

Suggested direction:

- Fueled: lighter/sparser diagonal hatch.
- Unfueled: denser or cross-hatched pattern.

Exact CSS is up to implementation.

The important requirement is:

> A user should be able to distinguish the two states even if green/orange hue discrimination is weak.

### Preserve button legibility

The Inter-System / Interstellar label must remain clearly readable.

Patterning must not make the text noisy.

Preserve the existing control dimensions and interaction semantics unless a tiny CSS adjustment is required for legibility.

### Reuse existing visual language where practical

Inspect the existing Planned Supply unavailable-item hatch styling.

Prefer reusing/adapting the existing background-image / repeating-linear-gradient / spacing / line-weight vocabulary rather than inventing a completely unrelated pattern system.

However:

- Planned Supply hatch means **invalid selection**;
- cargo fuel hatch means **status**.

They may share visual technique without becoming identical semantic styles.

## Part E — Testing

### Planned Supply validator regression tests

Add focused tests covering at least:

**Planned Supply only**
- item in Planned Supply;
- item exported from cargo pad;
- no local production/import source.

Expected:
- no cargo-no-source warning;
- existing virtual/planned informational issue remains.

**No source at all**
- item not produced;
- not imported;
- not Planned Supply;
- exported from cargo pad.

Expected:
- cargo-no-source warning remains.

**Actual source**
- existing valid locally sourced/imported export behavior remains unchanged.

**Stable identity**
- include `type + ID` matching coverage if not already adequately protected.

### Manufacturing state tests

Add focused tests for state derivation/render semantics if the codebase supports component/state tests.

At minimum verify:

- selected manufacturing + all inputs available → strong/producing state;
- selected manufacturing + missing input → outlined/not-producing state.

If presentation state is exposed via class names or helper functions, test the helper rather than brittle pixel/style values.

Do not overfit tests to exact CSS declarations.

### Cargo fuel-state tests

Where practical, add tests that confirm the correct semantic class/state is applied for:

- interstellar + fueled;
- interstellar + unfueled.

Do not assert exact gradient strings unless there is no better seam.

## Part F — Manual visual checks

### Resource Matrix

Verify:

**Manufacturing ready**
- selected manufactured item;
- all required inputs present.

Expected:
- Producing widget matches the dark filled treatment used by producing resources.

**Manufacturing blocked**
- selected manufactured item;
- one or more inputs missing.

Expected:
- Producing widget uses the light outlined treatment;
- not faint text;
- not hatch.

**Planned Supply**
- existing dimmed/hatched invalid-selection treatment remains unchanged.

### Cargo Pad

Verify at least:

- one fueled interstellar pad;
- one unfueled interstellar pad.

Expected:
- both states immediately legible;
- pattern difference visible;
- green/orange distinction retained;
- label remains readable.

Check at normal desktop zoom.

## Part G — Documentation

Update durable UX/domain docs only where useful.

If existing docs describe Planned Supply virtual source semantics, Resource Matrix state grammar, or interstellar fuel-state signaling, update them concisely.

Do not create a large new design section for this parcel.

If relevant items exist in `docs/BACKLOG.md`, remove/close only those implemented by this parcel.

Do not remove unrelated backlog work.

## Part H — Out of scope

Do not:

- redesign the entire Resource Matrix;
- change matrix column structure;
- change recipe/domain rules;
- change Planned Supply semantics;
- change cargo-link semantics;
- rewrite the validation framework;
- migrate unrelated validators;
- change localization architecture;
- change history behavior;
- change import/export;
- add new icons/status rows;
- add animation;
- add shadows/glow;
- commit;
- push.

## Part I — Verification

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also perform browser checks for:

- Planned Supply export validator behavior;
- manufacturing ready Producing state;
- manufacturing blocked Producing state;
- fueled interstellar styling;
- unfueled interstellar styling.

## Part J — Completion report

Report:

### Planned Supply validation
Explain:
- what source test changed;
- how Planned Supply satisfies cargo source validation;
- why the virtual-item info still remains.

### Manufacturing Producing state
Confirm:
- ready manufacturing → dark filled;
- blocked manufacturing → light outlined;
- Planned Supply hatch unchanged.

### Cargo fuel state
Describe:
- fueled pattern treatment;
- unfueled pattern treatment;
- how the two differ beyond color.

### Tests
List focused regression coverage.

### Files changed
List all changed files.

### Verification
Report exact results for:
- `npm test`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

Do not commit or push.

## Final instruction

Implement these three narrowly scoped corrections:

> **Planned Supply must count as a valid virtual cargo source; a selected manufacturing output should visually read as producing only when its inputs are satisfied and otherwise use the established outlined not-producing state; interstellar fuel state should use a much stronger patterned treatment that remains distinguishable beyond color alone.**

# Codex Implementation Brief — Outpost Details Polish and Validation

## Objective

Implement the next cohesive **Outpost Details polish and validation batch** for the Starfield Outpost Network app.

This batch should improve the Outpost Details editing experience, tighten selector behavior around outpost-eligible planetary bodies, add graceful validation for edge cases, preserve the manually tuned matrix density, and make a small Cargo Pad reshuffle-state correction.

Do **not** commit or push changes.

---

## Read first

Before implementing, read and follow the repository guidance in this order:

1. `AGENTS.md`
2. `docs/UX-DESIGN.md`
3. `docs/DOMAIN-RULES.md`
4. `docs/ARCHITECTURE.md`
5. `docs/BACKLOG.md`
6. `docs/IMPLEMENTATION-WORKFLOW.md`

For conflicts, use this precedence:

1. this implementation brief
2. `AGENTS.md`
3. repository docs
4. existing types/tests/behavior

This is a UI-heavy batch, so `docs/UX-DESIGN.md` is especially important.

---

## Scope summary

Implement all of the following:

1. Move **Delete Outpost** into the top header action area immediately to the **left of Undo**.
2. Remove the visible **Outpost Details** heading.
3. Promote the outpost name field into that heading space as a wide, heading-sized editable field.
4. Make **Planned Supply** default to collapsed.
5. Filter System and Body selectors using the runtime `outpostAllowed` body property.
6. Preserve existing/imported invalid location values gracefully.
7. Add a runtime validator for outposts located on non-eligible bodies.
8. Add an advisory runtime validator for outpost names longer than 25 characters.
9. Recheck/fix navigation name ellipsization behavior without altering stored names.
10. Disable Cargo Pad **Reshuffle** when fewer than two pads exist, and make reshuffle mode self-correct if the pad count drops below two.
11. Preserve the manually tuned Outpost Status Matrix density values listed below.

Do not fold unrelated visual redesigns or reference-data changes into this batch.

---

# 1. Delete Outpost placement

Move the existing **Delete Outpost** action so it appears in the persistent top header actions immediately to the **left of Undo**.

Requirements:

- Keep the label exactly:
  - `Delete Outpost`
- Preserve existing deletion behavior and history semantics.
- Do not redesign the overall header.
- The action should appear only when an outpost is selected, consistent with current behavior.
- Do not introduce a second delete control in Outpost Details.

This is a relocation, not a domain-behavior change.

---

# 2. Promote outpost name into editable heading

Remove the visible `Outpost Details` heading.

Use the outpost name field in that space instead.

Target presentation concept:

```text
[ New Outpost                                      ]

System                 Body
[ Select system... ]   [ Select body... ]
```

## Required behavior

The promoted name field must:

- remain the same persisted outpost name field;
- retain the existing draft/edit/commit behavior;
- commit on the existing blur/commit boundary;
- remain fully editable;
- not truncate or reject values;
- not impose the game's 25-character limit;
- remain compatible with mods that allow much longer names;
- use an accessible label such as:
  - `aria-label="Outpost name"`

## Required visual treatment

At rest:

- heading-sized;
- visually prominent;
- borderless or nearly borderless;
- transparent background;
- read visually as the page/section title rather than a conventional small form field.

On hover/focus:

- make editability clear;
- provide an obvious focus treatment;
- keep behavior consistent with the design language in `UX-DESIGN.md`.

Width:

- make it quite wide;
- it should use most of the available central section width;
- do not artificially constrain it to the old `min-width: 180px` field width;
- avoid ellipsizing during editing;
- let normal input scrolling handle text that eventually exceeds the available width.

Do not tie its width to 25 characters.

---

# 3. Planned Supply default collapsed

Change the local presentation default so **Planned Supply starts collapsed**.

Requirements:

- This is presentation state only.
- Do not persist collapse/expand state.
- Do not change Planned Supply semantics or auto-retirement behavior.
- Users must still be able to expand it normally.
- Existing compact/expanded UX conventions remain authoritative.

---

# 4. System and Body selector eligibility

The new canonical body model exposes:

```ts
body.outpostAllowed: boolean
```

Use that property directly.

Do **not** reconstruct eligibility from body type, source keywords, name heuristics, debug naming, or source provenance.

## Body selector

For normal/new selection:

- show only bodies where:
  - `body.outpostAllowed === true`
- also filter by the currently selected System as today.

Do not include Orbitals, non-landable worlds, ocean worlds, or test/debug records solely because they exist in the canonical dataset.

## System selector

The System selector must be derived from the eligible Body candidate set.

A System should appear as a normal selectable choice only if it contains at least one body where:

```ts
body.outpostAllowed === true
```

Do not independently maintain a system blacklist.

This should naturally suppress `_Test1`, `_Test2`, systems containing only orbitals, and any other systems with no outpost-capable bodies.

---

# 5. Preserve existing/imported invalid location values

Selector filtering must not destructively erase existing persisted data.

An existing/imported outpost may theoretically point to:

- an Orbital;
- a non-landable body;
- an ocean world;
- or another body where `outpostAllowed === false`.

This should be rare, but the UI must recover gracefully.

## Required behavior

If the current outpost already has a persisted System/Body that is no longer normally selectable:

- continue to display the current saved value;
- do not silently blank it;
- do not auto-migrate or auto-correct it;
- allow the user to inspect and deliberately change it.

Once the user changes away from that invalid value:

- normal filtered choices apply;
- the old invalid value should not remain available as a normal future option.

## System changes

When the user deliberately changes System:

- preserve the application's established System/Body consistency behavior;
- if the existing Body no longer belongs to the newly selected System, clear/reset Body as appropriate;
- do not create an invalid Body/System pairing.

Use existing undo/history conventions:
- one deliberate user operation = one history entry;
- collateral consistency changes caused by that operation belong in the same history entry.

---

# 6. Add invalid outpost location validator

Add a new runtime validation rule for an outpost whose persisted body cannot host an outpost.

## Severity

- `error`

## Condition

For an outpost with a resolvable body reference:

```ts
body.outpostAllowed === false
```

should produce the validation issue.

Unknown reference IDs remain the responsibility of the existing unknown-reference validator; avoid overlapping duplicate warnings for the same root problem.

## Behavior

- advisory in the sense that the validator reports the problem;
- do not auto-correct;
- do not delete or rewrite persisted data;
- give the user the opportunity to recover through the selectors;
- the normal selector filtering should prevent creation of new invalid locations.

Use wording consistent with the existing validation registry and StatusBar presentation.

Suggested message meaning:

> This outpost is located on a body that cannot host outposts.

Exact wording may be adjusted for consistency with the existing validator style.

---

# 7. Add >25-character outpost-name advisory

Starfield normally imposes a **25-character outpost-name limit**.

Mods can extend that limit up to 255 characters, so the tracker must not enforce or truncate the value.

Add a runtime validation rule.

## Severity

- `warning`

## Trigger

The rule should evaluate the committed persisted outpost name.

Because the name field already uses a draft/blur commit boundary, the warning should effectively appear **after commit/blur**, not live while the user is still typing an uncommitted draft.

Do not add special debounce logic if the existing commit flow already provides the intended boundary.

## Condition

```text
outpost name length > 25 characters
```

## Required behavior

- warning only;
- StatusBar/central validation surface only;
- no inline field error is required;
- do not truncate;
- do not reject;
- do not prevent save/import;
- imported/legacy names longer than 25 characters remain valid persisted data.

Suggested message meaning:

> Starfield normally limits outpost names to 25 characters.

The message should make clear this is an advisory about the base game, not a tracker hard limit.

---

# 8. Navigation name ellipsization

Recheck the Outpost navigation list so long names behave cleanly.

Requirements:

- preserve full persisted name;
- never truncate stored data;
- visual text may ellipsize when necessary;
- do not wrap in a way that pushes or destabilizes drag/move controls;
- preserve stable navigation columns/layout;
- preserve the existing `title`/tooltip behavior or equivalent so the full name remains inspectable;
- do not tie the visual ellipsis threshold to the 25-character validation rule.

The navigation should continue to work for both ordinary names and much longer modded names.

---

# 9. Cargo Pad Reshuffle enablement

Fix the Cargo Pad toolbar state.

## Rule

Reshuffling is meaningful only when at least two Cargo Pads exist.

Therefore:

```text
0 pads -> Reshuffle disabled
1 pad  -> Reshuffle disabled
2+ pads -> Reshuffle enabled
```

## Required behavior

- with fewer than two pads, the control displays `Reshuffle` in the disabled state;
- clicking does nothing;
- the UI must not enter reshuffle mode;
- if reshuffle mode is already active and the pad count drops below two, automatically exit reshuffle mode;
- after auto-exit, the control should return to disabled `Reshuffle`, not remain as `Lock Order`.

Do not change:
- pad reorder semantics;
- drag behavior;
- move controls;
- cargo links;
- outbound items;
- pad IDs;
- history behavior for actual reorder operations.

---

# 10. Preserve the manually tuned matrix density

The Outpost Status Matrix was manually tuned during this design pass.

Treat the following values/behavior as intentional unless implementation requires a very small compatibility adjustment.

Current intended density:

```css
.outpost-status-matrix__header > div,
.outpost-status-matrix__row > div {
  box-sizing: border-box;
  min-width: 0;
  padding: 0.1rem 0.5rem;
}

.outpost-status-matrix__row > div {
  display: flex;
  align-items: center;
}

.outpost-status-matrix__section + .outpost-status-matrix__section {
  margin-top: 0.35rem;
}

.outpost-status-matrix__section-heading,
.outpost-status-matrix__section-bar {
  margin: 0;
  padding: 0.1rem 0.5rem;
}

.outpost-status-matrix__row {
  min-height: 1.55rem;
  align-items: center;
}

.outpost-status-matrix__state,
.outpost-status-matrix__state--editable {
  width: 3.2rem;
  height: 1.55rem;
}
```

Also preserve the current matrix state font/presentation unless there is a concrete rendering problem.

Rationale:

- the original rows were too tall for resource-rich bodies;
- this tuning substantially improves 1920x1080 usability;
- `3.2rem` width is intentional because shorter widths make longer abbreviations such as Chlorosilanes (`SiH3Cl`) feel cramped;
- row-cell flex centering fixes the previous slight vertical misalignment.

Do not aggressively compress the matrix further in this batch.

---

# 11. Validation-registry integration

Integrate the two new rules into the existing centralized runtime validation registry:

1. invalid outpost location
2. outpost name longer than 25 characters

Maintain the current architecture:
- validator logic belongs in the validation/domain layer;
- the StatusBar/validation summary consumes results;
- no component-specific ad hoc warning system should be introduced.

Avoid overlapping warnings where an existing rule already explains the same root problem.

Examples:

- unknown body ID -> existing unknown-reference rule;
- known body with `outpostAllowed === false` -> new invalid-location rule.

---

# 12. Documentation updates

Update durable docs where appropriate.

Likely files:

- `docs/UX-DESIGN.md`
- `docs/DOMAIN-RULES.md`
- `docs/ARCHITECTURE.md`
- `docs/BACKLOG.md`

Document settled behavior, not implementation trivia.

At minimum capture:

- promoted editable outpost-name heading;
- System/Body selector filtering from `outpostAllowed`;
- graceful preservation of currently persisted invalid selections;
- invalid-location validation;
- >25-character name advisory;
- Reshuffle disabled below two pads;
- Planned Supply default collapsed if not already recorded.

Do not add speculative future redesigns.

---

# 13. Out of scope

Do **not** include:

- Shattered Space resource data;
- new reference-data extraction or canonical source changes;
- source sanitization of test/debug PNDT records;
- new `playerFacing` / `isDebug` runtime flags;
- matrix vertical scrollbar;
- collapsing Inorganic/Organic matrix sections;
- further aggressive matrix compression;
- biome/resource generation work;
- planner logic;
- throughput modelling;
- circular-flow validation;
- outpost-location auto-migration;
- storage schema migration unless truly required by an existing code path;
- unrelated Cargo Pad redesign;
- keyboard shortcut redesign;
- drag auto-scroll.

---

# 14. Acceptance criteria

The batch is complete when all of the following are true.

## Header / outpost identity

- `Delete Outpost` appears immediately left of `Undo`.
- The visible `Outpost Details` heading is gone.
- The outpost name occupies the heading space as a wide editable heading-style field.
- The field remains clearly editable on focus/hover.
- The full value is editable and is not constrained to 25 characters.
- `System` and `Body` remain below the name.

## Planned Supply

- Planned Supply starts collapsed for newly rendered outpost details.
- Expand/collapse remains local presentation state.

## Selectors

- New Body choices include only `outpostAllowed === true`.
- New System choices include only systems with at least one eligible body.
- `_Test1` and `_Test2` do not appear as normal selectable systems under current reference data.
- Orbitals do not appear as normal Body choices.
- Existing persisted invalid current selections remain visible until deliberately changed.
- Changing away from an invalid current selection does not make it normally selectable again.

## Validation

- Known non-eligible body location produces an `error`.
- Unknown references do not also produce the new invalid-location error.
- Names longer than 25 characters produce a `warning`.
- The name warning appears after committed name changes, consistent with blur/commit behavior.
- Long names remain persisted unchanged.
- Validation appears through the existing StatusBar/validation system.

## Navigation

- Long outpost names do not wrap in a way that destabilizes controls.
- Visual ellipsis does not alter stored values.
- Full names remain inspectable.

## Cargo Pads

- `Reshuffle` disabled at 0 pads.
- `Reshuffle` disabled at 1 pad.
- `Reshuffle` enabled at 2+ pads.
- If pad count drops below 2 while reshuffling, mode exits automatically.
- Button returns to disabled `Reshuffle`.

## Matrix

- Existing tuned compact geometry is preserved.
- State controls remain vertically centered.
- `SiH3Cl` and other longer abbreviations remain comfortably legible.

---

# 15. Suggested manual test cases

Please report the results of these after implementation.

## Outpost name

1. Open an ordinary outpost.
2. Confirm the name appears as the editable heading.
3. Edit and blur; confirm persistence and one appropriate history action.
4. Enter exactly 25 characters -> no warning.
5. Enter 26+ characters -> warning appears after commit/blur.
6. Undo -> confirm name and warning state restore appropriately.
7. Use a very long name -> field remains usable and navigation ellipsizes safely.

## Selector eligibility

1. New/ordinary outpost:
   - `_Test1` absent;
   - `_Test2` absent;
   - Orbitals absent;
   - Saturn-like non-landable bodies absent;
   - Volii Alpha absent.
2. Confirm normal eligible bodies such as Montara Luna remain selectable.
3. Confirm Shattered Space bodies with `outpostAllowed === true` remain selectable even though DLC resource coverage is incomplete.

## Invalid persisted location

Create or temporarily import/test a network with a known body where `outpostAllowed === false`.

Confirm:

- current invalid System/Body remain visible;
- validation shows an error;
- data is not auto-corrected;
- user can select a valid System/Body and recover;
- once changed away, the invalid body is no longer offered as a normal choice.

## Planned Supply

- Open an outpost and confirm Planned Supply begins collapsed.
- Expand/collapse works.
- Reload/re-render does not require persistence of that state.

## Cargo Pad Reshuffle

- 0 pads -> disabled.
- add first pad -> still disabled.
- add second pad -> enabled.
- enter reshuffle mode.
- remove pads until only one remains -> reshuffle mode exits automatically and control becomes disabled.

## Matrix

Check at least:

- Montara Luna;
- Charybdis II;
- a sparse body.

Confirm:

- matrix remains readable;
- no vertical misalignment;
- long abbreviations fit;
- no accidental new wrapping/clipping.

---

# 16. Verification

Run:

```text
npm run lint
npm run build
```

The project currently has a clean lint baseline.

Any new lint warning or error is a regression and must be resolved.

Also perform a focused diff review and confirm:

- no unrelated files changed;
- no canonical reference-data source files changed;
- no generated reference datasets changed;
- no storage migration introduced unintentionally;
- no domain semantics altered outside this brief.

---

# 17. Implementation report

When finished, report:

1. files changed;
2. summary of implementation;
3. validation rules added;
4. selector behavior and invalid-current-value handling;
5. Cargo Pad Reshuffle behavior;
6. docs updated;
7. lint/build results;
8. manual test results;
9. any deviations from this brief;
10. any new backlog items discovered.

Do not commit or push.

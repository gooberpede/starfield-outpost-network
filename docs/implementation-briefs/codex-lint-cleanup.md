# Codex Cleanup Brief — Eliminate Remaining Lint Errors

## Objective

Eliminate the six current ESLint errors so that:

```bash
npm run lint
```

passes cleanly with **0 errors**.

This is a dedicated maintenance/refactoring batch.

The overriding requirement is:

> **No intended user-visible behavior changes.**

Do not use this cleanup as an opportunity to redesign UI, change domain behavior, alter history semantics, or weaken lint rules.

---

# Current lint failures

The current full lint output reports six errors:

## `src/App.tsx`

Two `react-hooks/set-state-in-effect` errors:

1. startup reference-data load:

```tsx
useEffect(() => {
  void reloadReferenceData()
}, [])
```

2. selected-outpost repair:

```tsx
useEffect(() => {
  if (...) {
    setSelectedOutpostId(network.outposts[0].id)
  }
}, ...)
```

## `src/domain/validation/rules/activeProductionValidForBody.ts`

One unused parameter:

```text
_resourceId is defined but never used
```

Rule:

```text
@typescript-eslint/no-unused-vars
```

## `src/ui/components/CharacterHeader.tsx`

Two `react-hooks/set-state-in-effect` errors:

1. syncing `draftName` from `character.name`;
2. syncing `draftSkills` from `character.skills`.

## `src/ui/components/OutpostDetails.tsx`

One `react-hooks/set-state-in-effect` error:

- syncing `draftName` from `outpost.name`.

---

# Read first

Read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect:

- current history/Undo/Redo implementation;
- `App.tsx`;
- `CharacterHeader.tsx`;
- `OutpostDetails.tsx`;
- `activeProductionValidForBody.ts`;
- any helper/component ownership around selection and draft state.

Before changing code, run:

```bash
npm run lint
```

and confirm the six failures above are still current.

---

# Non-negotiable constraints

Do **not**:

- add `eslint-disable` comments to suppress these errors;
- weaken or remove ESLint rules;
- change ESLint config to ignore these files;
- replace one warning pattern with another;
- change user-visible UX;
- change domain semantics;
- change JSON/schema;
- change Undo/Redo behavior;
- change validation behavior;
- redesign CharacterHeader or OutpostDetails;
- commit or push.

Fix the underlying state/lifecycle structure.

---

# General React guidance for this cleanup

The five React errors all come from:

```text
react-hooks/set-state-in-effect
```

The goal is **not** “remove all effects.”

Effects are appropriate for synchronization with external systems.

The goal is to avoid:

```text
render
-> effect runs synchronously
-> effect calls setState
-> immediate second render
```

when the state could instead be:

- derived during render;
- initialized at the correct lifecycle boundary;
- updated in the event that causes the change;
- reset through component identity/keying;
- updated from asynchronous completion rather than synchronously inside an effect.

Preserve all existing editing semantics.

---

# 1. Fix startup reference-data loading in `App.tsx`

## Current behavior to preserve

On application startup:

- reference data loads automatically;
- loading succeeds/fails exactly as before;
- `referenceData` state is populated on success;
- `referenceDataError` behaves as before.

Manual:

```text
Reload Reference Data
```

must continue to work.

## Problem

Current mount effect calls:

```tsx
void reloadReferenceData()
```

and the linter traces synchronous state updates in that call path.

## Required outcome

Restructure startup loading so the effect is used only for legitimate external/asynchronous synchronization and does not synchronously cause the prohibited state-update pattern.

Possible valid approaches may include:

- separating the async loader from a manual wrapper that synchronously resets state;
- moving immediate reset behavior out of the mount effect path;
- having the effect start an asynchronous operation and only update state from async completion;
- another clean React pattern that satisfies the rule.

Do not suppress the rule.

## Regression requirements

Preserve:

- startup load;
- manual reload;
- error handling;
- successful reload behavior;
- no duplicate unnecessary loads.

---

# 2. Fix selected-outpost repair in `App.tsx`

## Current behavior to preserve

The app always behaves sensibly if `selectedOutpostId` becomes invalid, including when:

- the selected outpost is deleted;
- the first outpost is added;
- a network is imported;
- Undo/Redo changes outpost membership/order;
- normal navigation selection occurs.

The user should never be left with a broken selected-outpost view when outposts exist.

## Problem

Current effect detects invalid selection after render and calls:

```tsx
setSelectedOutpostId(...)
```

causing a cascading render.

## Preferred design direction

Where practical, derive an **effective selected outpost** or effective selected ID during render:

```text
requested selected ID still exists
    -> use it

otherwise, if outposts exist
    -> use a deterministic fallback, usually first outpost
```

Then update explicit selection state at deliberate events where selection truly changes.

Do not assume this exact implementation if current architecture suggests a cleaner equivalent.

## Important

Avoid having:

```text
invalid render
-> effect repairs state
-> second render
```

while preserving all current selection behavior.

## Regression requirements

Manual-check:

- delete selected outpost;
- Undo delete;
- Redo delete;
- add first outpost;
- import network with outposts;
- import empty network if supported;
- switch outposts normally;
- reorder outposts if selection behavior could be affected.

---

# 3. Fix CharacterHeader `draftName` synchronization

## Current behavior to preserve

Character name editing must continue to behave exactly as before.

Preserve:

- draft editing behavior;
- commit timing (blur/Enter/etc.) as currently implemented;
- Undo/Redo behavior;
- import/reset behavior;
- external authoritative character-name changes reflecting correctly in the field.

## Problem

Current code mirrors:

```text
character.name
```

into:

```text
draftName
```

via an effect that calls `setDraftName(...)`.

## Required outcome

Keep draft state only if it is genuinely needed, but stop synchronizing it through a synchronous setState-in-effect pattern.

Possible valid approaches:

- reinitialize at a clear component identity boundary;
- move reset behavior into explicit external-change ownership;
- restructure input control so draft is not duplicated unnecessarily;
- another React-safe solution.

Do not change commit/history semantics merely to make lint pass.

---

# 4. Fix CharacterHeader `draftSkills` synchronization

## Current behavior to preserve

Skill editing must remain behaviorally identical.

Especially preserve domain distinction:

```text
null = unknown
0    = known zero
```

Preserve all current visible and hidden skill semantics.

Preserve commit timing/history behavior.

## Problem

Current effect mirrors authoritative `character.skills` into local `draftSkills` with synchronous setState.

## Required outcome

Eliminate the effect-driven mirroring without changing editing semantics.

Be careful with conversions between:

```text
null
''
0
numeric ranks
```

Do not accidentally normalize unknown to zero or vice versa.

## Regression requirements

Manual-check at least:

- unknown/null skill;
- known zero;
- nonzero rank;
- editing skill up/down;
- Undo/Redo;
- import/external authoritative update if applicable.

---

# 5. Fix OutpostDetails `draftName` synchronization

## Current behavior to preserve

Outpost name editing must continue to behave exactly as before.

Preserve:

- local draft editing;
- commit timing;
- Undo/Redo;
- switching between outposts;
- external authoritative name changes;
- duplicate-name advisory behavior if applicable.

## Problem

Current effect mirrors:

```text
outpost.name
```

into:

```text
draftName
```

via synchronous setState.

## Important wrinkle

A simple:

```tsx
key={outpost.id}
```

may help when switching to a different outpost, but it does **not** by itself solve authoritative name changes for the same outpost ID, such as Undo/Redo.

Do not blindly use component keying unless all same-ID update behavior is preserved.

## Required outcome

Use the smallest React-safe design that keeps draft behavior and authoritative synchronization correct without prohibited effect-driven state mirroring.

---

# 6. Fix unused `_resourceId` parameter

File:

```text
src/domain/validation/rules/activeProductionValidForBody.ts
```

Remove or restructure the unused parameter cleanly.

Preferred:

- remove it from the local callback/signature if contract permits;
- or adjust surrounding code so it is not declared.

Do not:

- rename it again;
- suppress the unused-vars rule;
- change validation behavior.

This should be a no-behavior-change cleanup.

---

# History and behavior preservation

This batch must not change existing history semantics.

Pay particular attention to:

- character name changes;
- skill changes;
- outpost name changes;
- deleting selected outpost;
- importing network;
- normal selection changes.

If a refactor alters when a state change is committed, that is a regression unless current behavior was already incorrect and explicitly documented otherwise.

---

# Acceptance criteria

## Lint

1. `npm run lint` passes with **0 errors**.
2. No lint rule is disabled or weakened.
3. No new warnings/errors are introduced.

## Build

4. `npm run build` passes.

## Reference data

5. Reference data still loads on startup.
6. Manual Reload Reference Data still works.
7. Success/error behavior remains unchanged.

## Selection

8. Normal outpost selection works.
9. Deleting the selected outpost chooses a sensible valid fallback.
10. Undo restores expected selected/view state behavior.
11. Importing a network selects/displays correctly.
12. No invalid-selection flash or broken state is introduced.

## CharacterHeader

13. Character name editing behaves the same.
14. Character name Undo/Redo behaves the same.
15. Skill editing behaves the same.
16. `null` vs `0` skill semantics remain intact.
17. Skill Undo/Redo behaves the same.

## OutpostDetails

18. Outpost name editing behaves the same.
19. Switching outposts updates the name field correctly.
20. Same-outpost authoritative name changes, including Undo/Redo, update correctly.

## Validation

21. `activeProductionValidForBody` behavior is unchanged.
22. Unused parameter error is gone.

## Scope

23. No user-visible redesign occurs.
24. No schema/domain changes occur.
25. No unrelated cleanup is added.

---

# Verification commands

Run:

```bash
npm run lint
```

Expected:

```text
0 errors
```

Run:

```bash
npm run build
```

Run:

```bash
git diff --check
```

If tests exist for touched behavior, run relevant targeted tests.

---

# Manual test checklist

## Reference data

- start app fresh;
- confirm reference data loads;
- trigger manual Reload Reference Data;
- confirm success path still works;
- if practical, verify error path remains sane.

## Outpost selection

- select a non-first outpost;
- delete it;
- confirm valid fallback;
- Undo;
- confirm restored outpost behaves correctly;
- Redo;
- confirm fallback again;
- add first outpost to empty network;
- import representative network;
- switch among outposts.

## Character name

- edit character name;
- verify current commit behavior;
- Undo/Redo;
- verify field reflects authoritative state.

## Skills

Test at least:

- unknown/null;
- zero;
- nonzero;
- edit;
- commit;
- Undo/Redo.

Confirm no `null`/`0` regression.

## Outpost name

- edit selected outpost name;
- commit;
- Undo/Redo;
- switch outposts;
- switch back;
- confirm draft reflects correct authoritative name.

## General regression

- no console errors/warnings caused by cleanup;
- no visible layout changes;
- no unexpected history entries.

---

# Completion report

Report:

- files changed;
- root cause and fix for each of the six lint errors;
- how startup reference loading was made lint-safe;
- how selected-outpost fallback now works;
- how CharacterHeader draft synchronization was refactored;
- how OutpostDetails draft synchronization was refactored;
- how null-vs-zero skill semantics were preserved;
- how the unused validation parameter was removed;
- `npm run lint` result;
- `npm run build` result;
- `git diff --check` result;
- manual checks performed;
- any behavior caveats discovered.

Do not commit or push.

# Codex Audit Brief — Final Shortcut Key Allocation and Collision Review

## Objective

Conduct a **read-only audit** of the proposed final shortcut set for the Starfield Outpost Tracker.

The goals are to:

1. validate the proposed new shortcut chords against the existing registry;
2. check Windows/Chromium/Edge collision risk;
3. check AltGr, punctuation-key, number-key, and keyboard-layout behavior;
4. verify that each proposed shortcut has a clear action/focus contract;
5. identify any proposed chord that should be changed before implementation;
6. confirm the final action inventory for Parcel 3;
7. give specific guidance for how the expanded Help dialog should accommodate the final shortcut set without text overlap or smaller typography.

Do **not** implement shortcuts, UI changes, dialog changes, CSS changes, tests, or registry changes during this audit.

Do not commit or push.

---

## Branch and workflow

Work on:

- `staging`

Before inspection:

- run `git status`;
- run `git branch --show-current`;
- confirm branch is `staging`;
- identify unrelated working-tree changes.

Do not work directly on `main`.

Do not commit or push.

---

## Existing shortcut baseline

The application currently has these 8 chord bindings / 7 logical actions:

```text
Ctrl+Z             Undo
Ctrl+Y             Redo
Ctrl+Shift+Z       Redo (intentional alias)
/                  Focus Search for Items
Ctrl+Alt+N         Add outpost
Ctrl+Alt+ArrowUp   Previous outpost
Ctrl+Alt+ArrowDown Next outpost
Ctrl+Alt+V         Toggle Validation details
```

The registry, shared shortcut policy, modal suppression, AltGraph/composition guards, and Help dialog are already implemented.

Do not alter them during this audit.

---

## Final candidate action inventory

The following actions are proposed for Parcel 3.

### File / global commands

```text
Import
Export
```

### Cargo Links

```text
Add Cargo Link
Collapse all Cargo Links
Expand all Cargo Links
Focus Cargo Links
```

### Workspace / Navigation

```text
Show/hide Navigation
Focus Navigation
Focus Outpost Details
Focus Resource Matrix
Focus Planned Supply
Focus Search Results
```

### Resource Matrix internal landmarks

```text
Focus first Inorganic Resource row's first Present control
Focus first Organic Resource row's first Present control
Focus Manufacturing action:
  - Edit button when not editing
  - Save button while editing
```

No other new shortcuts are proposed in this parcel.

---

## Explicitly excluded actions

Do not recommend reintroducing these unless a serious consistency problem requires discussion:

```text
Previous/next network
Add network
Enter/leave Outpost reorder mode
Enter/leave Cargo reorder mode
Move reordered item
Focus Validation/status
Delete anything
Open About
Open Help
```

These have been deliberately rejected.

---

## Provisional key map to audit

Audit the following proposed assignments:

```text
Ctrl+Alt+I    Import
Ctrl+Alt+E    Export
Ctrl+Alt+L    Add Cargo Link

Ctrl+Alt+-    Collapse all Cargo Links
Ctrl+Alt+=    Expand all Cargo Links

Ctrl+Alt+H    Show/hide Navigation
Ctrl+Alt+O    Focus Navigation
Ctrl+Alt+D    Focus Outpost Details
Ctrl+Alt+M    Focus Resource Matrix
Ctrl+Alt+C    Focus Cargo Links
Ctrl+Alt+P    Focus Planned Supply
Ctrl+Alt+R    Focus Search Results

Ctrl+Alt+1    Focus first Inorganic Present control
Ctrl+Alt+2    Focus first Organic Present control
Ctrl+Alt+3    Focus Manufacturing Edit/Save
```

Treat these as **provisional**.

Do not assume they are correct merely because they are mnemonic.

---

## Product intent behind the punctuation shortcuts

The proposed Cargo Links pair is intentional:

```text
Ctrl+Alt+-    Collapse all
Ctrl+Alt+=    Expand all
```

Rationale:

- `-` naturally suggests collapse;
- `=` visually resembles an expanded `-`;
- both keys are adjacent on common desktop keyboards;
- they sit toward the right side of the keyboard, loosely matching the right-side Cargo Links panel;
- separate commands avoid the current button limitation where mixed expanded/collapsed state may require two clicks.

The audit should preserve this intent if the chords are practical.

Do not collapse them into a single toggle shortcut unless the proposed pair proves unsuitable.

---

## Core audit questions

### 1. Internal collision review

Compare every proposed chord with:

- the current registry;
- each other;
- any local/widget keyboard contract that could plausibly see the same chord;
- browser-level handlers already installed.

Explicitly report:

- exact conflicts;
- intentional aliases;
- no-conflict assignments.

### 2. Windows / Edge / Chromium collision review

For each proposed chord, classify:

```text
No obvious collision
Browser-reserved
Windows/system-reserved
Accessibility/system concern
Common third-party concern
Needs caution
Reject
```

Use practical baseline reasoning.

Do not reject a chord merely because some unrelated third-party application might theoretically bind it.

Primary supported environment:

- Windows
- Chromium / Edge

Prefer current official browser/Windows behavior where available.

### 3. AltGr and keyboard-layout review

This audit must specifically examine:

```text
Ctrl+Alt+-
Ctrl+Alt+=
Ctrl+Alt+1
Ctrl+Alt+2
Ctrl+Alt+3
```

These deserve extra scrutiny because punctuation and number keys can be layout-sensitive.

Assess:

- `KeyboardEvent.key`;
- `KeyboardEvent.code`;
- Shift interaction;
- AltGr representation;
- common US/UK behavior;
- representative German/European AltGr behavior;
- Japanese/non-Latin layout behavior;
- whether physical-key matching would be more stable for any of these.

Do not switch to `code` automatically.

Recommend per-chord matching strategy where appropriate.

### 4. Collapse / Expand Cargo Links semantics

Inspect the current Cargo Links implementation.

Determine whether Parcel 3 can cleanly expose two independent commands:

```text
Collapse all Cargo Links
Expand all Cargo Links
```

Requirements:

- Collapse all should collapse every Cargo Link regardless of mixed state.
- Expand all should expand every Cargo Link regardless of mixed state.
- Neither should depend on the current button label.
- Both should route through the same underlying presentation-state logic used by the visible control where practical.
- These should be presentation-only actions and should not create domain history entries unless current architecture already treats expansion state as history-worthy.
- If there are zero Cargo Links, the shortcut should no-op and remain unprevented if consistent with current dispatcher policy.

Identify whether this requires:

- a small refactor of the existing toggle implementation;
- no refactor;
- a product decision.

Do not implement it during the audit.

### 5. Add Cargo Link availability

Inspect the current Add Cargo Link control.

Determine:

- when it is available;
- whether any capacity/validation state disables or merely warns;
- what the shortcut should do when unavailable;
- where focus should go after successful creation.

Recommended policy to assess:

- use the same action path as the visible Add control;
- if unavailable, no-op and do not prevent default;
- after creation, focus the new Cargo Link's primary interactive control or other stable owner-consistent target.

Do not invent a separate shortcut-only creation path.

### 6. Show/hide Navigation behavior

Inspect current navigation panel visibility behavior.

Determine:

- current action path;
- whether visibility is presentation-only;
- focus behavior when hiding the panel while focus is inside it;
- focus behavior when showing it.

Recommended policy to assess:

- hiding Navigation should repair focus to a stable visible landmark;
- showing Navigation should not automatically move focus unless the action itself semantically implies it;
- the separate Focus Navigation shortcut should own explicit focus movement.

Report the most appropriate fallback target when hiding focused Navigation.

### 7. Focus Navigation

Determine the best focus target.

Likely candidates:

- selected outpost Navigation button;
- first outpost if none selected;
- stable Navigation heading/landmark if no outposts exist.

Specify exact fallback behavior.

Do not toggle visibility.

If Navigation is hidden, determine whether the shortcut should:

- no-op; or
- reveal Navigation and focus it.

Make a recommendation and explain why.

Prefer predictable behavior over hidden side effects.

### 8. Focus Outpost Details

Determine the strongest focus target in the selected-outpost details area.

Prefer:

- an existing meaningful interactive control; or
- an explicit focusable heading/landmark if one already fits accessibility architecture.

Specify behavior when:

- no network exists;
- no outpost is selected;
- selected outpost content is unavailable.

No-op should remain a valid outcome.

### 9. Focus Resource Matrix

Determine the correct top-level focus target for the matrix.

Possible candidates:

- Search for Items;
- matrix heading;
- first meaningful matrix control.

However, this shortcut should conceptually focus the **Resource Matrix region**, not duplicate `/` unless that is clearly the best existing focus landmark.

Recommend the most coherent destination.

### 10. Focus Planned Supply

Determine:

- whether Planned Supply can be collapsed;
- what element should receive focus when collapsed;
- what element should receive focus when expanded;
- whether the shortcut should expand it automatically.

Preferred behavior:

- focus the section's existing visible toggle/heading;
- do not change expanded/collapsed state merely to focus it.

Confirm against current implementation.

### 11. Focus Search Results

This shortcut has a strict product requirement:

> If the Search Results palette is visible, move focus into it. If it is not visible, do nothing.

Audit current Search Results focus architecture and determine the correct target.

Requirements:

- do not reopen Search Results;
- do not run a search;
- do not focus Search instead;
- no-op if the palette is absent/hidden;
- if handled, use the palette's existing focus/active-item contract;
- if no-op, do not call `preventDefault()`.

Determine what happens when:

- results are visible but no item is currently active;
- results contain one item;
- results contain many items;
- focus is already inside the palette.

### 12. Resource Matrix landmark shortcut 1

Proposed:

```text
Ctrl+Alt+1
```

Target:

> the first Present control in the top row of the Inorganic Resource section.

Requirements:

- focus only;
- never toggle;
- never alter Present state;
- no-op if no such control exists;
- do not auto-scroll to a different semantic row than the first current Inorganic row.

Inspect how rows are currently ordered and rendered.

Specify a robust target selection rule that is not dependent on fragile DOM position if a semantic selector/reference exists.

### 13. Resource Matrix landmark shortcut 2

Proposed:

```text
Ctrl+Alt+2
```

Target:

> the first Present control in the top row of the Organic Resource section.

Same requirements as Inorganic:

- focus only;
- never toggle;
- no-op if unavailable;
- use a semantic target if practical.

### 14. Resource Matrix landmark shortcut 3

Proposed:

```text
Ctrl+Alt+3
```

Target:

> Manufacturing action.

Required dynamic target:

- focus **Edit** when not in Manufacturing edit mode;
- focus **Save** while Manufacturing edit mode is active.

Requirements:

- focus only;
- never enter or leave edit mode merely because the shortcut was pressed;
- if Manufacturing section/action is unavailable, no-op;
- do not accidentally focus Cancel instead of Save unless architecture forces a product decision.

Confirm actual button structure and recommend the exact focus contract.

### 15. Import shortcut behavior

Inspect current Import behavior.

Assess:

- whether `Ctrl+Alt+I` conflicts with browser/Windows behavior;
- whether shortcut activation should open the file chooser directly;
- how modal suppression applies;
- editable-focus suppression;
- `preventDefault()` behavior;
- whether focus restoration after cancel/success needs any special handling.

Use the same action path as the visible Import control.

Do not invent drag/drop or alternate import semantics.

### 16. Export shortcut behavior

Inspect current Export behavior.

Assess:

- whether `Ctrl+Alt+E` conflicts with browser/Windows behavior;
- whether it immediately triggers download/export;
- availability;
- whether accidental repeated download is already prevented by repeat suppression;
- focus behavior afterward.

Use the same action path as the visible Export control.

### 17. Help dialog impact

The Help dialog currently has two known visual issues:

1. visual style mismatch with the About dialog;
2. `Ctrl + Alt + Arrow Up` overlaps the neighboring Validation label in the current two-column layout.

Do **not** fix these during the audit.

Instead, use the final shortcut inventory to recommend the correct layout for Parcel 3.

#### Requirements

Do not recommend:

- smaller text;
- truncated shortcut labels;
- abbreviated chord notation that harms clarity.

Assess:

- whether two columns remain appropriate;
- whether column widths need redesign;
- whether a one-column layout should appear below a breakpoint;
- whether the dialog should be wider;
- whether groups should be redistributed;
- how long chords should be contained within their own row;
- whether chord cells should have a dedicated minimum width;
- whether group layout should flow by category rather than simple equal columns.

#### Visual consistency

Recommend how the Help dialog should be harmonized with About, including as relevant:

- title typography/case;
- background;
- border;
- spacing;
- close affordance;
- section headings;
- button treatment.

Do not require pixel-identical dialogs if content needs differ.

### 18. Final Help grouping recommendation

Based on the full existing + proposed set, recommend a grouping structure.

Candidate groups may include:

```text
History
Search
Outpost Navigation
Workspace
Resource Matrix
Cargo Links
Import / Export
Validation
```

Avoid too many tiny groups if consolidation is clearer.

Redo should still appear as one logical action with two chords.

The three matrix landmark shortcuts should read as a coherent family.

Collapse/Expand Cargo Links should appear as two separate rows.

### 19. Final action count

Calculate:

- current logical action count;
- proposed new logical action count;
- final logical action count;
- final chord binding count, including Redo alias.

Use these counts to inform Help dialog sizing.

### 20. Registry impact

Assess whether the current registry shape is sufficient for all proposed actions.

Check whether it can cleanly represent:

- focus-only actions;
- no-op-if-unavailable actions;
- two separate Cargo expand/collapse actions;
- dynamic focus targets;
- logical grouping;
- punctuation and numeric chords.

Prefer keeping dynamic target resolution outside static registry metadata.

If a registry extension is needed, recommend the smallest one.

Do not implement it.

### 21. Collision matrix

Produce a table for **every proposed chord** with at least:

| Proposed chord | Action | Internal collision | Windows/Edge collision | AltGr/layout risk | `key` vs `code` recommendation | Verdict |
|---|---|---|---|---|---|---|

Verdict should be one of:

```text
Accept
Accept with guard
Change recommended
Reject
```

If recommending a replacement chord:

- give a concrete alternative;
- explain why it is better;
- preserve mnemonic/family coherence where practical.

### 22. Final recommended key map

The report must end with a single recommended key map.

Do not leave multiple equally weighted alternatives unless there is a genuine unresolved product decision.

If all proposed keys are acceptable, say so explicitly.

If one or more should change, provide the corrected map.

### 23. Test-plan recommendation

Recommend Parcel 3 tests for:

- registry uniqueness/collision;
- punctuation matching;
- number-key matching;
- AltGraph;
- composition;
- modal suppression;
- editable suppression;
- no-op/unavailable default-prevention behavior;
- focus destination;
- focus-only controls not toggling;
- Cargo expand all from mixed state;
- Cargo collapse all from mixed state;
- Search Results hidden/visible behavior;
- Manufacturing Edit/Save dynamic focus;
- Import/Export single execution;
- Help completeness after registry expansion.

Do not implement tests during the audit.

### 24. Backlog recommendation

Inspect:

```text
docs/BACKLOG.md
```

Determine how the existing Additional keyboard shortcuts item should be revised after Parcel 3.

Do not edit the backlog during this audit.

Expected eventual outcome:

- remove implemented candidate actions;
- retain only deliberately deferred candidates if any;
- remove stale design/discoverability wording;
- keep registry/policy rules documented only where useful and non-duplicative.

---

## Deliverable

Create:

```text
docs/audits/KEYBOARD-SHORTCUT-FINAL-KEY-ALLOCATION.md
```

Suggested structure:

1. Executive summary
2. Existing shortcut baseline
3. Final candidate action inventory
4. Proposed key map
5. Internal collision review
6. Windows/Edge collision review
7. AltGr/layout review
8. Punctuation/numeric-key analysis
9. Action-by-action behavior/focus contracts
10. Cargo expand/collapse semantics
11. Search Results focus behavior
12. Matrix landmark focus behavior
13. Registry impact
14. Help dialog layout implications
15. Help visual-style recommendation
16. Final grouping recommendation
17. Test plan
18. Backlog recommendation
19. Final recommended key map
20. Parcel size estimate
21. Reproduction/inspection notes

---

## Required conclusions

The report must explicitly answer:

- Are all proposed chords collision-free internally?
- Are any reserved by Windows/Edge?
- Are `Ctrl+Alt+-` and `Ctrl+Alt+=` practical?
- Should `-` and `=` use `key` or `code` matching?
- Are `Ctrl+Alt+1/2/3` practical?
- Should number shortcuts use `key` or `code`?
- Does AltGr create a material problem for any proposed binding?
- Can Import use `Ctrl+Alt+I`?
- Can Export use `Ctrl+Alt+E`?
- Can Add Cargo Link use `Ctrl+Alt+L`?
- Can Show/hide Navigation use `Ctrl+Alt+H`?
- Can Focus Navigation use `Ctrl+Alt+O`?
- Can Focus Outpost Details use `Ctrl+Alt+D`?
- Can Focus Matrix use `Ctrl+Alt+M`?
- Can Focus Cargo use `Ctrl+Alt+C`?
- Can Focus Planned Supply use `Ctrl+Alt+P`?
- Can Focus Search Results use `Ctrl+Alt+R`?
- What exact focus target should each focus shortcut use?
- What happens when each target is absent?
- Can Cargo Expand All and Collapse All be implemented independently from mixed states?
- Does the registry need extension?
- What should the final Help dialog grouping be?
- Should the Help dialog stay two-column, become responsive, or use another layout?
- How should Help be harmonized visually with About?
- What is the final recommended key map?
- Is Parcel 3 small, medium, or large?

---

## Scope boundaries

This is read-only.

Do not modify:

- shortcut registry;
- shortcut handlers;
- UI;
- Help dialog;
- About dialog;
- CSS;
- tests;
- localization;
- Cargo behavior;
- Search Results behavior;
- Resource Matrix;
- backlog;
- dependencies;
- lockfile;
- Cloudflare/deployment.

Do not add shortcuts.

Do not fix the current Help overlap.

Do not change dialog typography.

---

## Validation

Run only what is useful for audit confidence.

At minimum:

```text
npm run build
git diff --check
```

Run focused existing shortcut/component tests if helpful.

Browser inspection is encouraged where needed for:

- current focus targets;
- Search Results behavior;
- Cargo mixed expand/collapse state;
- Help dialog geometry;
- matrix section controls.

If browser interaction is used, report viewport and state.

---

## Completion response

Return:

1. concise conclusion;
2. current branch;
3. audit file created;
4. proposed action count;
5. final logical action count;
6. final chord binding count;
7. internal collision result;
8. Windows/Edge collision result;
9. AltGr/layout result;
10. punctuation-key verdict;
11. number-key verdict;
12. Import/Export/Add Cargo Link verdicts;
13. Cargo expand/collapse verdict and semantics;
14. workspace focus shortcut verdicts;
15. Search Results focus contract;
16. matrix landmark focus contracts;
17. registry impact;
18. Help dialog layout recommendation;
19. Help/About visual harmonization recommendation;
20. final Help grouping;
21. final recommended key map;
22. test-plan summary;
23. backlog recommendation;
24. Parcel 3 size estimate;
25. commands/browser checks used;
26. confirmation no application/test/CSS/localization files changed;
27. confirmation no dependency/lockfile change;
28. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.

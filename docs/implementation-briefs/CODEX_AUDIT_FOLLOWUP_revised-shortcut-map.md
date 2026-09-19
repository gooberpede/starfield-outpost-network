# Codex Audit Follow-Up — Revised Shortcut Map and Remaining Layout Questions

Please update:

`docs/audits/KEYBOARD-SHORTCUT-FINAL-KEY-ALLOCATION.md`

to reflect the revised preferred key map below and answer the remaining questions.

This remains **read-only audit work**. Do not implement shortcuts or UI changes. Do not commit or push.

## Revised preferred map

```text
Ctrl+Alt+O    Import
Ctrl+Alt+S    Export
Ctrl+Alt+A    Add Cargo Link

Ctrl+Alt+,    Expand all Cargo Links
Ctrl+Alt+.    Collapse all Cargo Links

Ctrl+Alt+[    Focus Navigation
Ctrl+Alt+]    Show/hide Navigation
Ctrl+Alt+T    Focus Outpost Details
Ctrl+Alt+G    Focus Resource Matrix
Ctrl+Alt+C    Focus Cargo Links
Ctrl+Alt+P    Focus Planned Supply
Ctrl+Alt+'    Focus Search Results

Ctrl+Alt+1    Focus first Inorganic Present control
Ctrl+Alt+2    Focus first Organic Present indicator
Ctrl+Alt+3    Focus Manufacturing Edit/Save
```

The existing shortcuts remain unchanged.

## Intent behind the revised assignments

### Import / Export

Use:

```text
Ctrl+Alt+O    Import
Ctrl+Alt+S    Export
```

The mnemonic is intentionally **Open / Save**, rather than Import / Export.

### Cargo Links expand / collapse

Use:

```text
Ctrl+Alt+,    Expand all Cargo Links
Ctrl+Alt+.    Collapse all Cargo Links
```

This order is intentional.

Rationale:

- `,` visually resembles an “expanded” `.`;
- the pair is adjacent on common desktop keyboards;
- conceptually, Expand → Collapse reads naturally from left to right for the primary supported environment.

These remain two independent operations, including from mixed expanded/collapsed state.

### Navigation panel

Use:

```text
Ctrl+Alt+[    Focus Navigation
Ctrl+Alt+]    Show/hide Navigation
```

The brackets are intended as a physical/visual pair associated with the left-docked Navigation pane.

### Search Results

Use:

```text
Ctrl+Alt+'    Focus Search Results
```

This is intended as a physical relationship with the existing `/` Search shortcut on common desktop layouts rather than as an apostrophe mnemonic.

### Resource Matrix landmarks

Keep:

```text
Ctrl+Alt+1
Ctrl+Alt+2
Ctrl+Alt+3
```

with the existing ordinal landmark meaning.

## Remaining questions

Please collision-check the revised map against:

- the existing shortcut registry;
- Windows accessibility/system shortcuts, especially Magnifier;
- Microsoft Edge / Chromium;
- representative keyboard layouts;
- AltGr and IME/composition behavior.

Please answer explicitly:

1. Are `Ctrl+Alt+[`, `Ctrl+Alt+]`, and `Ctrl+Alt+'` safe enough for the supported Windows + Chromium/Edge baseline?
2. Should those three be matched by physical `KeyboardEvent.code` values:
   - `BracketLeft`
   - `BracketRight`
   - `Quote`
   rather than by logical `key`?
3. Across representative US, UK, German/European, and Japanese layouts, do those physical positions remain coherent enough that Help can display `[`, `]`, and `'` without becoming misleading?
4. Do any of `Ctrl+Alt+O`, `Ctrl+Alt+S`, `Ctrl+Alt+A`, `Ctrl+Alt+T`, or `Ctrl+Alt+G` introduce Windows Magnifier or other important accessibility/system collisions?
5. Does the revised map avoid the Magnifier conflicts identified in the current audit, without requiring `Shift` as a fourth key?
6. Are there any additional Windows Magnifier **reading** shortcuts or other accessibility shortcuts that the previous audit missed and that conflict with this revised map?
7. Should comma, period, brackets, quote, and the number-row shortcuts all use `code` plus a separate display token in the registry?
8. If any revised chord is unsuitable, recommend one concrete replacement that preserves the three-key `Ctrl+Alt+<key>` pattern if at all practical.

## Audit update

Please revise the audit so that:

- the collision matrix reflects this revised map;
- the punctuation/layout analysis covers `Comma`, `Period`, `BracketLeft`, `BracketRight`, and `Quote`;
- the final recommended key map is replaced with the revised map if it passes;
- the old Shift-based replacements are removed if no longer recommended;
- any newly discovered accessibility/system collisions are documented;
- the final logical-action/chord counts remain correct;
- the implementation guidance and Help-layout recommendations remain consistent with the final approved map.

Do not rewrite historical findings that are still relevant; update the audit to distinguish the original provisional assignments from the final revised recommendation.

## Validation

Run whatever focused checks are useful, plus at minimum:

```text
npm run build
git diff --check
```

No application, UI, CSS, test, localization, dependency, lockfile, Cloudflare, or deployment changes.

No commit or push.

## Completion response

Please return:

1. whether the revised map is acceptable as-is;
2. any remaining collisions;
3. the recommended `key` vs `code` strategy for every punctuation/bracket/number binding;
4. any layout-specific caveats;
5. the final recommended map;
6. confirmation that the audit was updated;
7. files changed;
8. validation results;
9. confirmation no implementation files changed;
10. confirmation no commit or push occurred.

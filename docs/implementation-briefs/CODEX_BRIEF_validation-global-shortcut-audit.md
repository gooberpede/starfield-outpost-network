# Codex Research Brief — Validation Global Shortcut Audit

## Objective

Research and recommend a suitable **global keyboard shortcut** for toggling the Validation panel in the Starfield Outpost Network application.

This is a research/audit task only.

Do **not** implement the shortcut yet.

The eventual Validation interaction will include:

- global keyboard shortcut to open/close the Validation panel;
- arrow-key navigation within the issue list;
- keyboard activation of an issue;
- Escape to leave the issue list without closing the panel.

This brief concerns only the **global toggle shortcut**.

---

## 1. Constraints

The shortcut should:

- work well in the current Windows + Chromium/Edge environment;
- avoid browser-reserved or widely expected browser shortcuts;
- avoid common text-editing shortcuts;
- avoid interfering with ordinary typing in inputs/selects;
- avoid likely accessibility conflicts;
- avoid common Windows/system conventions where practical;
- be reasonably mnemonic or learnable;
- be comfortable to use repeatedly;
- leave room for future application shortcuts.

### Explicit preference

Do **not** recommend function keys (`F1`–`F12`) as the primary solution.

The user wants to avoid them because many people remap function keys at the OS/hardware level.

---

## 2. Inspect current application shortcut surface

Before researching candidates, inspect the current codebase for:

- existing global keyboard handlers;
- Undo/Redo shortcuts if any;
- shortcuts already implied by browser-native controls;
- any current or planned navigation shortcuts documented in:
  - `docs/UX-DESIGN.md`
  - `docs/BACKLOG.md`
  - `docs/DOMAIN-RULES.md`
  - `docs/ARCHITECTURE.md`

Also note likely future shortcut families already discussed in the backlog, especially:

- previous/next outpost navigation;
- pane visibility/show-hide controls;
- Undo/Redo;
- Validation.

Do not reserve speculative shortcuts unnecessarily, but avoid obvious collisions with these future needs.

---

## 3. Candidate generation

Generate a short list of plausible non-function-key candidates.

Consider combinations such as:

```text
Ctrl + Alt + <key>
Ctrl + Shift + <key>
Alt + Shift + <key>
```

and other practical combinations if justified.

Do not assume a mnemonic candidate is good merely because it contains `V`.

For example, explicitly verify conflicts around combinations such as:

```text
Ctrl + Shift + V
Ctrl + Alt + V
Alt + V
```

rather than accepting/rejecting them from intuition alone.

---

## 4. Conflict audit

For each serious candidate, investigate:

### Browser conflicts

Check current Chromium / Chrome / Edge behavior, including whether the combination is:

- browser-reserved;
- intercepted before the page can reliably receive it;
- already associated with a common browser action;
- platform-dependent.

### Windows/system conflicts

Check whether it has a common Windows/system meaning or is widely used by accessibility/input-method features.

### Text-editing conflicts

Check whether it commonly means:

- paste;
- paste-as-plain-text;
- formatting;
- navigation;
- selection;
- editing;
- browser find/search;
- tab/window management.

### Web-app conflicts

Consider whether the shortcut would be surprising inside:

- text inputs;
- numeric inputs;
- selects;
- buttons;
- contenteditable elements, if any exist now or are likely later.

### Future app conflicts

Consider obvious future shortcut needs, especially:

- previous/next outpost;
- pane show/hide;
- Undo/Redo.

---

## 5. Input-field behavior

For the recommended shortcut, determine whether it should fire while focus is inside:

```text
input
textarea
select
contenteditable
```

Prefer a rule that is easy for users to understand.

If the shortcut is safe enough to work globally even while editing, say so.

If it should be suppressed in some controls, specify exactly which ones and why.

Do not propose complicated context-sensitive rules unless necessary.

---

## 6. Browser verification

Where practical, verify candidate behavior in the actual development environment/browser rather than relying only on documentation.

For the strongest candidates:

- confirm the page receives the `keydown`;
- confirm no browser action fires first;
- confirm behavior with focus in ordinary form controls;
- note any Chromium/Edge differences observed.

Do not modify application behavior as part of this audit.

Temporary console/test instrumentation is acceptable if fully removed afterward.

---

## 7. Recommendation format

Return a concise comparison table such as:

| Candidate | Browser conflict | Editing conflict | Future app conflict | Mnemonic value | Recommendation |
|---|---|---|---|---|---|

Then provide:

### Primary recommendation

One preferred shortcut.

### Secondary fallback

One backup candidate.

### Rejected candidates

List the most tempting candidates that should explicitly **not** be used, with brief reasons.

---

## 8. Decision criteria

Weight the criteria roughly in this order:

1. reliable delivery to the application;
2. absence of browser/system conflict;
3. absence of editing conflict;
4. compatibility with future app shortcuts;
5. ease of repeated use;
6. mnemonic value.

Do not choose a mnemonic shortcut that conflicts with a standard browser/editor behavior.

---

## 9. Documentation/source quality

Use current, authoritative browser/platform documentation where practical.

If behavior differs between documentation and runtime testing, report the discrepancy.

Do not present uncertain shortcut behavior as settled fact.

---

## 10. Output only — no implementation

Do not change:

```text
source code
tests
CSS
UX behavior
keyboard handlers
documentation
```

unless a tiny temporary local test is required for investigation and then fully reverted.

No commit or push.

---

## 11. Completion report

Report:

```text
candidates tested
browser/platform sources checked
runtime verification performed
input-field behavior
primary recommendation
secondary fallback
rejected candidates
any uncertainty remaining
git status confirmation
```

If the audit reveals that no clean non-function-key shortcut exists, say so rather than forcing a weak recommendation.

---

## 12. Final instruction

This task is to **choose the shortcut intelligently before implementation**.

Do not implement Validation keyboard navigation yet.

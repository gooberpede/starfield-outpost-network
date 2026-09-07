# Codex Documentation Brief — Groom Backlog After Visual/Availability Sprint

## Objective

Groom `docs/BACKLOG.md` so it accurately reflects the current state of the Starfield Outpost Network project after the recent visual-language, validation, responsive-layout, and manufactured-product availability work.

This is a documentation-only task.

Do **not** implement features.

The goal is to:

- remove backlog items that are now complete;
- rewrite stale items whose context has materially changed;
- add genuinely deferred ideas identified during the completed sprint;
- keep the backlog focused on deferred problems/decisions rather than implemented behavior.

---

## 1. Read repository guidance first

Inspect:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Use implemented code/documentation as the source of truth for what is now complete.

Do not move implemented behavior back into the backlog.

---

# PART A — REMOVE COMPLETED ITEMS

## 2. Remove completed validation items

Under:

```text
Validation
→ Possible future validation
```

remove:

```text
recursive recipe feasibility
organic-resource prerequisites
```

Both are now implemented.

Do not replace them with equivalent vague wording.

---

## 3. Remove stale generic Outpost Details polish item

Under:

```text
Outpost Details follow-up
```

remove the generic item:

```text
general spacing, sizing, and alignment polish after the major information architecture has settled
```

The application has now gone through a substantial visual redesign and runtime consistency audit.

Do not preserve a permanent catch-all “polish later” item.

Keep only specific, still-deferred Outpost Details work.

---

# PART B — REWRITE STALE CONTEXT

## 4. Cargo Pad labels

Keep the deferred question about whether `CargoPad.label` should remain persisted or be derived.

Update the wording to reflect the current UI:

- visible Cargo Pad ordinals are now derived from current pad order;
- those ordinals are presentation-only;
- stable identity remains cargoPadId;
- `CargoPad.label` is persisted but is no longer the primary visible locator.

Do not imply that the ordinal itself should become persisted.

---

## 5. Status bar wording

The backlog currently says the status bar supports:

```text
validation/reference information
```

Reference-data diagnostics are now intentionally hidden during stable operation, although the underlying functionality remains easy to restore.

Rewrite this section so it does not imply reference diagnostics are currently a normal visible status-bar responsibility.

Keep the future review focused on status-bar information hierarchy, including:

```text
validation
application/version information if added
transient interaction hints
action success feedback
persistent errors
reference diagnostics when intentionally re-enabled for maintenance/debugging
```

Do not turn this into a new feature request to expose reference diagnostics.

---

# PART C — ADD NEW DEFERRED ITEMS

## 6. Workspace pane resizing

Under:

```text
Navigation and workspace
→ Workspace layout
```

add a deferred item to investigate manual/user-controlled pane resizing for the three workspace regions:

```text
Navigation
Matrix / main outpost workspace
Cargo Pads
```

Record the problem, not an assumed implementation.

Capture that future design should consider:

- sensible default widths;
- minimum widths;
- avoiding unusably narrow Navigation/Cargo panes;
- whether widths should persist;
- whether a reset-to-default action is useful.

Do not implement this now.

---

## 7. Cargo summary width allocation

Under:

```text
Cargo Pads
```

add a deferred presentation item:

- improve compact Cargo Pad summary width allocation so remote outpost names can use genuinely available horizontal space before ellipsizing;
- preserve the established compact two-row summary semantics;
- do not introduce layout changes now.

This was observed after responsive sizing work.

---

## 8. Validation issue navigation

Under:

```text
Validation
```

add a deferred item for interactive issue navigation.

Capture the intended direction:

- clicking/selecting a validation issue may navigate to the relevant outpost;
- when practical, it may also expose/focus the relevant local context such as:
  - Cargo Pad;
  - Planned Supply;
  - manufacturing row;
  - resource/biome context;
- issue metadata already contains stable IDs that can support future navigation;
- rows should remain non-interactive until this is implemented deliberately.

Do not prescribe exact scrolling/focus mechanics yet.

---

## 9. Planned Supply Info-level validation

Under:

```text
Validation
→ Possible future validation
```

add:

```text
unresolved Planned Supply informational issues
```

Document the intended semantics:

- one Info-level issue per unresolved Planned Supply item at an outpost;
- these are not warnings/errors;
- purpose is to provide a quiet “remaining virtual dependencies / loose ends” checklist;
- issues should naturally sit below warnings/errors in the existing severity ordering;
- avoid creating one issue per downstream consequence.

A likely future rule name is:

```text
planned-supply-unresolved
```

but do not hard-code this as a requirement if the project prefers a different rule identifier later.

---

# PART D — USER GUIDANCE / HELP

## 10. Add a help/guidance section

Add a new backlog section such as:

```text
Help, guidance, and localization
```

or another concise equivalent.

Include a deferred user-guide/help item.

The guide should eventually explain concepts that are intentionally denser than the UI can fully communicate by itself, especially:

### Planned Supply

Explain that Planned Supply exists so the user can model the **intended completed network** while progressively constructing it through incomplete intermediate states.

Important conceptual wording to preserve:

- Planned Supply represents virtual supply;
- it is useful while upstream outposts/resources/products are not yet complete;
- downstream fabricators and logistics can be laid out as though those inputs already exist;
- once the actual item replaces the virtual item, the Planned Supply entry retires automatically.

### Resource Matrix / Logistics

Consider lightweight documentation for dense column semantics such as:

```text
Present
Producing
Inputs
Logistics
```

Especially note that:

```text
Logistics = actually configured on a routed export
```

not merely “available to export”.

Do not add in-app help UI in this task.

---

## 11. Lightweight Matrix explanatory affordances

Under the same help/UX area, add a very low-priority deferred item to consider lightweight explanatory affordances such as:

- tooltips;
- compact help text;
- discoverable definitions for dense column semantics.

Only pursue this if real usage shows recurring confusion.

Do not prescribe a heavyweight help system.

---

# PART E — LOCALIZATION

## 12. Add lightweight localization framework

Under the new help/guidance/localization section, add a **very low priority** backlog item for localization infrastructure.

Frame this as internationalization/localization groundwork, not translation work.

Settled direction:

```text
English remains the default language.
English remains the only language initially.
```

Future first phase:

- create a lightweight framework/layer for resolving user-facing strings;
- make future language additions possible without rewriting components;
- preserve English as the fallback/default language.

Future translations may be added over time.

Do not require now:

```text
language selector
translation management UI
runtime download of translations
pluralization framework beyond demonstrated need
locale-sensitive number/date handling beyond demonstrated need
translation files for non-English languages
```

Do not refactor source strings in this task.

This backlog item should explicitly be low priority / far-future.

---

# PART F — KEEP EXISTING DEFERRED WORK

## 13. Preserve still-valid backlog areas

Do not accidentally remove legitimate deferred work such as:

```text
independent Navigation scrolling
workspace scrolling model review
drag auto-scroll refinements
throughput/power/storage/cargo-rate modelling
planner-facing recipe-feasibility explanation
planetary/resource planning improvements
history/timeline improvements
multi-network UI
collection-level import/export
reference-data ingestion improvements
longer-term planner functionality
```

Retain existing cautions against piecemeal throughput modelling and premature planner-driven schema distortion.

---

# PART G — BACKLOG QUALITY

## 14. Keep the backlog specific

During the edit:

- remove wording that is now merely historical;
- avoid vague permanent “polish later” bullets;
- prefer clearly named deferred problems;
- do not duplicate settled domain rules from `docs/DOMAIN-RULES.md`;
- do not duplicate established UX conventions from `docs/UX-DESIGN.md`;
- keep backlog entries concise but informative.

---

# PART H — VERIFICATION

## 15. Review the final diff

This is documentation-only.

Verify:

```text
git diff --check
```

Also manually confirm:

- `recursive recipe feasibility` is gone;
- `organic-resource prerequisites` is gone;
- generic Outpost Details spacing/polish bullet is gone;
- Cargo Pad label wording reflects current derived ordinals;
- status-bar wording reflects hidden reference diagnostics;
- pane resizing is present;
- Cargo summary width allocation is present;
- validation navigation is present;
- Planned Supply Info validation is present;
- user guide/help is present;
- lightweight Matrix explanation is present;
- localization framework is present and clearly very low priority;
- no implemented feature was accidentally reintroduced as future work.

---

# PART I — COMPLETION REPORT

## 16. Report

On completion, report:

```text
sections changed
items removed
items rewritten
items added
any backlog item you found ambiguous
git diff --check result
```

Explicitly state whether any source code, tests, or non-backlog documentation changed.

Do not commit or push unless explicitly asked.

---

## 17. Suggested commit message

If accepted:

```text
docs: groom project backlog
```

---

## 18. Final instruction

The backlog should describe **what is genuinely deferred now**, not what was deferred before the recently completed sprint.

Prefer removal over historical commentary when an item is complete.

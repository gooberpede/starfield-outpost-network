# AGENTS.md

## Purpose

This repository contains **Starfield Outpost Network**, a local React/TypeScript application for recording, editing, validating, and eventually planning a player's Starfield outpost network.

This file provides repository-wide instructions for coding agents.

Keep this file focused on:
- how to work in the repository;
- architectural boundaries that must be respected;
- validation/build expectations;
- where to find deeper project documentation.

Do not treat this file as a complete specification of Starfield domain rules or UX behaviour.

---

## Source of truth and instruction precedence

When implementing a task, use the following order of authority:

1. The current implementation brief or explicit user request
2. This `AGENTS.md`
3. Relevant documents under `docs/`
4. Existing automated validation and type constraints
5. Existing code behaviour

If these sources materially conflict, do not silently choose one interpretation. Report the conflict and preserve existing behaviour unless the implementation brief clearly supersedes it.

Do not infer new product requirements merely because an adjacent improvement seems useful.

---

## Project structure

The application is organised broadly as follows:

- `src/domain/`
  - domain models;
  - pure domain logic;
  - capacity rules;
  - availability and provenance calculations;
  - Undo/Redo editing-session logic;
  - validation rules.

- `src/data/`
  - serialization and deserialization;
  - browser persistence;
  - reference-data loading;
  - import/export-related utilities.

- `src/ui/components/`
  - feature-oriented React components.

- `src/ui/layout/`
  - page and workspace layout components;
  - layout components should primarily own positioning and presentation structure.

- `src/App.tsx`
  - application-level composition;
  - network editing orchestration;
  - application/session UI state;
  - coordination between domain logic and presentation components.

- `public/`
  - application-served static/reference assets.

- `reference-source/`
  - source material used to build or maintain reference datasets.

- `scripts/`
  - repository utility/data-processing scripts.

- `docs/`
  - architecture, domain, UX, backlog, and implementation guidance.

Read the relevant files before changing behaviour.

---

## Documentation

Before significant implementation work, consult the relevant documentation when present:

- `docs/ARCHITECTURE.md`
  - technical architecture and state ownership.

- `docs/DOMAIN-RULES.md`
  - Starfield/outpost rules encoded by the application.

- `docs/UX-DESIGN.md`
  - interaction and presentation principles.

- `docs/BACKLOG.md`
  - explicitly deferred work and unresolved decisions.

- `docs/IMPLEMENTATION-WORKFLOW.md`
  - expectations for implementation batches.

A backlog item is not an implemented requirement unless the current brief explicitly asks for it.

Do not "finish" deferred work merely because the surrounding code is being modified.

---

## Scope discipline

Implement the requested task narrowly.

Do not:
- introduce unrelated features;
- redesign neighbouring components without a requirement;
- change domain semantics as incidental cleanup;
- rename or reorganise large areas of the repository without need;
- silently resolve deliberately deferred product decisions;
- perform speculative refactors simply because they appear cleaner.

Small local refactors are acceptable when they directly support the requested change and preserve behaviour.

If existing code looks unusual but is outside the task, leave it alone unless it creates a correctness problem for the requested implementation.

---

## Domain and UI separation

Keep domain semantics outside presentation components where practical.

Prefer:

- pure functions in `src/domain/` for domain rules and derived data;
- serialization/storage concerns in `src/data/`;
- React components for presentation and interaction;
- `App.tsx` for application-level coordination and ownership of cross-feature state.

Do not duplicate domain rules in UI components merely for convenience.

UI components may derive presentation-specific values, but rules governing whether a network state is valid, possible, available, or allowed should normally live in the domain layer.

---

## Persisted state versus presentation state

`OutpostNetwork` represents persisted network data.

Do not add UI-only state to `OutpostNetwork` unless persistence is explicitly required.

Examples of presentation/session state that should normally remain outside the persisted model include:

- expanded/collapsed panels;
- selected tabs or UI sections;
- temporary form drafts;
- transient success/error messages;
- currently selected outpost;
- file-import/export feedback;
- other viewport or interaction-only state.

If unsure whether something belongs in the persisted model, preserve the existing separation and flag the decision.

---

## Undo/Redo semantics

The application uses whole-network immutable snapshots for Undo/Redo.

A deliberate user operation should normally correspond to **one history entry**.

If one action has collateral effects, those effects should be part of the same history entry.

Examples:
- deleting a cargo pad and its associated cargo link;
- changing a star system and clearing an incompatible body selection;
- enabling a real supply source and retiring fulfilled Planned Supply;
- importing a complete network.

Do not create one history entry per low-level mutation when the user perceives them as one action.

Temporary typing state should generally remain local to the UI and commit as one completed edit rather than one history entry per keystroke.

Presentation-only state is not part of Undo/Redo unless explicitly requested.

---

## Immutability and identity

Treat persisted network state as immutable.

Prefer:
- object/array copies;
- pure transformations;
- stable IDs for domain identity.

Do not mutate existing `OutpostNetwork`, outpost, cargo-pad, or cargo-link objects in place.

Array position may control presentation order, but stable UUIDs/IDs remain the identity of domain objects.

Do not use visible labels as object identity.

---

## Existing domain assumptions to preserve

Unless a task explicitly changes them, preserve these behaviours:

- cargo links are network-level entities;
- a cargo link connects two cargo-pad endpoints;
- cargo pads retain their own outbound item selections independently of links;
- inbound cargo availability is derived from the remote pad's outbound selections;
- availability changes do not automatically delete downstream cargo exports;
- Planned Supply represents unresolved supply intent;
- when an item acquires an actual source, a matching Planned Supply entry may be retired automatically;
- if that source later disappears, Planned Supply is not automatically recreated;
- Undo can restore state that was automatically retired as part of the original action;
- character skill values may be `null` when no value is recorded;
- `0` and `null` are distinct values;
- character name may be blank;
- reference IDs are stored as IDs, with human-readable names resolved at presentation time where appropriate.

For more complete rules, use `docs/DOMAIN-RULES.md` once present.

---

## Validation architecture

Validation belongs in the domain validation system, not scattered through UI components.

Prefer:
- one rule with one clear responsibility;
- stable rule IDs;
- validation issues carrying stable IDs/context;
- human-readable display-name resolution in the presentation layer.

Avoid overlapping rules that report the same problem multiple times unless the distinctions are intentional.

Warnings/advisories should not be promoted to hard errors without an explicit product decision.

Do not auto-correct persisted network data merely because validation reports an issue unless the brief specifically requires repair behaviour.

---

## Reference data

Reference data is distinct from the player's persisted outpost network.

Do not copy reference-data records into `OutpostNetwork` unless explicitly required.

Prefer storing stable IDs in network state and resolving names, recipes, planetary relationships, and other metadata from the reference-data layer.

If reference data is missing or stale:
- preserve stored IDs where possible;
- allow validation/presentation to report unresolved references;
- do not silently discard user data.

---

## Import/export and browser storage

Browser storage is the application's normal persistence mechanism.

JSON files are import/export vehicles, not live documents attached to the application.

Do not model an imported filename as persistent network state.

Import/export filenames and success/failure messages are session/presentation concerns.

A failed import must not modify:
- the current network;
- Undo/Redo history;
- the current selected outpost.

A successful full-network import should be treated as one deliberate Undoable action unless a future brief specifies otherwise.

---

## UX principles

Prefer dense but legible controls suitable for a data-heavy application.

Important principles already established:

- show relevant information rather than hiding it when a disabled state communicates the reason more clearly;
- preserve compact use of horizontal space;
- distinguish presentation state from domain state;
- avoid consuming unnecessary vertical viewport space;
- keep important global controls readily accessible;
- disabled controls should look disabled;
- collapsed summaries should remain informative where practical;
- avoid forcing the user to repeatedly re-enter information the application already knows;
- avoid destructive automatic cleanup when a warning is sufficient.

Do not introduce a new interaction pattern globally until it has been proven in an appropriate feature unless the brief explicitly calls for a shared abstraction.

---

## Code style and comments

Follow the existing TypeScript/React style in the repository.

For substantial new or rewritten files, retain the repository's explanatory comment convention where useful:

- `Purpose`
- `Architecture`
- `Change this file when`

Functions with non-obvious domain or state-management responsibilities should have short intent comments.

Comments should explain **why** a boundary or behaviour exists, not restate obvious syntax.

Avoid over-commenting trivial JSX or straightforward assignments.

Preserve existing formatting conventions unless a formatter/tooling change is explicitly requested.

---

## Type safety

Do not suppress TypeScript errors to make a task pass.

Avoid:
- unnecessary `any`;
- unsafe type assertions;
- broad casts that bypass model constraints.

Prefer explicit domain types and narrow component props.

When changing a component contract, update all callers and remove obsolete plumbing rather than leaving unused parameters/state behind.

Do not ignore compiler warnings about unused values introduced by the change.

---

## Accessibility and interaction

For interactive controls:

- use semantic buttons for actions;
- associate labels with form inputs;
- provide `title` or accessible labels for compact/icon-only controls where needed;
- use `disabled` for unavailable actions instead of implementing visual-only disabling;
- preserve keyboard-accessible behaviour;
- ensure hidden native inputs used for file selection remain reachable through an accessible visible control.

Do not implement clickable non-semantic elements when a button is appropriate.

---

## Testing and verification

The repository currently provides these npm scripts:

```sh
npm run dev
npm run build
npm run lint
npm run preview
```

For any coherent implementation batch:

1. Run the relevant local/manual checks for the changed feature.
2. Run:

```sh
npm run build
```

before declaring the task complete.

`npm run build` runs TypeScript compilation and the Vite production build, so it is the required whole-project sanity check.

Run:

```sh
npm run lint
```

when the change is broad, when lint-sensitive code has been modified, or when requested by the implementation brief.

Do not claim a check passed unless it was actually run.

If a check cannot be run, say so explicitly.

---

## Regression expectations

When changing an existing feature, verify both:
- the requested new behaviour;
- the important existing behaviours around it.

Pay particular attention to:

- Undo/Redo;
- browser persistence;
- import/export;
- selected-outpost stability;
- stable object IDs;
- derived cargo availability;
- validation output;
- reference-data resolution;
- boundary/disabled controls;
- presentation state accidentally becoming persisted.

---

## Working with implementation briefs

Implementation briefs are expected to define:
- objective;
- scope;
- required behaviour;
- non-goals;
- affected areas when known;
- acceptance criteria;
- manual tests where appropriate.

Treat the brief as authoritative for the batch.

Before editing:
1. inspect the relevant existing implementation;
2. identify affected domain and UI boundaries;
3. check relevant documentation;
4. note any conflict or ambiguity that could materially change the result.

During implementation:
- preserve unrelated behaviour;
- reuse existing architecture where appropriate;
- make the smallest coherent change that satisfies the brief.

After implementation:
- summarise files changed;
- summarise behaviour changed;
- report checks run and their result;
- mention any assumptions, limitations, or deliberately deferred items.

---

## Git behaviour

Do not commit, push, create branches, rewrite history, or modify remote repository state unless explicitly asked.

It is acceptable to inspect Git history or diffs when useful.

When suggesting commit messages, prefer Conventional Commit style, for example:

```text
feat: add cargo pad collapse controls
fix: preserve planned supply during source changes
refactor: centralize cargo pad capacity rules
docs: add project architecture guide
```

---

## Dependency changes

Do not add or upgrade dependencies unless the requested task genuinely requires it.

Prefer existing platform/browser/React capabilities over new packages for small functionality.

If adding a dependency is necessary:
- explain why;
- keep scope narrow;
- update lockfiles consistently;
- verify the production build afterward.

Do not perform opportunistic major-version upgrades as part of unrelated feature work.

---

## Deferred decisions

The repository contains deliberate backlog items and unresolved design questions.

Do not implement deferred items simply because the code being edited is adjacent to them.

Examples may include:
- drag-and-drop ordering;
- additional Undo/Redo history UI;
- throughput modelling;
- more advanced cargo-flow validation;
- broader selection-grid adoption;
- workspace scrolling/layout redesign;
- deriving/removing persisted cargo-pad labels.

Consult `docs/BACKLOG.md` when present.

---

## When to stop and report instead of guessing

Stop and surface the issue when:

- the implementation brief conflicts with documented domain rules;
- a requested change would require changing persisted schema unexpectedly;
- a change would alter Undo/Redo semantics outside scope;
- existing code and documentation disagree in a way that affects user data;
- a domain rule is unclear and multiple plausible interpretations would produce materially different behaviour;
- the task appears to require broad architectural changes that were not requested.

Prefer a precise reported uncertainty over silently inventing a product decision.

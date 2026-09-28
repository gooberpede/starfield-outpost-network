# Source Documentation and Commenting Standard

## Purpose

This standard covers source documentation and comments. It is not a general
TypeScript, React, CSS, or formatting guide.

## Principle: document intent, not mechanics

Comments should preserve intent, ownership, constraints, invariants,
source-of-truth distinctions, and non-obvious reasons. They should not narrate
straightforward branches, loops, assignments, JSX, or declarations.

The durable owner documents have a broader role:

- `docs/DOMAIN-RULES.md` explains domain semantics;
- `docs/ARCHITECTURE.md` explains technical structure and state ownership;
- `docs/UX-DESIGN.md` explains settled presentation and interaction behavior.

Source comments provide only the local context needed to modify nearby code
safely. Do not copy long passages from owner documents into source files.

## Owner docs and local source comments

A useful local comment explains why this module owns a responsibility, what it
deliberately does not own, which invariant must survive refactoring, which
source of truth applies, or why a simpler-looking implementation would be
wrong. It should remain understandable in place even when it refers to a
durable concept or owner document.

## Module classes

A **substantial owner module** owns feature behavior, a domain rule or state
transition, a persistence or storage boundary, validation responsibility, a
significant UI or layout region, a reference-data pipeline stage,
generation/verification tooling, or cross-feature orchestration. Ownership
matters more than line count.

A **small supporting module** is a narrow formatter, predicate, constant table,
mapping helper, or adapter. It needs no large header when its filename, types,
and implementation already make its purpose clear. A compact purpose comment
is acceptable when it preserves a useful distinction.

Generated and data-only modules normally do not need owner headers.

## Substantial owner-module headers

Substantial owner modules should normally begin with a concise header:

```ts
/**
 * Purpose:
 *   Why this module exists and what responsibility it owns.
 *
 * Architecture:
 *   Where it sits, what it owns and deliberately does not own, and the
 *   boundaries or invariants a maintainer must preserve.
 *
 * Change this file when:
 *   Which requirement changes belong here rather than in adjacent modules.
 */
```

Do not inventory exports or narrate imports. Preserve a compact prose header
when it already communicates the same ownership more clearly.

## Small supporting modules

Do not make a helper appear substantial by adding boilerplate. Prefer clear
names and types; add one or two lines only when they preserve a non-obvious
boundary or distinction.

## Function comments

Add or retain an intent comment when a function implements a non-obvious domain
rule, groups a state transition, protects persistence/import/migration or
Undo/Redo semantics, deliberately avoids side effects, depends on a subtle
source of truth, implements browser/platform geometry or timing, preserves
compatibility, or is likely to be simplified incorrectly.

Do not add parameter or return prose that duplicates TypeScript types. If the
name, types, and local context already express the contract, no comment is
needed.

## Invariant and boundary comments

Prioritize concise comments that prevent plausible regressions. Examples in
this repository include presentation-only state staying outside persistence,
one deliberate operation mapping to one Undo entry, exact organic producer
identity, planet-level farming eligibility versus natural biome occurrence,
network-owned cargo links versus pad-owned outbound selections, stored
reference IDs versus presentation-resolved names, failure-before-mutation
imports, and coalesced viewport geometry for browser layout.

Use these examples only where the nearby code needs the reminder; do not repeat
the owner documentation line for line.

## Scripts and tooling

Substantial scripts follow the same owner-module rule. Their headers should
identify the artifact or evidence owned, authoritative inputs, whether the
script generates, verifies, transforms, or audits, key identity/coverage/drift
or safety invariants, and what it deliberately does not infer, mutate, or
publish. Thin CLI wrappers may remain compact.

## Tests

Do not add boilerplate file headers to tests. Test and suite names should state
behavior. Comments are appropriate for non-obvious fixture intent, regression
significance, contractual magic values, surprising setup, or cross-layer
invariants.

## CSS modules

Apply the owner-module principle to substantial project-owned stylesheets that
own meaningful layout, sticky/fixed geometry, responsive behavior, feature
presentation state, browser-specific behavior, or shared interaction geometry.
Use the same `Purpose` / `Architecture` / `Change this file when` convention
when it adds useful ownership context. Do not comment straightforward
declarations or add boilerplate to trivial component-local stylesheets.

## Stale comments and history

Comments describe the current system and active compatibility promises. Git
owns author, date, and change history. Remove or update comments that refer to
obsolete behavior, unidentified briefs, or temporary phase, parcel, batch,
tranche, or task identifiers.

## What not to comment

Avoid comments on every function, JSDoc on every export, prose that repeats
types, narration of control flow or CSS declarations, source-file change logs,
temporary planning identifiers, large headers on tiny helpers, and copied
owner-document passages.

## Strong and weak examples

Strong: “Use planet-level species records here; biome occurrences describe
natural presence, not farming eligibility.” This preserves a tempting
source-of-truth distinction.

Weak: “Loop through the species.” This only restates the mechanics.

Strong: “Parse and validate the whole file before handing it to application
state; failures must not acquire mutation or history ownership.” This preserves
a boundary.

Weak: “Read the selected file.” The function name and code already say that.

## Review checklist

- Is this file's responsibility clear?
- Are ownership boundaries a maintainer could misunderstand explained?
- Is there an invariant or source-of-truth choice that could be simplified incorrectly?
- Do comments explain why instead of narrating what?
- Did this change make an existing comment stale?
- Is history recorded in Git rather than source prose?
- Does a substantial stylesheet explain non-obvious layout or browser constraints?

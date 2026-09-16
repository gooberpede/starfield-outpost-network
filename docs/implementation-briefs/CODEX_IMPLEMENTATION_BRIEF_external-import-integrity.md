# Codex Implementation Brief — External Import Integrity

## Objective

Harden the external JSON import boundary so that an imported network collection cannot enter live application state unless its persisted structure is safe for the current runtime and its stable identities are unambiguous.

This is a narrowly scoped import-integrity correction. Do not redesign the persistence model, domain validation model, localization architecture, accessibility architecture, or import UX.

## Important naming rule

Audit/slice identifiers used in discussion are transient shorthand only.

Do **not** introduce those identifiers into:
- source code;
- test names;
- comments;
- documentation;
- localization keys;
- error codes;
- generated artifacts;
- filenames;
- commit-oriented implementation labels.

Existing historical occurrences are out of scope for this task and may remain unchanged.

## Read first

Before changing code, inspect and follow:
- `AGENTS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- relevant localization/accessibility documentation
- the current whole-product security audit in `docs/audits/`
- current import, migration, persistence, localization, status-feedback, and accessibility tests

Use the repository as the source of truth for current paths, schema versions, APIs, and test commands.

## Core product rule

External import must be strict about **structure and stable identity**, but it must remain permissive about deliberately recoverable **domain semantics**.

An externally imported file may contain:
- unknown/stale reference-data IDs;
- incomplete planning state;
- stale exports;
- semantically contradictory but inspectable state already handled by the normal validation system;
- other recoverable conditions that current architecture intentionally preserves.

Those conditions must **not** become import failures merely because this boundary is strengthened.

By contrast, malformed runtime structure and ambiguous stable identity must be rejected before the imported collection becomes live application state.

## External import versus browser-storage recovery

Preserve the existing architectural distinction:

- **External file import** is a trust boundary and must be strict.
- **Browser-storage recovery** is deliberately more forgiving and may salvage valid recoverable entries.

Do not generalize strict external-import rejection into the storage-recovery path unless a specific existing contract requires it.

## Structural boundary

The external import path must establish the complete persisted runtime shape required by the current application.

Do not stop at the collection envelope or top-level network fields.

Validate all persisted nested structures that the runtime later treats as trusted, including current equivalents of:
- collection wrapper entries;
- network;
- character;
- character skills/capabilities;
- outposts;
- selected biome/resource ID arrays where structural typing matters;
- production routes and discriminants;
- manufacturing entries;
- Planned Supply items;
- Cargo Link / cargo-pad objects;
- outbound cargo items;
- Cargo Link endpoints;
- any other persisted nested member currently relied on without defensive `unknown` handling.

Required primitive/member types and discriminants must be verified before acceptance.

Do not use TypeScript assertions as a substitute for runtime validation of external data.

## Migration and lossy recovery

The current migration path performs some cleanup/recovery operations that can silently:
- filter invalid members;
- drop invalid production routes;
- skip malformed Cargo Links;
- collapse certain duplicate link relationships;
- pass through incompletely checked nested arrays.

A malformed external file must not become apparently valid merely because migration discarded or normalized malformed data.

Therefore:

1. Supported historical representations must remain importable through their legitimate defined migrations.
2. External input must be checked strongly enough **before any lossy recovery can conceal malformed input**.
3. After legitimate migration, the resulting current-schema structure must also satisfy the complete current runtime shape.
4. Silent removal of malformed external objects followed by a successful import is not acceptable.

Codex may choose the smallest architecture that cleanly enforces this contract. For example, it may separate strict external parsing from recovery migration, introduce import-specific structural checks, or make migration expose rejected/discarded data rather than silently hiding it. Do not undertake a broad migration rewrite unless necessary.

## Stable identity rules

Reject empty or ambiguous stable identities using the natural namespace already used by the application.

Required uniqueness scopes:

- saved-network identity: non-empty and unique within the collection;
- outpost identity: non-empty and unique within its network;
- Cargo Link relationship identity: non-empty and unique within its network;
- cargo-pad identity: non-empty and unique within its parent outpost.

Do **not** impose one universal cross-type ID namespace.

Examples that remain valid:
- a cargo pad in Outpost A and a cargo pad in Outpost B using the same literal ID, because pad identity is qualified by outpost identity;
- an outpost ID and a Cargo Link ID sharing the same literal string, provided current runtime paths keep those namespaces distinct.

Examples that must be rejected:
- two outposts in one network with the same outpost ID;
- two Cargo Links in one network with the same Cargo Link ID;
- two cargo pads in one outpost with the same cargo-pad ID;
- empty stable IDs in those identity-bearing positions.

Do not auto-repair ambiguous duplicate identities by inventing replacement IDs. Relationships may already refer to the duplicated identity, so renumbering would require guessing user intent.

## Atomic rejection

A rejected external import must not modify application state.

Verify that rejection leaves unchanged:
- the current `NetworkCollection`;
- active network;
- selected outpost / presentation context;
- Undo/Redo history;
- persisted browser storage;
- other runtime state that would only change after a successful import.

The file may be read and parsed for validation, but no accepted-state mutation may occur until the entire external document has passed the required boundary.

## Error model and localization

Do not decide or redesign detailed error presentation in this task.

The current concise status-bar failure path remains the baseline presentation.

However, new import failures must not depend on matching hard-coded English exception prose.

Introduce or strengthen a **locale-neutral, machine-readable import-error contract** sufficient to distinguish structural/import failure classes and carry structured parameters where useful.

The implementation should allow the presentation layer to decide later:
- how much detail is shown;
- whether only a concise reason is shown;
- whether a future “Details” or fuller report is available;
- how such detail is formatted.

Do not add a details dialog, report panel, disclosure button, or other expanded failure UI in this task.

All user-facing import feedback must continue through the localization layer.

Do not place English user-facing copy in data/migration/serialization code.

## Accessibility

Preserve and verify the existing accessible import-feedback behavior.

In particular:
- failed imports must remain exposed through the existing localized status-feedback architecture;
- assertive error announcements must continue to work;
- the existing focus-aware/deferred announcement behavior around the native file picker must not regress;
- visible text and assistive-technology announcement text must remain consistent with the localization layer.

Assess any changed import-failure flow for keyboard and screen-reader behavior.

Do not invent a new accessibility pattern or new error-details surface in this task.

## Domain validation boundary

Do not convert ordinary validation findings into import failures.

The normal validation system must continue to own recoverable semantic problems such as current equivalents of:
- unknown systems/bodies/resources/products/species;
- stale or unresolved exports;
- body/system contradictions;
- production/body or biome contradictions;
- missing reference-data matches;
- manufacturing feasibility problems;
- skill/capacity problems;
- Planned Supply inconsistencies;
- duplicate values in set-like semantic lists where the current validator deliberately diagnoses rather than rejects;
- other domain-invalid-but-inspectable states.

External import validation answers:

> “Can the runtime safely represent and address this data?”

Normal domain validation answers:

> “Does this recorded/planned network make semantic sense?”

Keep those responsibilities separate.

## Out of scope

Do not address in this change:
- file-size limits;
- collection-count or graph-complexity limits;
- string-length budgets;
- history byte-pressure policy;
- storage quota/failure recovery;
- corrupt localStorage recovery UX;
- deployment/CSP/security headers;
- runtime reference-data integrity hardening;
- new dependencies or schema-validation libraries unless the existing code genuinely cannot support a narrow solution;
- sanitizer libraries;
- authentication/authorization;
- any redesign of import/export UX;
- detailed import-error report UI;
- remediation of historical audit/slice identifiers already present in repository files.

These belong to separate work.

## Expected implementation characteristics

Prefer:
- small, explicit runtime guards;
- reusable helpers where they materially reduce duplication;
- structured import-error types/codes/parameters;
- current repository conventions;
- no unnecessary dependency additions;
- no broad persistence redesign;
- no changes to stable domain identifiers merely for presentation purposes.

Be especially cautious about changing migration semantics used by browser-storage recovery.

## Tests

Add focused regression coverage proving at minimum that external import rejects malformed nested structures that are currently accepted or silently cleaned up, including representative cases for:
- `manufacturing`;
- Planned Supply;
- outbound cargo items;
- production-route shape/discriminants where malformed current-schema values would otherwise be discarded;
- malformed Cargo Links that would otherwise be skipped;
- empty required stable IDs;
- duplicate outpost IDs within one network;
- duplicate Cargo Link IDs within one network;
- duplicate cargo-pad IDs within one outpost.

Also prove that:
- the same cargo-pad ID may exist in different outposts when otherwise valid;
- identical literal IDs in unrelated object-type namespaces are not rejected solely for matching text;
- unknown/stale reference IDs remain importable and continue into normal validation;
- supported historical schemas still migrate successfully;
- failed imports remain atomic and do not modify collection/history/selection;
- localized import-failure presentation still resolves through semantic message descriptors;
- accessible status announcements for import failure continue to function.

Where practical, include a regression case showing that malformed input cannot be made “valid” merely because migration would otherwise drop the offending member.

Do not add pathological-size stress tests here; those belong to the separate resource-boundary slice.

## Verification

Run the repository-appropriate focused tests first, then the relevant full verification set for a cross-cutting data-boundary change.

At minimum, use current equivalents of:
- unit/domain tests;
- component/accessibility tests affected by import feedback;
- localization tests;
- build;
- lint;
- `git diff --check`.

Also run any existing import/serialization/migration/persistence suites discovered in the repository.

Do not regenerate unrelated reference/localization provenance artifacts unless the implementation actually touches them.

## Documentation

Update durable architecture/domain documentation only where needed to record:
- strict external import versus forgiving storage recovery;
- complete structural/identity trust-boundary expectations;
- stable identity namespace scopes;
- locale-neutral import-error contract if it becomes an architectural primitive.

Do not add transient audit/slice identifiers to documentation.

Do not rewrite historical audit reports.

## Completion report

Return:
1. a concise summary of the implementation;
2. files changed;
3. important design choices, especially around migration/recovery separation;
4. exact duplicate-ID scopes enforced;
5. how locale-neutral import errors are represented;
6. tests added/updated;
7. verification commands and results;
8. any remaining uncertainty or deliberately deferred work.

Do not commit or push unless explicitly instructed.

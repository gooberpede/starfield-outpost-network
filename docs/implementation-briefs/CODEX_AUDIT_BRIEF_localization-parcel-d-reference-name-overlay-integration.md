# CODEX AUDIT BRIEF — Localization Parcel D: Official Japanese Reference-Name Overlay Integration

## Purpose

Audit the current application/runtime localization architecture before implementing Parcel D.

Parcel C is complete.

Parcel D will consume the finalized provenance contract from C8 and turn official Bethesda localization data into runtime reference-name overlays, beginning with Japanese.

This audit is intentionally focused on the integration boundary between:

```text
validated provenance/build artifacts
and
runtime localized reference names
```

Do not implement Parcel D yet.

Do not commit or push.

Write the audit report to:

```text
docs/audits/codex-localization-parcel-d-reference-name-overlay-audit.md
```

---

# Scope classification

**Medium cross-cutting audit.**

Expected areas inspected:

- runtime localization architecture;
- existing reference-name overlay scaffolding;
- canonical resource/product/system/body/biome/flora/fauna/skill data;
- generated-data conventions;
- locale switching/fallback;
- search/display consumers;
- build-time generated artifacts.

Do not modify runtime behavior during the audit.

---

# Parcel D goal

The intended D end state is:

> For Bethesda-owned reference names, the runtime uses official Bethesda Japanese localization derived from the validated Parcel C provenance, while tracker-authored UI strings continue to use the existing semantic message catalog.

The tracker already has Japanese translations for tracker-authored semantic strings.

Parcel D is about **Bethesda-owned names**, including the canonical reference catalogue.

---

# Authoritative upstream contract

Treat Parcel C outputs as authoritative.

Current authoritative Bethesda source universe:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

Current closure state:

```text
resolved entities: 3,539
provenance rows:   4,796
unresolved:            0
```

Current provider counts:

```text
Starfield.esm       4,759
ShatteredSpace.esm     35
SFBGS00D.esm            2
```

Parcel D must not rediscover:

- FormIDs;
- field paths;
- provider ownership;
- canonical record identity;
- composed-fauna naming rules.

Use the committed Parcel C outputs and handoff contract.

---

# Current localization architecture to inspect

Audit the current implementation of:

- locale definitions;
- `en-US` baseline/fallback;
- `en-GB` sparse override;
- Japanese tracker-authored semantic catalog;
- Automatic locale behavior;
- reference-name overlay mechanism/scaffolding;
- locale preference persistence;
- message lookup;
- reference-name lookup;
- runtime fallback behavior.

Identify exact files/modules/functions.

---

# Audit question 1 — What is the current reference-name overlay API?

Determine whether a runtime abstraction already exists for localized canonical names.

Report:

- module/file;
- key type;
- lookup function;
- locale input;
- fallback behavior;
- whether names are keyed by:
  - canonical app ID;
  - FormID;
  - entity kind + ID;
  - another stable identity;
- whether all reference families use the same abstraction.

If multiple partial mechanisms exist, inventory them.

Do not propose a second competing localization system unless necessary.

---

# Audit question 2 — What runtime entities need official-name overlays?

Map the provenance `EntityKind` values to runtime canonical datasets.

Current provenance kinds:

```text
biome
body
fauna
flora
official-term
product
resource
system
```

For each kind, report:

```text
provenance EntityKind
provenance EntityId shape
runtime canonical identity
runtime dataset/module
current English display field
current localization hook, if any
```

Identify whether the mapping is:

```text
1:1 direct
requires existing alias/normalization
requires generated crosswalk
unsupported/ambiguous
```

Do not rely on English-name joins if a stable ID mapping exists.

---

# Audit question 3 — Which Bethesda-owned names are actually surfaced by the tracker?

Distinguish:

```text
A. all provenance-backed canonical names
B. names currently reachable/displayed in the application
C. names currently used only in source/reference/build data
```

Parcel D may reasonably generate overlays for the complete authoritative catalogue even when some entries are not currently surfaced, but the audit should make the distinction explicit.

---

# Audit question 4 — The 114 deferred Bethesda-owned names

Parcel B deferred 114 strings/names to Bethesda provenance rather than translating them manually.

Locate the exact current representation of those deferred items.

Determine:

- which are true runtime semantic messages;
- which are canonical reference names;
- which provenance entities they map to;
- whether the full 114 are now covered by Parcel C;
- whether any item is still not represented by the provenance contract.

Provide a complete count reconciliation.

Do not silently hand-translate missing items.

---

# Audit question 5 — Direct/template name generation

For provenance rows with:

```text
DisplayNameSourceKind = direct
or
DisplayNameSourceKind = template
```

determine the simplest generated overlay representation.

Expected conceptual rule:

```text
(EntityKind, EntityId)
-> Japanese official localized name
```

using:

```text
NameSourcePlugin
NameStringTable
NameStringID
```

against the validated Japanese tables.

Audit whether D should generate:

- one normalized JSON/TS map;
- per-entity-kind generated maps;
- existing locale-specific reference overlay files;
- another established project convention.

Prefer the existing architecture.

---

# Audit question 6 — Composed fauna runtime representation

Composed fauna has multiple provenance component rows.

Established C6 semantic component slots:

```text
0 = prefix
1 = species/body
2 = diet
```

Established assembly order:

```text
prefix -> species/body -> diet
```

Established current Japanese behavior:

```text
same sequence
literal ASCII space U+0020 between nonempty components
```

Audit how D should represent composed names at runtime.

Compare at least:

## Option A — generate final Japanese composed name

```text
fauna EntityId -> final Japanese string
```

## Option B — ship component identities and assemble at runtime

Determine which is better for the current tracker architecture.

Strong preference should be given to the simpler runtime contract if it preserves audited behavior and future regeneration.

Parcel D should not require the app to understand Bethesda INNR/CCT internals unless there is a clear reason.

---

# Audit question 7 — Japanese separator hardening

C6 left one known hardening item:

```text
direct Japanese runtime / Creation Kit confirmation
of exact on-screen U+0020 separator fidelity
```

Determine whether D should:

- block implementation on this check;
- generate using the audited U+0020 rule and leave live visual confirmation to Parcel E;
- provide an explicit generated-data metadata note/test.

Recommend the smallest sensible treatment.

Do not re-open the C6 composition audit without contradictory evidence.

---

# Audit question 8 — Generated-data ownership

Determine where generated official-name overlays should live.

Requirements:

- project-owned;
- deterministic;
- regenerated from Parcel C provenance;
- not manually edited;
- reviewable in git;
- no Bethesda archive/table dumps committed;
- no installed-game dependency at runtime;
- ordinary CI/build works without Starfield installed.

Report the best file location and format based on existing project conventions.

---

# Audit question 9 — Generation command

Determine whether Parcel D should extend:

```text
npm run localization:provenance:build
```

or add a separate downstream command such as:

```text
npm run localization:reference-names:build
```

The desired dependency direction is:

```text
Parcel C provenance
-> Parcel D generated runtime overlay
```

not:

```text
runtime app
-> installed game files
```

Audit whether D generation can operate entirely from committed Parcel C handoff artifacts or whether it still requires local Japanese string tables.

If string-table bytes are still required to materialize Japanese text, propose the cleanest build-time arrangement while preserving CI independence.

---

# Audit question 10 — Japanese output reproducibility

Determine what must be committed so that:

- runtime Japanese names are available without installed game files;
- committed generated overlays can be verified in repository-only tests;
- installed-game regeneration can prove they came from the current official tables.

Identify which text-bearing generated artifact should be canonical for runtime use.

---

# Audit question 11 — Locale fallback behavior

Audit expected runtime fallback for official reference names.

Recommended conceptual behavior:

```text
requested locale official overlay
-> locale-specific reference name if present
-> en-US canonical reference name
```

Determine how this fits the current fallback architecture.

For Japanese, a missing official name should be observable in tests and build gates, even if runtime fallback remains safe.

Do not create silent data-quality holes.

---

# Audit question 12 — en-GB interaction

The project already has `en-GB` semantic overrides and the Aluminum/Aluminium proof.

Clarify the boundary between:

```text
tracker-authored semantic localization
and
official Bethesda reference-name localization
```

Determine whether official Bethesda reference names in `en-GB` should remain:

- baseline official English;
- existing project-specific sparse overlay;
- another already-established behavior.

Do not let Japanese generation accidentally break the current Aluminum/Aluminium proof.

---

# Audit question 13 — Search integration

Search for Items is network-local and searches the canonical catalogue.

Audit:

- what text it currently indexes;
- whether it already uses localized display names;
- whether switching to Japanese reference overlays automatically localizes search;
- whether alternate English names remain searchable under Japanese;
- whether search hardening should be deferred to Parcel E.

Parcel D should not expand into broad search UX changes unless necessary for basic correctness.

Parcel E owns Japanese search/font/layout hardening.

---

# Audit question 14 — Sorting

Identify all places where canonical reference names are sorted alphabetically.

Determine whether Parcel D should:

- immediately sort by localized display name;
- preserve canonical order;
- defer locale-aware collation to Parcel E.

Do not introduce a broad sorting/collation project during D unless current behavior would be obviously broken.

---

# Audit question 15 — Persisted data

Confirm that localized display names are presentation only.

Parcel D should not persist Japanese strings into:

- networks;
- outposts;
- items;
- resources;
- history snapshots;
- import/export payloads.

Stable canonical IDs must remain persisted.

Identify any current code path that improperly stores display names.

---

# Audit question 16 — Import/export and history

Confirm that locale changes and generated reference overlays do not change:

- schema versions;
- import compatibility;
- history semantics;
- network equality;
- undo/redo snapshots.

Report any surprising coupling.

---

# Audit question 17 — Validation/messages

Determine whether validation currently includes canonical names in messages.

If so, identify whether those names are obtained through the same reference-name lookup layer.

Parcel D should not duplicate localization logic inside validation.

---

# Audit question 18 — Generated artifact size

Estimate generated Japanese overlay size for:

```text
3,539 entities
```

and recommend a representation appropriate for Vite/browser use.

Consider:

- JSON vs TS module;
- one file vs per-kind modules;
- eager vs static import.

Do not prematurely optimize unless the generated payload is materially large.

---

# Audit question 19 — Tests required for D

Recommend the minimum meaningful test matrix.

At least consider:

```text
direct resource
DLC direct body
X-Tech
system
biome
flora
direct fauna
template fauna
composed fauna
skill/official term
fallback
en-GB regression
locale switching
persisted-ID stability
```

Include representative base-game and DLC cases.

---

# Audit question 20 — Build-time gates

Recommend exact D gates.

Potential gates:

```text
all 3,539 entities materialize for ja-JP
0 missing Japanese qualified IDs
0 duplicate generated keys
0 unknown runtime IDs
0 provenance entities omitted
0 runtime canonical entities without expected provenance
English fallback intact
generated output deterministic
generated output matches committed artifact
```

Distinguish gates that belong in:

- installed-game regeneration;
- repository-only CI.

---

# Audit question 21 — Parcel E boundary

Explicitly identify what should remain for Parcel E.

Expected E topics include:

- Japanese search behavior;
- Japanese font coverage/fallback;
- dense-layout expansion;
- truncation/wrapping;
- locale-aware sorting/collation if deferred;
- representative worst-case Japanese UI testing;
- direct runtime verification of composed-fauna separator if still outstanding.

Do not absorb these into D unless needed for correctness.

---

# Audit question 22 — Parcel D implementation shape

End with a recommended implementation sequence.

Prefer the smallest coherent plan, for example:

```text
D1 generated official-name overlay builder
D2 runtime reference-name integration
D3 tests/gates/documentation
```

or conclude a single implementation parcel is safe if the architecture is already straightforward.

Classify expected implementation cost:

```text
local
medium cross-cutting
high cross-cutting
```

and explain why.

---

# Required report tables

Include a mapping table:

```text
EntityKind | Provenance IDs | Runtime IDs | Runtime dataset | Overlay strategy | Count | Issues
```

Include a consumer table:

```text
Runtime consumer | Current name source | Locale-aware today? | D change needed? | Defer to E?
```

Include a deferred-114 reconciliation:

```text
Category | Count | Provenance-covered | Remaining issue
```

---

# Non-goals

Do not implement:

- Japanese font changes;
- layout redesign;
- search ranking redesign;
- broad locale-aware collation;
- accessibility audit;
- new persistence/schema versions;
- arbitrary mod/Creation localization;
- new Bethesda provenance discovery;
- third-party localization services.

Do not modify generated provenance outputs during this audit.

---

# Verification

Run only read-only/repository-safe checks needed to understand the architecture.

If temporary diagnostics are needed, place them under:

```text
.local-work/localization/d-audit/
```

Do not modify tracked runtime/generated files.

---

# Audit deliverable

Write:

```text
docs/audits/codex-localization-parcel-d-reference-name-overlay-audit.md
```

The final recommendation must state:

1. exact runtime overlay key/shape;
2. exact generated artifact location;
3. whether composed fauna should be precomposed or assembled at runtime;
4. how Japanese text will be materialized reproducibly;
5. how all 3,539 provenance entities map to runtime identities;
6. reconciliation of the 114 deferred Bethesda-owned names;
7. fallback behavior;
8. search/sort boundary with Parcel E;
9. persistence/history/import/export impact;
10. exact implementation slices and cost;
11. any blocker that must be settled before implementation.

Do not proceed to implementation unless separately instructed.

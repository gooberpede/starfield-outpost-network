# Codex Architecture Audit Brief — X-Tech Support

## Objective

Perform a **no-code architecture audit** for adding first-class X-Tech support to the Starfield Outpost Tracker.

Do **not** implement the feature yet.

The goal is to determine the safest way to introduce:

```text
character.capabilities.xTechExtraction
outpost.explicitResourcePresence
```

and integrate X-Tech into the existing resource, production, Search, Planned Supply, validation, history, persistence, localization, and UI architecture without contaminating ordinary biome/atmosphere occurrence logic.

The X-Tech design is substantially settled. This audit should focus on **where the new state belongs, which existing seams should consume it, what schema/migration work is required, and how to avoid scattered X-Tech special cases**.

---

# PART A — AUDIT REPORT LOCATION

Write the final report to:

```text
docs/audits/codex-x-tech-architecture-audit.md
```

Do not place it elsewhere unless repository conventions make this impossible.

---

# PART B — REQUIRED INPUTS

Read:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/audits/codex-inorganic-resource-dictionary-retirement-audit.md
```

Inspect the current repository after the canonical inorganic-resource migration, especially:

```text
reference-source/inorganic-resource-dictionary.csv
reference-source/inorganic-resource-tracker-policy.csv
scripts/inorganic-resource-data.mjs
scripts/build-reference-data.mjs
public/reference-data/resources.json

src/domain/models.ts
src/domain/referenceData.ts
src/domain/bodyResourceAvailability.ts
src/domain/validation/
src/data/networkMigration.ts
src/data/serialization.ts
src/data/referenceDataLoader.ts

src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/PlannedSupplyEditor.tsx
src/ui/itemSearch.ts
src/ui/search/
src/App.tsx

src/localization/referenceNames.ts
src/localization/locales/en-US.ts
src/localization/locales/en-GB.ts

tests/
```

Inspect any additional files that actually own:

```text
character model
outpost model
resource presence
active production
resource-matrix row construction
available-item derivation
Planned Supply
Search result derivation
history actions
validation
network defaults
import/export migration
```

---

# PART C — SETTLED PRODUCT DESIGN

Treat the following as **settled requirements**, not open questions.

## 1. Canonical X-Tech identity

The canonical resource migration has already established X-Tech as:

```text
stable app ID: x-tech
canonical name: X-Tech
short name: XT
canonical rarity: Unique
tracker disposition: special-deferred
```

The audit must verify the exact current repository representation.

Do not rename the stable app ID.

---

## 2. X-Tech is not planetary occurrence data

X-Tech:

- is not part of biome resource-generation data;
- is not atmospheric;
- has no ordinary occurrence rows;
- can be extracted at any valid outpost location once the character has the required capability.

Do **not** add fake biome/atmosphere occurrences.

Do **not** make planetary data claim X-Tech is naturally present everywhere.

---

## 3. Explicit resource presence

Persist X-Tech presence per outpost through a narrowly-defined field conceptually equivalent to:

```ts
explicitResourcePresence: ['x-tech']
```

Meaning:

> this resource is treated as Present at this outpost because the user explicitly added its presence, rather than because canonical occurrence data says it is present.

This is the preferred model.

Do not use a vague `specialResources` junk-drawer concept unless the audit finds a concrete architectural blocker.

The audit should determine the best exact type/location/name while preserving this semantic meaning.

---

## 4. Character capabilities container

Introduce a general future-facing character capability/buff container, conceptually:

```ts
character: {
  ...
  capabilities: {
    xTechExtraction: true
  }
}
```

Exact naming/type structure is open to audit, but the requirements are:

- this is the first member of a general capability/buff model;
- `xTechExtraction` exists now;
- it defaults to `true`;
- it is **not exposed in the UI yet**;
- future outpost-related buffs/research/magazine effects may be added later.

Do not add a visible character control in this parcel.

---

## 5. Capability gate

`xTechExtraction === true` gates whether X-Tech can be added/produced.

When the capability is true and X-Tech is absent:

```text
[+ X-Tech]
```

may be shown.

When the capability is false:

- `[+ X-Tech]` must not be available;
- X-Tech production is not valid;
- existing imported/persisted X-Tech state must be preserved and validated, not deleted.

The audit should recommend whether the absent-state button should be hidden vs disabled when capability is false. Current preference is **hidden**, because the capability is not user-editable yet.

---

## 6. Resource Matrix interaction

When X-Tech is absent from an outpost:

- no X-Tech row appears;
- a new `[+ X-Tech]` button appears in the **Present column** of the Inorganic section;
- only show this affordance when `xTechExtraction === true`.

When the user clicks `[+ X-Tech]`:

- add `x-tech` to `explicitResourcePresence`;
- create/show a new X-Tech row at the **bottom of the Inorganic section**;
- Present is already ON;
- Producing is available but initially OFF;
- this must be one normal undoable edit.

When the X-Tech row exists:

```text
Present ON + Producing OFF
    -> X-Tech is explicitly present but not locally produced

Present ON + Producing ON
    -> X-Tech is locally produced / realized supply
```

If Present is turned OFF:

- remove `x-tech` from `explicitResourcePresence`;
- remove active X-Tech production if present;
- remove the row;
- perform this atomically as one undoable action.

---

## 7. Present semantics

For ordinary inorganic resources:

```text
Present
    -> derived from body/biome/atmosphere availability
```

For X-Tech:

```text
Present
    -> derived from outpost.explicitResourcePresence containing x-tech
```

Both should feed the same downstream **resource-is-Present** concept where appropriate.

The audit should identify the cleanest centralized seam for this.

Do not scatter component-level `if (resourceId === 'x-tech')` logic unless unavoidable.

---

## 8. Producing semantics

Once X-Tech has explicit presence, Producing should behave like ordinary inorganic production.

Turning Producing ON should:

- create/use the normal inorganic production route/state;
- make X-Tech a realized local supply source;
- make it eligible for ordinary downstream availability logic.

Do not invent a new X-Tech-specific production model unless necessary.

---

## 9. Search semantics

Search for X-Tech should answer:

> where has the user actually incorporated X-Tech into this network?

Do **not** treat theoretical universal extractability as `PRESENT`.

Expected flags:

```text
explicit X-Tech row, not producing
    -> PRESENT

explicit X-Tech row + producing
    -> PRESENT + PRODUCING
```

An outpost without explicit X-Tech presence must not receive `PRESENT` merely because the character capability is true.

Other real states may still make X-Tech appear in Search:

```text
IMPORTING
EXPORTING
PLANNED SUPPLY
```

Search remains active-network only and follows existing live-derived semantics.

---

## 10. Downstream local availability

X-Tech should follow the same downstream availability rule as ordinary inorganic resources:

- Present alone means the resource exists/is tracked at the outpost;
- Producing makes it a realized local supply source;
- imports remain a realized source;
- Planned Supply remains virtual/planned supply under existing rules.

The audit must identify the exact existing helper(s) that define these distinctions and how X-Tech should plug into them.

---

## 11. Planned Supply

X-Tech should behave like an ordinary Planned Supply item once runtime-enabled.

No special dependency semantics.

It must appear in the existing **special strip** by appending it after whatever is currently there.

Current rule:

> take the existing special-strip order and append X-Tech.

Do not reorder existing special-strip items.

Canonical `Unique` rarity does not determine its strip placement; tracker policy does.

---

## 12. X-Tech tooltip/help

The X-Tech row should receive distinct explanatory help because its presence rule is exceptional.

The audit should identify:

- current status-tooltip/help seams;
- which message(s) should be X-Tech-specific;
- how to keep wording localized.

Producing tooltip may reuse ordinary production wording once X-Tech is explicitly present.

---

## 13. Validation

Do not create excessive X-Tech validation.

At minimum audit a rule for:

```text
X-Tech explicitly present and xTechExtraction === false
X-Tech producing and xTechExtraction === false
```

These states should be preserved and warned about.

Also inspect whether impossible internal states such as:

```text
X-Tech producing but not explicitly present
```

can exist through import/migration/manual JSON editing, and recommend whether validation should flag them.

Do not silently repair these states.

---

## 14. History

All X-Tech user edits participate in ordinary global Undo/Redo:

```text
add X-Tech
remove X-Tech
toggle X-Tech production
Planned Supply X-Tech changes
cargo X-Tech changes
```

The add/remove operations must use existing immutable collection/session history architecture.

No special X-Tech history mechanism.

---

## 15. Import / future-save resilience

If imported data contains X-Tech state while:

```text
xTechExtraction === false
```

preserve it and validate.

Do not strip or rewrite it.

If imported data contains `x-tech` before feature enablement or from a future version, follow the established non-destructive unknown/stale-data philosophy as appropriate.

The audit should determine what changes once `x-tech` becomes a known runtime resource.

---

# PART D — KEY ARCHITECTURE QUESTIONS

The audit must explicitly answer the following.

## 16. Character capability model

1. Where is character state currently modeled?
2. What is the cleanest exact shape for a general capability/buff container?
3. Should this be:
   - a typed object,
   - a typed collection,
   - another existing domain pattern?
4. How should `xTechExtraction` default to `true` for:
   - new networks;
   - existing stored networks;
   - imported older schemas?
5. Does adding the capability field require a network schema version bump?
6. If yes, what is the smallest safe migration?
7. If no, how is the default supplied without ambiguity?
8. How will future capabilities be added without repeated schema churn?

Prefer a typed model over an open-ended string/boolean bag unless the existing architecture clearly favors the latter.

---

## 17. Explicit resource presence model

1. Where should `explicitResourcePresence` live in the Outpost model?
2. What exact type should it use?
3. Should it store:
   - resource IDs only,
   - `CargoItem`-like typed identities,
   - another existing resource identity type?
4. Should the model be inorganic-only or generic across resource categories?
5. How should duplicates/unknown IDs be handled?
6. Does this field require a persisted schema migration?
7. What default should existing outposts receive?
8. How should import/export serialize it?

The semantic target remains narrow:

> explicit presence independent of canonical planetary occurrence.

---

## 18. Centralized presence resolver

Identify the best place to answer:

```text
is resource Present at this outpost?
```

The resolver should combine:

```text
ordinary canonical occurrence presence
+
explicitResourcePresence
```

without confusing Present with realized supply.

Determine whether an existing helper can be extended or whether a new domain helper is warranted.

Audit all current consumers that should use this unified resolver.

---

## 19. Matrix row construction

Determine:

- where inorganic matrix rows are built;
- how ordinary rows are sourced/sorted;
- how X-Tech can be appended last without disturbing normal resource ordering;
- how `[+ X-Tech]` fits the Present column structurally;
- how row removal should dispatch a single atomic edit;
- whether current Matrix component ownership permits this cleanly.

Do not redesign the Matrix.

---

## 20. Production route compatibility

Determine whether:

```ts
{ type: 'inorganic'; resourceId: 'x-tech' }
```

can already represent X-Tech production unchanged.

If so, use it.

If not, explain precisely why.

Audit all validation/availability helpers that interpret inorganic production routes.

---

## 21. Search integration

Inspect current Search result derivation and answer:

- what currently qualifies `PRESENT`;
- how to make `PRESENT` use the unified explicit/occurrence presence concept;
- what qualifies `PRODUCING`;
- whether X-Tech will naturally gain IMPORTING / EXPORTING / PLANNED SUPPLY flags once it is in runtime reference data;
- whether any current catalogue filtering blocks `x-tech`;
- how locale/abbreviation matching behaves.

Avoid X-Tech-only Search conditionals if a unified presence helper can solve it.

---

## 22. Planned Supply runtime enablement

X-Tech is currently `special-deferred` in tracker policy and not emitted to ordinary runtime surfaces.

Audit the smallest change required to:

- emit X-Tech as a known runtime resource;
- place it explicitly in Planned Supply special strip;
- keep Aqueous Hematite and Caelumite excluded;
- avoid accidental ordinary family topology;
- expose it to Search only once the feature is implemented.

Determine whether tracker disposition needs a new value such as:

```text
special-enabled
```

or whether the current policy can express this another clean way.

Do not expose the other excluded resources.

---

## 23. Validation architecture

Identify the best existing validation-rule family for:

```text
X-Tech present without capability
X-Tech producing without capability
X-Tech producing without explicit presence
```

Recommend severity for each.

Likely preference:

```text
warning
```

for capability mismatch unless architecture/domain precedent indicates otherwise.

Do not invent errors merely because X-Tech is exceptional.

---

## 24. Tooltip / localization architecture

Find the current tooltip/help generation seam for Matrix Present/Producing states.

Recommend exact localization key ownership.

The X-Tech Present help should explain the exceptional rule, conceptually:

```text
X-Tech can be extracted at any outpost once X-Tech extraction is available.
```

or better wording consistent with current UX.

Do not hard-code English in the component.

---

# PART E — PERSISTENCE / MIGRATION

## 25. Schema impact

The audit must determine whether adding:

```text
character.capabilities
outpost.explicitResourcePresence
```

requires:

```text
network schema bump
collection migration
storage migration
import migration
```

Do not assume either answer.

Explain the safest approach under the current migration architecture.

---

## 26. Defaults

Settled default:

```text
xTechExtraction = true
```

Existing outposts:

```text
explicitResourcePresence = []
```

unless current architecture supports omitted/derived defaults more safely.

The audit should recommend whether those defaults are materialized during migration or supplied by readers/default constructors.

---

## 27. Non-destructive behavior

Preserve current philosophy:

> invalid/stale selections are retained and validated rather than silently deleted.

This applies if:

- capability later becomes false;
- an imported save has X-Tech production without presence;
- an imported save contains unknown explicit resource IDs.

---

# PART F — UI DETAILS TO AUDIT

## 28. `[+ X-Tech]` affordance

Target visual location:

```text
Inorganic section
Present column
```

When X-Tech absent and capability true.

Audit how to implement this without:

- adding a permanent blank row;
- changing column geometry;
- making the control visually louder than resource buttons;
- affecting Matrix/Cargo alignment.

This is an architecture audit, not a visual redesign.

---

## 29. X-Tech row position

Always append X-Tech to the bottom of the Inorganic section.

Do not fold it into alphabetical/rarity/family sorting.

The row remains visually ordinary once added, aside from exceptional tooltip/help.

---

## 30. Present-off removal behavior

Audit the cleanest atomic edit path for:

```text
remove x-tech from explicitResourcePresence
+
remove x-tech inorganic production route if active
```

This should create one history entry.

Do not let component-level sequential updates create multiple history entries.

---

# PART G — TEST PLAN

The audit should recommend exact automated coverage.

At minimum:

## Model / migration

```text
new network capability defaults true
old network migrates/defaults safely
outpost explicitResourcePresence defaults empty
round-trip serialization preserves both
unknown explicit resource IDs are preserved
```

## Matrix

```text
capability true + no explicit X-Tech -> [+ X-Tech]
capability false + no explicit X-Tech -> no add affordance
add X-Tech -> row appears last, Present ON, Producing OFF
Present OFF -> row removed and production cleared atomically
Undo/Redo restores complete state
```

## Availability

```text
explicit present only -> Present true, realized local supply false
explicit present + production -> realized local supply true
ordinary inorganic presence unchanged
```

## Search

```text
no explicit state -> no PRESENT
explicit row -> PRESENT
explicit row + production -> PRESENT + PRODUCING
import/export/planned flags continue to work
theoretical global capability never causes all-outpost PRESENT
```

## Planned Supply

```text
X-Tech appended after current special-strip items
Aqueous Hematite absent
Caelumite absent
existing special order unchanged
```

## Validation

```text
capability false + explicit present -> issue
capability false + production -> issue
production without explicit presence -> issue if recommended
state preserved, not auto-repaired
```

## Localization / tooltips

```text
X-Tech name/XT resolve through reference data
exceptional help text localized
ordinary producing tooltip reused where appropriate
```

---

# PART H — MANUAL BROWSER CHECKS

Recommend focused browser checks for:

```text
adding/removing X-Tech row
row always last in Inorganic
Present/Producing button states
Undo/Redo
Search result flags
Planned Supply placement
cargo availability after production
locale switch
network switch
import/reload persistence
capability-false synthetic fixture if no UI control exists
```

Do not require a temporary visible capability UI merely for testing.

---

# PART I — QUESTIONS THE REPORT MUST ANSWER

The final audit must explicitly answer:

1. What exact model shape should represent character capabilities?
2. What exact model shape should represent `explicitResourcePresence`?
3. Does either require a schema version bump?
4. How are defaults applied to old/new networks?
5. What is the centralized domain seam for resource Present semantics?
6. Which current consumers need to change to use it?
7. Can existing inorganic production routes represent X-Tech unchanged?
8. How should add/remove X-Tech be implemented as atomic history edits?
9. How should the Matrix append X-Tech last without changing ordinary sorting?
10. Where should `[+ X-Tech]` be rendered and owned?
11. How should capability false affect the add affordance?
12. How should capability mismatch be validated?
13. Should production-without-explicit-presence be validated, and at what severity?
14. How will Search `PRESENT` distinguish explicit presence from theoretical ubiquity?
15. Which Search flags will work automatically once X-Tech is a runtime resource?
16. How should tracker policy change from `special-deferred` to runtime-enabled?
17. What explicit Planned Supply placement/order should X-Tech receive?
18. How do we keep Aqueous Hematite and Caelumite excluded?
19. What tooltip/localization changes are needed?
20. What exact files are likely to change during implementation?
21. What is the safest staged implementation sequence?
22. What migration/persistence regressions are highest risk?
23. Are there any unresolved design questions that should block implementation?

---

# PART J — REQUIRED REPORT STRUCTURE

Write:

```text
docs/audits/codex-x-tech-architecture-audit.md
```

Use these sections:

## 1. Executive conclusion

State whether the feature fits current architecture cleanly and summarize the recommended shape.

## 2. Current resource-presence architecture

Trace ordinary inorganic presence from canonical occurrence through Matrix/Search/availability.

## 3. Character capability model

Recommend exact shape/default/migration.

## 4. Explicit resource presence model

Recommend exact type/location/serialization.

## 5. Unified Present semantics

Identify helper/seam and consumers.

## 6. X-Tech production integration

Explain reuse of normal inorganic production.

## 7. Resource Matrix integration

Explain add affordance, row insertion/removal, ordering, ownership.

## 8. Search integration

Explain exact flag derivation.

## 9. Planned Supply integration

Explain tracker-policy/runtime changes and special-strip placement.

## 10. Validation

Recommend rules/severity/preservation behavior.

## 11. Tooltip/localization

Identify message ownership and current seams.

## 12. History / atomic edits

Explain add/remove/toggle history behavior.

## 13. Persistence / migration

State exact schema/migration implications.

## 14. Test plan

Separate automated and manual checks.

## 15. Likely implementation files

List actual paths.

## 16. Recommended implementation sequence

Provide low-risk staged order.

## 17. Risks / blockers / open questions

Only genuine unresolved matters.

---

# PART K — OUT OF SCOPE

Do not:

```text
implement code
modify schema
modify tracker policy
enable X-Tech runtime visibility
add [+ X-Tech]
add character UI
add Show Hidden
expose Aqueous Hematite
expose Caelumite
change ordinary biome/atmosphere occurrence semantics
change Search UX
redesign Planned Supply
commit
push
```

This is an architecture audit only.

---

# PART L — VERIFICATION

Because this is read-only:

- no product-code changes;
- no source/policy changes;
- no generated-data changes;
- no commit or push.

`git diff --check` and `git status --short` may be used.

Tests/build/lint are not required unless needed to establish an architectural fact.

Report exactly what was and was not run.

---

## Final instruction

Audit X-Tech as a **narrow exception to resource presence**, not as a separate resource class.

The intended domain model is:

```text
ordinary presence
    -> canonical body/biome/atmosphere occurrence

explicit presence
    -> outpost.explicitResourcePresence

capability
    -> character.capabilities.xTechExtraction

producing
    -> existing inorganic production route

downstream availability
    -> existing realized-supply semantics

Search / Planned Supply / validation
    -> consume those same domain facts
```

The goal is to add X-Tech without spreading ad-hoc `x-tech` conditionals throughout the application and without weakening the distinction between canonical source truth and explicit user-added presence.

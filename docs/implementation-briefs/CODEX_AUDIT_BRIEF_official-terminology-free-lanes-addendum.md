# CODEX AUDIT BRIEF — Official Terminology Addendum: Free Lanes Evidence and Cargo-Link Presentation Alignment

## Purpose

Perform a focused terminology addendum audit before implementing the Japanese semantic-terminology pass.

Two product decisions are now settled:

1. `SFBGS050.esm` (Free Lanes) is admitted as an **official terminology-evidence source**.
2. The tracker will retire the presentation labels **Cargo Pad** and **Interstellar** in favor of Bethesda’s official terminology:
   - `Cargo Link`
   - `Inter-System Cargo Link`
   - `Inter-System`

This audit should verify and preserve the relevant official evidence, especially for **X-Tech Power Core**, and define the smallest safe implementation changes.

Do **not** change the tracker’s internal domain model.

Do **not** implement catalogue/runtime/UI changes yet.

Do **not** commit or push.

Write the report to:

```text
docs/audits/codex-official-terminology-free-lanes-addendum-audit.md
```

---

# Naming guidance

Avoid transient roadmap identifiers such as:

```text
D3
C7
C8
```

in durable implementation names.

Use functional terminology such as:

```text
official terminology
Free Lanes terminology evidence
cargo-link presentation terminology
semantic localization
```

Historical audit prose may retain older labels where needed for chronology.

---

# Scope classification

**Small focused terminology addendum audit.**

Expected work:

- inspect `SFBGS050.esm` official localization tables;
- search for `X-Tech Power Core` and related phrases;
- verify whether the earlier terminology conclusion changes;
- inventory any other relevant Free Lanes terminology that intersects the deferred semantic-message set;
- define the presentation migration from tracker-owned Cargo Pad / Interstellar wording to official Cargo Link / Inter-System wording;
- recommend updates to the durable terminology-provenance artifact planned by the prior audit.

No runtime, persistence, history, schema, import/export, or domain-model changes.

---

# Source-universe distinction

Preserve an explicit distinction between:

## Canonical tracker-content sources

These remain:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

They continue to define the current canonical reference-name/provenance population for:

- systems;
- bodies;
- biomes;
- flora/fauna;
- resources;
- products;
- skills.

## Official terminology-evidence sources

These now include:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

`SFBGS050.esm` is admitted **for official terminology evidence**.

Do not automatically promote all Free Lanes entities into the canonical tracker-content population merely because the plugin is now searchable for terminology.

This distinction must remain explicit in the audit and later implementation guidance.

---

# Core audit question

The addendum should answer:

> Does Free Lanes provide authoritative English/Japanese localization evidence for `X-Tech Power Core` and any other currently unresolved tracker terminology, and how should that evidence alter the terminology registry and Japanese semantic-localization plan?

---

# Audit question 1 — X-Tech Power Core

Search `SFBGS050.esm` official English/Japanese localization for:

```text
X-Tech Power Core
X-Tech Power Cores
Power Core
X-Tech core
related obvious grammatical/plural variants
```

Search across:

```text
strings
dlstrings
ilstrings
```

and inspect record context where identifiable.

If found, preserve:

```text
TermId
EvidenceKind
SourcePlugin
RecordSignature, if applicable
RecordFormID, if applicable
FieldPath, if applicable
NameSourcePlugin
StringTable
StringID
OfficialEnglish
OfficialJapanese
Context
ContextNotes
Confidence
```

Preferred durable term:

```text
term.x-tech-power-core
```

Do not infer from substring similarity alone.

---

# Audit question 2 — X-Tech terminology family

Compare Free Lanes evidence with the already-established:

```text
term.x-tech
```

from:

```text
SFBGS00D.esm
```

Determine whether:

- `X-Tech` remains independently canonical;
- `X-Tech Power Core` is a separate official term;
- Japanese orthography is consistent;
- any Free Lanes context changes how the tracker should phrase X-Tech extraction capability messages.

Do not merge distinct official terms just because they share `X-Tech`.

---

# Audit question 3 — other Free Lanes terminology relevant to the tracker

Search Free Lanes localization for terms already appearing in the deferred semantic-message population, especially:

```text
Outpost
Cargo Link
Inter-System Cargo Link
Inter-System
Biome
Planet
Planetary Body
Star System
Starfield
```

The purpose is not to redo the whole terminology audit.

Instead, identify whether `SFBGS050.esm` adds:

- stronger standalone evidence;
- exact tracker-domain phrasing;
- useful alternative context;
- contradictions with the existing terminology audit.

Report only relevant additions/changes.

---

# Audit question 4 — Cargo Pad retirement

The product decision is now:

> `Cargo Pad` is retired from presentation terminology.

The internal domain model may continue to use:

```text
CargoPad
cargoPadId
cargoPads
```

for implementation clarity.

But user-facing English terminology should align with Bethesda.

Audit all semantic-message keys and visible presentation strings that currently use:

```text
Cargo Pad
cargo pad
cargo pads
```

Classify each as one of:

```text
REPLACE_WITH_CARGO_LINK
REPLACE_WITH_INTER_SYSTEM_CARGO_LINK
REPHRASE_AROUND_LINK_ENDPOINT
INTERNAL_ONLY_NO_CHANGE
```

Do not implement the changes yet.

---

# Audit question 5 — Interstellar retirement

The product decision is also:

> Presentation wording `Interstellar` should be retired where it refers to Bethesda’s cargo-link construct.

Use official terminology:

```text
Inter-System
Inter-System Cargo Link
```

Audit all current user-facing semantic-message keys/labels containing:

```text
Interstellar
interstellar
```

Classify each into:

```text
REPLACE_WITH_INTER_SYSTEM
REPLACE_WITH_INTER_SYSTEM_CARGO_LINK
GENERIC_ASTRONOMICAL_INTERSTELLAR_KEEP
INTERNAL_ONLY_NO_CHANGE
```

The tracker may still use an internal boolean/property named `interstellar` if changing it would create unnecessary domain churn.

Do not rename internal domain fields during this terminology pass unless a later dedicated refactor is explicitly approved.

---

# Audit question 6 — exact semantic-message migration set

Produce a complete row-level list of semantic-message keys affected by the Cargo Pad / Interstellar terminology migration.

For each:

```text
MessageKey
Current English
Current Japanese
Current terminology
Recommended English
Recommended Japanese
MigrationClass
Notes
```

Examples likely include:

```text
cargo.add
cargo.addButton
cargo.addWithLimit
cargo.destination.noPads
cargo.destination.pad
cargo.destination.selectPad
cargo.destination.unknownPad
cargo.finishReshuffle
cargo.heading
cargo.interSystem.context
cargo.reshuffle
help.interSystem
status.import.invalidCargoPad
validation.cargoPadLinkedMultiple
validation.cargoPadSkillLimit
validation.duplicateOutboundItem
validation.interstellarHelium3
validation.missingCargoEndpoint
validation.regularPadCrossSystem
validation.selfLinkedCargoPad
validation.unknownOutboundItem
```

Do not assume this list is complete; search actual catalogues/code.

---

# Audit question 7 — UI-context simplification opportunities

Where the presentation migration exposes awkward or overlong strings, identify low-risk opportunities for later UI hardening.

Examples:

```text
+ Add Cargo Link
+ Add
+
```

But this audit must only flag such opportunities.

Do not decide or implement button-label simplification here unless it is required to preserve semantic correctness.

The already-discussed `+ Add` / `+` idea belongs to later UI hardening.

---

# Audit question 8 — official terminology registry impact

The previous audit proposed:

```text
reference-source/official-terminology-provenance.csv
```

Update the recommended registry design to support:

```text
SFBGS050.esm
```

as a terminology-evidence source.

The registry should preserve source-universe role, for example with a field such as:

```text
SourceUse
```

or equivalent values like:

```text
canonical-content
terminology-evidence
```

if useful.

However, do not overcomplicate the schema if the distinction is already obvious from policy/docs.

The important rule is:

> Free Lanes terminology evidence must not accidentally make all Free Lanes content canonical tracker reference data.

---

# Audit question 9 — durable source policy

Recommend the smallest durable policy/documentation update needed to express:

```text
canonical content source allowlist
!=
terminology evidence source allowlist
```

Prefer clear functional names.

Possible policy shape:

```json
{
  "canonicalContentPlugins": [
    "Starfield.esm",
    "ShatteredSpace.esm",
    "SFBGS00D.esm"
  ],
  "terminologyEvidencePlugins": [
    "Starfield.esm",
    "ShatteredSpace.esm",
    "SFBGS00D.esm",
    "SFBGS050.esm"
  ]
}
```

This is conceptual only.

Audit whether an existing policy/config file is the right place or whether terminology should have its own small policy artifact.

Do not implement policy changes during the audit.

---

# Audit question 10 — Japanese terminology consequences

For every terminology conclusion changed by Free Lanes evidence, state the exact Japanese consequence.

At minimum determine:

```text
term.x-tech-power-core
```

and any cargo-link wording strengthened by Free Lanes.

Do not change Japanese catalogue files during the audit.

---

# Audit question 11 — future-language reuse

State how the new Free Lanes-qualified evidence will help future locales.

Expected pattern:

```text
same TermId
same qualified Free Lanes string identity
+ French/German/etc. Free Lanes table
-> official localized term
```

Where context extraction is still required, state that explicitly.

---

# Audit question 12 — implementation boundary

End with the smallest recommended implementation scope.

Expected likely implementation work:

1. add/update durable terminology provenance artifact;
2. admit `SFBGS050.esm` as terminology-evidence source only;
3. revise `term.x-tech-power-core` from tracker-owned to official if evidence exists;
4. update Japanese semantic messages using official terminology;
5. migrate presentation copy from Cargo Pad -> Cargo Link;
6. migrate cargo-related Interstellar -> Inter-System;
7. leave internal domain names untouched;
8. update tests/review evidence.

Do not include:

- reference-name runtime architecture changes;
- persistence/history/schema work;
- font/layout/search/collation work;
- button-label simplification;
- canonical Free Lanes entity ingestion.

---

# Required report tables

## Free Lanes evidence summary

```text
TermId
Found?
EvidenceKind
SourceIdentity
OfficialEnglish
OfficialJapanese
Context
ChangesPriorConclusion?
```

## Cargo terminology migration

```text
MessageKey
CurrentEnglish
RecommendedEnglish
CurrentJapanese
RecommendedJapanese
MigrationClass
```

## Source policy summary

```text
Plugin
CanonicalContentSource?
TerminologyEvidenceSource?
Notes
```

---

# Evidence standards

Prefer:

1. exact standalone qualified Free Lanes string identity;
2. exact contextual qualified string identity;
3. multiple corroborating official contexts;
4. explicit absence result.

Do not use:

- unofficial wiki text as authority;
- machine translation as authority;
- fuzzy English search without source identity;
- inferred Japanese terminology with no official evidence.

---

# Temporary diagnostics

If needed, place diagnostics under:

```text
.local-work/localization/terminology-free-lanes-audit/
```

Do not commit Bethesda localization dumps.

Do not alter tracked semantic catalogues during the audit.

---

# Non-goals

Do not:

- implement the terminology migration;
- change generated Japanese reference-name artifacts;
- change canonical content provenance;
- add Free Lanes systems/bodies/resources/products to tracker reference data;
- rename `CargoPad` domain types/fields;
- rename internal `interstellar` flags/properties;
- simplify `+ Add ...` buttons;
- change search/fonts/layout/collation;
- touch persistence/history/import/export/schema;
- add mod/Creation support.

---

# Verification

Run repository-safe checks needed for the audit.

At minimum:

```text
git diff --check
```

If diagnostics inspect `SFBGS050.esm`, report:

- exact localization archive/table sources;
- string IDs inspected;
- diagnostic location;
- whether the plugin is present only as terminology evidence.

No production artifact should be regenerated or changed.

---

# Audit disposition

End with one of:

## Outcome A — Free Lanes closes the terminology gap

Use if `X-Tech Power Core` and any related unresolved terms gain stable official evidence.

Recommend a focused implementation pass.

## Outcome B — partial improvement

Use if Free Lanes adds useful evidence but some tracker terminology remains manual/contextual.

Recommend mixed official-provenance + tracker-owned wording.

## Outcome C — no material change

Use if Free Lanes does not contain authoritative evidence for the suspected terms.

Retain prior terminology conclusions and proceed with tracker-owned adjudication.

---

# Final report requirements

The report must state:

1. whether `X-Tech Power Core` is officially present in Free Lanes;
2. exact qualified source identity if found;
3. official Japanese value;
4. any other terminology conclusions changed by Free Lanes evidence;
5. complete Cargo Pad -> Cargo Link presentation migration set;
6. complete cargo-related Interstellar -> Inter-System migration set;
7. whether internal `CargoPad`/`interstellar` domain names can remain unchanged;
8. recommended terminology-evidence source policy;
9. future-language reuse model;
10. smallest implementation scope;
11. whether any blocker remains before implementation.

Do not proceed to implementation unless separately instructed.

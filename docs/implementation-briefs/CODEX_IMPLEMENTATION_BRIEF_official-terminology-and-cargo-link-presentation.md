# CODEX IMPLEMENTATION BRIEF — Official Terminology Provenance and Cargo-Link Presentation Alignment

## Purpose

Implement the official-terminology work established by the completed terminology audit and Free Lanes addendum.

This slice should:

- add a durable terminology-evidence policy;
- add durable official-terminology provenance;
- admit `SFBGS050.esm` as **terminology evidence only**;
- preserve `SFBGS050.esm` as **non-canonical for tracker reference-content ingestion**;
- formalize `X-Tech Power Core` as an official Bethesda term;
- migrate user-facing Cargo Pad terminology to Cargo Link terminology;
- migrate cargo-related Interstellar wording to Inter-System wording;
- apply the Japanese terminology corrections supported by the audits;
- update tests and tracked localization-review evidence.

Do **not** rename the internal cargo domain model.

Do **not** broaden canonical tracker reference data to Free Lanes content.

Do **not** include Japanese search/font/layout/collation hardening.

Do **not** simplify `+ Add ...` buttons in this slice.

Do **not** commit or push.

---

# Naming guidance

Avoid transient roadmap identifiers such as:

```text
D3
C7
C8
```

in durable code, filenames, config keys, functions, exports, or generated artifact names.

Use functional names such as:

```text
official terminology
terminology provenance
terminology policy
cargo link
inter-system cargo link
```

Historical audit prose may retain roadmap labels where they document past planning.

---

# Scope classification

**Medium focused semantic-localization implementation.**

Expected touched areas:

- `reference-source/official-terminology-policy.json`;
- `reference-source/official-terminology-provenance.csv`;
- terminology verifier/tests;
- English semantic catalogue;
- Japanese semantic catalogue;
- Japanese review-source evidence;
- localization tests;
- selected validation/help/history/UI expectations;
- localization architecture/documentation.

Do not modify:

- canonical reference-name provenance population;
- generated Japanese reference-name overlay;
- persistence schemas;
- domain model types;
- import/export schemas;
- history snapshot structures;
- search behavior;
- fonts/layout;
- collation;
- accessibility;
- button-label shortening.

---

# Source-of-truth audits

The implementation must follow the current conclusions of:

```text
docs/audits/codex-official-terminology-semantic-localization-audit.md
docs/audits/codex-official-terminology-free-lanes-addendum-audit.md
```

Where the Free Lanes addendum conflicts with the earlier terminology audit, the **Free Lanes addendum supersedes it**.

In particular, superseded conclusions include:

- `X-Tech Power Core` is **not** tracker-owned;
- it is an official Free Lanes term;
- `バイオーム` is officially attested and should not be globally replaced merely because the earlier audit preferred `生態系`.

---

# Source-universe policy

Create a durable terminology-owned policy file:

```text
reference-source/official-terminology-policy.json
```

Recommended shape:

```json
{
  "schemaVersion": 1,
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

The exact JSON organization may vary slightly if repository conventions require it, but the two allowlists must remain explicit and functionally named.

## Critical invariant

```text
terminologyEvidencePlugins
!=
canonicalContentPlugins
```

`SFBGS050.esm` is terminology evidence only.

Do not feed the terminology allowlist into canonical reference-name or provenance builders.

Do not modify the meaning of the existing canonical localization-provenance policy to include Free Lanes.

---

# Terminology provenance artifact

Add:

```text
reference-source/official-terminology-provenance.csv
```

Use **one row per evidence occurrence**.

Recommended columns:

```text
EvidenceId
TermId
CanonicalEnglish
EvidenceKind
SourceUse
SourcePlugin
RecordSignature
RecordFormID
FieldPath
NameSourcePlugin
StringTable
StringID
OfficialEnglish
OfficialJapanese
Context
ContextNotes
Confidence
RecommendedDefaultForJaJP
Notes
```

Nullable record fields are valid for string-table-only contextual evidence.

Do not pack multiple source identities into one cell.

---

# SourceUse values

Support at least:

```text
canonical-content
terminology-evidence-only
```

Rules:

- evidence sourced from `Starfield.esm`, `ShatteredSpace.esm`, or `SFBGS00D.esm` may use `canonical-content`;
- evidence sourced from `SFBGS050.esm` must use `terminology-evidence-only`;
- a `terminology-evidence-only` row must never imply canonical runtime entity ingestion.

---

# Required terminology rows

Populate the registry from the completed audits.

At minimum preserve evidence for:

```text
term.outpost
term.cargo-link
term.inter-system-cargo-link
term.inter-system
term.biome
term.planet
term.planetary-body
term.star-system
skill.outpost-management
skill.outpost-engineering
skill.planetary-habitation
skill.research-methods
skill.special-projects
term.x-tech
term.x-tech-power-core
term.starfield
term.moon
term.orbital
```

Include absence/context rows where the audit explicitly treats absence or contextual evidence as meaningful.

Do not create `term.cargo-pad` as an active presentation term merely to preserve obsolete wording.

If an absence-history row is useful for audit continuity, make that status explicit rather than treating it as a supported term.

---

# X-Tech Power Core provenance

The registry must include the exact official standalone identity:

```text
EvidenceId:           term.x-tech-power-core.item-name
TermId:               term.x-tech-power-core
CanonicalEnglish:     X-Tech Power Core
EvidenceKind:         standalone
SourceUse:            terminology-evidence-only
SourcePlugin:         SFBGS050.esm
RecordSignature:      MISC
RecordFormID:         02031E18
FieldPath:            topLevel.FULL
NameSourcePlugin:     SFBGS050.esm
StringTable:          strings
StringID:             000011E5
OfficialEnglish:      X-Tech Power Core
OfficialJapanese:     X-テックパワーコア
Context:               Free Lanes inventory/build-enabling item
Confidence:            HIGH
```

Preserve additional contextual Free Lanes evidence where useful, especially the outpost-domain usages.

Do not merge:

```text
term.x-tech
term.x-tech-power-core
```

They are distinct official terms.

---

# Terminology verifier

Add a repository-only verifier/test for:

```text
reference-source/official-terminology-policy.json
reference-source/official-terminology-provenance.csv
```

At minimum validate:

- schema version;
- allowed `EvidenceKind` values;
- allowed `SourceUse` values;
- unique `EvidenceId`;
- non-empty `TermId`;
- plugin allowlist membership;
- `SourceUse` compatibility with plugin role;
- uppercase 8-hex `RecordFormID` when present;
- uppercase 8-hex `StringID` when present;
- valid string-table values:
  - `strings`
  - `dlstrings`
  - `ilstrings`
- required paired official text where a source identity exists;
- nullable record fields only where evidence kind/context permits;
- no Free Lanes row marked `canonical-content`;
- no unsupported plugin appears in terminology provenance.

Do not require game files for ordinary repository verification.

Installed-game regeneration/validation can remain a separate developer workflow if needed.

---

# Optional terminology scripts

If the repository benefits from a small terminology verification/build script, use durable names such as:

```text
scripts/localization/verify-official-terminology.mjs
scripts/localization/build-official-terminology.mjs
```

Avoid roadmap labels.

Do not build a broad Bethesda string browser.

The terminology tooling should remain narrow and manifest/policy driven.

---

# Cargo Pad presentation migration

The user-facing term `Cargo Pad` is retired.

Internal domain identifiers remain unchanged.

## Keep internal names

Do **not** rename:

```text
CargoPad
CargoPadId
cargoPads
cargoPadId
cargo.pad.*
interstellar
getInterstellarFuelState
InterstellarFuelState
CargoPad component names
cargo-pad CSS classes
history/action implementation identifiers
import diagnostics
```

unless a particular internal literal is genuinely user-facing.

Semantic message keys may remain stable even when their displayed value changes.

---

# Official presentation terms

Use:

```text
Cargo Link
Inter-System Cargo Link
Inter-System
```

Japanese:

```text
貨物リンク
星系間貨物リンク
星系間
```

Use natural sentence grammar rather than token substitution.

---

# Required 26-key migration

Apply the exact migration set established by the addendum audit.

## Cargo UI

### `cargo.heading`

English:

```text
Cargo Links
```

Japanese:

```text
貨物リンク
```

### `cargo.add`

English:

```text
Add cargo link
```

Japanese:

```text
貨物リンクを追加
```

### `cargo.addButton`

English:

```text
+ Add Cargo Link
```

Japanese:

```text
＋ 貨物リンクを追加
```

Do not shorten this to `+ Add` or `+` in this slice.

### `cargo.addWithLimit`

English:

```text
Add cargo link ({count} of {limit})
```

Japanese:

```text
貨物リンクを追加（{count}/{limit}）
```

### `cargo.reshuffle`

English:

```text
Reshuffle cargo links
```

Japanese:

```text
貨物リンクを並べ替え
```

### `cargo.finishReshuffle`

English:

```text
Finish reshuffling cargo links
```

Japanese:

```text
貨物リンクの並べ替えを完了
```

---

## Destination copy

### `cargo.destination.pad`

```text
Destination cargo link
搬送先の貨物リンク
```

### `cargo.destination.noPads`

```text
{outpost} — no cargo links
{outpost} — 貨物リンクなし
```

### `cargo.destination.selectPad`

```text
Select cargo link...
貨物リンクを選択...
```

### `cargo.destination.unknownPad`

```text
Unknown cargo link
不明な貨物リンク
```

### `cargo.destination.unknownPadInline`

```text
unknown cargo link
不明な貨物リンク
```

---

## Inter-System copy

### `cargo.interSystem.context`

English:

```text
Inter-System Cargo Links
```

Japanese:

```text
星系間貨物リンク
```

### `cargo.interstellar`

English:

```text
Inter-System Cargo Link
```

Japanese:

```text
星系間貨物リンク
```

The message key may remain `cargo.interstellar`.

---

## Cargo-link ordinal/count copy

### `cargo.pad.summary`

English:

```text
Cargo Link {ordinal}
```

Japanese:

```text
貨物リンク{ordinal}
```

### `cargo.pad.count`

English:

```text
{count} {count, plural, one {cargo link} other {cargo links}}
```

Japanese:

```text
{count}件の貨物リンク
```

Preserve valid ICU syntax.

### `validation.context.pad`

English:

```text
Cargo Link {ordinal}
```

Japanese:

```text
貨物リンク{ordinal}
```

---

## Help/status/validation copy

### `help.interSystem`

English:

```text
Inter-System Cargo Links can connect outposts in different star systems and require Helium-3.
```

Japanese:

```text
星系間貨物リンクは異なる星系の拠点同士を接続でき、He-3を必要とします。
```

### `status.import.invalidCargoPad`

English:

```text
The selected file contains an invalid cargo link.
```

Japanese:

```text
選択したファイルに無効な貨物リンクが含まれています。
```

### `validation.cargoPadLinkedMultiple`

English:

```text
This Cargo Link has more than one connection.
```

Japanese:

```text
この貨物リンクには複数の接続が設定されています。
```

### `validation.cargoPadSkillLimit`

English:

```text
This outpost has {count} cargo links, but the current {skill} level allows a maximum of {limit}.
```

Japanese:

```text
この拠点の貨物リンク数は{count}ですが、現在の{skill}レベルでは最大{limit}です。
```

### `validation.duplicateOutboundItem`

English:

```text
{item} appears more than once in this Cargo Link's outbound items.
```

Japanese:

```text
{item}がこの貨物リンクの搬出項目に複数回含まれています。
```

### `validation.interstellarHelium3`

English:

```text
This Inter-System Cargo Link is sending cargo, but its outpost has no available Helium-3 supply.
```

Japanese:

```text
この星系間貨物リンクは貨物を発送していますが、拠点で利用できるHe-3の供給がありません。
```

### `validation.missingCargoEndpoint`

English:

```text
This cargo connection refers to a missing outpost or Cargo Link endpoint.
```

Japanese:

```text
この貨物接続が、存在しない拠点または接続先の貨物リンクを参照しています。
```

### `validation.regularPadCrossSystem`

English:

```text
This Cargo Link is connected to an outpost in another star system; use an Inter-System Cargo Link instead.
```

Japanese:

```text
この貨物リンクは別の星系の拠点に接続されています。代わりに星系間貨物リンクを使用してください。
```

### `validation.selfLinkedCargoPad`

English:

```text
This cargo connection uses the same Cargo Link at both endpoints.
```

Japanese:

```text
この貨物接続では、両端に同じ貨物リンクが指定されています。
```

### `validation.unknownOutboundItem`

English:

```text
This Cargo Link refers to unknown {kind} ID "{id}" in its outbound items.
```

Japanese:

```text
この貨物リンクの搬出項目が不明な{kind} ID「{id}」を参照しています。
```

---

# Unchanged parameterized keys

The following should not need literal catalogue changes if they remain parameterized/terminology-neutral:

```text
cargo.destination.padContents
cargo.destination.padContentsLinked
cargo.destination.linkedLocator
cargo.pad.remove
cargo.pad.emptyExports
cargo.pad.noDestination
cargo.pad.linkedTo
validation.context.separator
```

Verify that `{pad}` now receives the migrated Cargo Link display label.

Do not rename these semantic keys merely because they contain `pad`.

---

# Interstellar retirement boundary

The semantic catalogue contains exactly two user-facing cargo-related `Interstellar` usages requiring migration:

```text
cargo.interstellar
validation.interstellarHelium3
```

After implementation, cargo presentation should use:

```text
Inter-System
Inter-System Cargo Link
```

Do not rename the persisted/internal discriminator:

```text
'interstellar'
```

Do not rename internal APIs purely for terminology consistency.

---

# X-Tech semantic corrections

## `matrix.tooltip.xTech.add`

Do **not** remove the Power Core concept.

The earlier no-source recommendation is superseded.

Use official terminology:

English should retain the existing concept:

```text
X-Tech Power Cores
```

Japanese should use:

```text
X-テックパワーコア
```

Natural Japanese does not need an explicit plural marker.

Keep the tracker’s boolean extraction-capability abstraction.

Do not add inventory counts or a runtime MISC reference entity.

---

# X-Tech parameterization

Preserve the existing D2 direction for the three validation messages:

```text
validation.xTechCapabilityPresent
validation.xTechCapabilityProduced
validation.xTechRequiresPresence
```

Where practical, resolve the canonical X-Tech resource display name through:

```text
resource:x-tech
```

so Japanese uses:

```text
X-テック
```

Do not hard-code `X-Tech` in Japanese semantic output if a stable reference parameter is already appropriate.

Do not parameterize `X-Tech Power Core` as a runtime reference entity unless there is a compelling existing pattern; the audit explicitly allows it to remain semantic copy backed by terminology provenance.

---

# Starfield terminology

Apply the audit-supported Japanese spelling:

```text
スターフィールド
```

for semantic messages that currently retain Latin-script `Starfield`, including at least:

```text
about.description
validation.outpostNameLength
```

Do not change English.

---

# Skill semantic fallback

Correct:

```text
character.skill.outpostEngineering
```

Japanese semantic fallback to:

```text
拠点エンジニアリング
```

Runtime official-term resolution should already return the same value.

Do not alter the five-skill runtime mapping introduced previously.

---

# Biome terminology

Do **not** globally replace:

```text
バイオーム
```

with:

```text
生態系
```

The Free Lanes addendum establishes repeated official structured-label evidence for `バイオーム`.

Biome remains context-dependent.

For the previously deferred biome messages:

- review each sentence in context;
- retain `バイオーム` where natural and consistent;
- use `生態系` or `環境` only where the sentence meaning clearly warrants it;
- do not mechanically normalize all occurrences to one Japanese word.

If no clear improvement is needed, retaining the current Japanese wording is acceptable.

Document any editorial changes in the review source.

---

# Outpost / planet / system terminology

Retain the already-supported defaults unless sentence-level grammar requires otherwise:

```text
Outpost -> 拠点
Planet -> 惑星
Star System -> 星系
Planetary Body / tracker abstraction -> 天体 where appropriate
```

Do not over-parameterize these lexical terms.

Tracker-authored sentence grammar remains locale-owned.

---

# Japanese review evidence

Update:

```text
docs/localization/ja-JP-review-source.csv
```

to reflect:

- official Cargo Link terminology;
- Inter-System terminology;
- official X-Tech Power Core terminology;
- `スターフィールド`;
- corrected Outpost Engineering fallback;
- any biome adjudication decisions.

Ensure the tracked review source is consistent with the active catalogues.

Do not rely on ignored local adjudication files as the only durable evidence.

---

# Reconcile superseded audit guidance

Update durable documentation so developers do not mistake the earlier audit’s superseded conclusions for current guidance.

At minimum note that:

- `term.x-tech-power-core` is now official via Free Lanes;
- the old “no official Power Core phrase” result was limited by the prior source universe;
- `バイオーム` has official Free Lanes evidence and is context-dependent rather than categorically wrong;
- Cargo Pad presentation terminology has been intentionally retired.

Do not rewrite history in the old audit report.

Prefer a short “superseded by addendum” note or architecture/documentation reference rather than altering historical findings in place.

---

# Tests — terminology policy/provenance

Add focused tests for:

```text
SFBGS050.esm
```

being:

```text
canonicalContentSource = false
terminologyEvidenceSource = true
```

Verify:

- `term.x-tech-power-core.item-name` has exact qualified identity;
- source use is `terminology-evidence-only`;
- official Japanese is `X-テックパワーコア`;
- `SFBGS050.esm` cannot appear as `canonical-content`;
- unsupported plugins fail verification.

---

# Tests — semantic migration

Add/update exact-message tests for representative keys:

```text
cargo.heading
cargo.addButton
cargo.interSystem.context
cargo.interstellar
cargo.pad.summary
cargo.pad.count
help.interSystem
status.import.invalidCargoPad
validation.cargoPadLinkedMultiple
validation.interstellarHelium3
validation.missingCargoEndpoint
validation.regularPadCrossSystem
validation.selfLinkedCargoPad
matrix.tooltip.xTech.add
about.description
validation.outpostNameLength
character.skill.outpostEngineering
```

Verify both English and Japanese where appropriate.

---

# Tests — migration reconciliation

Add a targeted assertion or diagnostic ensuring the intended presentation migration is complete:

- no user-facing English semantic value contains:
  - `Cargo Pad`
  - `cargo pad`
  - `cargo pads`
- no user-facing cargo semantic value contains:
  - `Interstellar`
  - `interstellar`
  where it denotes the cargo-link construct;
- internal key names and domain identifiers are exempt.

Do not blindly grep all source code and fail on legitimate internal names.

The test should inspect user-facing semantic catalogue values.

---

# Tests — placeholder / ICU integrity

The migration must preserve valid placeholders.

Verify:

- key parity;
- placeholder parity;
- ICU validity;
- protected-token parity;
- `{outpost}`, `{count}`, `{limit}`, `{skill}`, `{item}`, `{kind}`, `{id}`, `{ordinal}`, `{resource}` as appropriate.

Pay special attention to:

```text
cargo.pad.count
```

because the English plural branches change.

---

# No generated reference-name changes

Do not modify:

```text
src/localization/generated/ja-JP-reference-names.ts
reference-source/localized-reference-names-manifest.json
```

Run the existing verifier and require zero drift.

Free Lanes terminology evidence must not change the canonical generated reference-name population.

Expected Japanese reference-name count remains:

```text
3,561
```

---

# No canonical provenance changes

Do not add `SFBGS050.esm` to the canonical reference-name provenance universe.

The canonical provenance closure remains:

```text
3,561 entities
4,818 rows
```

unless unrelated upstream data has legitimately changed.

The terminology registry is separate.

---

# No schema/domain migration

Explicitly do not change:

- `CargoPad`;
- `CargoPadId`;
- `cargoPads`;
- `cargoPadId`;
- persisted `'interstellar'`;
- network/outpost persistence schema;
- import/export schema;
- history snapshot schema;
- stable IDs;
- local-storage schema.

This is presentation terminology, not domain migration.

---

# UI boundary

Do not shorten:

```text
+ Add Cargo Link
```

to:

```text
+ Add
```

or:

```text
+
```

in this slice.

That idea remains a later UI-hardening decision.

Likewise do not address:

- wrapping;
- min-widths;
- tooltips;
- Japanese font coverage;
- truncation;
- collation;
- search aliases;
- accessibility audit.

---

# Documentation

Update durable localization/architecture documentation to describe:

- canonical content source allowlist;
- terminology evidence source allowlist;
- `SFBGS050.esm` terminology-only role;
- terminology provenance artifact;
- one-row-per-evidence design;
- future-language reuse;
- Cargo Link presentation terminology;
- internal/presentation naming boundary.

Use functional names only.

---

# Future-language reuse

Document the expected reuse pattern for Free Lanes terminology:

```text
term.x-tech-power-core
  + SFBGS050.esm / MISC:02031E18 / topLevel.FULL
  + locale-specific strings / 000011E5
  -> official localized item name
```

Do not require English reverse matching for future locales.

Context rows may still require language-specific editorial review.

---

# Verification commands

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run build
npm run lint
git diff --check
```

Also run any new terminology verifier/test command introduced by this work.

If a new package script is added, use a durable functional name such as:

```text
npm run localization:terminology:verify
```

or equivalent.

---

# Expected invariants after implementation

Canonical reference-name provenance:

```text
3,561 entities
4,818 rows
```

Japanese generated reference names:

```text
3,561 names
0 drift
```

Terminology policy:

```text
Starfield.esm       canonical + terminology
ShatteredSpace.esm  canonical + terminology
SFBGS00D.esm        canonical + terminology
SFBGS050.esm        terminology only
```

Presentation:

```text
Cargo Pad      -> Cargo Link
Interstellar   -> Inter-System
X-Tech Power Core -> official Bethesda terminology retained
```

Internal domain:

```text
unchanged
```

---

# Acceptance criteria

The implementation is complete when:

1. `official-terminology-policy.json` exists with distinct canonical-content and terminology-evidence allowlists;
2. `SFBGS050.esm` is terminology evidence only;
3. `official-terminology-provenance.csv` exists and is one-row-per-evidence;
4. the exact X-Tech Power Core identity is preserved;
5. terminology provenance is repository-verifiable without game files;
6. all 26 Cargo Pad / Interstellar presentation keys are migrated;
7. user-facing Cargo Pad wording is gone from semantic catalogue values;
8. cargo-related user-facing Interstellar wording is gone;
9. internal `CargoPad` and `interstellar` identifiers remain unchanged;
10. `matrix.tooltip.xTech.add` retains official X-Tech Power Core terminology;
11. Japanese uses `X-テックパワーコア`;
12. Japanese semantic Starfield uses `スターフィールド`;
13. Outpost Engineering fallback is `拠点エンジニアリング`;
14. biome wording is adjudicated contextually, not globally replaced;
15. Japanese review evidence is updated;
16. superseded terminology guidance is clearly reconciled in documentation;
17. generated Japanese reference-name artifacts remain unchanged;
18. canonical provenance remains unchanged;
19. no schema/persistence/history/import/export migration is introduced;
20. no button-shortening/font/layout/search/collation work is included;
21. all tests/verifiers/build/lint/checks pass;
22. no transient roadmap identifiers are introduced into durable implementation names;
23. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- final terminology policy;
- terminology provenance row count;
- exact X-Tech Power Core row;
- Cargo Link / Inter-System migration count;
- confirmation that all 26 intended keys were changed;
- confirmation that user-facing Cargo Pad / cargo Interstellar values are gone;
- confirmation that internal domain identifiers were untouched;
- Japanese terminology changes;
- biome adjudication decisions;
- whether generated reference-name artifacts changed;
- whether canonical provenance changed;
- new terminology verifier/test command;
- all verification results;
- any documentation marked as superseded;
- confirmation that no UI-hardening work was included.

Do not proceed to Japanese search/font/layout hardening unless separately instructed.

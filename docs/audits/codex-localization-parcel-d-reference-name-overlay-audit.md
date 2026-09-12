# Localization Parcel D: Official Japanese Reference-Name Overlay Integration Audit

## Executive verdict

Parcel D should extend the existing stable-ID reference-name overlay rather than
introduce another localization system. The current runtime seam is
`getReferenceDisplayName(kind, id, canonicalName, locale)` in
`src/localization/referenceNames.ts`. Its resolution order is already the right
one: locale overlay, canonical English runtime name, then raw ID.

The smallest sound D design is:

```text
committed Parcel C provenance + locally manifested official Japanese tables
  -> separate deterministic Parcel D generator
  -> src/localization/generated/ja-JP-reference-names.ts
  -> getReferenceDisplayName()
```

The generated module should contain one precomposed Japanese string per runtime
identity. It should use the existing runtime kinds, merge provenance `flora`
and `fauna` into runtime `species`, and add `official-term` for the five skill
names. Composed fauna should be assembled by the generator in audited slot
order with literal `U+0020`, not assembled from Bethesda INNR/CCT components in
the browser.

The current provenance can materialize all **3,539** committed entities, and a
diagnostic materialization found no missing Japanese qualified string ID. The
resulting single map is approximately **129,646 bytes compact**, **150,931
bytes pretty-printed**, and **26,526 bytes gzip**. A single eagerly imported
module is therefore appropriate; splitting or lazy-loading is premature.

There are, however, two contract gaps that must be settled before Parcel D can
claim its stated end state:

1. Parcel C covers 56 `resource` identities, but the runtime has a different
   76-resource population. Two provenance resources (`aqueous-hematite` and
   `caelumite`) are deliberately hidden at runtime, while **22 surfaced organic
   resource IDs have no provenance entity**. The other seven families reconcile
   exactly. D must not rediscover those 22 identities. Parcel C must be extended,
   or an explicit product decision must accept observable English fallback for
   them.
2. The “114 deferred Bethesda names” are actually 114 semantic catalogue
   messages. Only five are themselves canonical skill names; six more contain
   exact provenance-backed skill or X-Tech terms, one is only partially covered,
   and 102 contain generic game terminology for which Parcel C defines no
   entity. A reference-name overlay cannot silently resolve those 102 tracker
   sentences. Their scope must be explicitly separated from D or supplied with
   a new authoritative official-term contract.

These gaps do not block generating and integrating the exact 3,539-entry
overlay. They do block describing that integration as complete official-name
coverage of everything currently surfaced.

## Evidence and scope

This audit inspected the localization registry, catalogues, preference and
document-language handling, reference-name seam, canonical runtime datasets,
reference-data loader and builder, Parcel C provenance builder and handoff,
search, validation presentation, history presentation, UI consumers, and the
Parcel B adjudication evidence. It made no runtime or generated-data changes.

The committed Parcel C contract was treated as authoritative:

```text
entities              3,539
provenance rows        4,796
unresolved                 0
Starfield.esm rows     4,759
ShatteredSpace.esm        35
SFBGS00D.esm               2
```

The size/materialization diagnostic is ignored under
`.local-work/localization/d-audit/overlay-size.mjs`. It reads the committed
provenance and manifested local Japanese tables without changing tracked
artifacts.

## 1. Current localization and overlay API

The semantic-message architecture is:

- `src/localization/types.ts`: `SupportedLocale`, `MessageKey`, catalogue and
  preference types;
- `src/localization/registry.ts`: central registrations for `en-US`, `en-GB`,
  and `ja-JP`;
- `src/localization/locales/en-US.ts`: complete baseline;
- `src/localization/locales/en-GB.ts`: sparse semantic override;
- `src/localization/locales/ja-JP.ts`: complete 330-key tracker-authored
  catalogue;
- `src/localization/catalog.ts`: locale override -> `en-US` baseline lookup,
  placeholder checking, interpolation, and simple plural handling;
- `src/localization/locale.ts`: explicit/Automatic locale selection. Automatic
  maps Japanese to `ja-JP`, US English to `en-US`, other English to `en-GB`, and
  unsupported languages to `en-US`;
- `src/localization/preferences.ts`: `localeOverride` in the separate
  `starfield-outpost-network-preferences` local-storage record;
- `src/localization/LocalizationProvider.tsx`: effective locale, persistence,
  `t()`, and document-language coordination;
- `src/localization/documentLanguage.ts`: updates `<html lang>`.

The canonical-name API is entirely in `src/localization/referenceNames.ts`:

```ts
type ReferenceNameKind =
  | 'resource' | 'product' | 'system' | 'body' | 'biome' | 'species'

getReferenceDisplayName(kind, id, canonicalName, locale): string
```

It is keyed by **runtime canonical kind plus stable application ID**, not by
localized text and not uniformly by FormID. Current fallback is:

```text
referenceNameOverrides[locale][kind][id]
  -> canonicalName
  -> id
```

The only populated proof entries are `resource:aluminium` in `en-US` and
`en-GB`. All six current reference families use this abstraction either at the
consumer or through localized presentation copies made in `App.tsx`. There is
no competing reference-name mechanism. The only missing family hook is the
five skills, which still use semantic message keys directly.

Recommended exact runtime shape:

```ts
export type ReferenceNameKind =
  | 'resource' | 'product' | 'system' | 'body'
  | 'biome' | 'species' | 'official-term'

export type ReferenceNameOverlay = Readonly<
  Partial<Record<ReferenceNameKind, Readonly<Record<string, string>>>>
>

export const jaJPReferenceNames: ReferenceNameOverlay = {
  biome: { /* Biome FormID -> Japanese */ },
  body: { /* body FormID -> Japanese */ },
  species: { /* flora/fauna FormID -> Japanese */ },
  'official-term': { /* skill.* -> Japanese */ },
  product: { /* ProductId -> Japanese */ },
  resource: { /* ResourceId -> Japanese */ },
  system: { /* system ID -> Japanese */ },
}
```

`getReferenceDisplayName()` should remain the sole lookup. It should statically
register the generated Japanese map alongside the small hand-owned English
overrides.

## 2. Provenance-to-runtime mapping

| EntityKind | Provenance IDs | Runtime IDs | Runtime dataset | Overlay strategy | Count | Issues |
|---|---|---|---|---|---:|---|
| `biome` | uppercase 8-hex BIOM FormID | same `BiomeReference.id` | `public/reference-data/biomes.json` | direct `biome` key | 428 | Exact set equality. |
| `body` | uppercase 8-hex PNDT/body FormID | same `PlanetaryBodyReference.id` | `public/reference-data/bodies.json` | direct `body` key | 1,776 | Exact set equality, including orbitals and DLC. |
| `fauna` | uppercase 8-hex canonical NPC/species FormID | same `SpeciesReference.id` where `type=fauna` | `public/reference-data/species.json` | normalize kind to `species`; precompose where needed | 968 | Exact set equality: 41 direct, 5 template, 922 composed. |
| `flora` | uppercase 8-hex FLOR/species FormID | same `SpeciesReference.id` where `type=flora` | `public/reference-data/species.json` | normalize kind to `species` | 153 | Exact set equality. |
| `official-term` | namespaced app IDs such as `skill.outpost-management` | no canonical dataset; five camel-case skill slots have semantic labels | `CharacterHeader`, history and validation presentation maps | add `official-term`; map each skill slot to its namespaced ID | 5 | New hook required; do not use PERK FormID at runtime. |
| `product` | stable slug `ProductId` | same `ProductReference.id` | `public/reference-data/products.json` | direct `product` key | 30 | Exact set equality. |
| `resource` | stable slug `ResourceId` | same namespace in `ResourceReference.id` | `public/reference-data/resources.json` | direct `resource` key | 56 | Only 54 are runtime-loaded; two are tracker-policy `excluded`. Runtime also has 22 organic IDs absent from provenance. |
| `system` | decimal structural system ID stored as string | same `StarSystemReference.id` | `public/reference-data/systems.json` | direct `system` key | 123 | Exact set equality. `system:0` is an approved source/display normalization, not an ID conversion. |

No English-name join is needed. All mappings use committed `EntityId`. The one
kind normalization, `flora|fauna -> species`, follows the runtime model and is
deterministic. It introduces no collision because the two 1,121-species sets
are disjoint.

The resource mismatch is exact:

- provenance-only, intentionally hidden: `aqueous-hematite`, `caelumite`;
- runtime-only organic resources: `adhesive`, `amino-acids`, `analgesic`,
  `antimicrobial`, `aromatic`, `gastronomic-delight`, `hallucinogen`,
  `high-tensile-spidroin`, `hypercatalyst`, `immunostimulant`, `luxury-textile`,
  `metabolic-agent`, `neurologic`, `nutrient`, `ornamental`, `pigment`,
  `sealant`, `sedative`, `spice`, `stimulant`, `structural`, and `toxin`.

Parcel C8's own scope list says “inorganic resources”; the 22 are organic
harvest outputs. This explains the boundary but does not satisfy D's broader
runtime-reference-name goal.

## 3. Surfaced versus source-only names

The populations should be described separately:

- **A — all provenance-backed names:** all 3,539 are available to the D
  generator. This includes names not normally selectable.
- **B — ordinarily reachable UI names:** 121 systems with eligible bodies,
  1,444 outpost-allowed bodies, 427 biomes used by eligible bodies, 323 unique
  domesticable species, 54 provenance-backed loaded resources, all 30 products,
  and all five skills. Search and Planned Supply additionally surface all 76
  runtime resources, exposing the 22-resource gap.
- **B, recovery paths:** known persisted selections are retained even when no
  longer eligible. Through those recovery paths all 123 systems, 1,776 bodies,
  428 biomes, and potentially all known species identities can be displayed.
- **C — source/build only:** the two excluded provenance resources are never
  loaded at runtime. Non-domesticable species and non-outpost bodies normally
  remain source/reference data, although tolerant imported state can make
  their known names visible.

Generating the complete 3,539-entry authoritative overlay is preferable to
pruning by today's UI reachability. It preserves recovery displays and avoids
coupling generation to current screens.

## 4. The deferred 114

The exact row-level representation is currently
`.local-work/translation/jp/ja-JP-adjudication.csv`: 114 rows with
`Decision=DEFER_BETHESDA` and a `BethesdaDependency`. That file is ignored and
is therefore not a durable repository contract. The committed
`docs/audits/codex-japanese-translation-review.md` retains only aggregate
counts. `docs/localization/ja-JP-review-source.csv` has all 330 rows labelled
`Tracker-authored`; it does not preserve the 114 decisions.

All 114 are runtime **semantic message keys**. They are not a list of 114
canonical reference entities. Their current exclusive reconciliation is:

| Category | Count | Provenance-covered | Remaining issue |
|---|---:|---|---|
| Outpost terminology | 60 | 0 fully; two also embed `Planetary Habitation` and are partially covered | Generic “outpost” terminology has no provenance entity. |
| Cargo Pad terminology | 22 | 0 fully; one also embeds `Outpost Management` and is partially covered | Generic cargo-pad/link terminology has no provenance entity. |
| Biome terminology | 9 | 0 | These are generic semantic uses, not the 428 concrete biome names. |
| Planetary-body terminology | 5 | 0 | Generic body terminology, not a concrete body ID. |
| Star-system terminology | 5 | 0 | Generic system terminology, not a concrete system ID. |
| Displayed Starfield skill names | 5 | 5 | Exact 1:1 mapping to all five `official-term:skill.*` entities. |
| X-Tech / X-Tech Power Cores | 4 | 3 fully at the name-token level; one partial | `resource:x-tech` supplies official `X-Tech`; `X-Tech Power Cores` has no provenance entity. |
| Inter-System cargo terminology | 2 | 0 | No provenance entity. |
| Planet terminology | 2 | 0 | Generic semantic term, not a concrete body ID. |
| **Total** | **114** | **8 fully, 4 partially, 102 with no entity mapping** | Reference overlays alone cannot close the semantic terminology review. |

The four partial rows are three generic Outpost/Cargo messages that also embed
a covered skill name, plus `matrix.tooltip.xTech.add`, which contains the
uncovered phrase `X-Tech Power Cores`. At a structural level the same 114 can
also be summarized as five whole-message canonical skill labels, six tracker
messages containing an exact covered skill/X-Tech term, one partially covered
tracker message, and 102 tracker messages with no provenance-backed mapping for
their deferred fixed terminology. Dynamic reference-name parameters in some of
those messages are already a separate, overlay-capable concern.

D should route the five skill labels through `official-term` and parameterize
covered official names in tracker sentences where appropriate. It must not
replace the other 102 messages with hand-translated guesses. A later brief must
either declare those generic terms outside the reference-name overlay scope or
provide authoritative term entities/evidence.

## 5. Generated representation and composition

Direct and template rows both already resolve to one complete qualified string
identity. Their generator rule is simply:

```text
(normalized runtime kind, EntityId)
  -> Japanese table[NameSourcePlugin, NameStringTable, NameStringID]
```

Composed fauna should use **Option A: generate the final Japanese name**. The
generator groups rows by `fauna:EntityId`, orders the non-empty slots by numeric
`ComponentOrder`, and joins them with literal ASCII space `U+0020`. It then
writes the result to `species[EntityId]`. This preserves all audited behavior,
keeps regeneration possible, and avoids making the app understand INNR/CCT
internals, component roles, providers, table types, or string IDs.

The C6 hardening item should not block D. Add a generator/unit assertion that
the separator is exactly one `U+0020`, record that policy in generated metadata,
and leave direct Japanese runtime/Creation Kit visual confirmation to Parcel E.
There is no contradictory evidence justifying a reopened C6 audit.

## 6. Generated-data ownership and commands

The canonical runtime text-bearing artifact should be exactly:

```text
src/localization/generated/ja-JP-reference-names.ts
```

It should be generated, two-space formatted, sorted by fixed kind order and ID,
reviewable in git, and headed by a “generated; do not edit” comment. A single TS
module fits the existing static localization architecture, avoids a new runtime
fetch/error state, requires no TypeScript JSON-import configuration, and lets
Vite tree/bundle it normally.

Commit a small non-text-bearing reproducibility sidecar at:

```text
reference-source/localized-reference-names-manifest.json
```

It should record schema/tool version, locale, game version, SHA-256 of the exact
committed provenance bytes, the Parcel C input-manifest identity, the official
table hashes already recorded by the C manifest, entity/row/kind counts,
composition policy (`0,1,2`, `U+0020`), and SHA-256 of the generated TS bytes.
Do not commit BA2s, ESM excerpts, string tables, or general table dumps.

Add a separate downstream command, not another responsibility inside the C
builder:

```text
npm run localization:reference-names:build
```

The dependency is clear and testable:

```text
localized-name-provenance.csv
  + manifested local ja tables
  -> Japanese runtime overlay
```

The committed provenance alone cannot materialize Japanese text. It contains
qualified IDs and English verification text, not Japanese values. The C6
preview covers only composed fauna. Installed/local regeneration must therefore
use the ignored extracted Japanese tables through the existing intake manifest,
including size/SHA checks and UTF-8 decoding.

Ordinary CI and app builds must instead consume the committed generated TS and
perform repository-only structural verification. Installed-game regeneration
is what proves the committed text came from the current official tables.

## 7. Runtime fallback, en-GB, search, and sorting

Recommended fallback remains:

```text
requested locale official overlay
  -> en-US canonical runtime name
  -> stable ID (only when canonical data is absent)
```

Missing Japanese names must be safe at runtime but loud in tests/build gates.
The Japanese map should not contain English fallback entries merely to make the
count pass.

`en-GB` remains a tracker-owned sparse presentation overlay. Official Bethesda
English names otherwise use the canonical baseline; `resource:aluminium`
continues to resolve to project-specific `Aluminium`. Registering the Japanese
generated map must not replace the existing `en-US`/`en-GB` maps or change
their precedence.

Search already builds its catalogue through `getReferenceDisplayName()` for
resources and products, normalizes in the effective locale, and uses
`Intl.Collator(locale)` for ranked ties. A Japanese overlay therefore
automatically changes displayed/indexed full names while retaining stable item
identity and invariant abbreviations. English full names will generally stop
matching under Japanese because only the selected display name and abbreviation
are indexed. Alternate-English aliases, dual-script matching, ranking changes,
and Japanese search hardening belong to Parcel E.

Current reference-name ordering is mixed but not broken:

- Matrix resource/product/species rows compare localized names, mostly with an
  explicit locale/collator;
- search uses an explicit locale collator;
- validation sorts localized lists with `getCollator(locale)`;
- Planned Supply receives localized names but uses parameterless
  `localeCompare()` for name fallbacks;
- system/body selectors preserve generated dataset order;
- biome selectors preserve source biome index;
- inorganic family layout primarily uses tracker `sortOrder`.

D should make names correct and preserve established ordering. Explicit
Japanese collation changes, including Planned Supply's comparator, belong to E
unless a D smoke test exposes an unusable order.

## 8. Runtime consumers

| Runtime consumer | Current name source | Locale-aware today? | D change needed? | Defer to E? |
|---|---|---|---|---|
| System selector | canonical `systems[].name` through `getReferenceDisplayName` | Yes | Generated data only | Sorting/layout |
| Body selector | canonical `bodies[].name` through lookup | Yes | Generated data only | Sorting/layout |
| Biome buttons and validation | stable biome ID through `biomePresentation` lookup | Yes | Generated data only | Wrapping/collation |
| Resource Matrix | resource/product/species IDs through lookup | Yes | Generated data only | Worst-case layout/collation |
| Planned Supply and cargo editors | localized resource/product copies made by `App.tsx` | Yes | Generated data reaches them automatically | Layout/collation |
| Search autocomplete/results | locale-built resource/product catalogue through lookup | Yes | Generated data automatically localizes indexed display names | English aliases, Japanese search UX/ranking |
| Validation messages | semantic message plus lookup-resolved resources/products/species/biomes | Yes, except skill labels | Route skills through `official-term` | Layout only |
| History labels | stable reference facts resolved at render time | Yes, with fallback caveat | Preserve canonical fallback; add official-term skill route | Visual hardening |
| Character skill labels | semantic `character.skill.*` messages | Semantic-only | Resolve five names through `official-term` with semantic English fallback | No |
| Source/reference/build-only records | canonical CSV/JSON/provenance names | No runtime consumer | Generate complete map anyway | No |

Validation already keeps domain issues structural and resolves names in
`src/ui/validationPresentation.ts`; D must extend that seam, not add localized
names to validation rules.

## 9. Persistence, history, and import/export

Localized reference names are presentation-only. Persisted networks store
resource/product/system/body/biome/species IDs. Reference data is loaded
separately, locale preference has its own local-storage key, and locale changes
do not dispatch collection edits. No current path persists canonical reference
display names into network, outpost, item, history snapshot, or portable JSON.
Localized default outpost names are ordinary user-editable outpost data and are
an existing intentional rule, not canonical reference data.

No D schema version, migration, import/export change, equality change, or
Undo/Redo entry is needed. Generated overlays are static application data and
locale changes remain outside history.

One session-history coupling needs correction during D: `App.tsx` creates
localized resource/product presentation copies, then sometimes stores their
localized `.name` as a `HistoryLabelDescriptor.referenceParameters[].fallback`.
When a history action is created in Japanese and later rendered in `en-US`, an
unoverridden lookup can therefore fall back to the captured Japanese string.
The descriptor still stores the stable ID and is not portable/persisted, but
its fallback should always come from the canonical `referenceData` snapshot (or
be resolved from that snapshot at render time). Fixing this does not change
collection snapshots or history semantics; it preserves the intended
relocalization behavior.

## 10. Artifact size and loading

The audit materialized the proposed normalized map from the currently
manifested official Japanese tables:

| Runtime kind | Entries |
|---|---:|
| biome | 428 |
| body | 1,776 |
| species | 1,121 |
| official-term | 5 |
| product | 30 |
| resource | 56 |
| system | 123 |
| **Total** | **3,539** |

Measured sizes were 129,646 compact UTF-8 bytes, 150,931 pretty UTF-8 bytes,
and 26,526 gzip bytes. A single static TS import is simpler than per-kind chunks
or asynchronous fetches and is not materially large for this application.

Representative materializations also prove the intended shape:

```text
resource:aluminium                         アルミニウム
resource:x-tech                            X-テック
product:adaptive-frame                     順応型フレーム
system:119226                              カヴニク
body:01000801                              ヴァルーン・カイ
body:0005E364 (SFBGS00D name provider)     ムフリドIV
biome:01012244                             岩石砂漠
species:01039BE3                           ヘイルポッド
species:0008D0D8 (template)                グリロバハンター
species:000065E6 (composed)                遊牧の グロウバック スカベンジャー
official-term:skill.outpost-management     拠点管理
```

## 11. Minimum D test matrix

Repository tests should cover at least:

1. direct base resource: `resource:aluminium`;
2. official DLC resource/X-Tech: `resource:x-tech` from `SFBGS00D.esm`;
3. base product: `product:adaptive-frame`;
4. Shattered Space system: `system:119226`;
5. Shattered Space body: `body:01000801`;
6. differing DLC name provider: `body:0005E364`;
7. Shattered Space biome: `biome:01012244`;
8. Shattered Space flora: `species:01039BE3`;
9. direct fauna: `species:00170A43`;
10. template fauna: `species:0008D0D8`;
11. composed fauna with all relevant slot behavior, including
    `species:000065E6` and exact `U+0020` assertions;
12. all five official skill terms;
13. missing Japanese entry -> canonical English -> raw-ID fallback;
14. `en-US` Aluminum and `en-GB` Aluminium regression;
15. locale switching rerenders reference names without changing IDs, network
    state, or history length;
16. Japanese-created history labels rerender in English using canonical fallback;
17. search rebuilds from localized names while submitted stable identity remains;
18. exact generated key counts and the 22 runtime-resource exceptions.

Use base-game and both current DLC providers in golden coverage. Runtime/UI
tests need not duplicate the provenance provider-discovery tests.

## 12. Build-time gates

### Installed-game/local regeneration gates

- authoritative plugin, archive, extracted-table size and SHA identities match
  the Parcel C manifest;
- provenance file hash and schema match the D sidecar;
- all 4,796 qualified Japanese IDs resolve from the specified plugin/table;
- all 3,539 entities materialize exactly once;
- no duplicate normalized `(runtime kind, ID)` key;
- direct/template entities have one complete component;
- composed entities have legal slots, required species slot, and exact
  `U+0020` joining;
- no empty Japanese value and no accidental decoder replacement character;
- all runtime mappings other than declared exceptions are known;
- output is byte-deterministic and matches the committed TS and sidecar;
- the existing English/provenance and provider-chain gates remain green.

### Repository-only CI/build gates

- import the committed generated module without installed Starfield;
- verify 3,539 total keys and exact per-kind counts;
- compare generated keys with committed provenance after deterministic
  `flora|fauna -> species` normalization;
- reject duplicates, empty strings, unknown kinds, extra keys, or omitted
  provenance entities;
- verify generated-module and provenance hashes against the committed sidecar;
- reconcile runtime datasets: exact sets for biome/body/species/product/system,
  plus an explicit reviewed resource exception set;
- fail if that exception set drifts (currently 2 provenance-only and 22
  runtime-only IDs);
- run overlay lookup/fallback, locale switching, search, validation/history,
  and en-GB regression tests;
- run `npm test`, `npm run build`, and deterministic generated-output checks.

Repository-only CI can prove structural/key completeness and committed-byte
integrity. It cannot prove Japanese values came from Bethesda tables without
those table bytes; that proof belongs to installed regeneration.

## 13. Parcel E boundary

Leave the following for Parcel E:

- English/romanized aliases and broader Japanese search behavior;
- Japanese font coverage and fallback;
- dense-layout growth, truncation, wrapping, and worst-case labels;
- broad locale-aware sorting/collation review;
- representative full Japanese UI testing;
- direct runtime or Creation Kit confirmation of composed-fauna separator
  fidelity.

D should include only the minimal search rebuilding and display correctness
already supplied by the existing lookup architecture. It should not redesign
ranking, layout, fonts, or global ordering.

## 14. Recommended implementation sequence and cost

Expected cost is **medium cross-cutting**. Generation is local and simple, but
complete integration touches build tooling, the lookup registry, seven runtime
families, skill presentation, history fallback correctness, tests, manifests,
and coverage gates.

Recommended slices:

### D0 — settle scope blockers

1. Extend Parcel C with the 22 runtime organic resource identities, or approve
   them as an explicit English-fallback exception.
2. Decide whether the 102 generic semantic terminology deferrals are outside D
   or provide an authoritative official-term contract. Explicitly address the
   uncovered `X-Tech Power Cores` phrase.
3. Preserve a committed row-level reconciliation for the 114; the ignored CSV
   should not be the only exact evidence.

### D1 — generated official-name overlay builder

1. Add a downstream manifest-driven Japanese materializer.
2. Normalize provenance kinds to runtime kinds and precompose fauna.
3. Generate the single TS map plus reproducibility sidecar.
4. Add installed-input drift, Japanese availability, identity, composition,
   determinism, and write-vs-verify behavior.

### D2 — runtime reference-name integration

1. Register the generated Japanese map in the existing lookup.
2. Add `official-term` and route skill labels/history/validation through it.
3. Parameterize exact covered official terms in semantic messages where needed.
4. Ensure history reference fallbacks use canonical English source names.
5. Preserve the en-GB sparse override and all stable persisted IDs.

### D3 — repository gates and documentation

1. Add structural/coverage/fallback/locale/search/history regression tests.
2. Add the repository-only verifier to ordinary build without installed-game
   dependencies.
3. Document regeneration inputs, commands, review flow, exception policy, and
   the Parcel E boundary.

No implementation should begin until D0 is answered. If the product explicitly
accepts the two exception classes, D1-D3 can proceed without architectural
redesign; otherwise the authoritative upstream contract must be extended first.

## Final recommendations

1. **Runtime key/shape:** `ReferenceNameOverlay` keyed by runtime kind then
   stable `EntityId`; add `official-term`, merge flora/fauna into `species`.
2. **Artifact:** `src/localization/generated/ja-JP-reference-names.ts`, with
   `reference-source/localized-reference-names-manifest.json` as sidecar.
3. **Composed fauna:** precompose during generation with ordered non-empty slots
   and literal `U+0020`.
4. **Japanese text:** resolve committed qualified provenance IDs against locally
   manifested, hash-verified official Japanese tables; commit only the derived
   map and metadata.
5. **3,539 identities:** all deterministically map; six provenance kinds retain
   their runtime kind and flora/fauna normalize to the shared runtime species
   kind. Two mapped resource identities are source-only.
6. **Deferred 114:** all are semantic messages; only 8 are fully coverable as
   currently categorized, 4 are partial, and 102 have no provenance entity.
7. **Fallback:** requested overlay -> canonical English -> stable ID, with
   missing Japanese made observable by gates.
8. **Search/sort:** localized display/index updates are D; alternate-English
   search, broad collation, font/layout hardening are E.
9. **Persistence/history/import/export:** no schema or snapshot impact; stable
   IDs remain persisted. Correct the session-history localized-fallback leak.
10. **Slices/cost:** D0 contract closure, D1 generator, D2 integration, D3
    tests/docs; medium cross-cutting.
11. **Blocker:** settle 22 surfaced organic resources and the 102 generic
    semantic-term deferrals (including `X-Tech Power Cores`) before claiming
    complete D coverage.

# Architecture

## Purpose

This document describes the current technical architecture of **Starfield Outpost Network**.

It is intended to help maintainers and coding agents understand:

- where different responsibilities belong;
- which state is persisted and which is session-only;
- how domain logic, React components, persistence, validation, and Undo/Redo interact;
- which architectural boundaries should be preserved when extending the application.

This document describes the architecture that exists now. It is not a complete product specification and should not be treated as a list of future requirements.

For repository-wide coding-agent instructions, see the root `AGENTS.md`.

---

# 1. Architectural overview

Starfield Outpost Network is a local browser application built with:

- React;
- TypeScript;
- Vite;
- browser `localStorage` for normal persistence;
- JSON import/export for portable backups and interchange.

The static Vite build is hosted on Cloudflare Pages Free, with `staging` as an
automatically deployed Preview and `main` as the source of manually deployed
production releases. `https://starfieldoutposts.com` is the durable production
and browser-data origin; the bare production `pages.dev` hostname redirects to
it while preview subdomains remain separate. The deployed CSP/security headers
constrain the client and its same-origin reference-data requests. Vite's
development server uses its default local-only binding. See
[Deployment](DEPLOYMENT.md) for operational and security policy.

The codebase is divided broadly into:

```text
src/
├── App.tsx
├── data/
├── domain/
└── ui/
    ├── components/
    └── layout/
```

The intended dependency direction is approximately:

```text
UI components
      │
      ▼
   App.tsx
      │
      ▼
Domain logic   ←→   Data/persistence
```

More precisely:

- `src/domain/` should remain independent of React where practical;
- `src/data/` handles external representations and persistence;
- `src/ui/` handles presentation and local interaction;
- `src/App.tsx` coordinates application-level state and feature interactions.

The application currently favours explicit application orchestration over introducing a separate state-management library.

---

# 2. Core architectural principles

The most important principles are:

1. **Persist domain state, not UI state.**
2. **Keep domain rules outside React presentation code where practical.**
3. **Treat the network as immutable.**
4. **Use stable IDs for identity.**
5. **One deliberate user operation should normally equal one Undo step.**
6. **Derive information where possible instead of duplicating it in persisted state.**
7. **Keep reference data separate from the player's network data.**
8. **Validation reports problems; it does not normally repair data automatically.**
9. **Browser storage is the working persistence mechanism; JSON files are import/export vehicles.**
10. **Presentation components should not silently acquire responsibility for domain semantics.**

These principles should be preserved unless a deliberate architectural change is agreed.

---

# 3. Persisted domain and collection models

One `OutpostNetwork` is the gameplay document for one Starfield universe.
Browser storage wraps those documents in a separately versioned ordered
`NetworkCollection`:

```ts
interface SavedNetwork {
  id: string
  network: OutpostNetwork
}

interface NetworkCollection {
  schemaVersion: number
  networks: SavedNetwork[]
  activeNetworkId: string
}
```

Array order is the user-facing network order. Stable hidden `SavedNetwork.id`
values provide identity, while `activeNetworkId` selects the current network.
The UI exposes compact ordinal navigation and lifecycle controls. Collection metadata is not part of
the gameplay document and has its own schema version.

Conceptually:

```ts
interface OutpostNetwork {
  schemaVersion: number
  character: Character
  outposts: Outpost[]
  cargoLinks: CargoLink[]
}
```

The network contains:

- character data;
- outposts;
- cargo pads owned by those outposts;
- network-level cargo-link relationships.

It does **not** contain presentation-only state such as:

- selected outpost;
- expanded/collapsed UI panels;
- transient status messages;
- Undo/Redo history;
- file-import/export messages.

---

# 4. Character model

Character data currently contains:

- name;
- level;
- Starfield skill ranks relevant or potentially relevant to outpost behaviour.
- typed character capabilities, currently `xTechExtraction`.

Skill values use:

```ts
number | null
```

Semantics:

- `null` means no value has been recorded;
- `0` means a known rank of zero;
- those two values are intentionally distinct.

Character name is a string and may be blank.

Not every persisted character field is currently exposed in the UI.

At present, some fields remain in the model for future use even when the interface does not display them.

`character.capabilities.xTechExtraction` is required, defaults to `true`, and
is intentionally not exposed in the current UI.

This is intentional: hiding a field from the UI does not imply removing it from the persisted schema.

---

# 5. Outpost model

Each `Outpost` has:

- stable `id`;
- user-visible `name`;
- `systemId`;
- `bodyId`;
- local resources;
- explicit resource presence;
- active production;
- manufacturing entries;
- Planned Supply entries;
- cargo pads.

Conceptually:

```ts
interface Outpost {
  id: string
  name: string
  systemId: StarSystemId
  bodyId: PlanetaryBodyId
  selectedBiomeIds: BodyBiomeId[]
  localResources: ResourceId[]
  explicitResourcePresence: ResourceId[]
  activeProduction: ResourceProductionRoute[]
  manufacturing: ManufacturingEntry[]
  plannedSupply: CargoItem[]
  cargoPads: CargoPad[]
}
```

Array order currently determines presentation order for:

- outposts;
- cargo pads.

Stable IDs remain the identity of those objects.

Visible names and labels must not be used as object identity.

---

# 6. Cargo-item abstraction

Resources and manufactured products share a common identity shape where cargo and supply logic needs to treat them uniformly.

```ts
type CargoItem =
  | {
      type: 'resource'
      id: ResourceId
    }
  | {
      type: 'product'
      id: ProductId
    }
```

This abstraction deliberately describes only **what the item is**.

It does not describe:

- where the item came from;
- whether it is actual or planned supply;
- whether it is inbound or outbound;
- how much throughput exists.

Those concerns are derived elsewhere.

---

# 7. Cargo-pad model

A cargo pad currently stores:

- stable ID;
- visible label;
- type;
- outbound cargo selections.

```ts
interface CargoPad {
  id: string
  label: string
  type: 'regular' | 'interstellar'
  outboundItems: CargoItem[]
  destinationIntent?: { outpostId: string }
}
```

A cargo pad does **not** store:

- its cargo link;
- inbound items.

Those are deliberately represented elsewhere.

The current stored label generally reflects positional presentation such as:

```text
Pad 1
Pad 2
Pad 3
```

This legacy persisted label is generated in the invariant `Pad {n}` form and
must not depend on the active locale. User-facing pad ordinals are derived from
array order and localized separately at render time.

Stable identity is still the pad ID, not the label.

There is a known future design question around whether positional labels should continue to be persisted or instead be derived from array order. That is not currently resolved.

---

# 8. Cargo-link architecture

Cargo links are network-level entities.

A link has two equivalent endpoints:

```ts
interface CargoLinkEndpoint {
  outpostId: string
  cargoPadId: string
}

interface CargoLink {
  id: string
  endpointA: CargoLinkEndpoint
  endpointB: CargoLinkEndpoint
}
```

This design was chosen because a cargo link is a relationship between **two specific cargo pads**, not merely two outposts.

Neither endpoint is inherently the source or destination.

The relationship is bidirectional.

The pure `cargoConnections.ts` owner indexes qualified endpoint tuples, classifies
destination state, resolves structural routing and owns immutable cargo transitions.
All supply consumers share that structural eligibility; raw invalid claims remain
available to validation and explicit record repair. Destination intent is persisted
on the pad only while no incident raw claim exists. App captures the expected
network and snapshot, generates IDs outside reducer replay, and retires planning
only after a successful atomic command. Rejected commands return the same state.

Each cargo pad is intended to participate in at most one distinct cargo link. That rule is enforced through application logic and validation rather than through the TypeScript type itself.

---

# 9. Outbound and inbound cargo

Outbound cargo belongs to the local cargo pad:

```text
CargoPad.outboundItems
```

Inbound cargo is **derived** from the outbound items on the cargo pad at the opposite end of the link.

Therefore:

- outbound selections persist independently of whether a link currently exists;
- unlinking a pad does not inherently erase its outbound configuration;
- inbound availability is not stored redundantly.

This is an important architectural choice.

Do not add an `inboundItems` collection to persisted cargo-pad state merely for convenience.

---

# 10. Availability

Availability is derived in the domain layer.

The application distinguishes between:

## Actual availability

Items which currently have a real source at an outpost, such as:

- active local resource production;
- feasible local manufacturing;
- inbound cargo.

Manufacturing feasibility is resolved from recipe reference data with a
fixed-point pass. The resolver begins with active local production, inbound
cargo, and Planned Supply as effective prerequisites, then repeatedly adds
configured products whose inputs are all effective. Manufactured outputs are
actual local supply even when Planned Supply satisfies an input; the Planned
Supply placeholder itself remains virtual.

## Planned availability

Items represented only by Planned Supply.

The application can therefore answer related but distinct questions such as:

- "What items can this outpost use for downstream planning?"
- "Which of those items already have a real source?"
- "What still needs a source?"

These calculations belong in domain functions rather than React components.

Relevant domain modules include:

```text
src/domain/availability.ts
src/domain/provenance.ts
```

---

# 11. Provenance

Availability answers whether an item is available.

Provenance answers **why** it is available.

Provenance is derived from the network rather than persisted separately.

Examples of provenance may include:

- local production;
- manufacturing;
- inbound cargo.

Presentation components may display provenance, but they should use the domain lookup rather than reconstructing the same rules independently.

---

# 12. Planned Supply

Planned Supply represents unresolved supply intent.

It is stored on the outpost as:

```ts
plannedSupply: CargoItem[]
```

Its current semantics are:

- an item may be added when the user intends the outpost eventually to receive or produce it;
- it participates fully in downstream prerequisite resolution as virtual supply;
- once that item acquires an actual source, the corresponding Planned Supply entry may be retired automatically;
- if the actual source later disappears, the Planned Supply item is **not automatically recreated**;
- Undo can restore a previously retired Planned Supply item when that retirement occurred as part of the action being undone.

This is intentionally asymmetric.

Planned Supply is a planning placeholder, not a continuously derived mirror of missing availability.

---

# 13. Manufacturing

Manufacturing entries are stored as:

```ts
interface ManufacturingEntry {
  productId: ProductId
  quantity: number
}
```

The persisted entry records what the outpost is configured to manufacture.

Recipe knowledge belongs to reference data, not the outpost model.

Validation may use recipes to determine whether required inputs appear to be available, but recipe definitions themselves should not be copied into the network.

---

# 14. Reference data architecture

Reference data is separate from the player's network state.

The reference-data model currently includes information such as:

- star systems;
- planetary bodies;
- resources;
- products;
- resource/body mappings;
- manufacturing recipes.

Persisted network objects normally store stable IDs referring to that data.

For example:

```text
systemId
bodyId
resourceId
productId
```

Human-readable names are resolved at presentation time where appropriate.

This separation allows:

- reference data to improve independently of user saves;
- stale IDs to remain inspectable rather than silently discarded;
- validation to report unresolved references.

Do not embed complete reference-data records into `OutpostNetwork` unless an explicit requirement changes this design.

Reference catalogues are generated rather than read from delimited source
files by the browser. Planetary data follows a direct canonical export path:

```text
Game extracts → reference-source/planet-directory.csv
                reference-source/inorganic-resource-dictionary.csv
                reference-source/industrial-workbench.csv
                reference-source/biome-inorganic-resources.csv
                reference-source/biome-organic-resources.csv
Tracker policy → reference-source/inorganic-resource-tracker-policy.csv
                 reference-source/item-tracker-metadata.csv
        ↓
scripts/build-reference-data.mjs
        ↓
public/reference-data/*.json
        ↓
scripts/verify-reference-deployment.mjs → manifest.json + bundled dataset ID
        ↓
src/data/referenceDataLoader.ts
```

The canonical inorganic ESM extract is source truth for FormID identity,
canonical fallback name, abbreviation, SNAM rarity, source classification, and
immediate parent FormID. The tracker policy joins by FormID and separately owns
stable application `ResourceId`, runtime disposition, five-tier presentation
rarity, and Planned Supply placement/order. Application IDs are opaque persisted
identities and are never regenerated from canonical or localized names. The
canonical Industrial Workbench extract is the identity backbone for manufactured
products and the source of recipe facts. Its product, ingredient, and COBJ
identities are validated at build time; products and ingredients join by FormID,
while COBJ identity remains source-only. Organic identities are reduced by
FormID from the occurrence-grain organic extract.

`item-tracker-metadata.csv` is the single handmade metadata source for the 30
tracked products and 30 tracked organics. It explicitly pins stable app IDs,
abbreviations, five-tier tracker rarity, and sparse display overrides. Its
canonical identity columns are checked assertions rather than a competing
authority. Every tracker-authored row uses `BESPOKE - NO SOURCE FILE` and
`9999-12-31 00:00:00` to distinguish bespoke metadata from extracted facts.

The three canonical CSVs supply body facts, inorganic biome/atmosphere
occurrences, and organic species occurrences respectively. The builder delegates
shared biome joins and organic normalization to scripts/biome-reference-data.mjs.
No flattened planet/resource source file is maintained.

Runtime relationships are deliberately separate:

- bodies retain FormID/system identity, derived outpostAllowed, and nullable raw
  solarArrayPower, windTurbinePower, and planetaryHabitationRank values;
- biomes contain canonical FormID/name definitions; bodyBiomes identify a body
  occurrence with body FormID plus biome index and retain numeric source order;
- inorganicOccurrences distinguish biome occurrences from body-level atmosphere;
- species contain global identity/name/type; planetSpecies contain the harvested
  resource, domesticability, and source class for each body/species pair;
- organicOccurrences connect body biomes to species without repeating those facts;
- organicFarmingProfiles normalize observed inputs by plant/herbivore/carnivore;
- bodyResources is a derived compatibility index of all inorganic and harvested
  organic resources, including wild-only organic sources. It remains for
  compatibility consumers; the matrix and active-production validator derive
  directly from occurrence-grain biome and species facts.

Each relationship has its own generated JSON file and typed loader property.
Resource IDs remain stable application IDs. Inorganic occurrences join canonical
FormID to tracker policy to application ID; their names and EditorIDs are
consistency assertions rather than identity. The obsolete inorganic Aluminum
name alias is gone. Canonical `Gastro Delight` crosswalks by FormID to stable ID
`gastronomic-delight`, with `Gastronomic Delight` supplied as explicit tracker
display metadata. Canonical `Aluminum` likewise crosswalks by FormID to stable
app ID `aluminium`; recipes contain no name-compatibility branch.

The canonical dataset retains Aqueous Hematite and Caelumite with tracker
disposition `excluded`. X-Tech is `special-enabled`, emitted as a runtime
inorganic, and remains outside canonical occurrence data. Unknown IDs in user
data remain preserved and are diagnosed normally.

Source provenance and extraction-specific fields stay in canonical CSVs. An
optional biome-inorganic-resources.manifest.json validates declared dataset,
schema version (currently 1), output filename, and total/location row counts.
Absent manifests are accepted; upstream hashes/timestamps/counts are provenance,
not locks against refreshed source files. The bespoke tracker timestamp is a
sentinel, not an extraction event. No provenance or COBJ data enters runtime JSON.
Duplicate body IDs and conflicting system, biome, resource crosswalk, or
planet/species facts fail generation. Base-game and Shattered Space bodies remain
in the catalogue, including ineligible bodies; selectors use outpostAllowed.

The biome-aware reference-data work changed reference truth first, then advanced
`OutpostNetwork` to schema version 3: outposts persist body-biome occurrence IDs
and active production uses a discriminated route union. Browser storage and JSON
import migrate older resource-ID arrays. Known organics become
`organic-unspecified`, inorganics become inorganic routes, and unknown IDs remain
recoverable as inorganic routes rather than being discarded.

Schema version 4 adds required `CharacterCapabilities` and per-outpost
`explicitResourcePresence`. Schemas 1–3 migrate to X-Tech extraction enabled and
empty explicit presence. Schema-4 readers preserve explicit `false`, unknown
resource IDs, duplicates, and invalid-but-recoverable production state.

`src/domain/resourcePresence.ts` centralizes the narrow explicit-presence policy.
Ordinary inorganic rows remain occurrence-backed and their recorded Present state
remains `localResources`; X-Tech Present comes only from
`explicitResourcePresence`. Production continues to use the ordinary inorganic
route and therefore existing availability, provenance, cargo, and Planned Supply
retirement paths.

`src/domain/bodyResourceAvailability.ts` owns effective biome scope, biome-aware
inorganics, body-wide atmosphere, exact planetary domesticable organic farming
routes derived from `planetSpecies`, and inorganic production-signature
duplicate-name button grouping. Natural organic occurrence remains separately
represented by `organicOccurrences` and does not gate farming. It never rewrites persisted invalid IDs.
`src/domain/productionRoutes.ts` owns route keys, farming-profile input
resolution, and the route-to-distinct-resource aggregation boundary used by
availability and provenance.

`src/domain/powerEfficiency.ts` derives qualitative solar and wind efficiency
from the selected body's raw base-generator output. The Outpost Details UI maps
those buckets to compact labels. Efficiency is never copied into `OutpostNetwork`,
browser storage, or Undo/Redo state; an unresolved body derives unknown values.

Matrix rows use full route identity and merge persisted organic routes into
reference-derived rows so invalid active state remains inspectable. Validators
report unknown, foreign, or duplicate biome IDs; invalid active routes;
unspecified sources; and missing farming inputs rather than repairing data.

Search for Items builds a localized presentation index over the complete
resource/product reference catalogue and submits only stable `{ type, id }`
identity. Each stable entity has one visible entry containing its localized
display name and abbreviation, canonical English name, and narrowly curated
supported alternate aliases. Localized matches rank before English and
alternate aliases; alias collisions retain one deterministic row per stable
entity and participate in category disambiguation. `App.tsx` owns its draft,
submitted item, open state, and floating
palette position above the outpost-keyed Matrix. Results are derived live from
the active network by `src/domain/itemSearchResults.ts`: resource `PRESENT`
mirrors the Matrix's recorded inorganic or source-specific planet-level organic
state; the remaining ordered flags use production/manufacturing feasibility,
routed imports and exports, and exact Planned Supply identity.

For X-Tech, Search reports `PRESENT` only for explicit presence and `PRODUCING`
for the persisted route, including a recovery-only route without presence.

Outpost navigation and ordinary same-network Undo/Redo preserve Search while
network switches, lifecycle/import replacements, and history traversal across
a network boundary reset it. No Search state enters collection history,
browser persistence, or portable JSON.

The separate `planetary-habitation-requirement` operational validator compares
an eligible body's known minimum rank to a valid known character rank. Unknown
references, categorical ineligibility, and invalid skill values retain their
dedicated validators. `skillRanks.ts` shares canonical integer-rank checking
between invalid-skill and habitation validation.

---

# 14.1 Localization boundary

Localization is application presentation infrastructure under
`src/localization/`. `en-US` is the complete baseline and fallback catalogue;
`ja-JP`, `fr-FR`, `de-DE`, `es-ES`, `it-IT`, `pt-BR`, and `pl-PL` are complete runtime
catalogues, while regional variants such as `en-GB` may supply sparse overrides.
Tests require complete locales to have
exact key and placeholder parity with `en-US`; runtime fallback remains only as
defensive resilience. The semantic
catalogue is the boundary for tracker-authored visible copy, accessible names,
tooltips/help, validation presentation, transient status, and history labels.
The registry owns runtime catalogue registration so feature components do not
contain per-locale branching. The tooling metadata contract at
`reference-source/localization-locale-metadata.json` maps tracker tags to
Bethesda tokens, encodings, catalogue roles, and runtime availability.
Spanish (`es-ES`/`es`), Italian (`it-IT`/`it`), Brazilian Portuguese
(`pt-BR`/`ptbr`), and Polish (`pl-PL`/`pl`) are full runtime locales with
complete semantic catalogues and official reference overlays. Polish is a full
supported runtime locale with locale-aware search and the same stable-ID
presentation boundary as the other supported locales. Tooling derives review,
XLIFF, terminology, and reference-overlay paths from tracker tags; runtime
support remains controlled by the separate typed registries. Browser mapping
for these regional catalogues is conservative: bare language tags, the exact
supported regional tag, and its descendants map to the catalogue, while an
explicit other region continues to later browser preferences. Browser language
families map `fr-*` to the single supported `fr-FR` catalogue and `de-*` to the
single supported `de-DE` catalogue; this is fallback reuse, not a claim of
separately translated regional variants. Baseline keys are derived from
the complete catalogue, while interpolation validates both missing and
unexpected named parameters at runtime and in tests.

The localization provider resolves the effective locale from an explicit
supported override, then the browser language list, then `en-US`. Application
preferences use a dedicated localStorage key and are not part of
`NetworkCollection`, `OutpostNetwork`, import/export, or Undo/Redo history.
The provider also owns `document.documentElement.lang` and updates it whenever
the effective locale changes.

Approved compact visible copy is a separate presentation layer in
`src/localization/compactDisplay.ts`. It is keyed by stable surface/concept
identity and locale, falls back deterministically to the full semantic message,
and does not alter or weaken full-catalogue key and placeholder parity. Feature
components request compact text through this resolver rather than branching on
locale. Full semantic messages remain authoritative for accessible names,
tooltips, validation, history, prose, and unconstrained surfaces.

Reference display names use a separate sparse overlay keyed by stable reference
kind and ID. Resolution is locale override, canonical runtime name, then raw ID.
The overlay never changes reference identity or generated reference datasets.
The generated Japanese, French, German, Spanish, Italian, Brazilian Portuguese,
and Polish official-name overlays are registered at this seam for resource,
product, system, body, biome, species, and `official-term` names.
Character skill slots map to five namespaced `official-term` IDs; their canonical
English semantic labels remain the fallback, and game FormIDs do not enter
runtime or persisted state. Tracker-authored copy therefore remains
independent of Bethesda-owned reference names.

Locale-aware collation is a presentation concern for genuinely alphabetical
lists. Star systems, localized cargo candidates, and alphabetical Planned
Supply groups use the active-locale collator with stable-ID tie-breakers.
Body/orbit order, biome occurrence order, resource topology, persisted order,
validation order, and history chronology retain their domain or user sequence.

Japanese tracker-catalogue work closed after comparative review supplied the Codex
first draft, an independent English-source translation, keyed comparative
adjudication, and final integration verification. The resulting catalogue has
exact key and placeholder parity with the current `en-US` baseline. Official Japanese
reference-name overlays and official terminology provenance are implemented;
the Free Lanes source remains terminology evidence only and does not extend the
canonical content universe. The remaining limitation is native-speaker and
manual/platform release verification, not missing localization architecture.

Validation rules emit a required semantic `messageKey`, structured parameters,
and stable target/reference IDs rather than completed English sentences. The
presentation layer resolves localized names, locale-aware lists, current pad
ordinals, contextual labels, remediations, and the final phrase. Rule IDs,
categories, severity, navigation metadata, and triggering semantics remain
domain facts.

Undo/Redo history remains session-only, but its labels are semantic
`HistoryLabelDescriptor` values. Descriptors capture user-authored names at
action time, retain frozen network ordinals, and render in the current locale,
so switching locale relocalizes existing Undo/Redo titles without changing the
stored collection or history snapshots. Reference parameters retain their stable
kind and ID plus an authoritative canonical English fallback, never text from a
locale-decorated presentation copy. Expected import failures and transient
status messages use the same descriptor boundary; unexpected diagnostics are
kept separately from localized user-facing copy.

`formatters.ts` is the narrow locale-formatting boundary for lists, integers,
decimals, percentages, and display-name collation. Export filename timestamps,
schema values, IDs, and other technical identity remain invariant.
French and German item search keeps locale-normalized exact, prefix, and
substring ranking, then applies Unicode decomposition and combining-mark
removal as a localized fallback before canonical-English and curated aliases.
It does not infer German digraphs, `ss`/`ß`, or French `oe`/`œ` equivalence.
Accessible shortcut descriptions use locale-aware modifier, connector, and
arrow speech while visible key tokens and bindings remain invariant.

## 14.2 Build-time localized-string provenance boundary

Canonical localized-name provenance uses deliberately separate authorities:

```text
xEdit / canonical sources
    -> semantic identity, relationships, discovery, and later provider analysis
narrow ESM reader
    -> raw serialized localized uint32 IDs only
project-owned semantic field map
    -> allowlisted record path and string-table type
explicit BA2 inputs
    -> validated localization members and local official tables
reference-name overlay tooling
    -> localized text resolution and runtime overlays
```

The narrow provenance tooling lives under `scripts/localization/`. Its binary layer supports
only 24-byte record/group framing, recursive groups, compressed records, `XXXX`
subrecord sizes, exact raw FormID selection for the audited signatures, and
bounded signature scans used by system and organic relationship resolution.
The semantic layer, rather than the binary reader, decides whether a `FULL`
subrecord is the intended localized field. Unknown, missing, or ambiguous shapes
fail closed. The current component route is specifically bounded by serialized
`BFCB`/`BFCE` markers for `TESFullName_Component`; this is not a claim of generic
Starfield component parsing.

Plugin files are opened read-only and are required only for an opt-in local proof.
Unit tests use project-authored synthetic framing, and local manifests retain a
normalized filename, size, SHA-256, declared load order, tool version, game
version, and generation timestamp. No ESM, BA2, string-table contents, or raw
record dumps belong in the repository.

The direct-name generator produces a normalized, generated crosswalk for direct-name resources
(inorganic, special/X-Tech, and organic harvest resources), products, biomes,
and official skill terms:

```text
canonical stable entity
    -> exact source plugin + FormID + allowlisted semantic field
    -> raw localized uint32 ID and field-owned table type
    -> explicitly mapped official English table
    -> exact CanonicalEnglish verification
```

`reference-source/localized-name-provenance.csv` contains complete, qualified
direct-name rows and normalized composed-component rows.
`localized-name-provenance-unresolved.csv` preserves
every target whose local plugin/table input or supported direct shape is missing;
there are no silent drops. Recipe and biome occurrence sources are normalized to
stable entity identity before extraction, so occurrence repetition cannot create
duplicate provenance. The fully qualified name identity remains
`NameSourcePlugin + NameStringTable + NameStringID`; English text is never used
to choose it.

Local regeneration consumes an explicit config and records plugin and English
table filenames, sizes, hashes, declared load order, game/tool version, and time
in an ignored local manifest. Committed-crosswalk validation runs without local
game data as part of the reference build.

The system generator extends that population with one direct row per canonical star system:

```text
canonical system and its canonical body rows
    -> exact PNDT records and audited 12-byte GNAM galaxy tuples
    -> one consistent numeric system number
    -> exact STDT.DNAM match across the declared official plugin set
    -> STDT TESFullName_Component.FULL localized ID
    -> exact official English verification
```

The numeric system number is the join key; English is verification only. All
canonical bodies assigned to a system are checked for agreement before one
system target produces one provenance row. Base-game and official DLC records
use the same population and lookup path. A supported plugin may legitimately
contribute zero targets, while missing, conflicting, ambiguous, or mismatched
systems remain explicit in the unresolved crosswalk.

The body generator adds one direct row per canonical tracker body:

```text
canonical planet-directory row
    -> exact source plugin + PNDT FormID
    -> PNDT TESFullName_Component.FULL localized ID
    -> exact official English verification
```

The checked-in tracker population is the complete scope boundary. `Planet`,
`Moon`, and `Orbital` rows are peer body targets, including unusual and
non-landable bodies; the pipeline does not scan PNDT records to discover
additional stations or celestial objects. All current canonical shapes use the
same full-name component route, and inline `ANAM` text is never accepted as
localized-name provenance. Any future structural exception must remain an
explicit unresolved row until a target-specific semantic route is audited.
Source/display differences use the same exact entity-scoped normalization
policy as system names.

The provider layer verifies direct-name ownership across the authoritative localization
source universe, which is exactly `Starfield.esm`, `ShatteredSpace.esm`, and
`SFBGS00D.esm`. All three are ordinary full modules. The narrow provider layer
reads their ordered TES4 `MAST` entries and normalizes each file-local FormID to:

```text
record signature + origin plugin + lower-24-bit object ID
```

Provider chains use that logical identity in the fixed supported order. The
last record is the winner, but `NameSourcePlugin` is the latest provider that
explicitly serializes the exact allowlisted `NameFieldPath`; if the winner omits
that field, resolution walks backward and otherwise fails closed. Text equality
and bare string-ID equality never establish ownership. Muphrid IV is the current
live regression: its canonical PNDT remains `Starfield.esm:0005E364`, while its
explicit winning full-name field and qualified string table belong to
`SFBGS00D.esm`.

This is intentionally not a generic load-order model. Medium/light modules,
Creations, and third-party mods remain outside tracker scope. `SFBGS050.esm`
may remain in local historical configuration for compatibility, but it is not
an authoritative tracker source and cannot participate in provider selection.

The organic generator derives its complete organic target set from
`biome-organic-resources.csv`, collapsing Planet × Biome occurrence rows to one
stable flora or fauna FormID. It reproduces the production exporter precedence:

```text
flora: FLOR.FULL
fauna: NPC_.FULL
    > valid CCT composition (resolved by the composed-fauna generator)
    > NPC_ TPLT -> LVLN entry NPC_ -> encounter-template NPC_.FULL
```

Direct flora, direct fauna, and template-fauna `FULL` providers enter the
normalized provenance crosswalk. CCT classification includes native NPC
keywords, recursive OMOD includes, `NPC - Keyword` properties, and the audited
INNR ordering of greatest keyword specificity, highest `YNAM`, then earliest
rule. Different useful Object Template names and different encounter-template
names fail closed. `localized-name-provenance-composed-fauna.csv` remains the exact
composed-fauna population boundary and records its resolved state, while
`localized-name-provenance-template-fauna-lineage.csv` preserves the
canonical NPC → LVLN → leveled NPC → encounter NPC audit path without denormalizing
the main crosswalk. The current installed-game inventory is 153 direct flora,
41 direct fauna, 5 template fauna, and 922 composed-fauna targets.

The composed-fauna generator resolves only those 922 committed targets through the audited CCT
naming family:

```text
canonical fauna
    -> native NPC KWDA + recursive selected-OMOD NKEY keywords
    -> dn_CCTPrefixes ruleset 0 / dn_CCTSuffixes rulesets 0 and 1
    -> specificity, YNAM, then serialized-rule-order selection
    -> raw WNAM IDs with winning record and string providers
    -> ordered prefix(0), species(1), diet(2) component provenance
    -> exact qualified locale lookup
    -> non-empty values joined by literal U+0020
```

Species is required; prefix and diet are optional, but their semantic slots are
never renumbered. This fixed role order belongs to the CCT naming family.
Locales change the qualified component values, not their order, and there is no
locale grammar table or format entity. Every useful Object Template combination
is resolved independently and multiple final names fail closed. The audited
installed population emits 2,179 component rows and reconstructs all 922
English names exactly. The Japanese preview resolves the same qualified IDs and
is a deterministic verification handoff consumed by the overlay generator.

Exact English equality remains the default verification rule. A structural
canonical value is never rewritten merely to match localized display text. A
localized value may differ only through a checked-in approval keyed by stable
entity identity and exact expected source/display values. Once that exact
provenance and approval are verified, the official localized string is
authoritative for localized display while `CanonicalEnglish` continues
to preserve the structural source value.
`localized-name-normalizations.csv` records the exact approved source/display
pair and classification so committed-data validation can detect policy drift.

The localization-input layer is a separate build-time sniper:

```text
explicit BA2 v2 GNRL paths
    -> member-table enumeration
    -> exact plugin-base + locale + table-type selection
    -> ignored local official string tables + hashes
    -> English provenance verification and Japanese composed-name verification
    -> committed locale overlays
```

It never infers ownership from an archive filename and never crawls the game
Data directory. Its manifest adapter verifies each extracted table's size and
SHA-256 before exposing it through the existing string-table reader. Ambiguous
qualified tables fail closed. Archive and table bytes remain external/ignored;
the application never reads game archives at runtime. This is narrow archive
intake, not general archive discovery, inherited override analysis, or a BA2
browser.

This build-time boundary does not run in the browser, participate in application
persistence, or resolve runtime display text. The shared string-table reader
selects decoding from the project-owned locale metadata contract (Windows-1252
for English and strict UTF-8 for Japanese, French, and German) and fails unknown
locales explicitly. Adding a
language requires an encoding mapping, manifested tables, and representative
composed-name verification; it does not require another CCT architecture audit
unless evidence contradicts the fixed model. Direct Japanese runtime or
Creation Kit confirmation of exact on-screen U+0020 fidelity remains a
hardening item. Runtime registration and all display-consumer changes remain
separate from build-time overlay generation.

Official reference-name overlay generation is a downstream build-time layer:

```text
committed qualified provenance
    + manifested official locale tables
    -> locale reference-name materializer
    -> deterministic stable-ID overlay + reproducibility sidecar
```

Japanese is the first generated locale. Each generated locale has one module
and a matching versioned, locale-named sidecar. Direct and template identities become
one value, while composed fauna are assembled before runtime in fixed semantic
slot order with a literal U+0020 separator. The committed module contains no
FormID keys and requires no installed files at runtime. Its sidecar binds the
module to provenance, provenance-manifest identity, official locale table
hashes, token/encoding metadata, closure counts, and generator policy. Repository-only verification
checks these artifacts without reading Bethesda inputs; installed-game
generation remains an explicit verify-by-default, `--write`-to-accept workflow.

Official semantic terminology has a separate evidence boundary. The
`reference-source/official-terminology-policy.json` allowlists distinguish
canonical tracker content from plugins that may only prove official wording,
and `reference-source/official-terminology-provenance.csv` stores one qualified,
locale-neutral row per evidence occurrence. Per-locale value artifacts key
official values and recommended defaults back to stable `EvidenceId` values.
`SFBGS050.esm` is admitted only as terminology
evidence: it proves terms such as `X-Tech Power Core`, but cannot add runtime
reference entities or participate in canonical reference-name generation.
Repository verification reads only these committed artifacts. A future locale
can resolve the same plugin/record/field/string identity directly from its
official string table, without English reverse matching; contextual rows still
require editorial review.

The generated module is registered statically under `ja-JP` in the runtime
reference-name lookup. Existing consumers receive official Japanese names
without changing stable identities, persistence, or domain state. Generic
semantic-message terminology, search hardening, collation review, and visual
layout remain separate concerns.

User-facing cargo endpoint presentation uses the official `Cargo Link` and
`Inter-System Cargo Link` terms. Internal domain and persistence vocabulary
(`CargoPad`, `cargoPads`, `cargoPadId`, and the `interstellar` discriminator)
remains intentionally unchanged; the terminology change is presentation-only.

The integrated provenance pipeline uses one fail-closed builder. The project-owned
policy at `reference-source/localization-provenance-policy.json` is the single
allowlist for authoritative sources, expected TES4 master relationships,
locale encodings, and the currently reviewed closure totals. Its authoritative
universe is exactly `Starfield.esm`, `ShatteredSpace.esm`, and `SFBGS00D.esm`.
`SFBGS050.esm` is optional historical configuration only; its absence cannot
fail coverage and its presence cannot affect record or string-provider
selection. Other installed ESMs are ignored.

The integrated local pipeline is:

```text
manifest and authoritative-input validation
    -> canonical direct/system/body/organic population by stable tracker identity
    -> direct, system/body, organic, and composed-fauna generation
    -> logical provider-chain selection
    -> entity-scoped normalization and exact English verification
    -> qualified Japanese-ID availability and composed-fauna reconstruction
    -> resolved/unresolved/excluded coverage reconciliation
    -> row-shape validation and semantic drift comparison
    -> ignored machine-readable build report
```

Direct and template names have one complete component at slot 0. Composed
fauna retain sparse semantic slots 0=prefix, 1=species, and 2=diet. Every
canonical entity must occur in exactly one resolved, explicit unresolved, or
explicit excluded state. The current reviewed closure is 3,561 resolved
entities, 4,818 provenance rows, and zero unresolved entities. Its 78 resource
entities cover all 76 surfaced runtime resources plus the source-only excluded
`aqueous-hematite` and `caelumite` identities.

`reference-source/localized-name-provenance-manifest.json` records the reviewed
game version, normalized plugin identities and SHA-256 hashes, TES4 masters,
module class, archive identities and hashes, selected localization members and
hashes, locales, table types, encoding policy, generator version, and a
dedicated generation timestamp. It contains no machine-absolute paths or
Bethesda content. A normal build compares fresh inputs to this manifest before
acceptance; timestamps and optional commit metadata do not create input drift.

Repository-only validation reads committed artifacts and synthetic fixtures and
does not require Starfield. The explicit installed-game builder writes its
detailed report to `.local-work/localization/provenance/build-report.json` and,
by default, does not rewrite committed outputs. Input, editorial-localization,
and structural-provenance drift are reported separately and cause failure.
`--write` is an explicit post-review acceptance action that refreshes the
project-owned outputs and input manifest.

A future Bethesda DLC enters scope only through an intentional policy update,
declared TES4/archive/table relationships, and canonical tracker source-data
extension. Existing provider logic then consumes the expanded allowlist; a new
extractor is added only for a genuinely new naming shape. Game patches are
review events: run the builder, inspect input and semantic drift, update source
data or narrow logic if justified, explicitly accept regenerated artifacts,
then rerun repository verification. The pipeline never auto-adopts Creations,
third-party mods, arbitrary installed ESMs, or user-selected load orders.

# 15. Reference-data loading

The deliberate `npm run reference:build` workflow regenerates the 13 JSON
files and refreshes the runtime manifest and bundled expected dataset ID, so
local development can start immediately afterward. The production build regenerates all 13 required JSON files in a temporary
directory and compares their exact bytes with the committed runtime files.
Generator invariants and cross-file joins are build-time responsibilities.
The build writes a deterministic deployment manifest and bundles its dataset
ID. It never silently repairs committed files.

`ReferenceStartupGate` runs under `LocalizationProvider` before mounting
`App`. The loader verifies the manifest and all 13 required runtime JSON assets:
HTTP status, JSON MIME type, size bounds, hashes, parsing, dataset/manifest
coherence, and lightweight shapes. Only a complete validated snapshot reaches
`App`; no browser-side source regeneration occurs. Pending or failed checks keep
normal network initialization, migration, and persistence inactive, preserving
saved user data.
The fatal screen offers a full retry and a user-initiated diagnostic email link.
Its report uses only typed technical fields and never reads player state.

On Cloudflare Pages, the directory-local `public/reference-data/404.html` gives
missing `/reference-data/*` paths genuine HTTP 404 responses while unrelated
paths retain SPA fallback. This is defense in depth; the client-side startup
gate remains the primary integrity boundary and rejects non-2xx responses and
wrong MIME types even if hosting behavior changes.

Reference-data state is not part of Undo/Redo.

---

# 16. Browser persistence

Normal working persistence uses browser `localStorage`.

The data layer owns this mechanism.

Relevant module:

```text
src/data/storage.ts
```

The storage layer:

- loads the saved network collection;
- wraps legacy single-network storage in a one-entry collection;
- creates a one-entry blank collection on first run;
- saves the whole current `NetworkCollection` from `session.collection`.

Startup reads storage under an exception boundary, checks raw length before
parsing, iteratively checks the browser-specific resource envelope, rejects
incoherent source structures before deterministic migration, then validates the
recovered current shape. A failed source produces a usable temporary collection
and a persistent recovery warning, but remains untouched under the original
gameplay key. The mount effect does not save that fallback; the first changed
persisted collection (including an active-network switch or Undo/Redo) permits
replacement. Outpost selection and rerenders do not. No backup key is used.

Missing storage creates a default collection and attempts an initial save.
Read exceptions instead yield an in-memory default with storage-unavailable
status. Normalized re-save is separate from recovery: a failed write leaves a
valid recovered collection live and the original stored bytes intact. Later
serialization, envelope, quota, or storage failures leave the edit and history
in memory with a persistent unsaved warning. Subsequent collection changes
retry; success clears the warning. The status is session state, not part of
the collection or history.

The inclusive browser envelope is 4,194,304 raw UTF-16 code units; 65,536
aggregate array members; 128 networks; 128 outposts/network; 16 pads/outpost;
384 links/network; 256 outbound items/pad; 512 members for every other array;
16,384 code units for each string and object key; and depth 64 from root depth
zero. This is a persistence/resource boundary, never a gameplay editing cap.

`session.collection` is the authoritative persisted collection. Active and
inactive networks are not maintained through a separate mirrored state.

React components should not call `localStorage` directly.

If the persistence mechanism later changes to IndexedDB or another service, the intention is that most domain and UI code should not need to know.

---

# 17. Persistence migration

The storage layer includes migration logic for older saved representations.

One existing migration converts older cargo-pad-local link structures into the current network-level cargo-link model.

Older data may contain enough information to identify the destination outpost but not the exact remote cargo pad.

When safe migration is impossible, the loader preserves recoverable user data rather than inventing a link.

For example:

- outbound cargo may be retained;
- a browser legacy outpost-only choice survives as intent unless it competes with an exact claim.

Nested network schema 5 preserves simple destination intent; collection schema stays 1. Supported schemas 1–4 migrate through their existing transformations. Raw source validation rejects malformed intent and intent plus any incident claim before reconstruction. Supported missing/self/conflicting exact claims retain their IDs. Valid schema-4 browser data is upgraded and saved during initialization, without waiting for a cargo edit.

Migration should favour preservation over speculation. A malformed collection
member or ambiguous identity now rejects the entire browser-storage recovery,
preserving the raw source rather than silently dropping and rewriting a member.

---

# 18. JSON import/export

JSON files are portable representations of the complete `NetworkCollection`.

They are not treated as live documents attached to the running application.

## Export

Export:

- serializes every ordered saved network, its stable ID, and `activeNetworkId`;
- generates a useful filename;
- downloads a JSON file.

The current filename convention includes:

- application/network identifier;
- the active character name and level when available;
- local timestamp.

The filename is not persisted as network state.

## Import

Import:

- reads a selected JSON file;
- deserializes and validates its structure;
- requires a collection envelope and rejects malformed or duplicate stable IDs;
- replaces the complete collection only after successful parsing;
- records the replacement as one Undoable action.

A failed import must not alter collection state.

Import/export success and failure messages are presentation/session state.

Legacy bare-network files may be rejected externally. Browser-local migration
continues to recover the earlier bare-network storage representation.

External files and browser storage deliberately use different acceptance paths.
External file import checks the selected file's byte size before reading it (maximum
4,194,304 bytes). Its pre-migration capacity pass bounds saved networks to 64,
outposts per network to 96, cargo pads per outpost to 12, links per network to
256, manufacturing and Planned Supply entries per outpost to 256 each, and
outbound items per pad to 128. The sum of the lengths of every array recursively
in the source collection, including legacy fields, may be at most 25,000;
every source string is limited to 4,096 JavaScript UTF-16 code units. Limits
are inclusive and apply only to the external trust boundary. Accepted imports
retain normal collection-wide Undo/Redo. Browser storage instead has its own
larger resource envelope and historical recovery path. It rejects incoherent
collections atomically while allowing unambiguous historical defaults and
transformations. External import retains its stricter file byte, structure,
and capacity policy unchanged.

These import and persistence boundaries close the three MEDIUM findings in the
[whole-product security audit](audits/codex-whole-product-security-audit.md).
The original findings remain there as historical evidence. CSP and related
HTTP security headers are now deployed on Cloudflare Pages; see
[Deployment](DEPLOYMENT.md) for the current policy.

Structural import checks do not replace domain validation. Unknown reference IDs,
incomplete plans, stale exports, and other representable semantic problems remain
importable for the normal validation system to diagnose.

Stable identity follows the namespace used to address each object: saved-network
IDs are unique within the collection; outpost IDs and Cargo Link relationship IDs
are each unique within their network as separate namespaces; cargo-pad IDs are
unique within their parent outpost. Every identity in these scopes is non-empty.

Expected import failures cross the data/UI boundary as locale-neutral error codes
with structured parameters. The UI maps those codes to semantic localization
descriptors; data and migration code do not own user-facing prose.

---

# 19. Editing-session architecture

The collection, working context, selected-outpost memory, and Undo/Redo history
are coordinated as one `CollectionEditingSession`.

Conceptually:

```ts
interface CollectionEditingSession {
  collection: NetworkCollection
  context: { networkId: string; outpostId: string | null }
  selectedOutpostByNetworkId: Record<string, string | null>
  history: CollectionHistory
}
```

React `App.tsx` uses:

```text
useReducer(...)
```

with the pure domain reducer:

```text
collectionEditingSessionReducer
```

This design ensures collection state, active network, selected outpost, and
history move atomically. Manual network/outpost navigation updates persisted
`activeNetworkId` and session-only selection memory without creating history.

`sampleNetwork` is an explicit development/test fixture and is not startup data.

The reducer itself does not depend on React.

---

# 20. Undo/Redo history model

Undo/Redo uses whole-collection immutable before/after snapshots.

A history entry contains:

- the before and after collection snapshots;
- the before and after Network + Outpost working context;
- an action label;
- a timestamp.

The central semantic rule is:

> One deliberate user action should normally create one Undo entry.

A single user action may therefore contain several internal mutations.

Examples include:

- deleting a cargo pad and removing its cargo link;
- changing star system and clearing an incompatible body;
- enabling production and automatically retiring fulfilled Planned Supply;
- importing an entire collection.

Those related effects should remain one history action.

Undo and Redo normalize restored context centrally: a missing network falls
back through valid active ID to first network, while a missing outpost falls
back to first outpost or `null`. Traversal always restores the context recorded
for the action, even after unrelated manual navigation.

Navigation and Cargo presentation use separate reset boundaries. Both reset
across active-network or lifecycle/import replacement boundaries. Outpost
membership changes reset Navigation; selected-outpost or cargo-pad membership
changes reset Cargo. Stable-ID reorder alone resets neither. Ordinary
same-outpost value edits preserve both through Undo/Redo.

Cargo-pad removal is the narrow exception to the general cargo-pad membership
reset. Traversing that action preserves the mounted Cargo editor so unrelated
expanded/collapsed state remains current. A transient, presentation-only
instruction expands the restored pad on Undo and removes its stale expansion
key on Redo; it is not stored in collection history or persisted data.

---

# 21. History branching

When the user:

1. performs actions;
2. Undo(s);
3. then performs a new action;

the previous Redo branch is discarded.

This follows conventional Undo/Redo behaviour.

History is session-only.

It is not persisted to browser storage or JSON.

The collection-global session history retains at most the newest 1,000 entries.
When a new entry exceeds that bound, the oldest retained entry is discarded.

---

# 22. No-op editing operations

Editing-session updates may return the existing collection object.

Returning the exact same collection object is treated as a no-op.

A no-op:

- does not replace the current collection;
- does not create an unnecessary Undo entry.

This allows application handlers to safely avoid recording edits that do not actually change persisted state.

---

# 23. Immutable update pattern

Persisted collection and nested network state should be treated as immutable.

Typical updates use:

- object spread;
- array spread;
- `map`;
- `filter`;
- replacement arrays.

Do not mutate an existing network/outpost/pad/link object in place.

The architecture assumes snapshots are safe to retain in history.

In-place mutation would undermine that assumption.

---

# 24. App.tsx responsibilities

`src/App.tsx` is currently the main application coordinator.

Its responsibilities include:

- coordinating the collection editing session and its reducer;
- dispatching Undo/Redo;
- deriving the active network and outpost for presentation from session state;
- owning reference-data state;
- owning transient status messages;
- deriving data needed across multiple features;
- coordinating changes that affect several domain objects;
- composing the page-level UI.

`App.tsx` is currently large.

That is recognised, but broad decomposition should not be done incidentally during unrelated tasks.

Future extraction should be deliberate and preserve the existing ownership boundaries.

---

# 25. UI component responsibilities

UI components generally fall into two categories:

## Feature components

Under:

```text
src/ui/components/
```

Examples include:

- character editing;
- outpost navigation;
- outpost details;
- resource editing;
- manufacturing;
- Planned Supply;
- cargo pads;
- validation display;
- import/export controls.

Feature components should receive:

- data;
- callbacks;
- derived presentation information.

They should not independently mutate persisted domain/collection state.

## Layout components

Under:

```text
src/ui/layout/
```

Layout components should primarily own:

- positioning;
- semantic page regions;
- spacing;
- sticky/fixed behaviour;
- major layout structure.

They should not normally own domain behaviour.

---

# 26. Current page shell

The application currently has three distinct shell regions:

## Title bar

`TitleBar`

Purpose:

- application identity.

Behaviour:

- normal document flow;
- scrolls away as the user moves down the page.

It should not contain network-editing controls.

## Page header

`PageHeader`

Purpose:

- persistent network-level controls.

Current contents include:

- character;
- Outpost Management;
- Planetary Habitation;
- Undo;
- Redo;
- Export;
- Import.

Behaviour:

- sticky at the top of the viewport.
- exposes its current rendered height through the shared shell geometry
  contract, updated by `ResizeObserver` when wrapping, locale, zoom, or font
  metrics change.

## Status bar

`StatusBar`

Purpose:

- persistent status and application feedback.

Current contents include:

- validation access;
- transient success/error messages.

Behaviour:

- fixed to the bottom of the viewport;
- fixed height from the shared Status Bar token;
- workspace bottom spacing and document block-end scroll inset use the same
  token so content is reachable and focus alignment respects the reservation.

`src/ui/focusVisibility.ts` owns the presentation-only fixed-chrome focus
contract. It focuses application targets, reveals nested vertical scroll owners
first, excludes fixed overlays from document correction, then minimally adjusts
the document between the rendered Page Header bottom and Status Bar top. A
post-focus recheck covers layout settling and already-focused shortcut targets.
The same module supplies the transient programmatic-focus class used by the
Resource Matrix. No measured geometry, focus, or scroll state enters persistence
or Undo/Redo history.

Success messages expire automatically.

Action errors remain visible until dismissed or replaced.

---

# 27. Workspace layout

The main application workspace currently separates:

- outpost navigation;
- outpost editing;
- cargo-pad editing.

`WorkspaceLayout` owns the major positioning.

Its two operational columns also expose a shared, control-safe minimum height
for the Resource Matrix and Cargo Links title strips. The peer components own
their typography and controls, while this layout-level contract keeps their
outer boundaries aligned without coupling their body geometry.

The exact long-term scrolling behaviour of the major workspace regions is intentionally unresolved.

In particular:

- the status matrix lives above Planned Supply in the middle Outpost Details
  column, while Cargo Pads remain in the right column;
- the matrix uses scoped horizontal overflow and a sticky Item column without
  owning an artificial vertical scrolling region;
- the Cargo Pads toolbar remains outside a viewport-bounded, independently
  scrolling card list;
- broader independent scrolling for Navigation and Outpost Details remains
  unresolved;
- selected-outpost information in the sticky page header has been considered but deferred.

Do not redesign workspace scrolling as incidental work.

---

# 28. Selected outpost

The active selected outpost is working context owned by the collection editing
session. Per-network remembered outpost selection is also session-only.

Neither value is persisted in `OutpostNetwork`; `activeNetworkId`, by contrast,
is persisted collection state. Manual network/outpost navigation updates this
context without creating history.

The selected ID is used to derive:

- selected outpost data;
- local body/resource options;
- availability;
- provenance;
- cargo editing context.

Presentation-only sub-outpost state remains separate and should reset only at
its relevant ownership boundary. Collection replacement operations such as
import must ensure the selected-outpost context still refers to a valid
outpost.

---

# 29. Capacity rules

Capacity calculations belong in domain helpers rather than UI components.

Relevant module:

```text
src/domain/capacity.ts
```

Current examples include:

- outpost capacity based on Planetary Habitation;
- cargo-pad capacity based on Outpost Management.

UI components receive the derived capacity and display current/maximum counts.

Unknown skill rank is represented as `null`, and the UI does not invent a maximum when the relevant rank is unknown.

---

# 30. Validation architecture

Validation lives under:

```text
src/domain/validation/
```

Validation is derived from:

- the current network;
- reference data where required.

Validation does not belong in persistence.

A validation rule should generally have:

- one clear responsibility;
- a stable rule ID;
- an appropriate severity/category;
- enough stable context IDs for presentation to explain where the issue occurred.

Validation rules should avoid overlapping reports for the same problem unless the distinction is intentional.

---

# 31. Validation presentation

Domain validation issues store stable identifiers.

The UI resolves those identifiers into human-readable names.

For example:

- outpost ID → outpost name;
- cargo-pad ID → pad label;
- resource/product ID → reference-data display name.

This maintains separation between:

- domain diagnostics;
- presentation wording.

The validation summary is accessible from the fixed status bar.

Its expanded panel is presentation-only state.

---

# 32. Validation versus enforcement

Validation and editing constraints are related but not identical.

Some rules may:

- prevent an impossible action;
- disable a control;
- report an error;
- report a warning;
- simply provide informational diagnostics.

Do not assume every validation issue should block editing.

Do not silently auto-correct network state because a validator reports a problem unless that repair behaviour is explicitly required.

---

# 33. Local UI drafts

Some inputs use temporary local React state while the user edits a value.

This is especially useful for:

- text fields;
- numeric text input;
- values where blank is a meaningful temporary editing state.

The local draft is committed only when editing is completed, such as on blur.

This supports the Undo rule:

> one completed edit = one Undo entry

rather than:

> one keystroke = one Undo entry.

Local drafts must stay synchronized with persisted state so Undo/Redo updates are reflected correctly.

---

# 34. Presentation-only state

Examples of state that should remain outside `OutpostNetwork` include:

- selected outpost;
- expanded/collapsed panels;
- transient status messages;
- file-input state;
- validation panel open/closed state;
- Search for Items draft, submitted identity, open state, and palette position;
- future Expand All / Collapse All state;
- viewport-specific layout state.

Such state should not enter:

- serialization;
- browser persistence;
- Undo/Redo history;

unless explicitly required.

---

# 35. Reordering

**Stable identity/membership determines structural continuity; array
reordering alone is not object replacement.** This applies to networks,
outposts, cargo pads, and other ordered stable-ID collections: order may affect
presentation, while stable IDs determine identity.

Outpost and cargo-pad ordering is currently stored through array position.

Manual up/down movement changes the persisted array order.

Cargo-pad reordering preserves:

- stable pad IDs;
- cargo contents;
- cargo-link relationships.

Visible positional labels are currently renumbered after order changes.

Arrow and drag-and-drop reordering share the same final-index operation.
Each completed reorder is one Undoable action.

---

# 36. Defaults

Creation defaults belong in domain helpers where practical.

Relevant module:

```text
src/domain/defaults.ts
```

Examples include:

- default outpost creation;
- generation of unique default names.

The current default naming scheme uses:

```text
New Outpost
New Outpost (2)
New Outpost (3)
...
```

and fills available numbering gaps.

Default naming is separate from validation of duplicate user-entered names.

---

# 37. Duplicate names and identity

Outpost names are user-visible labels, not IDs.

Duplicate names are currently allowed but produce an advisory validation warning.

The warning is grouped per duplicated exact name rather than emitted once per outpost.

Current duplicate matching is exact/case-sensitive.

Any future name-normalization policy should be a deliberate product decision.

---

# 38. Error and status-message architecture

Application action feedback is owned at App level.

Current transient status messages distinguish:

```ts
'success'
'error'
```

Success behaviour:

- visible in the status bar;
- automatically expires after a short period.

Error behaviour:

- visible in the status bar;
- remains until replaced or dismissed.

Reference-data failure is presented by the pre-App fatal state, outside the status bar.

Status messages are not persisted.

---

# 39. Styling architecture

Styling is currently plain CSS.

Components commonly import a component-specific stylesheet.

Layout-related CSS should remain with the relevant layout component where practical.

Global/root behaviour belongs in global styles such as:

```text
src/index.css
```

An important current shell dependency is:

- fixed status-bar height;
- matching bottom padding on the application root.

If the fixed footer height changes, the reserved workspace clearance must remain consistent.

---

# 40. Data-flow examples

## Editing an outpost field

Typical flow:

```text
User input
   ↓
UI component local draft
   ↓
commit callback
   ↓
App.tsx
   ↓
editing-session reducer
   ↓
immutable NetworkCollection before/after state
   ↓
history records collection + Network/Outpost context
   ↓
React derives active network/outpost and re-renders
   ↓
browser storage saves session.collection
```

## Deriving inbound cargo

Typical flow:

```text
Selected outpost/pad
   ↓
network-level CargoLink
   ↓
remote endpoint
   ↓
remote CargoPad.outboundItems
   ↓
availability/provenance domain logic
   ↓
UI presentation
```

No inbound cargo collection is persisted.

## Successful import

Typical flow:

```text
User selects JSON file
   ↓
FileReader
   ↓
deserialize
   ↓
successful NetworkCollection
   ↓
App import handler
   ↓
one Undoable collection replacement
   ↓
Network/Outpost context made valid
   ↓
browser storage saves session.collection
   ↓
status-bar success message
```

A parsing/deserialization failure stops before collection mutation.

---

# 41. Known architectural pressure points

Several areas are expected to evolve.

They are documented here so maintainers understand where complexity is accumulating, not as permission to refactor them opportunistically.

## App.tsx size

`App.tsx` currently coordinates many application actions and is large.

Future decomposition may be useful, but should be planned around coherent responsibilities rather than arbitrary file-size reduction.

## Outpost Details

The Outpost Details area combines spanning identity/location fields with a
shared status matrix above Planned Supply in the middle workspace column. Cargo
Pads remain in the right column. The matrix derives resource occurrence, actual
availability, exports, and imports without adding presentation state to
`OutpostNetwork`.

`OutpostStatusMatrix.css` keeps one authoritative `--outpost-matrix-columns`
template for header anchors and body rows. Any header-only presentation must
preserve that template, table minimum width, and body controls. Help target
reservation belongs to the header layer, not to domain or saved state. Inputs
overhang is applied only to its nested label using shared spacing variables;
the semantic cell retains its body-track position. A component-local heading
helper keeps each final word and its help control together without changing
catalogue text, help ownership, or DOM column order. See
`docs/audits/RESOURCE-MATRIX-HEADER-GEOMETRY-VERIFICATION.md` for measurements
and remaining manual acceptance.

The editable outpost name owns a component-local draft and commits through
`App.tsx`. Location selectors derive normal System and Body choices from the
runtime body's `outpostAllowed` fact while retaining any current persisted
non-candidate value as a recovery option. Runtime validation reports known
ineligible locations and base-game name-length advisories without rewriting
persisted data.

Manufacturing add/remove work is staged in component-local draft state and
committed through `App.tsx` as one collection-history action affecting the
active network.

## Selection controls

Checkbox-heavy resource/product lists may evolve toward denser toggle-button grids.

Planned Supply is a likely pilot for that pattern.

Do not globally replace selection controls until the interaction pattern is proven.

## Cargo-pad labels

Persisted positional labels may eventually be replaced by labels derived from current array position.

This is not yet decided.

## Workspace scrolling

Independent scrolling/sticky workspace regions have been discussed but remain unresolved.

## Undo/Redo navigation

Undo/Redo restores the Network + Outpost working context recorded for each
action. Manual navigation remains outside history.

Potential future features include:

- history list;
- direct history navigation;
- keyboard shortcuts;

These are deferred.

---

# 42. What should trigger an architectural discussion

Before implementing a change, pause if it would require:

- adding UI-only fields to `OutpostNetwork`;
- duplicating derived availability/inbound/provenance data in persistence;
- moving domain rules into React components;
- changing cargo-link ownership;
- changing stable identity rules;
- changing schema version/migration behaviour;
- changing one-action/one-Undo semantics;
- making history persistent;
- introducing a new application-wide state-management framework;
- broad restructuring of `App.tsx`;
- adding a second competing model for ordering or relationships.

These changes may eventually be appropriate, but they should be deliberate.

---

# 43. Current architecture summary

At a high level:

```text
REFERENCE DATA
systems / bodies / resources / products / recipes
                 │
                 ▼
           domain lookups
                 │

PERSISTED COLLECTION
ordered saved networks + active ID
each containing character / outposts / cargo
                 │
                 ▼
        domain derived logic
availability / provenance / validation / capacity
                 │
                 ▼
              App.tsx
     application coordination
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
 UI components        session UI state
                       per-network selection memory
                       drafts
                       status
                       expansion

UNDO/REDO
whole-collection before/after snapshots + working context
session-only

PERSISTENCE
localStorage NetworkCollection
session.collection saved directly

IMPORT/EXPORT
whole-collection JSON interchange
not a live-file relationship
```

The central architectural idea is:

> `NetworkCollection` is the persisted root containing ordered
> `OutpostNetwork` documents; the collection editing session coordinates
> authoritative state, history, and working context; `App.tsx` coordinates the
> reducer and presentation; session-only UI state remains outside the persisted
> model.

Preserve that separation unless a future design decision explicitly changes it.

## Application build identity and legal text

scripts/build-identity.ts reads package.json, checks lockfile version agreement,
and resolves checkout/allowlisted CI commit evidence during Vite configuration.
The dependency-free scripts/version-management.ts maintainer tool calculates
explicit beta, RC and stable transitions and synchronizes package.json with both
lockfile version roots. It is never invoked by builds, Git hooks or deployment.
Only version, full commit, clean/modified/unknown status and a conditional source
URL reach the typed src/buildIdentity.ts browser module. There are no runtime
GitHub requests, environment dumps or timestamps. Git status includes tracked
and untracked non-ignored changes. Missing Git or status evidence remains
unverified; only a clean verified checkout gets an exact source link. Branch
names are not exposed. Application identity is independent of all persisted
schemas, reference hashes, game-source versions and locale IDs.

scripts/legal-assets.ts emits LICENSE and THIRD-PARTY-NOTICE.md verbatim as
separate static text files and serves equivalent dev routes. About links to
them on demand; legal texts do not enter JavaScript or startup fetches. Root
sources own the text, avoiding manually maintained public copies. About owns
only presentation and uses the shared modal/focus contract; opening it does
not mutate collection state, storage or Undo/Redo.

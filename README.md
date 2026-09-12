# Starfield Outpost Network

**Starfield Outpost Network** is a local browser-based tracker and planning tool for managing a player's outpost network in *Starfield*.

The project is intended to make complex outpost networks easier to record, inspect, validate, and eventually plan. It tracks outposts, character skills, local resources, active production, manufacturing, Planned Supply, cargo pads, and cargo links while preserving the distinction between actual supply and future intent.

The application is under active development.

## Current capabilities

The application currently supports:

- character-level outpost skill tracking;
- ordered multiple-network creation, navigation, deletion, and reset;
- creation, renaming, selection, and manual ordering of outposts;
- star-system and planetary-body assignment;
- local resource recording;
- explicit X-Tech presence and production tracking;
- active production tracking;
- manufacturing configuration;
- Planned Supply;
- regular and interstellar cargo pads;
- bidirectional cargo links between specific cargo pads;
- outbound cargo selection;
- derived inbound availability;
- supply provenance;
- character-skill-dependent outpost and cargo-pad capacity;
- domain validation and advisory warnings;
- global contextual Undo/Redo across all networks;
- automatic browser persistence;
- browser-derived or explicitly selected US/UK English presentation;
- whole-collection JSON import and export;
- reference-data loading and reload status.

The project deliberately allows some incomplete or temporarily invalid planning states to remain recorded so they can be diagnosed rather than silently discarded.

## Technology

The application uses:

- React;
- TypeScript;
- Vite;
- plain CSS;
- browser `localStorage` for normal persistence;
- JSON files for import/export.

No separate application state-management framework is currently used.

## Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

The application is normally available at:

```text
http://localhost:5173/
```

Run the production build and TypeScript whole-project check:

```sh
npm run build
```

Run ESLint:

```sh
npm run lint
```

Rebuild and verify generated reference data explicitly:

```sh
npm run reference:build
npm run reference:test
```

Preview the production build:

```sh
npm run preview
```

## Project structure

The main source areas are:

```text
src/
├── App.tsx
├── data/
├── domain/
└── ui/
    ├── components/
    └── layout/
```

Broadly:

- `src/domain/` contains domain models, derived logic, Undo/Redo logic, capacity rules, and validation;
- `src/data/` contains persistence, serialization, reference-data loading, and import/export utilities;
- `src/ui/` contains React presentation and layout components;
- `src/App.tsx` coordinates application-level state and cross-feature interactions.

Reference-data source material and supporting scripts live outside the main application source tree.

## Documentation

The repository includes documentation intended for both maintainers and coding agents:

- [`AGENTS.md`](AGENTS.md)
  - repository-wide instructions for coding agents;
  - scope discipline;
  - architectural boundaries;
  - testing and implementation expectations.

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
  - technical architecture;
  - state ownership;
  - persistence;
  - Undo/Redo;
  - domain/UI boundaries;
  - known architectural pressure points.

- [`docs/DOMAIN-RULES.md`](docs/DOMAIN-RULES.md)
  - current domain semantics;
  - supply and cargo behaviour;
  - character skill meaning;
  - capacity rules;
  - validation versus enforcement;
  - explicitly deferred or unresolved rules.

- [`docs/UX-DESIGN.md`](docs/UX-DESIGN.md)
  - settled presentation and interaction conventions;
  - layout, navigation, reordering, density, and accessibility guidance.

- [`docs/BACKLOG.md`](docs/BACKLOG.md)
  - genuinely deferred work;
  - unresolved product and technical decisions.

- [`docs/IMPLEMENTATION-WORKFLOW.md`](docs/IMPLEMENTATION-WORKFLOW.md)
  - implementation handoff and review process;
  - architecture audits, verification, and documentation maintenance.

When implementing a feature, read `AGENTS.md` first and then consult the relevant deeper documentation.

## Persistence

The application normally saves the ordered network collection and active network automatically in browser `localStorage`.

JSON import/export is provided for portable backups and interchange.

Application preferences, including the Automatic/explicit locale selection,
use a separate browser-storage record. They are not part of network data,
Undo/Redo, or JSON import/export.

Imported/exported files are not treated as live documents attached to the running application.

## Reference data

The application keeps Starfield reference data separate from the player's persisted network.

Persisted network state stores stable IDs for systems, planetary bodies, resources, and products. Human-readable names, recipes, and other metadata are resolved from the reference-data layer.

This separation allows reference data to evolve without duplicating large reference records into each saved network.

Runtime catalogues are generated by `scripts/build-reference-data.mjs`.
Planetary bodies and systems come directly from the canonical game extract at
`reference-source/planet-directory.csv`, including base-game and Shattered
Space records. The inorganic ESM extract provides canonical FormID identity,
names, abbreviations, source rarity, and family parents. The separate
FormID-keyed tracker policy pins stable persisted resource IDs and owns runtime
inclusion, presentation rarity, and Planned Supply placement/order. The organic
occurrence extract supplies canonical organic identity, while the canonical
Industrial Workbench extract supplies manufactured-product identity and recipes.
Both join by FormID to `item-tracker-metadata.csv`, which explicitly pins stable
product/organic app IDs, abbreviations, tracker rarity, and sparse display
overrides. Recipe COBJ provenance is validated only during generation.
`biome-inorganic-resources.csv` and `biome-organic-resources.csv` supply biome,
atmospheric, and species relationships. Body-level inventory is a derived
compatibility index; organic matrix choices require domesticable species.
The browser loads the generated JSON files
under `public/reference-data/`.

Aqueous Hematite and Caelumite are canonical-known but tracker-excluded. X-Tech
is runtime-enabled as a special resource and appears after Helium-3 and Water in
Planned Supply. Its recorded presence is an explicit outpost fact rather than a
canonical biome occurrence. Localized names are presentation-only and never
determine persisted identity.

### Localized-name provenance

Parcel C1 includes a narrow, read-only build tool for recovering raw localized
string IDs from four audited `Starfield.esm` record fields. It is not a general
plugin parser and is never used by the browser application. Ordinary CI uses
project-authored synthetic bytes only; no Bethesda binary data is stored in the
repository.

With a locally installed, legally owned copy of Starfield, run:

```powershell
npm run localization:provenance:proof -- --plugin "C:\path\to\Starfield.esm"
```

The proof is pinned to Starfield `1.16.244.0` and SHA-256
`1DABED00C3F4282DD3BB54D2E9601E40B577D8742D078B7CCEF203ADBFEF0DA7`.
The command reports the observed size/hash and writes a local reproducibility
manifest under `.local-work/localization/provenance/`. If the hash differs, it
still reports extracted values but requires `--acknowledge-hash-mismatch` before
treating proof-value differences as test failures. Review and re-audit version
drift rather than updating the pinned profile blindly.

Run the synthetic parser tests independently with:

```powershell
npm run localization:provenance:test
```

Parcel C2 uses the same narrow reader to build the normalized
`reference-source/localized-name-provenance.csv` crosswalk for direct-name
resources, products, biomes, and five official skill terms. Every canonical C2
target is either in that file or in
`reference-source/localized-name-provenance-unresolved.csv`; repeated recipe and
BIOM occurrences do not duplicate entity provenance.

Local regeneration requires a JSON config supplied with `--config`. It declares
`gameVersion`, an ordered `plugins` array of `{ filename, path }`, and an explicit
`localizationInputs` array of `{ plugin, tableType, path }`. Paths may be absolute
or relative to the config file. Tables must already be legally extracted English
`.strings`, `.dlstrings`, or `.ilstrings` files; archive names are deliberately
not inferred. For example:

```powershell
npm run localization:provenance:build -- --config ".local-work/localization/provenance/c2-inputs.json"
npm run localization:provenance:verify
```

The first command reads plugins and tables only, deterministically rewrites the
two crosswalk CSVs, and writes a local hash manifest under `.local-work/` by
default. The second command validates committed schema, identity, and complete
resolved/unresolved coverage without requiring game files. `reference:build`
runs the same validation gate before producing runtime reference JSON.

Missing plugin/table inputs and unsupported direct record shapes remain explicit
unresolved rows. Wrong IDs, tables, fields, plugins, or unexplained English
mismatches fail regeneration. The verifier always follows record to raw ID to
official English; it never selects an ID by matching English text.

No Bethesda plugin, archive, or string-table content may be committed. C2 emits
no Japanese data and does not alter runtime localization, UI, persistence, or
network schemas. Later parcels C3-C8 cover deferred populations and provider
inheritance; Parcel D will consume verified provenance for runtime overlays.

## Project status

This project is in active development.

Current work is focused on improving the usability of the tracker and establishing reusable interaction patterns before expanding into more advanced planning features.

Future work may include richer network visualization, more advanced validation, throughput-aware planning, recipe-chain reasoning, biome/resource data, and deeper integration with player-state data.

Deferred ideas should not be treated as implemented requirements unless explicitly included in a current implementation brief.

## Game and project scope

This is an independent fan/project-development tool related to *Starfield*.

It is not affiliated with or endorsed by Bethesda Game Studios or Microsoft.

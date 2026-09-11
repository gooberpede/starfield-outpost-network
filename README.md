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
and manufactured-product dictionaries retain their existing curated roles.
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

## Project status

This project is in active development.

Current work is focused on improving the usability of the tracker and establishing reusable interaction patterns before expanding into more advanced planning features.

Future work may include richer network visualization, more advanced validation, throughput-aware planning, recipe-chain reasoning, biome/resource data, and deeper integration with player-state data.

Deferred ideas should not be treated as implemented requirements unless explicitly included in a current implementation brief.

## Game and project scope

This is an independent fan/project-development tool related to *Starfield*.

It is not affiliated with or endorsed by Bethesda Game Studios or Microsoft.

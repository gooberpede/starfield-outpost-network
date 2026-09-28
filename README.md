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
- browser-derived or explicitly selected English (US/UK), French, German, Italian, Japanese, Polish, Portuguese (Brazil), Simplified Chinese and Spanish (Spain) presentation;
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

Use Node.js 24 (package engine `>=24 <25`; verified with Node 24.21.0 and npm 11.19.0). Install the locked dependencies:

```sh
npm ci
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

Run the automated suites and test type checks:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run localization:terminology:verify
npm run localization:provenance:verify
```

Run ESLint:

```sh
npm run lint
```

Ordinary checkout builds use committed generated inputs and require no installed game. Maintainer-only regeneration of provenance and localized overlays requires legally obtained local game inputs; never commit game binaries or string tables. Rebuild and verify reference data explicitly:

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

Networks are saved in this browser profile on this origin. There is no account
sync or server backup. Export JSON before moving browsers/devices or clearing
browser data. Import replaces the whole collection; export a backup first. If
saving fails, export your in-memory work before closing the page. Unusually
large, modded or outlier data may exceed the external-import envelope; universal
re-import is not promised.

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
compatibility index; organic matrix choices require an exact domesticable
producer on the selected planet/body, independent of selected biome.
The browser loads the generated JSON files
under `public/reference-data/`.

Aqueous Hematite and Caelumite are canonical-known but tracker-excluded. X-Tech
is runtime-enabled as a special resource and appears after Helium-3 and Water in
Planned Supply. Its recorded presence is an explicit outpost fact rather than a
canonical biome occurrence. Localized names are presentation-only and never
determine persisted identity.

### Localized-name provenance

The provenance pipeline includes a narrow, read-only build tool for recovering raw localized
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

The provenance generator uses the same narrow reader to build the normalized
`reference-source/localized-name-provenance.csv` crosswalk for direct-name
resources, products, biomes, and five official skill terms. Every canonical direct-name
target is either in that file or in
`reference-source/localized-name-provenance-unresolved.csv`; repeated recipe and
BIOM occurrences do not duplicate entity provenance.

Optional installed-game verification uses an explicit local JSON configuration
and manifested, legally extracted localization inputs. Follow the current
[provenance architecture](docs/ARCHITECTURE.md#142-build-time-localized-string-provenance-boundary)
and [locale handbook](docs/localization/LOCALE-ONBOARDING.md) for the authoritative
plugin, table and archive policy; do not infer ownership from archive names.
For example:

```powershell
npm run localization:provenance:build -- --config ".local-work/localization/provenance/provenance-inputs.json"
npm run localization:provenance:verify
```

The first command verifies inputs and generated results, reports drift, and
writes an ignored local report. It does not accept changed committed outputs
unless the maintainer explicitly adds `--write` after review. The second command
validates committed schema, identity, and complete
resolved/unresolved coverage without requiring game files. `reference:build`
runs the same validation gate before producing runtime reference JSON.

Missing plugin/table inputs and unsupported direct record shapes remain explicit
unresolved rows. Wrong IDs, tables, fields, plugins, or unexplained English
mismatches fail regeneration. The verifier always follows record to raw ID to
official English; it never selects an ID by matching English text.

No Bethesda plugin, archive or complete string-table binary may be committed.
The integrated pipeline now covers direct, system, body, organic and composed
fauna names and provider inheritance. Verified provenance supplies committed
official-name overlays for all supported non-English locales. See
[locale onboarding](docs/localization/LOCALE-ONBOARDING.md) for current generation
and review instructions; historical briefs record earlier intermediate work.

## Project status

This project is in active development.

Current work is focused on improving the usability of the tracker and establishing reusable interaction patterns before expanding into more advanced planning features.

Future work may include richer network visualization, more advanced validation, throughput-aware planning, recipe-chain reasoning, biome/resource data, and deeper integration with player-state data.

Deferred ideas should not be treated as implemented requirements unless explicitly included in a current implementation brief.

## Game and project scope

This is an independent fan/project-development tool related to *Starfield*.

It is not affiliated with or endorsed by Bethesda Game Studios or Microsoft.

## Licence and source

Copyright (C) 2026 Gooberpede. Project-authored application/build/test code for
which the project holds the relevant rights is licensed under the GNU GPL,
version 3 or (at your option) any later version: **GPL-3.0-or-later**. It is
provided without warranty, including implied merchantability or fitness for a
particular purpose. See [LICENSE](LICENSE) and [third-party notices](THIRD-PARTY-NOTICE.md).
The favicon, including historical versions, is separately licensed artwork
excluded from that grant. Official game text and generated game-derived data
are not relicensed as Gooberpede's code. Upstream software notices and applicable
combined-work obligations remain intact. See the [provenance ledger](docs/THIRD-PARTY-REFERENCES.md).

The existing [source repository](https://github.com/gooberpede/starfield-outpost-network)
and its development history are retained. At public launch, the exact deployed
commit's corresponding source, build scripts and lockfile must be publicly
available there, alongside these build instructions. A clean About build links
to its full commit; modified/unverified builds do not claim exact pristine
source correspondence. Repository and Issues availability without authentication
must be checked at publication; a private link is not public source access.

## Application versions

The current pre-release line begins at **0.9.0-beta.1**. `package.json` is the
application-version authority; the version commands synchronize both lockfile
roots. About combines that application version with a separate short Git commit
and an honest clean, modified or unverified status. Ordinary commits, builds and
staging deployments do not change the application version.

Maintainers advance deliberate checkpoints with:

```sh
npm run version:beta                 # 0.9.0-beta.1 -> 0.9.0-beta.2
npm run version:rc -- 1.0.0          # start 1.0.0-rc.1 with an explicit target
npm run version:rc                   # continue rc.1 -> rc.2
npm run version:release              # promote beta/RC to its stable core
npm run version:patch                # stable 1.0.0 -> 1.0.1
npm run version:minor                # stable 1.0.1 -> 1.1.0
npm run version:major                # stable 1.1.0 -> 2.0.0
```

Beta and RC continuation commands require an existing matching prerelease.
Stable increments require a stable current version. Starting an RC train always
requires an explicit stable target. These commands only update package metadata:
they never commit, tag, push, publish or deploy. The formal **1.0.0-rc.1** cut and
its acceptance remain future deliberate checkpoints.

Future versions follow [SemVer](https://semver.org/): patch for compatible fixes,
minor for compatible application features, major for incompatible supported
application behavior or data-interchange contracts. Internal React component
APIs are not public contracts. App versions are independent of save schemas,
reference hashes, source-game versions and locale IDs; no migration is implied.
The npm package remains private. Public release tags use `v<version>` and remain
separate, explicitly authorized release operations; published tags must not be
silently moved.

## Support

Use [GitHub Issues](https://github.com/gooberpede/starfield-outpost-network/issues)
for reproducible bugs and feature suggestions. For private or alternative
contact, email [support@starfieldoutposts.com](mailto:support@starfieldoutposts.com).
Mailbox delivery and replies have been verified by the owner.

Include application version/build, browser/OS versions, locale, concise steps
and expected versus actual behavior. Prefer a small synthetic example; do not
post real saved networks, credentials or personal data by default. Arrange a
private, redacted example only if needed. Response times, feature implementation,
fluent support in every language and contribution acceptance are not promised.

[Support Gooberpede](https://ko-fi.com/gooberpede) voluntarily for the developer's
Bethesda modding and tools work. Released projects are free to use. Tips or
memberships do not purchase extra features, exclusives, access, priority support
or delivery commitments. This describes the developer's offering and adds no
restriction to GPL recipients. Ko-Fi page presentation and membership pricing
remain a separate pre-launch task.

## Platform and release status

The interface is desktop-oriented. Existing acceptance primarily covers Windows/
Chromium. Owner testing on iPhone 12/Safari passed basic production workflows,
including locale changes and cargo linking; the earlier blank page was not
reproduced. Japanese X-Tech overflow and possible expanded Cargo compression
remain observations (compression cause unconfirmed). There is no phone-optimized
support promise or comprehensive Apple/VoiceOver certification.

Licensing/identity/About preparation does not mean publication, candidate
acceptance or launch has occurred. See [preparation verification](docs/audits/RELEASE-PREPARATION-VERIFICATION.md)
and [Deployment](docs/DEPLOYMENT.md) for remaining gates.

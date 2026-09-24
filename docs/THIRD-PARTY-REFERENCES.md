# Third-party references and provenance

## Scope and shipped notices

This ledger distinguishes software, artwork, external fonts, game-derived
content and development tools. [THIRD-PARTY-NOTICE.md](../THIRD-PARTY-NOTICE.md)
owns the shipped full notices and licence boundary; LICENSE is the unchanged
official GPLv3 text. Project-authored application/build/test code is offered by
Gooberpede under GPL-3.0-or-later. Third-party rights are preserved, and original
dependency licences do not remove applicable combined-work GPL obligations.

## Software and artwork inventory

| Material | Role, source and evidence | Distribution / disposition |
| --- | --- | --- |
| React 19.2.8, React DOM 19.2.8, Scheduler 0.27.0 | Browser software from [facebook/react](https://github.com/facebook/react). Installed package LICENSE files contain the identical Meta MIT notice. | Bundled JavaScript; full notice retained in root and emitted legal text. Lockfile owns exact versions. |
| csv-parse 7.0.2 | Build/reference/review tooling, [adaltas/node-csv](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse); installed LICENSE is MIT, Copyright 2010 Adaltas. | Downloaded by npm ci; no application import chain to the review tooling, so not assumed part of the browser bundle. Upstream package retains its full notice. |
| Vite 8.2.1 / Rolldown 1.2.4 runtime helpers | Emitted module graph includes Vite's modulepreload polyfill and Rolldown runtime. Installed Vite core LICENSE.md and Rolldown LICENSE / THIRD-PARTY-LICENSE supply MIT notices. [Vite](https://github.com/vitejs/vite), [Rolldown](https://github.com/rolldown/rolldown). | Small helpers ship in application JS; full core/upstream notices retained in the root and emitted legal text, including accompanying Rollup/esbuild notices. This does not imply all build-tool dependencies ship. |
| TypeScript, test/lint tools and other transitive packages | Development tools pinned in package-lock.json; individual package notices apply. | Installed for builds/tests, not automatically classified as shipped browser software. No dependency upgrades or vendor-source copying in this preparation. |
| Space exploration, gravisio / Flaticon | User certificate dated 23 September 2026; free commercial use WITH ATTRIBUTION, subject to standard terms. [Existing category link](https://www.flaticon.com/free-icons/cosmos), [terms](https://www.flaticon.com/terms-of-use). | Current public/favicon-16x16.png and public/favicon-32x32.png; historical public/favicon.svg and historical versions retained. Separate-licence artwork excluded from project GPL grant. Exact credit and uncertainty are recorded in the root notice; retention is the owner's chosen arrangement, not rightsholder clearance. Private certificate not published. |
| Barlow Semi Condensed; IBM Plex Mono | CSS requests Google Fonts; [Barlow OFL](https://github.com/google/fonts/blob/main/ofl/barlowsemicondensed/OFL.txt), [IBM Plex Mono OFL](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt), SIL OFL 1.1. | External CSS/font delivery, no repository font binaries. Existing external-font policy accepted; no self-hosting or CSP change. |
| Starter assets | Initial scaffold paths src/assets/hero.png, src/assets/react.svg, src/assets/vite.svg, public/icons.svg; introduced in initial commit 060d162. React/Vite artwork corresponds to their upstream brands; no separate source/rights evidence was established for hero.png or icons.svg. | Confirmed unused and removed from current tree only. History retained. Historical hero.png/icons.svg provenance needs owner evidence or an explicit publication disposition; no blanket GPL attribution or new rights conclusion. |

## Canonical game content

Project-authored xEdit extraction and JavaScript/TypeScript generation code are
distinct from their game-derived outputs. Current source populations include
planet-directory, inorganic/organic occurrences, biome/species relationships,
workbench products/recipes, qualified name provenance and official terminology
under reference-source. Runtime JSON is in public/reference-data; official-name
overlays are in src/localization/generated and bundled into the app. Per-locale
reference-source sidecars and the localization provenance manifest record
input versions/hashes and generation evidence. The reviewed source-game baseline
is 1.16.244.0; manifests, rather than prose here, own exact hashes.

Canonical provider selection uses Starfield.esm, ShatteredSpace.esm and
SFBGS00D.esm. SFBGS050.esm is terminology-only evidence and adds no canonical
tracker entities. All eight non-English runtime overlays are now generated and
registered. Ordinary checkout builds verify committed outputs without installed
game inputs; optional regeneration reads legally obtained local inputs. No
complete ESM, BA2 or string-table binary is distributed in this repository.

**Publication sign-off pending:** establish the applicable rightsholder/EULA
basis for distributing these selected extracted records, official names,
generated overlays and historical source records. Provenance proves origin,
not permission. The [dated release review](audits/RELEASE-READINESS-REVIEW.md)
records the evidence limit. No infringement conclusion or rightsholder approval
is asserted, and this content is not relicensed as Gooberpede-authored GPL code.

## Bethesda Strings Editor

[Bethesda Strings Editor / 0xra0](https://github.com/0xra0/bethesda-strings-editor)
was studied for BA2/string-table architecture and qualification by plugin,
table extension and string ID. Prior project evidence records no copied or
adapted code and no imported output. It is not a runtime dependency. The prior
ledger records MIT; inspect and retain upstream notices if code is ever adapted.
Use as a reference is not evidence that its implementation entered this project.

## Development and translation tools

[DeepL](https://www.deepl.com/) supplied independent translation/review evidence
for Japanese and subsequent French, German, Spanish, Italian, Brazilian
Portuguese, Polish and Simplified Chinese work. Durable review CSVs record
actual comparative wording and editorial decisions; historical working XLIFF
handoffs are not an active publication workflow. DeepL is not used at runtime
or as authority for official Bethesda terminology. No service implementation
was copied. **Remaining evidence:** owner confirmation of the actual service/
terms applicable to these translation jobs; no account plan or contract is
inferred. [Free terms](https://www.deepl.com/en/terms-of-use) and
[Pro terms](https://www.deepl.com/en/pro-license) are distinct. No new paid job
or third-party contact was performed for release preparation.

[OpenAI Codex / ChatGPT](https://openai.com/) supported implementation, design,
review, tests, documentation, analysis and multilingual drafting/adjudication.
Project output was generated for this repository; no OpenAI product source was
copied and there is no runtime integration. Applicable service terms remain
those of the actual account agreement; no invented account plan or additional
tool-attribution requirement is asserted. New About copy is Codex-drafted and
reviewed, with no new DeepL or native review; durable review evidence records
that distinction. Native review remains desirable, not automatically blocking.

## Publication boundary

Code licence, public attribution, favicon retention and publication of the
existing repository/history are settled owner decisions. The non-favicon
questions above remain specific publication sign-off items; they do not reopen
those choices or certify the whole repository. No history filtering, archive
packaging, third-party contact or publication is performed by preparation.

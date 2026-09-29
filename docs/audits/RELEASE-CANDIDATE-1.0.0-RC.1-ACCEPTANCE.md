# Release Candidate 1.0.0-rc.1 Acceptance

## Candidate identity

| Field | Evidence |
| --- | --- |
| Version | `1.0.0-rc.1` |
| Full commit | `02b62eabdb7b964dc0c2727142d77a0745dd36f1` |
| Short build | `02b62eab` |
| Staging origin | `https://staging.starfield-outpost-network.pages.dev/` |
| Test date | 2026-09-29 |
| Browser / OS | Codex in-app Chromium browser on Windows; exact browser and Windows version were not exposed |
| Browser-data isolation | Dedicated Codex in-app browser session, staging-origin storage, and synthetic networks only |

Local `staging` HEAD, `package.json`, and the deployed About dialog agreed on the exact frozen candidate. About displayed `Version 1.0.0-rc.1 · Build 02b62eab`, linked the full expected commit, and showed no modified or unverified marker.

## Acceptance matrix

| ID | Area | Result | Evidence | Notes / limitation |
| --- | --- | --- | --- | --- |
| A | Clean startup and locale persistence | PASS | Clean staging startup; reference-backed controls loaded; About identity matched; explicit `de-DE` survived reload. | Restored `en-US` for most functional work. |
| B | Ordinary outpost recording | PASS | Created and renamed multiple synthetic outposts and a second network; recorded level 50 and skill ranks; selected Feynman III, Ternion III and Andraphon; reordered outposts. | Compact unselected placeholders and selected values remained legible in DOM-backed browser inspection. |
| C | Inorganic production | PASS | Recorded and activated Iron on Feynman III and Aluminum on Andraphon with biome-sensitive choices. | No safe ordinary UI path existed to create an incompatible active-production record; validation behavior was exercised with other deliberate inconsistencies. |
| D | Organic planetary farming | PASS | On Feynman III, Tropical Maw Palm remained an enabled exact Fiber producer while Ocean was selected, outside its natural Tropical Forest occurrence. Wild-only Beetle Scavenger, Spore Filterer, Hunting Coralbug and Beetlecrab Grazer were not offered as farming controls. | Exact producer identity appeared in the Matrix and control accessible name. |
| E | Manufacturing and Planned Supply | PASS | Adaptive Frame changed from missing Aluminum to feasible after inbound Aluminum; Planned Supply Aluminum retired when the real inbound source appeared; Undo restored the placeholder. | Confirmed Planned Supply supported recipe planning without itself becoming provenance. |
| F | Cargo Links | PASS | Created two cross-outpost links, exported Iron and Aluminum, observed derived inbound availability, unlinked and re-linked Iron while its outbound selection remained intact, and expanded multiple cards. | Live expanded-list use plus green geometry tests found no status-bar coverage or blank-gap regression. Native drag-edge autoscroll was not repeated. |
| G | Cargo remove / Undo / Redo context | PASS | With two Ternion cards expanded: remove, Undo, Redo, Undo produced counts 2→1→2→1→2; both cards returned expanded and unrelated expansion survived. A later rename Undo/Redo restored the operation's outpost context after navigation elsewhere. | Session-only expansion behaved as designed. |
| H | Validation and focus | PASS | Deliberate cross-system regular-link errors, a farming-input warning and Planned Supply info were shown without data repair; issue activation navigated to Ternion; closing Validation, About and Help restored focus to their invoking buttons. | Keyboard activation was used throughout. |
| I | Persistence | PASS | A two-network collection with four outposts, reordered outposts, System/Body selections, production, manufacturing, Planned Supply and two cargo links survived reload. Before/after active network, selected outpost, outpost order, detail text, Matrix text and Cargo summaries were identical. | Undo history correctly reset on reload; explicit locale also persisted. |
| J | Successful export/import round-trip | PASS | Owner manually verified the round-trip with an exported synthetic two-outpost file. After export, character name, level and skills were changed; importing the file restored the original blank character name, null level and null skill values together with the original network state. | The restored imported state remained intact after reload. |
| K | Failed import atomicity | PASS | Live malformed-JSON import surfaced a specific error and preserved active network, selected outpost, ordered collection and the exact Undo label. Automated tests passed duplicate-ID rejection, every capacity boundary, and unchanged collection/context/history/storage after rejection. | Automated duplicate-ID and over-envelope rejection/atomicity coverage is accepted as sufficient; no further live repetition is required. |
| L | Existing-save compatibility | NOT RUN — JUSTIFIED | No representative disposable pre-RC save was supplied. | Existing personal-looking downloads were not used. |
| M | Search | PASS | Exact, prefix, substring and abbreviation matching returned deterministic results; German localized `Aluminium` matched canonical English `Aluminum`; submitted identity remained fixed. While Results stayed open, Undo renamed `Ternion Hub Atomicity` back to `Ternion Hub` and the result updated immediately without changing the two-result count. | Found and filtered-result cases were exercised. |
| N | Localization spot-check | PASS | Inspected `en-US`, `de-DE`, `ja-JP`, `zh-Hans` and `es-ES`; additionally verified compact System/Body placeholders in English, French, German, Japanese, Simplified Chinese and Spanish. | Placeholder text was respectively `Select...`, `Sélectionner…`, `Auswählen...`, `選択...`, `请选择……`, and `Selecciona...`; automated geometry/localization tests also passed. |
| O | 100% and true 200% zoom | PASS — owner manual verification | Owner testing at 100% and true 200% browser zoom passed the Resource Matrix; collapsed and expanded Cargo Links; Cargo Links panel scrolling; Outpost Navigation; outpost and cargo-link Reshuffle Mode; Help and About; Locale Selector; modal dialogs; Search and Search Results; Validation pop-up; Import and Export; Planned Supply; context help; and tooltips. | Essential controls remained accessible across the tested surfaces. |
| P | Windows High Contrast / forced colors | PASS — owner manual verification | Owner Windows High Contrast testing passed the Resource Matrix; collapsed and expanded Cargo Links; Cargo Links panel scrolling; Outpost Navigation; outpost and cargo-link Reshuffle Mode; Help and About; Locale Selector; modal dialogs; Search and Search Results; Validation pop-up; Import and Export; Planned Supply; context help; and tooltips. | Focus, links, buttons and form controls remained usable across the tested surfaces. |
| Q | About / Narrator known limitation | FAIL — NON-BLOCKING KNOWN/DEFERRED | About content, links, both Close controls, keyboard access and focus return showed no regression. | Static About-body Narrator reading remains the accepted deferred limitation; Narrator is not marked fully passed. |
| R | Apple / Safari evidence | NOT RUN — JUSTIFIED | Hardware unavailable; prior bounded iPhone 12 Safari evidence retained. | No macOS/iPad/VoiceOver certification and no Playwright WebKit substitution. |
| S | Reference startup and cache behavior | PASS | Required reference data loaded on initial startup and reload; `npm run build` completed reference provenance, overlay, deployment and dist verification successfully. | Stronger browser request interception/Retry simulation was not repeated because it was impractical in the available browser; existing automated evidence was used as allowed by the brief. |
| T | Missing reference-data / nested route behavior | PASS | A deliberately missing reference JSON path rendered the dedicated `Reference data not found.` response; an unrelated unknown SPA path loaded the Starfield Outpost Network shell with persisted data. | The in-app browser did not expose raw response status codes; deployed content behavior and the candidate's green deployment verification provide the evidence boundary. |
| U | About links and public destinations | PASS | Verified destinations for full licence, third-party notices, repository, exact build source, Issues, support email, Ko-Fi and Flaticon attribution. | No issue, email, payment, membership or other side effect was initiated. Private repository availability remains expected until launch. |
| V | Legal/static output smoke | PASS | Downloaded staging `LICENSE.txt` (35,149 bytes) and `THIRD-PARTY-NOTICE.txt` (10,183 bytes); both were readable and contained the intended GPL and licence-boundary text. App startup succeeded before either file was retrieved. | This was a smoke check, not a new legal audit. |
| W | Unexpected console/network failures | PASS | Representative staging use and reload produced no captured console warnings or errors; all required reference-backed UI loaded; no request loop or functional CSP failure was observed. | Deliberate missing-reference probing is excluded from unexpected failures. |

## Acceptance summary

- PASS: 20
- Release blockers: 0
- Remaining owner-manual checks: 0
- NOT RUN — JUSTIFIED: 2 (`L`, `R`)
- FAIL — NON-BLOCKING KNOWN/DEFERRED: 1 (`Q`)

## Manual-owner items

Remaining owner-manual items: **NONE**.

The owner completed the successful export/import round-trip, true 200% browser zoom, and Windows High Contrast checks. Automated duplicate-ID and over-envelope rejection/atomicity coverage was accepted as sufficient, so no further live failed-import repetition is required.

## Known and deferred evidence

- Narrator static About-body reading remains a non-blocking deferred limitation; interactive controls and focus behavior did not regress.
- Apple/macOS/iPad/VoiceOver hardware coverage was not re-run; prior bounded iPhone evidence is retained.
- `www.starfieldoutposts.com` remains **PENDING LAUNCH OPERATION — not an RC application defect**. No DNS or redirect change was made.
- Desktop-oriented/mobile-not-optimized scope, language-editorial limits, large-bundle optimization, on-demand reference overlay, narrow native drag-edge activation and Help biome wording remain accepted limitations where applicable.

## Automated verification

| Check | Result |
| --- | --- |
| `npm test` | PASS — 275 tests |
| `npm run test:components` | PASS — 100 tests in 10 files |
| `npm run build` | PASS — reference validation, TypeScript and Vite production build; only the accepted large-chunk advisory was emitted |
| `npm run lint` | PASS |

The automated import coverage specifically passed duplicate network-ID rejection, malformed nested import rejection, array/string/aggregate envelope boundaries, and assertions that rejected imports leave collection, context, history and storage unchanged.

## Blockers

Release blockers found: NONE

## Final disposition

**RC-A — accepted for promotion toward 1.0.0**

The initial Codex acceptance pass ended at RC-B. Subsequent owner manual checks closed the remaining finite acceptance items, and the candidate is accepted for promotion toward `1.0.0`.

No application source, CSS, localization, reference data, dependency, version, commit, tag, remote, deployment, DNS, indexing, repository-visibility or publication change was made during this acceptance pass.

# Simplified Chinese Locale Runtime QA

Audit date: 2026-09-22

Manual closure update: 2026-09-22

Locale: `zh-Hans`

Branch: `staging`

## Closure status

**Automated/runtime QA passed. Normal-scale manual smoke testing and true
browser-controlled 200% zoom passed. Manual Windows Narrator interaction passed
structurally, with Chinese spoken output unverified because Narrator consistently
skipped Chinese text on the test environment.**

No Simplified Chinese-specific blocker was found. Layout/accessibility/release
closure is complete, and the locale is fully closed/supported within the
project's tested Windows/Chromium scope. This status is not Chinese-speech
Narrator certification and does not include Apple/WebKit or VoiceOver.

## Scope and change boundary

This was a QA/audit parcel. It added this durable record and did not change
translations, reference-name overlays, locale ordering, application behavior,
accessibility architecture, styling, layout geometry, typography metrics, or
Apple/WebKit-specific code.

The supplied audit brief was present as an untracked input and was not modified.
The later documentation-only closure update preserved the automated evidence and
added the user's final true-200%-zoom and Narrator results.

## Runtime identity and coverage

| Check | Result |
| --- | --- |
| Runtime registration | Pass: `zh-Hans` remains runtime-available. |
| Selector | Pass: the selector exposes `简体中文`; all existing supported locales remain present. |
| Semantic catalogue | Pass: 414/414 keys, exact placeholder/plural structure, no ordinary English fallback or accidental-English residue. |
| Reference overlay | Pass: 3,561/3,561 resolved entities from 4,818 provenance rows; 0 unresolved. |
| Document language | Pass: Chinese sets `document.documentElement.lang` to exactly `zh-Hans`; switching to `en-US` produced `en-US`, and the shared tests cover every supported locale and switching away again. |
| Live switching | Pass: component tests switched through all ten supported locales, including `zh-Hans`, without mutating network selection, outpost context, persisted data, or history. |
| Locale collation | Pass through the shared `Intl.Collator` path, including numeric Chinese ordering. |
| Locale font | Pass: the approved locale-scoped CJK system-font stack remains present, with no bundled or fetched font. |

The semantic review tests verified exact key and placeholder parity, final
catalogue derivation from the approved review evidence, intentional invariant
handling, and the Chinese-specific accidental-English detector. Intentional
branding/attribution was not classified as leakage.

Representative runtime overlay tests covered systems, bodies, biomes, species,
resources, products, and official skill/terminology identities. The browser
run additionally displayed official Chinese system, body, biome, resource, and
product values. Mixed-script values, abbreviations, Roman characters, and
source punctuation remained literal.

## Browser-language mapping

Automated mapping tests passed the complete policy:

| Input | Expected/result |
| --- | --- |
| `zh`, `zh-Hans`, `zh-Hans-CN`, `zh-Hans-SG`, `zh-CN`, `zh-SG` | `zh-Hans` |
| `zh-Hans-TW` | `zh-Hans` (explicit script outranks region) |
| `zh-Hant`, `zh-Hant-CN`, `zh-TW`, `zh-HK`, `zh-MO` followed by `fr-FR` | Continued to the later preference and selected `fr-FR` |

The broader automated case also keeps `zh-Latn-CN` outside the Simplified
Chinese mapping.

## Search QA

Search tests passed for localized exact, prefix, and substring tiers; canonical
English alias lookup; abbreviation lookup; localized-result labels; and stable,
deterministic ranking. They explicitly reject accidental pinyin (`lv`) and
Traditional Chinese conversion (`鋁`). No additional punctuation, whitespace,
transliteration, or script-conversion behavior was introduced.

At runtime, searching for `铝` returned `铝 Al`. Searching by the canonical
English alias `Aluminum` returned the same localized Chinese result label.

## Major surfaces

| Surface | Automated/runtime result | Existing normal-scale manual evidence |
| --- | --- | --- |
| Navigation | Localized heading, controls, and accessible names present; shared focus and semantic-shell tests passed. | Passed, including reshuffle mode. |
| Outpost Details | Localized field labels, system/body values, biome help, power descriptions, and accessible names present. | Passed with no new layout/clipping issue. |
| Cargo Links | Localized heading, add/expand/reshuffle controls, compact summaries, link type, destinations, and item names present; component accessibility tests passed. | Passed, including reshuffle mode. |
| Resource Matrix | Localized table/section headings, help names, tooltips/descriptions, reference names, and search controls present; semantic/layout-contract and component tests passed. | Passed; no new clipping apart from known shared flora/fauna-name pressure, and inspected tooltips had no unexpected English. |
| Planned Supply | Localized heading, help name, expansion control, and item labels present. | Passed. Abbreviation usefulness remains the accepted non-blocking later capacity-review item. |
| Validation | Localized trigger and issue-count text present; shared issue navigation, severity, stable-identity, and focus tests passed. | Localized validation messages passed. |
| Search results | Localized labels and accessible combobox/listbox wiring present; search positioning and keyboard tests passed. | Search and results passed. |

Persisted English user-authored names such as `Outpost 1` and the application
title branding are data/invariants, not catalogue leakage.

## Dialog QA

- Help opened as the accessible `键盘快捷键` dialog. Its introduction, groups,
  actions, close name, and shortcut speech strings were localized. At 1366×768
  it stayed inside the viewport and used its designed internal vertical scroll.
- About opened as the accessible `关于` dialog. Tracker prose was Chinese. The
  approved `Starfield Outpost Network` brand and `Cosmos icons created by
  gravisio - Flaticon` attribution remained English.
- Delete Network opened as `删除哨站网络`, with localized irreversible-action
  context, Undo guidance, Cancel, and Delete controls. The audit cancelled it;
  no network was deleted.
- Component tests passed shared modal focus restoration and shortcut suppression
  behavior.

## Import/export and status QA

The shared automated checks passed locale-independent serialization and
deserialization for every supported locale preference, preserving stable
network/outpost IDs and producing byte-equivalent persisted content. Known
invalid JSON, unsupported schema, invalid structure, and guardrail failures
retain stable message descriptors and diagnostic parameters. Component tests
passed stable polite/assertive live regions and deferred import-failure timing.

The Chinese catalogue coverage/residue checks cover export success, import
success, invalid import, capacity/guardrail failures, and their placeholder
substitution. The user's completed manual smoke test separately confirmed
successful import/export and translated status-bar messages, including invalid
file cases. No persisted identity or schema is localized.

## Validation/status QA

Domain and presentation tests passed representative error, warning, and info
paths; Planned Supply unresolved information; cargo/export warnings;
manufacturing and organic/inorganic production diagnostics; reference/identity
fallback handling; stable issue identity; localized names; list formatting; and
placeholder substitution. Catalogue completeness and Chinese English-residue
checks found no unapproved raw-English fallback on these paths.

## Shortcut and accessibility wiring QA

Chinese shortcut-help strings passed the required speech-token contract:
`Control`, `Alt`, `Shift`, `加`, `上箭头`, `下箭头`, `左箭头`, and `右箭头`.
The runtime Help accessibility tree exposed examples including
`Control加Shift加Z`, `Control加Alt加上箭头`, and
`Control加Alt加下箭头`.

The automated accessibility/component checks passed:

- semantic main/navigation/aside/section structure;
- localized control names, tooltips, and descriptions on critical UI paths;
- accessible dialog names and close controls;
- combobox/listbox relationships and search-result focus behavior;
- stable polite and assertive status live regions;
- validation roving focus and keyboard activation;
- keyboard traversal and the shared shortcut policy;
- modal shortcut suppression and Help focus restoration;
- locale changes updating `document.lang` and rendered labels without changing
  domain state or history.

The 1366 browser accessibility tree showed localized names for the locale
selector, global controls, Navigation, Outpost Details, Resource Matrix,
Planned Supply, Cargo Links, Validation, Help, About, and Delete Network.
No missing name was observed only under Chinese, and switching did not leave
stale Polish or English catalogue labels.

These checks verify strings and wiring. The later manual Narrator pass confirmed
that this structure was traversable, but it did not verify Chinese pronunciation
because the test environment consistently skipped Chinese text.

## Automated layout and overflow QA

### 1366×768 baseline

The in-app Chromium viewport was explicitly set to 1366×768 with `zh-Hans`
active and a mature 64-network/6-outpost workspace loaded.

- `documentElement.lang`: `zh-Hans`.
- Document/client width: 1,351 px (15 px vertical scrollbar).
- Document scroll width: 1,351 px.
- Page-level horizontal overflow: none.
- The title bar, header controls, Navigation, Outpost Details, Resource Matrix,
  Cargo Links, and fixed Validation status remained visible and usable.
- Help dialog rectangle was 1,044×732 px at `(161, 18)` and did not exceed the
  viewport. It had intended internal vertical scrolling (851 px content in a
  730 px client area), not page overflow.
- About and Delete Network dialogs had no observed overflow.
- No Chinese-specific selector, Solar/Wind, Resource Matrix header, Planned
  Supply, search-result, or major-panel blocker was observed.

This automated/browser-visible evidence is complemented by the user's later
true browser-controlled 200% zoom pass.

### Simulated high-zoom-equivalent viewport

At a 683×384 viewport (half of the 1366×768 baseline), Chinese produced a 668 px
client width and 787 px document scroll width: 119 px of horizontal overflow.
The identical English comparison produced the same 668/787 px measurements and
the same overall reflow. It is therefore classified as **shared cross-locale
high-zoom debt**, not a Chinese-specific regression. This matches the brief's
known fixed-header/high-zoom and compact-layout debt boundary.

No claim is made that this simulated viewport is true browser-controlled 200%
zoom.

### Manual true browser-controlled 200% zoom

**Pass.** The user observed no text overflow or clipping anywhere in the app at
true browser-controlled 200% zoom in Simplified Chinese. This real zoom result
closes the Chinese manual zoom gate and supersedes the uncertainty left by the
simulated narrow viewport.

The earlier 119 px simulated overflow remains valid historical evidence of a
shared English/Chinese narrow-viewport condition. The manual Chinese pass does
not claim that every possible global high-zoom or compact-layout debt has been
eliminated.

## Cross-locale regression result

Pass. Registry/selector and component-switching tests retained English (US and
UK), Japanese, French, German, Spanish (Spain), Italian, Polish, Portuguese
(Brazil), and Simplified Chinese. The production build independently verified
all eight non-English 3,561-entry overlays, and shared tests covered runtime
catalogue loading, search/collation paths, document languages, and
presentation-independent persistence. This QA parcel did not change any
semantic catalogue or reference overlay.

## User-completed normal-scale smoke evidence

Recorded as supplied, without re-litigating it:

- selector displays `简体中文`;
- Help and About are translated except approved branding/attribution;
- successful and invalid import/export paths show translated status messages;
- Delete Network and validation messages are translated;
- Navigation and Cargo Links work, including reshuffle modes;
- Resource Matrix works, with only known cross-locale flora/fauna-name pressure,
  and inspected tooltips contain no unexpected English;
- Planned Supply, search/results, Outpost Details, and inspected tooltips work;
- title branding intentionally remains English;
- normal-scale Chinese typography caused no new clipping/layout issue;
- no other locale disappeared or regressed.

The observation that full localized Planned Supply names may be more useful than
abbreviations is recorded as non-blocking later UI/capacity review and is not
reopened here.

## Known shared/global debt observed or retained

- The simulated high-zoom-equivalent viewport has the same 119 px page overflow
  in Chinese and English.
- Fixed-header/status-bar focus visibility remains shared global debt even
  though the tested Chinese true-200%-zoom layout passed.
- Narrator shortcut interception, omitted chord speech, ambiguous Solar
  announcements, intermittent Matrix focus indication, compact Cargo/Matrix
  context, and Cargo Undo collapse behavior remain established shared debt.
- Localized placeholder, Solar/Wind capacity, Resource Matrix header spacing,
  and long flora/fauna-name pressure remain shared capacity concerns.
- The production build reports the existing JavaScript chunk-size warning; it
  is unrelated to Chinese QA and bundle optimization is out of scope.

No evidence made any of these Chinese-specific.

## Completed manual closure

| Manual gate | Status |
| --- | --- |
| True browser-controlled 200% zoom/reflow | **Pass:** no text overflow or clipping observed. |
| Windows Narrator interaction | **Pass with environment limitation:** roles, states, positions, numeric values, Latin text, and untranslated user-authored content were exposed; Narrator consistently skipped Chinese text. |
| Keyboard interaction while Narrator is active | **Pass:** tested, with some shortcuts intercepted as established shared/global behavior. |
| Import/export and import-error live paths | **Pass structurally:** interaction and live-announcement paths worked, while their Chinese text was skipped. |

Manual Narrator interaction passed structurally, but Chinese speech itself could
not be verified on the test environment because Narrator consistently skipped
Chinese text. A missing suitable Chinese Narrator/language capability is a
possible explanation, not a proven cause. The locale is therefore not described
as Narrator-certified for Chinese speech.

### Narrator surface results

| Surface | Manual result |
| --- | --- |
| Locale selector | Pass: interaction worked; Chinese text was skipped. |
| Import/export/import error | Pass: interaction and live-announcement paths worked; Chinese text was skipped. |
| Keyboard shortcuts | Pass: some shortcuts did not work under Narrator, matching established shared/global interception rather than a Chinese-specific regression. |
| Help | Pass: dialog traversal worked and Latin key tokens such as `CTRL` and `ALT` were announced; Chinese text and phrases such as `UP ARROW` when dependent on attached Chinese text were omitted. |
| About | Pass: English branding and icon attribution were announced; Chinese text was skipped. |
| Validator | Pass: structural interaction behaved as expected; Chinese text was skipped. |
| Search/results | Pass: interaction behaved as expected; Chinese text was skipped. |
| Resource Matrix | Pass: button states and table positions were announced; Chinese labels and tooltip text were skipped. |
| Solar/Wind | Pass: multiplier amounts were announced; surrounding Chinese text was skipped. |
| Outpost Details | Pass: control types, relevant states, and untranslated/user-authored values were announced; Chinese labels were skipped. |
| Navigation | Pass: untranslated outpost names, control types, and states were announced; Chinese labels were skipped. |
| Cargo Links | Pass: collapsed links exposed the link number and untranslated remote outpost name; expanded controls exposed types/states; Chinese resource names, labels, and tooltips were skipped. |
| Planned Supply | Pass: control types and toggle state were announced; Chinese labels were skipped. |

This consistent surface-wide pattern supports the conclusion that application
roles, states, focusable controls, table relationships, live paths, and Latin or
numeric content remained exposed while Chinese speech itself could not be
verified in the test environment.

## Commands and results

| Command/check | Result |
| --- | --- |
| Focused runtime/localization suite (`simplifiedChineseRuntime`, localization, coverage, review, reference names, metadata, collation) | Pass: 75/75 |
| Focused search/shortcut/accessibility/layout-contract suite | Pass: 41/41 |
| Focused component files (`componentAccessibility`, `keyboardShortcutsDialog`, `browserStorageApp`) | Covered by the full component run below; the initial parallel invocation did not emit a final summary and was not counted separately. |
| `npm test` | Pass: 246/246 |
| `npm run test:components` | Pass: 60/60 across 6 files |
| `npm run typecheck:tests` | Pass |
| `npm run localization:terminology:verify` | Pass: 37 evidence rows across 19 terms |
| `npm run localization:provenance:test` | Pass: 105/105 |
| `npm run localization:provenance:verify` | Pass: 3,561 resolved, 0 unresolved |
| `npm run localization:reference-names:verify -- --locale zh-Hans` | Pass: 3,561 entities / 4,818 provenance rows |
| `npm run reference:test` | Pass: 154/154 |
| `npm run build` | Pass: TypeScript and Vite production build; all locale overlays and deployed reference data verified |
| `npm run lint` | Pass |
| `git diff --check` | Pass |

## Audit conclusion

Simplified Chinese retains complete semantic and official-reference coverage,
correct Hans/Hant browser routing, localized search/results, correct document
language, stable locale switching, localized dialogs/status/validation paths,
and equivalent keyboard/accessibility wiring. The 1366 baseline found no
Chinese-specific layout blocker. The simulated constrained viewport reproduced
an English-equivalent shared overflow rather than a Chinese regression.

The user's true browser-controlled 200% pass found no text overflow or clipping.
Manual Narrator interaction passed structurally across the tested surfaces.
Chinese speech itself could not be verified because Narrator consistently
skipped Chinese text on the test environment; known shortcut interception
remains shared/global debt rather than a Chinese-specific blocker.

**Readiness: Layout/accessibility/release closure is complete. Simplified Chinese
is fully closed/supported within the project's tested Windows/Chromium scope,
with the explicit limitation that Chinese spoken output was not verified.
Post-localization cleanup is the next localization programme phase.**

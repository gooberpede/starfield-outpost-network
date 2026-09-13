# Release Verification and Accessibility Readiness Audit

**Audit date:** 2026-09-13

**Scope:** Repository, source, generated artifacts, and automated tests only

**Manual interaction:** Not performed; the required manual checks are listed last

**Disposition:** Outcome B — minor corrections required

## Executive summary

The repository is release-integrity clean, but it is not yet ready to proceed directly to final manual verification. No data-integrity, localization, reference-generation, or inaccessible-core-workflow blocker was found. A small accessibility correction batch should precede the manual pass.

Finding count, including source defects, documentation consistency, and explicit release-coverage gaps:

| Severity | Count |
| --- | ---: |
| BLOCKER | 0 |
| HIGH | 1 |
| MEDIUM | 8 |
| LOW | 5 |
| COSMETIC | 0 |
| **Total** | **14** |

- Localization is numerically complete at **331 / 331** tracker-authored semantic messages for both `en-US` and `ja-JP`; `en-GB` is a valid empty sparse override and therefore resolves all 331 baseline keys. The brief's upstream `330 / 330` count is stale by one, but parity is exact and no localization value is missing.
- The semantic catalogues have exact key and placeholder parity, valid supported formatting syntax, no empty Japanese values, and no ordinary accidental English fallback. No duplicate or orphaned active message key was found.
- Reference/provenance closure is clean: **3,561 entities**, **3,561 generated Japanese names**, **4,818 provenance rows**, **0 unresolved**, and no committed overlay drift.
- Official terminology verification is clean at **37 evidence rows across 19 terms**. `SFBGS050.esm` remains terminology-evidence-only; the canonical content universe remains `Starfield.esm`, `ShatteredSpace.esm`, and `SFBGS00D.esm`.
- Locale switching remains presentation-only. The preference uses a separate storage key; source and tests show no mutation of the collection, selected IDs, network contents, history, stable IDs, schema versions, or serialization.
- Persistence/import/export/history invariants hold. Internal `CargoPad`, `cargoPads`, `cargoPadId`, and `interstellar` identities remain invariant; localized reference names are resolved at presentation time rather than persisted.
- No essential workflow is structurally inaccessible. Major actions use native buttons, inputs, and selects; modal focus is trapped and restored; Search and Validation have keyboard models; focus styling is broadly present.
- No tracker-authored user-facing prose bypass was found. The remaining literals are an intentional product title, non-language symbols, invariant technical IDs/fallbacks, or developer diagnostics.
- Accessibility is not closed: shared muted colors produce sub-4.5:1 source-level contrast combinations for small text; several visually communicated statuses lack equivalent textual or accessibility semantics; and focusable drag handles do not themselves support keyboard activation.

## Method and evidence

The audit followed the requested order: repository/test/localization closure, accessibility/source review, regression coverage, browser/platform readiness, and finally the manual checklist.

Inspected sources include the localization catalogues and provider, serialization/storage/session logic, search and collation helpers, all major interactive React components, their stylesheets, the active architecture/domain/UX/localization documentation, and the complete test inventory. No application code or tests were changed.

Required commands all completed successfully:

| Command | Result |
| --- | --- |
| `npm test` | PASS — 148 tests |
| `npm run reference:test` | PASS — 131 tests |
| `npm run reference:build` | PASS — regenerated reference data matched the worktree |
| `npm run localization:provenance:test` | PASS — 84 tests |
| `npm run localization:provenance:verify` | PASS — 3,561 entities / 4,818 rows / 0 unresolved |
| `npm run localization:reference-names:verify` | PASS — 3,561-name committed overlay verified |
| `npm run localization:terminology:verify` | PASS — 37 rows / 19 terms |
| `npm run build` | PASS — TypeScript and Vite production build; existing 500 kB chunk advisory only |
| `npm run lint` | PASS |
| `git diff --check` | PASS before report creation; run again at handoff |

There is no dedicated accessibility/static-analysis command in `package.json`. No dependency was added.

## Localization and release integrity

| Area | Expected | Observed | Status | Severity |
| --- | --- | --- | --- | --- |
| `en-US` baseline | Complete | 331 keys | PASS | — |
| `en-GB` overrides | Valid sparse overrides | 0 overrides; all 331 keys inherit from `en-US` | PASS | — |
| `ja-JP` semantic catalogue | Complete, non-empty, key/placeholder parity | 331 keys; 331/331 parity; 0 empty values | PASS | — |
| Brief closure count | 330 / 330 | Current authoritative tests/docs/catalogue agree on 331 / 331 | PASS with stale brief count noted | LOW (L-01) |
| Formatting validity | Supported message/ICU-like forms parse | Full test rendering succeeds; parameter validation rejects missing/unexpected parameters | PASS | — |
| Protected tokens | Preserved | Representative `He-3`, `Esc`, `JSON`, `ID`, product name, and attribution checks pass | PASS | — |
| Stale English in Japanese | None except intentional invariants | Five documented invariant messages; all other Japanese messages differ from baseline | PASS | — |
| Duplicate/orphan keys | None | Typed baseline keys plus exact Japanese parity; no orphan active keys found | PASS | — |
| Canonical entities | 3,561 | 3,561 | PASS | — |
| Generated Japanese names | 3,561 | 3,561 | PASS | — |
| Qualified provenance | 4,818 rows, 0 unresolved | 4,818 rows, 0 unresolved, 3 approved normalizations | PASS | — |
| Generated drift | 0 | Overlay verifier passes; reference rebuild leaves no tracked diff | PASS | — |
| Canonical plugin universe | Three intended plugins | `Starfield.esm` 4,781 rows; `ShatteredSpace.esm` 35; `SFBGS00D.esm` 2 | PASS | — |
| Free Lanes boundary | Terminology only | `SFBGS050.esm` appears only in terminology evidence/optional historical configuration; no runtime entity ingestion | PASS | — |
| Official terminology | Valid and stable | 37 evidence rows / 19 terms | PASS | — |
| X-Tech Power Core | Record-qualified official term | Qualified verifier/test remains active and passes | PASS | — |
| Retired Cargo Pad prose | No active user-facing semantic value | Catalogue closure test passes | PASS | — |
| Retired cargo `Interstellar` prose | No active cargo-facing semantic value | Catalogue closure test passes; internal discriminator remains unchanged | PASS | — |
| Active implementation guidance | No superseded guidance | Architecture, glossary, and backlog still describe completed official-reference work as provisional/future | NEEDS CORRECTION | MEDIUM (A-06) |

### User-facing literal classification

| Class | Observed examples | Assessment |
| --- | --- | --- |
| Intentional non-language symbol | `×`, `+`, `-`, arrows, disclosure triangles, drag glyph, `✷⇄✷`, em dash | Acceptable where semantic names are otherwise supplied; marker exception is A-04 |
| Brand/proper title | `Starfield Outpost Network` in title bar, document title, and About | Intentional invariant product title |
| Technical token | stable IDs, `Pad {n}` legacy invariant, schema/version text, raw diagnostic title | Correctly separated from localized presentation |
| Developer-only text | source comments and thrown raw diagnostics | Not user-facing prose; known diagnostics are mapped to localized summaries |
| User-facing hard-coded text | None found | PASS |

The focused hard-coded-copy guard covers critical UI paths and passed. Source inspection found no additional tracker-authored English label, help, tooltip, status, or accessibility attribute outside the localization layer.

## Locale, persistence, and history invariants

### Locale switching

`LocalizationProvider` owns locale preference and `document.documentElement.lang`; application preferences persist separately from the network collection. `App.tsx` consumes `locale` only for presentation lookups, formatting, search catalogues, and current-label rendering. Switching `en-US`, `en-GB`, and `ja-JP` does not dispatch an editing-session action.

Automated evidence confirms that relocalizing history/reference descriptors leaves collection and history snapshots deeply equal and serialization byte-identical. Manual network/outpost navigation also creates no history entry. Stable reference IDs survive locale-dependent display and Search submission.

**Conclusion:** locale switching is presentation-only; no persistence invariant failed.

### Persistence and import/export

- `serializeNetworkCollection` receives only `NetworkCollection`; locale is not an input.
- Import schema parsing is locale-independent and preserves stable IDs, network order, `activeNetworkId`, schema versions, and internal cargo discriminators.
- Known import errors use stable localized descriptors while retaining the raw diagnostic separately.
- Unknown/deferred IDs are preserved rather than translated or cleaned up.
- Generated reference overlays are keyed by stable kind + ID and do not enter persisted network data.
- `reference:build` and the production build produced no tracked generated-data change.

**Conclusion:** export payloads and accepted imports are locale-independent; no localized reference name is persisted in place of a stable ID.

### History relocalization

History descriptors carry stable message kinds, stable reference kind/ID pairs, and canonical English fallback values. Tests demonstrate Japanese-to-English and English-to-Japanese rendering through the same immutable descriptor. Skill names use stable official-term IDs. Locale preference changes do not enter the editing reducer or create history entries.

**Conclusion:** the history correctness fix holds; no localized reference presentation leaks into descriptor fallbacks or snapshots.

## Accessibility findings

| Component | Issue | Evidence | RecommendedChange | Severity |
| --- | --- | --- | --- | --- |
| Shared palette and small secondary text | Muted text contrast is inadequate in several common combinations. Direct token measurements are 3.86:1 on `--ui-background`, 3.19:1 on `--ui-surface`, 2.42:1 on `--ui-panel`, and 4.01:1 on `--ui-highlight`. The affected text is often 0.68–0.86rem. | `src/index.css:26-36`; examples in `ValidationSummary.css:142-158`, `CargoPadsEditor.css:43-46`, and `PlannedSupplyEditor.css:25-65,104-114` | Darken the shared muted token or introduce measured secondary/disabled tokens per background; measure all final combinations at normal-text criteria. | HIGH (A-01) |
| Validation issue rows | Per-issue severity is carried by a red/yellow leading strip and CSS class only. Issue content does not render or announce `Error`, `Warning`, or `Info`; aggregate counts do not associate severity with each row. | `ValidationSummary.tsx:288-315,327-348`; `ValidationSummary.css:124-140` | Add localized visible or visually hidden severity text to every issue row; retain color as reinforcement. | MEDIUM (A-02) |
| Status bar import/export feedback | Asynchronous success and error messages are visually inserted but have no `role="status"`, `role="alert"`, or `aria-live`. A non-visual user may receive no completion/failure announcement, and success disappears after five seconds. | `StatusBar.tsx:50-75`; `App.tsx:217-241,2342-2357` | Use an appropriate polite status region for success and an assertive/alert treatment only where justified for failure; avoid duplicate announcements. | MEDIUM (A-03) |
| Collapsed Inter-System marker | The symbol is correctly hidden and the wrapper is not focusable, but the localized `aria-label` is on a generic `span` with no semantic role or text node. Generic containers are not a robust cross-browser accessibility-name target, so the hidden symbol can leave no announced marker. | `CargoPadsEditor.tsx:789-796` | Give the marker a suitable noninteractive semantic role (for example an image role) with the localized name, or include localized visually hidden text. Keep the marker out of Tab order. | MEDIUM (A-04) |
| Outpost and Cargo Link drag handles | The drag handles are focusable generic spans with an accessible-looking label but no keyboard handler or button semantics. Enter/Space does nothing. Alternate move buttons make reordering possible, but the handles themselves are misleading focus stops. | `OutpostList.tsx:267-278`; `CargoPadsEditor.tsx:752-763`; alternate buttons at `OutpostList.tsx:298-320` and `CargoPadsEditor.tsx:902-923` | Remove handles from sequential focus when they are pointer-only, or implement a complete keyboard drag interaction with state/instructions. Preserve the existing move-button fallback. | MEDIUM (A-05) |
| Active localization documentation | Active documentation says 114 decisions remain provisional, official overlays will be extracted later, and extraction is deferred, despite verified runtime integration and terminology closure. This can cause future implementation work to reopen settled boundaries. | `docs/ARCHITECTURE.md:661-666`; `docs/localization/JAPANESE-GLOSSARY.md:79-89`; `docs/BACKLOG.md:282-299` | Update only the stale paragraphs to describe completed official overlays/evidence and the remaining native-speaker/manual-review limitation. | MEDIUM (A-06) |
| Cargo fuel and stale-export state | Fuelled/unfuelled Inter-System state uses distinct stripe patterns and color, so it is not color-only visually, but the state is absent from the button's accessible name/description. A stale selected export is styled by color/opacity while its name remains only “Toggle export for …”. Validation may provide a separate warning, but control-local state is not exposed. | `CargoPadEditor.tsx:98-118`; `CargoPadEditor.css:70-95,146-157`; `CargoExportsEditor.tsx:119-132` | Add localized state descriptions associated with the controls. Keep current texture/border cues and avoid changing domain state. | MEDIUM (A-07) |
| Collapsed cargo summaries | Outbound/inbound abbreviations expose full names only through `title` on non-focusable spans. Sighted keyboard and touch users cannot discover the expansion while the card is collapsed, although expanding the card exposes named controls. | `CargoPadsEditor.tsx:808-844` | Prefer an accessible visible expansion path such as a compact text summary, a focusable disclosure description, or a shared card description; do not add needless Tab stops per item. | LOW (A-08) |

### Keyboard and focus assessment

Structural keyboard support is sound for core workflows:

- locale, system, body, and cargo destination controls use native `select` elements;
- text fields use native inputs with programmatic labels;
- major actions use native buttons, so Enter/Space activation is supplied by the platform;
- Search uses a labelled combobox, `aria-activedescendant`, listbox/options, arrow navigation, Enter submission, and Escape handling;
- Validation uses a native trigger and roving focus with Arrow Up/Down, Home, End, Enter/Space, and Escape;
- dialogs expose `role="dialog"`, `aria-modal`, labelled/described relationships, initial focus, Escape close, focus containment, scroll lock, and focus restoration;
- collapsed Cargo Link bodies are conditionally unmounted, so hidden controls are not focusable;
- disabled native controls use `disabled`; Planned Supply's intentionally inspectable unavailable choices use `aria-disabled` and ignore activation;
- reordering has native move-up/down button alternatives.

The focus-visible audit found explicit 2px outlines for the title-bar selector/About control, header controls, navigation controls and selection rows, compact Add controls, Matrix states, Planned Supply cells, Cargo controls, Search/results, Validation rows, dialog controls, and status controls. No `outline: none` or `outline: 0` removal was found. Dark selected controls retain an offset outline against surrounding light surfaces. Focus treatment is therefore adequate at source level, pending zoom/platform observation.

The keyboard exception is A-05: pointer-only drag handles should not advertise themselves as keyboard-operable focus stops.

### Accessible names and form labels

- Compact `+ Add` / `＋ 追加` controls preserve localized full actions in both `aria-label` and `title`; their visual control dimensions remain at least 1.75rem high and were not reduced by the audited batch.
- Network icon controls, navigation collapse, move buttons, disclosure buttons, removal controls, Search submit/close, About close, and status dismiss controls have localized explicit accessible names where shorthand or symbols are used.
- The Inter-System editor toggle has visible localized text and `aria-pressed`; the collapsed marker is covered by A-04.
- Character name/level/skills are wrapped by labels. Outpost name has an explicit localized `aria-label`. System/body and manufacturing selectors are label-associated. Cargo destination selectors have localized `aria-label`s. Search has a localized explicit label plus description; placeholder is supplementary. Locale has a localized explicit `aria-label`; its visible short code is decorative.
- Biome controls are native buttons grouped under a visible section label and expose selected state through `aria-pressed`.

No control relies solely on `title` for its action name. Non-control tooltip dependence remains in the collapsed cargo abbreviations (A-08).

### Inter-System marker

- Visible `[INT]`: removed.
- Visible replacement: localization-neutral `✷⇄✷`.
- Symbol announced literally: prevented by `aria-hidden="true"`.
- Localized tooltip: present through `title`.
- Localized accessible name: authored but not robustly mapped on the generic wrapper; A-04.
- Internal discriminator: remains `interstellar`.
- Color-only dependence: no; the glyph supplies shape.
- Unnecessary Tab stop: none.
- SVG replacement: optional polish, not required by this audit.

### Validation, status, and color dependence

Validation messages themselves are complete text, stable-ID names are resolved at presentation time, contextual names use the ordinary UI font under Japanese, and remediation text is exposed in DOM reading order. Validation severity, however, is associated with individual rows only through color (A-02).

Selected/present/producing/planned states generally combine color with button state semantics (`aria-pressed`), borders, dashed/patterned fills, or text. Disabled native controls expose the disabled state programmatically. Planned Supply uses `aria-disabled` plus a dashed pattern. Cargo fuel state uses different one-way/two-way stripe patterns, but lacks an assistive description; stale exports use styling without a control-local status description (A-07).

The audit does not claim WCAG conformance. It performed exact source-token contrast calculations only; translucent `color-mix()` combinations and rendered anti-aliasing still require browser measurement. The shared muted token is sufficiently weak on known solid surfaces to warrant correction before manual checks (A-01).

## Search and collation regression

Search preserves one row per stable `type:id`, localized visible names, deterministic alias ranking, stable submission identity, and category disambiguation when collisions require it. Japanese canonical English and alternate aliases do not become visible or announced labels. Source implements Arrow Up/Down, Enter, Escape, focus retention, and `aria-activedescendant` selection.

Presentation-layer collation is limited to intended consumers:

- star systems are copied and sorted by localized display name with a stable-ID fallback;
- bodies are filtered from their existing reference order and are not sorted;
- resource topology remains controlled by fixed domain/reference order;
- X-Tech retains its fixed special placement;
- persisted outpost and Cargo Link order is untouched;
- validation keeps severity/order policy in `sortValidationIssues`;
- history chronology is untouched.

No domain mutation from collation was found.

## Release-state automated coverage

| Invariant | Existing coverage | Gap classification |
| --- | --- | --- |
| Semantic locale closure | Exact Japanese key/placeholder parity, invariant-token and no-fallback checks; baseline/sparse fallback checks | Covered |
| Locale switching | Locale resolution, preference separation, document language, history/collection immutability | LOW (T-01): no mounted-provider integration test switches all three locales while asserting selected network and a non-null selected outpost remain unchanged |
| Search aliases | Stable identity, Japanese/English aliases, rank/collision/deduplication tests | MEDIUM (T-02): no DOM-level combobox test verifies keyboard selection and announced visible names/category disambiguation |
| History relocalization | Stable reference and skill descriptors render across English/Japanese without mutation | Covered |
| Persistence locale independence | Serialization equality around relocalization plus comprehensive schema/stable-ID import/export tests | LOW (T-03): no single table-driven test runs the same import/export fixture under all supported locale preferences |
| Compact accessible names | Source guards assert localized `aria-label`, `title`, visible `+ Add`, and marker literals | MEDIUM (T-04): regex tests do not validate computed accessible names/roles, which allowed the generic-span marker ambiguity and cannot detect keyboard-inert focus stops |
| Terminology closure | Policy/unit/verifier coverage including Free Lanes exclusion and qualified X-Tech record | Covered |
| Locale-aware collation | Collator helper and stable-ID tie-breaker test; consumer source is correctly scoped | LOW (T-05): no regression test jointly asserts localized system order and unchanged body/resource/outpost/history ordering |
| Generated-reference zero drift | Repository verifier, deterministic serialization, sidecar/hash drift classification, reference build | Covered |

No missing test is a release blocker because current pure-function and source evidence establish the data invariants. The two medium gaps should be added with their related semantics corrections; the low gaps can be one small release-regression slice.

## Browser and platform coverage plan

The app has a standard `width=device-width, initial-scale=1.0` viewport declaration. The Japanese UI stack falls through `Yu Gothic UI`, `Yu Gothic`, `Hiragino Sans`, Meiryo, and system UI, which is sensible on Windows and WebKit/macOS/iOS. The application does not claim a mobile layout; iPhone should remain a font/WebKit sanity target only.

At 125% and 150% zoom, likely risk areas are:

- the two-column workspace, especially the 18rem minimum Cargo column;
- the independently scrolling Cargo Link list with `max-height: calc(100svh - 12rem)`;
- the Matrix's intentional 38rem minimum table width and horizontal scroller;
- compact header/network/search controls during wrapping;
- 1.35–1.45rem disclosure controls and focus rings near clipped card edges;
- fixed bottom status feedback and the Validation popover;
- Search results palette viewport clamping.

Source generally uses minimum sizes, flexible grids, wrapping, and explicit overflow rather than fixed content heights. The Matrix and Planned Supply have local horizontal scrolling. No source-level fixed-height clipping of prose was found, but zoom behavior is untested and is not marked passed.

Core meaning does not depend exclusively on desktop hover for buttons: compact/icon controls have accessible names, Matrix read-only states are keyboard focusable, and contextual help is a focusable button. A-08 remains the collapsed-summary hover/touch exception.

## Accepted limitations

These are known, non-blocking limitations if unchanged:

- no macOS desktop visual test is available;
- iPhone Safari is only a WebKit/Japanese-font sanity check, not mobile-support certification;
- 125% and 150% browser zoom remain unobserved until the manual pass;
- the composed-fauna U+0020 separator is verified by policy/build tests but not byte-confirmed against a first-party final in-game Japanese composition screenshot;
- `✷⇄✷` is a provisional platform-font symbol and may later become a custom SVG if visual consistency warrants it; its semantic correction is independent of that polish;
- import-summary locale collation remains deferred;
- fully independent outpost-navigation scrolling remains deferred;
- the Japanese catalogue and official overlays have strong source/provenance closure but no native-speaker release review;
- the production bundle emits a non-blocking chunk-size advisory.

## Recommended correction slices

1. **Accessibility semantics:** add per-validation-row severity text, live status semantics, robust marker semantics, and accessible cargo operational-state descriptions.
2. **Keyboard semantics:** remove pointer-only drag handles from Tab order or implement a complete keyboard drag model; retain move buttons.
3. **Contrast:** revise/measure secondary and disabled text tokens across background, surface, panel, tooltip, Validation, and status contexts.
4. **Localization documentation closure:** update only the stale Architecture, Japanese Glossary, and Backlog paragraphs; do not reopen localization architecture.
5. **Small release tests:** replace regex-only confidence with DOM accessibility/keyboard tests for compact controls and Search, then add table-driven locale/persistence and collation-boundary regressions.

No persistence, schema, domain, reference-generation, or large UI architecture change is recommended.

## Release recommendation

**Outcome B — minor corrections required.** Make the focused accessibility/documentation/test slices above, rerun the clean verification suite, and then execute the manual checklist. There are no repository-level blockers, but the HIGH contrast finding and MEDIUM semantic findings should not be deferred until after final manual verification.

## Manual verification checklist

These checks are outstanding and must not be recorded as passed until actually observed.

### Windows primary browser

- [ ] Exercise `en-US`, `en-GB`, and `ja-JP` on representative populated data.
- [ ] Switch locale repeatedly; verify selected network/outpost, data, history depth, Undo/Redo, IDs, and exported JSON do not change.
- [ ] Exercise Search, Resource Matrix, Planned Supply, Cargo Links, Validation, history, About, and network reset/delete dialogs.
- [ ] Confirm Japanese reference names, `X-テックパワーコア`, Cargo Link terminology, and the invariant app title render intentionally.
- [ ] Record any visual, focus, or interaction regression.

### Browser zoom

- [ ] At 100%, 125%, and 150%, inspect the header, outpost details, Matrix, Cargo editor, Validation panel, Search results, and dialogs.
- [ ] Check for clipping, hidden controls, document-level horizontal overflow, overlap, truncated essential text, inaccessible local scrollbars, and lost/obscured focus rings.

### iPhone Safari sanity check

- [ ] Confirm Japanese glyphs render without tofu and the Hiragino/system fallback looks coherent.
- [ ] Confirm the app title remains intentional and the page is not catastrophically broken.
- [ ] Confirm essential control meaning is available without hover.
- [ ] Treat observations as WebKit/font evidence only, not mobile certification.

### Keyboard-only pass

- [ ] Tab through locale, Search, network/outpost navigation, Add/Remove/Reshuffle, details, biome, Matrix, Planned Supply, Cargo, Validation, history, and About controls.
- [ ] Activate native actions with Enter/Space and operate selects with the keyboard.
- [ ] Open/close each dialog, verify initial focus, Tab containment, Escape close, and focus restoration.
- [ ] Verify Search arrows/Enter/Escape and Validation roving focus/Home/End/Enter/Escape.
- [ ] Verify every focus indicator remains visible, including selected/dark states and compact Add controls.
- [ ] Confirm no focus trap; specifically retest reshuffle drag handles after A-05 is corrected.

### Optional screen-reader smoke test

- [ ] With Narrator or another familiar Windows screen reader, verify both compact `+ Add` controls announce their full contextual actions.
- [ ] Verify the collapsed Inter-System marker announces one localized semantic name and does not announce `✷⇄✷` literally.
- [ ] Verify Search label, visible option names, category disambiguation, active option, and results summary.
- [ ] Verify locale selector label/current selection.
- [ ] Verify each Validation row includes its severity, context, message, and remediation.
- [ ] Verify asynchronous import/export success and failure feedback is announced once.
- [ ] Verify dialog close controls and dialog names/descriptions.

### Composed-fauna evidence

- [ ] If a first-party Japanese screenshot or in-game dynamically composed fauna name becomes available, compare separator behavior with the current single U+0020 policy.
- [ ] Do not block release solely for absent evidence if current rendering is legible and no contradictory evidence appears.

### Marker prototype

- [ ] Confirm `✷⇄✷` is visually coherent in the primary Windows browser and iPhone Safari font stack.
- [ ] If inconsistent, retain the corrected semantics and schedule a custom SVG; do not change the cargo domain model.

**Final disposition: Outcome B — minor corrections required.**

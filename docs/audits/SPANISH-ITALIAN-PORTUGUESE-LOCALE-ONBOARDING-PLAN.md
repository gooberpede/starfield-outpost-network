# Spanish, Italian, and Brazilian Portuguese Locale Onboarding Plan

## 1. Executive summary

Spanish (Spain), Italian, and Portuguese (Brazil) should remain one coherent
localization tranche. The installed game has complete official input coverage
for all three languages, all 36 inspected tables decode cleanly as strict UTF-8,
the same 4,818 qualified provenance rows materialize the same 3,561 canonical
entities in every language, and all 37 official-terminology evidence identities
resolve. No new localization architecture is required.

Use tracker locales `es-ES`, `it-IT`, and `pt-BR`, with Bethesda table tokens
`es`, `it`, and `ptbr`. The distinction matters: runtime identifiers are BCP 47
tags used by `Intl`, `document.lang`, preferences, and the locale selector;
Bethesda tokens only identify official string-table members.

The current French/German pipeline is substantially ready. Locale metadata,
strict decoding, qualified terminology values, overlay generation and sidecars,
stable-ID lookup, formatters, collation, preferences, and closure orchestration
are locale-oriented. The remaining work is bounded extension of fixed locale
lists and target-specific data: review drafts and glossary constraints, review
CLI routing, fauna-evidence eligibility, runtime registry/imports, search-fold
policy, shortcut speech, build commands, and parameterized tests.

The semantic review should continue to use one deterministic XLIFF 1.2 file and
one review CSV per locale. DeepL currently supports Spanish, Italian, and
Brazilian Portuguese targets, and its document API supports XLIFF 1.2. The
existing stable-key, source-hash, context, risk, placeholder, protected-token,
neutral-adjudication, and stale-constraint controls are reusable after the
hard-coded French/German glossary fields and draft routing are generalized.

Composed fauna remain the only evidence-sensitive release gate. The current
922-name/2,179-component prediction model should be generated for each locale,
but `prefix + species + diet` order and literal U+0020 separators should remain
pending until normal gameplay supplies opportunistic first-party screenshots.
The user should not be asked to hunt named fauna or meet a screenshot quota.

No decision blocks engineering from starting. Before runtime activation, accept
the conservative browser mapping in section 21 (or explicitly choose a broader
regional fallback), approve three glossaries and semantic reviews, and obtain
non-contradictory composed-fauna evidence for each locale.

## 2. Recommendation on keeping all three locales together

Keep all three locales together through tooling, terminology, semantic review,
reference generation, runtime integration, and closure.

Concrete reasons:

- installed official inputs are complete and structurally identical;
- all three use strict UTF-8 and the existing Latin UI typography;
- each resolves the unchanged canonical and terminology identities;
- the review/XLIFF contract is inherently per-locale but can run three times;
- search needs the same lower-ranked decomposition fold, with only a small
  Italian apostrophe normalization addition;
- shared `Intl` formatters and collators behave correctly for all three;
- presentation risk is additive workload, not incompatible architecture.

Editorial review is the largest cost. It can proceed independently per locale
inside the shared tranche, so one locale need not block drafting work for the
others. Split only if a stop condition in section 34 occurs.

## 3. Exact recommended tracker locale IDs

| Language target | Tracker/runtime ID | Reason |
| --- | --- | --- |
| Spanish (Spain) | `es-ES` | Explicit Spain target; valid canonical BCP 47 tag; leaves regional Spanish variants distinct. |
| Italian | `it-IT` | Explicit Italy target; follows the project's language-region convention. |
| Portuguese (Brazil) | `pt-BR` | Explicit Brazilian target; keeps European Portuguese distinct. |

Local Node/ICU checks canonicalized these tags unchanged and selected Spanish,
Italian, and Portuguese locale data for number, list, and collation behavior.

## 4. Exact observed Bethesda tokens

The installed archive members prove these exact tokens:

| Tracker locale | Bethesda token | Representative member |
| --- | --- | --- |
| `es-ES` | `es` | `strings/starfield_es.strings` |
| `it-IT` | `it` | `strings/starfield_it.strings` |
| `pt-BR` | `ptbr` | `strings/starfield_ptbr.strings` |

Do not use `es-ES`, `it-IT`, or `pt-BR` to locate Bethesda members, and do not
expose `ptbr` as a runtime locale.

## 5. Official table coverage by plugin/table type

Read-only intake inspection used the repository's exact-member BA2 reader
against the installed Starfield data. Every cell below contains `.strings`,
`.dlstrings`, and `.ilstrings`:

| Plugin | Archive containing the tables | `es` | `it` | `ptbr` |
| --- | --- | --- | --- | --- |
| `Starfield.esm` | `Starfield - Localization.ba2` | complete | complete | complete |
| `ShatteredSpace.esm` | `ShatteredSpace - Main02.ba2` (`Main01` also inspected) | complete | complete | complete |
| `SFBGS00D.esm` | `SFBGS00D - Main.ba2` | complete | complete | complete |
| `SFBGS050.esm` | `SFBGS050 - Main.ba2` | complete | complete | complete |

The first three plugins remain canonical content sources. `SFBGS050.esm`
remains terminology evidence only and must not add runtime entities. Fresh
implementation-time manifests should bind generated outputs to the then-current
archive and member hashes; audit-time local hashes are not durable release
identities.

## 6. Encoding findings

Add explicit strict UTF-8 entries for all three Bethesda tokens:

```text
es    -> utf-8
it    -> utf-8
ptbr  -> utf-8
```

The diagnostic walked every value boundary in all 36 target tables. Each table
had zero fatal UTF-8 decode failures. Large numbers of values differed when the
same bytes were decoded as Windows-1252, providing a strong mojibake signal
rather than merely showing that ASCII happened to decode under both encodings.

Preserve the current policy:

- `TextDecoder(..., { fatal: true })`;
- no byte sniffing;
- no fallback decoder;
- `UNSUPPORTED_LOCALE_ENCODING` for unregistered tokens;
- tests for Bethesda token and tracker-ID lookup;
- English remains Windows-1252; Japanese, French, and German remain UTF-8.

## 7. Current pipeline readiness

| Area | Readiness | Finding |
| --- | --- | --- |
| Locale metadata/encoding | High | One metadata file drives tracker ID, token, encoding, role, and artifact names. |
| Semantic catalogue contract | High | Baseline parity, placeholders, plural syntax, and fallback are reusable. |
| Review CSV/XLIFF | Medium-high | Core is generic; target constraints and CLIs contain fixed locale branches. |
| Terminology | High | Evidence and per-locale value schema are already locale-neutral. |
| Reference overlays | High | Materializer, serializer, sidecar, and verifier accept tracker locale metadata. |
| Fauna evidence | Medium | Prediction/validation is generic; eligible locale list is fixed to French/German. |
| Runtime selection/persistence | High | Central registry and preference validation need ordinary additions. |
| Search | Medium-high | Ranking is generic; fold eligibility is fixed and apostrophe policy needs evidence-based extension. |
| Collation/formatting | High | Shared `Intl` helpers already accept any `SupportedLocale`. |
| Shortcut speech | Medium-high | Small exhaustive per-locale map needs three entries. |
| Locale closure | High | Orchestrator is locale-oriented once artifacts exist. |

## 8. Remaining hard-coded locale assumptions

The following are implementation work, not reasons for a new framework:

- `SupportedLocale`, registry imports/entries, reference-overlay imports, and
  browser-family mapping list only current locales;
- semantic review draft selection only recognizes Japanese/French/German;
- review glossary constraints store `fr`/`de` fields and choose between them;
- adjudication output naming accepts only French/German;
- XLIFF generation skips Japanese through an explicit branch;
- fauna evidence accepts only `fr-FR` and `de-DE`;
- search decomposition folding is enabled only for French/German;
- accessible shortcut speech is an exhaustive current-locale object;
- production build and several test arrays name the current overlay locales;
- a few test descriptions/fixtures are French/German- or Japanese-specific.

Default arguments of `ja-JP` in some build tools are convenience defaults, not
architectural blockers, but explicit `--locale` should be used for new work.

## 9. Semantic review/XLIFF readiness

The current review schema already records:

```text
Key, Locale, EnglishSource, EnglishSourceSha256, Context, Risk,
Parameters, ProtectedTokens, OfficialTermConstraints, CodexTranslation,
DeepLTranslation, ComparisonStatus, AdjudicationDecision,
FinalTranslation, ReviewerNote
```

It supplies deterministic key order, exact source hashes, LOW/MEDIUM/HIGH risk,
placeholder and protected-token validation, stable-key import, comparison
states, explicit neutral decision provenance, rationale enforcement, final
catalogue generation, source-drift rejection, and constraint-drift rejection.
Neutral adjudication does not prefer either machine source.

Required extension:

- move glossary constraint values into locale-keyed data rather than adding
  more language fields to each code object;
- register one independent Codex draft per target;
- make generation/adjudication CLIs derive files and export names from locale
  metadata;
- parameterize full-locale tests and retain small language-specific assertions;
- preserve reproducibility of already committed French/German handoffs.

## 10. DeepL workflow recommendations

Continue with XLIFF 1.2, one file per locale:

```text
docs/localization/es-ES-deepl.xliff
docs/localization/it-IT-deepl.xliff
docs/localization/pt-BR-deepl.xliff
```

Use `en-US` as source language and the exact tracker target tag. DeepL's current
documentation lists supported translation languages through its Languages API,
and its document endpoint accepts XLIFF 1.2, 2.0, and 2.1:

- https://developers.deepl.com/docs/getting-started/supported-languages
- https://developers.deepl.com/api-reference/document/upload-and-translate-a-document

DeepL distinguishes Brazilian and European Portuguese, so request `PT-BR`, not
generic Portuguese or `PT-PT`. Spanish and Italian use their supported target
directions. Reconfirm support immediately before the manual handoff because it
is an external service contract.

The current XLIFF preserves message keys in `id`/`resname`, represents message
placeholders as `<ph>`, includes source hash/parameter/protected-token metadata,
and supplies context and terminology notes. Non-placeholder protected tokens
are fail-closed at import rather than guaranteed immutable in transit; retain
that validation and `INVALID_TOKENS` review path. Re-import must continue to
reject missing, duplicate, unknown, stale-source, locale-mismatched, and
token-invalid units.

Committed XLIFF remains a deterministic current handoff representation, not
historical proof of the exact bytes sent to DeepL. Do not call DeepL from the
repository tooling and do not combine the three targets into one XLIFF.

## 11. Official terminology readiness

The 37 evidence rows across 19 term IDs are reusable without schema changes.
A read-only qualified lookup resolved every non-absence row for all three
tokens; absence rows remained intentionally empty. Representative exact values
include:

| Concept | Spanish | Italian | Brazilian Portuguese |
| --- | --- | --- | --- |
| Outpost | `Puesto` | `Avamposto` | `Entreposto` |
| Cargo Link | `Enlace de cargamento` | `Collegamento merci` | `Vínculo de Carga` |
| Inter-System Cargo Link | `Enlace de cargamento intersistema` | `Collegamento merci intersistema` | `Vínculo de Carga Entre Sistemas` |
| X-Tech | `X-Tech` | `X-Tech` | `Tec-X` |
| X-Tech Power Core | `Núcleo de energía de X-Tech` | `Nucleo energetico di X-Tech` | `Núcleo de Energia Tec-X` |

These are evidence, not automatic sentence fragments. Contextual rows still
need editorial judgment, especially where articles, contractions, inflection,
capitalization, or the standalone tracker concept differs from source context.

The existing per-locale value artifact shape (`EvidenceId`, `Locale`,
`OfficialValue`, `RecommendedDefault`) and verifier are already suitable.

## 12. Proposed glossary strategy

Create, during implementation rather than this audit:

```text
docs/localization/SPANISH-GLOSSARY.md
docs/localization/ITALIAN-GLOSSARY.md
docs/localization/PORTUGUESE-BRAZIL-GLOSSARY.md
```

Each glossary should identify the English concept, approved target wording,
official evidence ID where applicable, tracker-owned status otherwise,
forbidden/confusable alternatives, capitalization, grammatical notes, compact
label suitability, and representative UI contexts. Approve glossaries before
bulk semantic translation so review constraints are stable.

## 13. Tracker-owned terminology risks

All three languages need context rather than isolated word substitution.

Spanish risks include `Present` as presence versus a temporal adjective,
`Producing` as state versus action, `Inputs` as manufacturing inputs rather
than form fields, `Source`/`Destination` gender and article choice, and compact
imperatives for `Reshuffle`, `Lock`, `Undo`, and `Redo`. `Planned Supply`,
`Active Production`, and `Resource Matrix` require consistent noun phrases.

Italian has the same state/action distinctions plus productive articles and
prepositional contractions. `Present` must mean availability/presence, not
“current”; `Inputs` must not drift into generic data-entry terminology.
`Producing`, `Planned Supply`, and validation messages need agreement with
parameterized nouns. Apostrophes and elision need sentence-level review.

Brazilian Portuguese requires an explicit regional register. `Present` must be
the availability state, `Producing` the operational state, and `Inputs` the
manufacturing concept. Gender/number and contractions affect `Source`,
`Destination`, `Inorganic`, `Organic`, `Active Production`, and complete
validation sentences. Official capitalization such as `Vínculo de Carga` is
evidence but should not force title case into every tracker sentence.

Across all three, give HIGH or explicit sense context to `Planned Supply`,
`Present`, `Producing`, `Inputs`, `Logistics`, `Manufacturing`, `Validation`,
`Resource Matrix`, `Reshuffle`, `Lock`, `Network`, `Active Production`,
`Source`, `Destination`, `Undo`, and `Redo`.

## 14. Reference-overlay readiness

The generalized materializer successfully produced one complete in-memory
overlay per token from committed provenance and installed tables:

```text
3,561 entities per locale
4,818 qualified provenance rows per locale
0 unresolved qualified values
```

Use one generated module and one sidecar per locale:

```text
src/localization/generated/es-ES-reference-names.ts
src/localization/generated/it-IT-reference-names.ts
src/localization/generated/pt-BR-reference-names.ts
reference-source/localized-reference-names-es-ES-manifest.json
reference-source/localized-reference-names-it-IT-manifest.json
reference-source/localized-reference-names-pt-BR-manifest.json
```

No canonical discovery, reverse English matching, provider selection, FormID
resolution, or schema migration is needed. Generated modules should be
statically registered after their evidence and verification gates close.

## 15. Provenance reuse

Reuse exactly:

- 3,561 stable canonical entities;
- 4,818 qualified direct/template/component identities;
- the same source plugins, provider chains, FormIDs, fields, table types, and
  string IDs;
- the three approved entity-scoped source/display normalizations;
- per-locale official values and generated output hashes.

Locale-specific values must not modify canonical IDs, English fallback data,
persisted documents, import/export, history, or reference-data records.

## 16. Composed-fauna evidence plan

The existing population is reusable: 922 composed fauna, 2,179 components,
with 267 `prefix+species`, 335 `prefix+species+diet`, and 320 `species+diet`
shapes. Generate deterministic prediction support for each locale and initialize
its evidence record as pending.

Verify, when examples naturally appear in target-locale gameplay:

- component order;
- exactly one U+0020 between present components;
- bracket and abbreviation preservation;
- capitalization as presentation versus lexical content;
- Spanish gender/number or adjective-order changes;
- Italian elision, apostrophes, prepositions, and agreement;
- Brazilian Portuguese agreement, contractions, and hyphen behavior.

Useful observations cover the three component shapes and any surprising
punctuation or agreement. They are not a quota. The user should capture
screenshots opportunistically during ordinary play; tooling maps visible names
back to stable fauna IDs afterward. Do not require English/foreign-name hunts,
Creation Kit navigation, or a prescribed planet. Any contradiction reopens the
composition rule for that locale rather than creating silent per-entity fixes.

## 17. Spanish search considerations

Enable the existing lower-ranked NFD combining-mark fold for localized Spanish
names. It handles `á é í ó ú ü` and also maps `ñ` to `n`. Although `ñ` is a
distinct Spanish letter, treating unaccented/un-tilded input as a convenience
fallback is acceptable because correctly spelled localized exact/prefix/
substring matches retain higher rank and display spelling never changes.

Add tests for `ñ`/`n`, diaereses, accents, exact-before-folded ranking, and
deterministic collision behavior. Do not remove inverted punctuation globally;
it is sentence punctuation and was not evidenced as a reference-name search
need. The generated Spanish overlay contains ASCII apostrophes/hyphens, no
non-ASCII hyphen variants, and no ligatures. The 108 resource/product names had
no new collision after decomposition folding in the audit corpus.

## 18. Italian search considerations

Enable lower-ranked decomposition folding for accented vowels (`à è é ì ò ó
ù`). Add search-only equivalence between straight ASCII apostrophe and the
curly apostrophe used by official Italian names; the audit overlay contained
15 curly-apostrophe names and no straight-apostrophe names, making this a real
typing-path need. Preserve punctuation in display values and exact ranking.

Official names used ASCII hyphens and no ligatures or non-ASCII hyphen variants.
Do not add broad punctuation stripping or fuzzy matching. The resource/product
folded corpus had no new collision.

## 19. Brazilian Portuguese search considerations

Enable lower-ranked decomposition folding for acute, circumflex, tilde, grave,
diaeresis, and cedilla forms (`á â ã à ç é ê í ó ô õ ú ü`). This allows common
unaccented input without changing visible spelling or outranking exact localized
matches. The generated corpus used ASCII apostrophes and hyphens, with no
non-ASCII hyphens or ligatures. No new resource/product collision appeared
after folding.

Do not infer European Portuguese synonyms, fuzzy edits, or broad punctuation
removal. Canonical English and curated aliases remain behind localized matches,
and every result remains one stable entity.

## 20. Collation

Keep `Intl.Collator(locale, { sensitivity: 'base', numeric: true })` for all
three targets. Local ICU checks selected the appropriate language data, kept
numeric `2` before `10`, treated ordinary accents as base-equivalent, and kept
Spanish `n` before distinct `ñ` under Spanish collation.

Use it only for systems, cargo export candidates, alphabetical Planned Supply
groups, and Search tie-breaks. Preserve body/orbit order, biome occurrence,
resource topology, persisted outpost and cargo-link order, validation order,
source-class order, and history chronology. No locale-specific collator is
needed; stable ID remains the final tie-break.

## 21. Browser-locale mapping policy

Recommend a conservative regional policy:

| Browser preference | Effective tracker locale |
| --- | --- |
| `es`, `es-ES`, descendants of `es-ES` | `es-ES` |
| other `es-*` such as `es-MX` | continue to next preference, then normal fallback |
| `it`, `it-IT`, descendants of `it-IT` | `it-IT` |
| other `it-*` such as `it-CH` | continue to next preference, then normal fallback |
| `pt-BR`, descendants of `pt-BR` | `pt-BR` |
| bare `pt` | `pt-BR` as the project's only unqualified Portuguese default |
| `pt-PT` and other explicit non-Brazilian `pt-*` | continue to next preference, then normal fallback |

This differs deliberately from the broad French/German family mapping. Spanish
regional vocabulary can differ, and Brazilian versus European Portuguese is a
material product distinction. Users with another regional tag can still choose
the clearly labeled locale manually. If product policy prefers “supported
language is better than English” over regional exactness, broad family mapping
is technically easy, but it must still display the actual supported regional
label and must not claim a regional catalogue that does not exist.

## 22. Locale selector labels

Use self-identifying explicit labels:

```text
Español (España)
Italiano (Italia)
Português (Brasil)
```

Keep the current compact effective-tag convention in the closed automatic
state (`ES-ES`, `IT-IT`, `PT-BR`). Do not use flags. Do not settle final locale
ordering in this work; append consistently during onboarding and review final
ordering after all V1 locales exist.

## 23. Accessible shortcut speech

Extend the existing small policy without changing visible key tokens or
bindings. Initial speech values for editorial and Narrator verification:

| Token | Spanish | Italian | Brazilian Portuguese |
| --- | --- | --- | --- |
| Control | `Control` | `Control` | `Control` |
| Alt | `Alt` | `Alt` | `Alt` |
| Shift | `Mayús` | `Maiusc` | `Shift` |
| plus | `más` | `più` | `mais` |
| Arrow Up | `Flecha arriba` | `Freccia su` | `Seta para cima` |
| Arrow Down | `Flecha abajo` | `Freccia giù` | `Seta para baixo` |
| Arrow Left | `Flecha izquierda` | `Freccia sinistra` | `Seta para a esquerda` |
| Arrow Right | `Flecha derecha` | `Freccia destra` | `Seta para a direita` |

These are screen-reader phrases, not catalogue translations or visible chord
tokens. Confirm natural pronunciation in Windows Narrator during closure.

## 24. Typography

The current Latin stack (`Barlow Semi Condensed`, `Arial Narrow`, system UI)
already renders French and German Latin Extended glyphs and covers the Spanish,
Italian, and Brazilian Portuguese characters observed in official values. The
mono stack covers invariant technical tokens. No new font, binary, network
dependency, locale-specific size, or tracking rule is justified.

Manual QA must still inspect acute/grave/circumflex accents, tilde, diaeresis,
cedilla, `ñ`, curly Italian apostrophes, uppercase rendering, and fallback under
font-load failure. Preserve the geometry freeze.

## 25. Layout-risk review

The three locales are less likely than German to create sustained compound-word
pressure, but all can lengthen noun phrases and validation prose. High-risk
surfaces are the header and locale selector, network controls, Navigation,
Outpost Details, Resource Matrix headings/tooltips, Planned Supply, Cargo Links,
Search placeholder/results, Validation filters/messages, Help/Keyboard
Shortcuts, About, confirmations, status feedback, and file-transfer messages.

Observe at 1366 px, 1600 px, and 200% zoom/reflow. Record wrapping, clipping,
occlusion, excessive header growth, inaccessible focus, or essential text hidden
behind tooltips as presentation debt. Do not shorten correct translations merely
to fit and do not autonomously change control dimensions, gaps, grid/flex
proportions, breakpoints, font metrics, colors, or other geometry. Any physical
mitigation requires a separate reviewed UI task.

## 26. Accessibility/manual QA plan

Reuse the French/German closure checklist with target strings:

- keyboard-only operation and visible focus;
- Search combobox/results and portal focus handoff;
- Validation filters, severity, navigation, and announcements;
- modal containment and focus restoration;
- import/export status and delayed failure announcements;
- localized shortcut speech while visible bindings remain invariant;
- correct `document.lang` and persisted/automatic preference behavior;
- 1366 px, 1600 px, and 200% zoom/reflow;
- Windows Narrator smoke tests;
- typography and glyph rendering;
- repeated runtime switching without data/history changes.

Native-speaker review is desirable but remains non-blocking under current
policy. Apple/WebKit remains shared deferred platform follow-up.

## 27. Bundle impact

Audit-time in-memory compact JSON payloads were approximately 104,007 bytes
(`es`), 102,706 bytes (`it`), and 103,126 bytes (`ptbr`): about 310 KB total
before generated TypeScript formatting. Based on current 29-34 KB semantic
catalogues, add roughly 90-105 KB for three complete catalogues. Generated
source growth should therefore be approximately 430-480 KB plus small registry,
speech, and glossary-constraint code. Minified/compressed production impact must
be measured during implementation rather than inferred exactly from source.

The current built JavaScript is about 823 KB before these locales. Nothing in
the audit demonstrates a startup or runtime problem, and lookup remains simple
static data. Do not implement lazy loading. Preserve the backlog order: finish
planned V1 localization, then perform the dedicated bundle/startup review.

## 28. XLIFF/selector-order deferred items

Keep active handoff XLIFF under `docs/localization/`. After the entire
localization program, move working XLIFF to ignored local storage and update
tooling/docs/tests as already planned. Do not move existing files in this
tranche.

Do not settle final selector ordering. Review it after Spanish, Italian, Polish,
Brazilian Portuguese, and Simplified Chinese onboarding is complete.

## 29. Automated test plan

Prefer parameterized locale tables over copied suites. Minimum durable coverage:

- metadata maps tracker IDs to `es`/`it`/`ptbr`, strict UTF-8, full role, and
  correct artifact names;
- strict decode succeeds on fixtures and malformed UTF-8/unknown locale fails;
- complete catalogue key, placeholder, plural, token, and non-empty parity;
- review CSV and XLIFF deterministic generation/re-import, stable keys,
  context/constraints, source hash, invalid token, and stale-constraint cases;
- neutral adjudication decisions and substantive-rationale enforcement;
- all applicable glossary constraints match intended keys/contexts;
- 37-row terminology value completeness and deterministic ordering;
- 3,561-entity/4,818-row overlay closure and sidecar drift verification;
- 922-fauna/2,179-component predictions, evidence states, and contradiction
  rejection for all three locales;
- browser mapping including negative `es-MX`, `it-CH`, and `pt-PT` cases under
  the recommended policy;
- persisted override, invalid stored preference fallback, and `document.lang`;
- generated reference registration and canonical English fallback;
- accent/tilde/cedilla/`ñ` folding, Italian apostrophe equivalence, rank order,
  aliases, collisions, and one stable result;
- collator numeric ordering and stable-ID fallback on actual presentation lists;
- accessible shortcut speech for modifiers, connector, and arrows;
- number/list/percent formatting and locale closure orchestration;
- repeated runtime switching without persisted-network or history changes;
- production build verifies all three overlays explicitly.

## 30. Recommended implementation sequence

1. **Locale contracts and reusable review tooling** — add non-runtime locale
   metadata/encodings, generalize review constraints/draft/output routing,
   extend fauna eligibility, and parameterize contract tests. Do not expose the
   locales yet.
2. **Official terminology and glossaries** — resolve and commit three value
   artifacts, author the three glossaries, approve compact terminology and
   context-sensitive constraints.
3. **Semantic catalogues and comparative review** — create three complete Codex
   drafts, generate separate review CSV/XLIFF files, perform independent DeepL
   handoffs, adjudicate every row with rationale, and generate final catalogues.
4. **Official reference names and fauna evidence** — generate three overlays and
   sidecars from unchanged provenance, produce prediction support, record
   opportunistic screenshots, and close or explicitly hold each composition
   evidence status.
5. **Runtime, browser, search, collation, and speech integration** — register
   only completed artifacts, implement the conservative browser policy,
   decomposition/apostrophe search behavior, selector labels, shortcut speech,
   and formatter/collator regression coverage.
6. **QA and release closure** — run locale closure/build/test/lint checks, manual
   Windows/Chromium layout/accessibility passes, measure bundle output, update
   locale profiles and backlog state, and activate all three together if no stop
   condition remains.

Do not collapse terminology approval into bulk translation, or runtime
activation into evidence generation. Tooling and metadata work can be combined
because current abstractions are already generalized.

## 31. Estimated complexity

These are effort ranges, not deadlines:

| Work area | Engineering | Editorial/translation | DeepL | Screenshot evidence | Manual QA |
| --- | --- | --- | --- | --- | --- |
| Locale contracts/review tooling | 1-2 person-days | 0.5 day terminology consultation | none | none | targeted tooling checks |
| Terminology/glossaries | 1-2 days | 3-5 days across three locales | none | none | glossary spot-check |
| Semantic catalogues/review | 2-3 days | 8-14 days across three complete catalogues | three independent document turnarounds | none | catalogue spot-check |
| Reference overlays/fauna | 2-3 days | 1-2 days evidence review | none | opportunistic, indeterminate elapsed time | evidence comparison |
| Runtime/search integration | 2-3 days | 0.5-1 day speech/label review | none | none | focused functional checks |
| QA/release closure | 2-4 days | 1 day correction review | only if source rows changed | review any newly observed fauna | 3-6 person-days |

Overall planning range: about 10-17 engineering person-days, 14-23
editorial/translation person-days, three user-mediated DeepL handoffs, and 3-6
manual-QA person-days. Opportunistic screenshot elapsed time is intentionally
not estimated or converted into a target hunt.

## 32. Transferable lessons for Polish

Polish should reuse the metadata, per-locale constraints, value artifacts,
overlay, evidence, closure, and parameterized test contracts established here.
The review must pay more attention to case, gender, number, plural categories,
parameterized sentence order, longer labels, and diacritic folding. Do not
assume the three-locale grammar or browser-family policy applies. Inspect the
actual Bethesda token/encoding/tables and fauna rendering independently.

## 33. Transferable lessons for Simplified Chinese

The same stable IDs, qualified provenance, terminology separation, review
adjudication, and sidecar model should transfer. Simplified Chinese still needs
its own token/encoding proof, CJK typography and line-breaking decision,
punctuation/search/collation evidence, shortcut speech, and independent fauna
composition verification. Do not copy Japanese font, spacing, composition, or
search behavior merely because both use CJK scripts.

## 34. Explicit blockers and user decisions before implementation

No blocker prevents the first engineering work area.

The following are acceptance gates before runtime release:

- approve the three glossaries and final semantic review rows;
- complete the three user-mediated DeepL handoffs without treating DeepL as the
  default winner;
- accept the conservative browser mapping in section 21, or explicitly choose
  broader language-family fallback;
- obtain non-contradictory opportunistic first-party fauna evidence sufficient
  to provisionally accept each locale's order/separator model;
- resolve any material layout/accessibility blocker without silently changing
  frozen geometry.

Split the tranche only if one locale has missing official tables, incompatible
encoding or extraction requirements, a contradicted fauna model needing a
different architecture, impractical review capacity, unresolved regional
mapping policy, materially different search architecture, or another isolated
release blocker. None of those conditions was found in this audit.

### Closing recommended sequence

Proceed as one three-locale tranche in this order: locale contracts and review
tooling; terminology and glossaries; complete semantic catalogues with separate
DeepL comparison and neutral adjudication; official overlays with opportunistic
fauna proof; runtime/search/collation/speech integration; then shared manual QA
and release closure. Do not proceed from this audit directly into implementation
without a separate implementation brief.

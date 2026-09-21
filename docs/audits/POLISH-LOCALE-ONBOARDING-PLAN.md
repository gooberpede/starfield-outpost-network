# Polish Locale Onboarding Plan

## 1. Executive summary

Polish is ready to enter the established single-locale onboarding pipeline as:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
String encoding:  strict UTF-8
Catalogue role:   full
```

The installed-game inventory already proves complete Polish `.strings`,
`.dlstrings`, and `.ilstrings` populations across the current required source
set. A read-only in-memory materialization of the unchanged committed
provenance resolves all 3,561 canonical entities through all 4,818 qualified
rows, with zero unresolved rows. The same inventory resolves all 33 textual
official-terminology evidence rows; the other four of the 37 rows are intended
absences. This audit did not regenerate provenance or write an overlay.

No new localization architecture is required. Polish needs ordinary extension
of locale-keyed contracts, registries, review constraints, artifacts, tests,
and build verification. Its language-specific work is primarily editorial:
case and agreement around placeholders, four pluralized messages, terminology
that changes form by context, and composed-fauna evidence.

The current `one / other` formatter does not model Polish `few` and `many`
categories. Nevertheless, all four current plural keys can be expressed in
natural Polish with count-neutral constructions such as “number of …: {count}”.
The engine therefore need not change for the current catalogue. This conclusion
is an implementation stop condition: if Polish editorial review rejects a
natural neutral rendering for any of those four keys, plural support must be
reconsidered before runtime activation rather than shipping incorrect forms.

Search should add the existing lower-ranked decomposition fold plus one narrow
Polish search-only equivalence, `ł -> l`. The 108 current resource/product
names produce no new collision under either ordinary NFD folding or NFD plus
`ł -> l`. Exact Polish spelling must remain highest-ranked. The shared
`Intl.Collator` is sufficient and correctly distinguishes the Polish letters
in the tested ordering.

Proceed through a separate implementation brief. Do not activate Polish until
terminology, semantic review, reference-overlay closure, fauna evidence, and
manual layout/accessibility QA have passed.

## 2. Exact locale, token, and encoding contract

The intended contract is:

```text
pl-PL -> pl -> utf-8 -> full catalogue
```

The later metadata entry should initially be staged with runtime availability
off, then activated only during runtime integration:

```json
{
  "trackerLocale": "pl-PL",
  "bethesdaToken": "pl",
  "stringTableEncoding": "utf-8",
  "catalogueRole": "full",
  "runtimeAvailable": false
}
```

The runtime-integration stage should change only `runtimeAvailable` to `true`
after all required artifacts exist. Metadata registration alone must not expose
an incomplete locale.

`pl-PL` is a canonical BCP-47 tag in the current JavaScript runtime.
`Intl.getCanonicalLocales('pl-PL')` returns `pl-PL`. The existing formatter
boundary is suitable:

- `Intl.NumberFormat('pl-PL')` formats `1234567.89` as
  `1 234 567,89` (locale grouping and decimal separators);
- `Intl.ListFormat('pl-PL', { type: 'conjunction' })` formats `A, B, C` as
  `A, B i C`;
- `Intl.PluralRules('pl-PL')` exposes `one`, `few`, `many`, and `other`;
- `Intl.Collator('pl-PL', { sensitivity: 'base', numeric: true })` selects
  Polish collation data;
- `setDocumentLanguage('pl-PL')` already produces the correct
  `document.lang` value.

No date/time requirement exists in the current catalogue. Technical IDs,
schema values, and export filename timestamps remain invariant.

## 3. Installed input coverage

The existing installed-language inventory is authoritative for availability.
It found `pl` in every inspected official/Bethesda-named source and all three
table types. For onboarding, the required coverage is complete for:

- `Starfield.esm`;
- `ShatteredSpace.esm`;
- `SFBGS00D.esm`;
- `SFBGS050.esm` as terminology-only evidence.

Strict fatal UTF-8 decoding succeeded. The inventory reported zero replacement
characters and no C1-control symptoms. Windows-1252 produced 5,164 C1 controls,
which corroborates the strict UTF-8 contract rather than a guessed encoding.

Read-only closure already established:

| Population | Polish result |
|---|---:|
| Canonical entities | 3,561 / 3,561 |
| Qualified provenance rows | 4,818 / 4,818 |
| Unresolved provenance rows | 0 |
| Terminology evidence rows | 37 |
| Resolved textual evidence rows | 33 / 33 |
| Intended absence rows | 4 / 4 |
| Unresolved terminology rows | 0 |

Canonical provenance must not be regenerated merely to onboard Polish.

## 4. Current pipeline readiness

The proven Japanese, French/German, and Spanish/Italian/Brazilian-Portuguese
pipeline transfers directly:

- tracker locale metadata resolves Bethesda token and encoding;
- artifact names derive from the tracker tag;
- review CSV and XLIFF use stable semantic keys, source hashes, notes,
  placeholder metadata, protected tokens, and constraints;
- DeepL results import by stable key and are checked for stale source,
  placeholders, protected tokens, and supported plural structure;
- adjudication has no default winner and requires a substantive rationale;
- official terminology values key back to locale-neutral evidence identities;
- reference overlays materialize from unchanged qualified provenance;
- generated modules and sidecars are deterministic and verified without game
  files;
- fauna predictions and evidence records validate the fixed population;
- runtime identity remains stable-ID based and presentation-only;
- the locale closure command delegates to authoritative terminology,
  provenance, and overlay verification.

The current system is deliberately explicit rather than fully discovered at
runtime. Adding Polish to typed registries and parameterized tests is ordinary
extension, not evidence that a plugin framework or dynamic locale loader is
needed.

## 5. Remaining hard-coded assumptions

### Ordinary locale extension

The later implementation must extend these existing seams:

| Concern | Current seam | Polish work |
|---|---|---|
| Tooling metadata | `reference-source/localization-locale-metadata.json` | Add staged `pl-PL` / `pl` / UTF-8 full contract; activate later. |
| Runtime type | `src/localization/types.ts` | Add `pl-PL` to `supportedLocaleIds` during activation. |
| Runtime catalogue | `src/localization/registry.ts` | Import/register the final complete catalogue and selector labels. |
| Browser resolution | `src/localization/locale.ts` | Add conservative Polish routing. |
| Review draft routing | `scripts/localization/review-routing.ts` | Add the independent Polish draft after it exists. |
| Review constraints | `src/localization/reviewPackage.ts` | Add Polish values/strategies and a bounded accidental-English allowlist. |
| Terminology values | locale-named CSV contract | Add `official-terminology-values-pl-PL.csv`. |
| Semantic review | derived locale artifact paths | Add Polish draft, review CSV, one XLIFF, adjudication, and final catalogue. |
| Reference overlay | locale-oriented build/verify tools | Generate `pl-PL` module and sidecar from unchanged provenance. |
| Fauna evidence | metadata-derived target locale set | Add Polish evidence JSON; eligibility follows automatically once metadata is present. |
| Runtime reference names | `src/localization/referenceNames.ts` | Import/register the generated overlay. |
| Search folding | `src/ui/itemSearch.ts` | Add Polish to folding and apply narrow `ł -> l`. |
| Shortcut speech | `src/ui/keyboardShortcuts.ts` | Add the Polish speech record. |
| Build closure | explicit commands in `package.json` | Verify the Polish overlay in the production build. |
| Tests | locale arrays/tables across localization, components, search, collation, shortcuts | Add Polish cases, preferably by extending shared tables. |
| Durable policy | locale profile and backlog/architecture statements | Record only the final accepted Polish decisions at closure. |

Locale-keyed artifacts also follow existing deterministic names:

```text
src/localization/reviewDrafts/pl-PL.ts
docs/localization/pl-PL-review.csv
docs/localization/pl-PL-deepl.xliff
src/localization/locales/pl-PL.ts
reference-source/official-terminology-values-pl-PL.csv
reference-source/localized-fauna-evidence-pl-PL.json
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

### Not architecture gaps

- Static `SupportedLocale`, catalogue, speech, and overlay registries are the
  intentional compile-time completeness boundary.
- Explicit production-build overlay verification is acceptable for one more
  locale. It can be parameterized later if duplication becomes error-prone.
- The large locale-keyed glossary constraint map is verbose but already
  supports phrase, key-scoped, semantic-concept, and variant guidance.
- Fauna eligibility is metadata-derived and needs no Polish branch.
- Overlay generation, adjudication, artifact naming, and locale closure are
  already locale-oriented.

### Bounded generalization worth making during implementation

Tests currently repeat supported-locale arrays in several files. Extend or
centralize those tables only where doing so prevents Polish from being omitted
from parity, accessibility, and runtime-switching checks. Do not introduce a
new locale discovery framework.

The plural validator deliberately recognizes only the current `one / other`
syntax. No formatter expansion is justified by the present four keys, as
explained below. If neutral Polish wording fails editorial review, that finding
would be a real architecture requirement and a stop condition.

## 6. Polish grammar risks

Polish case, gender, number, and aspect make opaque placeholder insertion the
main semantic risk. Official names and user-authored names generally arrive in
nominative standalone form; the catalogue must not assume it can decline them.

### Highest-risk key families

| Risk | Representative keys | Required strategy |
|---|---|---|
| Verbs applied to opaque `{item}` / `{resource}` / `{product}` | `common.removeItem`, `plannedSupply.add`, `cargo.export.toggle`, `history.addExport`, `matrix.action.*`, many validation/tooltips | Prefer labels, colon structures, passive/impersonal wording, or quotation. Avoid requiring accusative, instrumental, or gender agreement from the inserted name. |
| Prepositions around `{outpost}` / `{system}` / `{body}` | `cargo.pad.linkedTo`, `history.changeSystem`, `history.changeBody`, `history.*Resource`, `history.startProducing` | Use arrows, locators, quoted names, or separate labelled fields. User-authored names and official proper names cannot be safely inflected automatically. |
| Official `{skill}` names in sentences | `validation.cargoPadSkillLimit`, `validation.outpostSkillLimit`, `validation.invalidSkillLevel`, `validation.planetaryHabitationRequirement`, `history.clearSkill`, `history.setSkill`, `history.changeSkill` | Isolate the skill label with punctuation or restructure the sentence. Do not derive a case form from the standalone official skill name. |
| Rename `{name}` / `{previousName}` | `history.renameCharacter`, `history.renameOutpost` | Prefer `old → new` or labelled values to avoid case and gender assumptions. |
| Subject agreement | `validation.manufacturedInputUnavailable`, active-production and X-Tech validation keys, matrix tooltips, organic help | Prefer impersonal constructions such as “brak …”, “oznaczono jako …”, or split label/value structures; do not make the unknown resource/product name govern gendered verbs or adjectives. |
| Count-governed nouns | the four plural keys plus non-plural `*addWithLimit`, skill-limit messages, `duplicateOutpostName`, and `validation.counts` | Use count-neutral “liczba …” structures unless all required Polish categories are represented. Audit non-ICU count sentences as carefully as the four explicit plural keys. |
| Adjective agreement and compact headings | `Present`, `Producing`, `Inorganic`, `Organic`, `Active Production`, power-quality labels | Choose forms against the implied Polish head noun for each surface; one invariant adjective is not automatically safe across headings, flags, buttons, and prose. |
| Imperative/aspect | Add/remove, start/stop producing, lock/reorder, import/export, undo/redo | Define whether a control is an instantaneous command or an ongoing state. Polish perfective/imperfective choices should remain consistent by action family. |

Parameterized messages should be translated as whole messages. The application
must not add a general Polish inflection engine, infer grammatical gender from
reference names, or mutate official names. Syntactic isolation is safer,
deterministic, and compatible with user-authored text.

## 7. Plural-system analysis

`Intl.PluralRules('pl-PL')` returns:

```text
1       -> one
2-4     -> few (except teens and other rule exclusions)
0, 5-21 -> many
fractions and some values -> other
```

Representative runtime results were `1=one`, `2=few`, `5=many`, `12=many`,
`22=few`, and `101=many`. The current formatter selects the `one` branch only
when the category is exactly `one`; `few`, `many`, and `other` all use the
current `other` branch. A direct noun translation would therefore be wrong:
Polish needs distinct forms analogous to `1 placówka`, `2 placówki`, and
`5 placówek`.

The English catalogue currently has exactly four pluralized semantic keys:

| Key | Direct Polish plural needed? | Natural neutral strategy |
|---|---|---|
| `cargo.pad.count` | `połączenie / połączenia / połączeń` | “Liczba połączeń towarowych: {count}” |
| `validation.issueCount` | `problem / problemy / problemów` or equivalent | “Walidacja — liczba problemów: {count}” |
| `validation.plannedSupplyUnresolved` | `element / elementy / elementów` | “Planowane zaopatrzenie — liczba nierozwiązanych pozycji: {count}. {itemList}.” |
| `search.results.found` | `placówka / placówki / placówek` | “Liczba placówek, w których znaleziono {searchItem}: {count}.” |

These are illustrative structures, not final translations. Each can avoid a
count-governed variable noun while retaining all placeholders and the current
required plural-expression shape (identical neutral branch text is acceptable
if the validator continues to require the source plural parameter). Runtime
output can remain natural; no richer branch selection is needed for these four
messages.

Conclusion: the current architecture is sufficient for the actual catalogue,
provided Polish review approves neutral wording for every key. Do not add ICU,
FormatJS, or `few`/`many` syntax speculatively. Do not use one noun form for all
non-`one` values. If a final reviewer finds the neutral structures unnatural or
if a new message genuinely requires count-sensitive Polish morphology, stop
and design richer plural syntax as a separate cross-locale change.

## 8. Official terminology readiness

All evidence identities resolve, but “resolved” does not mean every raw value
is a safe invariant tracker label.

| Concept | Representative official Polish evidence | Recommendation |
|---|---|---|
| Outpost | `Placówka` | Strong standalone default. Add case/number variants only as contextual guidance; do not inflect inserted proper names. |
| Cargo Link | `Połączenie towarowe` | Strong presentation default. Verify compact surfaces. |
| Inter-System Cargo Link | `Międzyukładowe połączenie towarowe` | Strong full-label default. Context evidence also uses the alternate order `Połączenie towarowe międzyukładowe`; do not mechanically force one order into every sentence. |
| Biome | `Biomy:` plus contextual `biom`, `biomach`, `biomów` | Official concept, context-sensitive morphology. Derive an editorial nominative singular default rather than copying the plural label. |
| Planet | `planecie` and `planety` in context | Official concept but no standalone nominative evidence row; use contextual guidance. |
| Planetary Body | `ciał planetarnych`; also broader `ciała niebieskie` | Tracker-owned abstraction informed by official evidence. Choose scope deliberately; do not extract a standalone form mechanically. |
| Star System | `układ` and `układ gwiezdny`, with contextual `układu` | `Układ gwiezdny` is the likely full concept; compact `układ` may be appropriate by key. Preserve context variants. |
| Official skills | `Zarządzanie placówką`, `Inżynieria placówek`, `Zasiedlanie planet`, `Metody badawcze`, `Projekty specjalne` | Direct defaults for skill display names. Treat them as opaque standalone labels in parameterized prose. |
| X-Tech | `X-Tech`; contextual `X-Techem` and `X-Techu` | Standalone resource label is direct. Constraints must allow contextual inflection and must not require literal invariant `X-Tech` in every phrase. |
| X-Tech Power Core | `Rdzeń mocy X-Techu` | Direct standalone default; contextual evidence corroborates the same inflected compound. It remains terminology-only evidence, not a new canonical reference entity. |
| Starfield | raw standalone evidence `W gwiazdy` | Unsuitable as the tracker’s product-brand default. Follow the existing locale policy and preserve the brand `Starfield`; retain the official value as evidence rather than a forced translation. |

Capitalization in the evidence is mostly sentence or standalone-label
capitalization. Polish common nouns should not inherit English title case.
Compact labels require surface-level review rather than automatic truncation or
abbreviation. The four cargo-pad absence rows remain absence-history evidence;
they do not revive “Cargo Pad” as a user-facing term.

## 9. Tracker-owned terminology risks

These concepts need strong context in the future glossary. Candidate senses
below are explanatory only, not approved translations.

| Concept | Polish risk to resolve |
|---|---|
| Planned Supply | Singular mass `zaopatrzenie` versus plural deliveries/supplies; must mean unresolved future intent, not inventory, reservation, or actual delivery. |
| Present | `obecny` can sound temporal and changes for gender; a noun such as “presence” or availability wording may be safer by surface. |
| Producing | State label versus start/stop action; adjective/participle agreement and verbal aspect differ. |
| Inputs | Avoid a term meaning form fields. Distinguish recipe requirements/material inputs from generic data input. |
| Logistics | Likely compact loanword, but confirm that the column means actual routed exports, not the entire logistics domain. |
| Manufacturing | Distinguish manufacturing configuration from generic production so it does not collapse into “Producing”. |
| Validation | `walidacja` is compact technical terminology; a plainer correctness-check term may be more natural in user-facing prose. Decide by surface. |
| Resource Matrix | Genitive construction and compactness; preserve the established table concept. |
| Reshuffle | Must mean enter manual reordering mode, never random shuffle. An action phrase may be safer than a single verb. |
| Lock | Must mean finish/prevent reordering, not login/security or immutable data. |
| Network | Likely `sieć`; confirm outpost-network domain sense and case variants. |
| Active Production | Gender/agreement and possible overlap with “Producing”; it means configured production, not measured throughput. |
| Source | Origin/source can differ for supply, production, and UI evidence. Use key/context scope where needed. |
| Destination | Compact cargo endpoint versus general purpose/goal sense. |
| Undo / Redo | Use standard Polish UI verbs consistently; “redo” must not mean repeat an arbitrary operation. |
| Inorganic / Organic | Adjectives require an implied noun and agreement; headings may safely use nominalized plural forms only if the category semantics stay clear. |

No single invariant phrase should be required across every grammatical context
for `Present`, `Producing`, `Inputs`, `Reshuffle`, `Lock`, `Source`,
`Destination`, `Inorganic`, or `Organic`. Use key-scoped or semantic-concept
constraints with curated variants.

## 10. Glossary strategy

Create `docs/localization/POLISH-GLOSSARY.md` during implementation, not in this
audit. It should use the same three classes as prior locale glossaries:

1. **Official Bethesda terminology** — direct defaults for Outpost, Cargo Link,
   Inter-System Cargo Link, X-Tech, X-Tech Power Core, and the five skill names.
2. **Tracker-owned preferred terminology** — Planned Supply, Present,
   Producing, Inputs, Logistics, Manufacturing, Validation, Resource Matrix,
   Reshuffle, Lock, Network, Active Production, Source, Destination, Undo/Redo,
   Inorganic, and Organic.
3. **Context-sensitive concepts** — Biome, Planet, Planetary Body, Star System,
   Starfield branding, X-Tech in declined prose, compact/full cargo-link forms,
   and any tracker term whose case, number, gender, or verbal aspect changes by
   sentence role.

Each entry should record meaning, excluded senses, preferred standalone form,
approved contextual variants, compact-label guidance, capitalization, and
keys/surfaces where the guidance applies.

The generalized constraint model is expressive enough. `phrase` is suitable
for true invariant labels, `key-scoped` for exact UI surfaces, and
`semantic-concept` with curated variants for inflection. Do not attempt to list
every theoretical Polish case form or turn the constraint system into a
morphology engine. Use context notes and human adjudication where a finite
variant list would become misleading.

## 11. Semantic review and XLIFF readiness

The current review pipeline supports Polish without new architecture:

- an independent Codex draft can route through the existing explicit map;
- review rows derive deterministically from all 414 current `en-US` keys;
- XLIFF 1.2 carries stable keys, source hashes, context, risk, parameters,
  protected tokens, and terminology notes;
- DeepL import validates locale, key set, source/hash freshness, placeholders,
  protected tokens, and plural syntax;
- invalid DeepL tokens can be recorded rather than silently accepted;
- adjudication requires a decision, final value, and substantive rationale;
- final catalogues are generated only from fully approved rows;
- stale constraints fail closed;
- positive plural-structure validation already exists.

Polish needs a locale-keyed constraint set before review rows can be generated.
The accidental-English detector also needs a bounded Polish allowlist. Because
it detects only words copied from the English source, likely legitimate shared
technical vocabulary is narrow—especially `system`, `status`, and protected
brand/technical tokens. Build the allowlist from actual false positives in the
independent draft. Do not pre-allow broad English vocabulary, and retain the
existing invariant handling for `Starfield`, `X-Tech`, `JSON`, `FormID`, key
tokens, and file extensions.

The four plural rows require targeted assertions proving that their rendered
Polish output is natural across representative `one`, `few`, and `many`
numbers even though the technical catalogue syntax remains `one / other`.

## 12. DeepL workflow

DeepL's current official Translator language list includes Polish, and its
official XLIFF documentation states that file translation accepts XLIFF 1.2 or
higher. See
[DeepL Translator languages](https://support.deepl.com/hc/en-us/articles/360019925219-DeepL-Translator-languages)
and [DeepL XLIFF file translation](https://support.deepl.com/hc/en-us/articles/7507376697500-Translate-XLIFF-files).

Use one Polish handoff only:

```text
docs/localization/pl-PL-deepl.xliff
```

It should be generated from the frozen Polish review rows after glossary and
constraint approval. Preserve stable keys, source/context notes, source hashes,
protected placeholders/tokens, and terminology notes. Import the returned
document through the existing validator, record invalid-token results, and
adjudicate every row neutrally against the English source, independent draft,
context, risk, and glossary. DeepL is comparative evidence, never the default
winner. Do not use multiple Polish handoffs to partition the same catalogue.

## 13. Reference-overlay readiness

The generalized tooling can produce the required outputs unchanged:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

The read-only audit materialized 3,561 Polish values from all 4,818 committed
qualified rows with zero unresolved rows. Expected per-kind closure remains:

```text
428 biomes
1,776 bodies
1,121 species
5 official terms
30 products
78 resources
123 systems
3,561 total
```

The generated Polish TypeScript module is estimated directly from the in-memory
serialization at 122,766 UTF-8 bytes. No committed output was generated.

Corpus observations:

- all expected Polish letters occur: `ą ć ę ł ń ó ś ź ż`;
- official values use ASCII apostrophe, ASCII hyphen, period, and underscore;
- three values contain a straight apostrophe and none contains a curly one;
- 902 values contain ASCII hyphens and none uses a non-ASCII hyphen variant;
- standalone official names preserve their supplied capitalization and
  abbreviations;
- contextual declension in Bethesda prose must not be projected onto the
  standalone overlay values.

No Polish-specific materializer or serialization change is needed. Generation
must still verify manifested table identity, strict UTF-8, exact coverage,
non-empty text, sidecar hashes, terminology agreement for official skill names,
and resource reconciliation.

## 14. Fauna composition risks and evidence plan

Reuse the fixed population and prediction model:

```text
922 composed fauna
2,179 components
267 prefix + species
335 prefix + species + diet
320 species + diet
literal U+0020 between non-empty components
```

Read-only Polish samples produced plausible game-style names such as
`Ślimak Stepowy Padlinożerca`, `Perła Filtrator`, and abbreviated prefixes such
as `Trzodn.` or `Stadn.`. This demonstrates that the qualified components
materialize and that Bethesda intentionally supplies compact Polish component
forms. It does not prove that every runtime composition exactly matches the
game.

Polish-specific risks are:

- adjective agreement with species gender and number;
- whether a prefix is an abbreviation deliberately designed to avoid
  agreement;
- noun/adjective order;
- diet-role nouns that could require an agreeing form;
- mutation or declension of the species component in composition;
- capitalization after abbreviated prefixes;
- period preservation in abbreviations;
- hyphenation or other punctuation replacing U+0020;
- differences among the three component shapes.

Evidence policy should match completed locales:

- generate the deterministic 922-row Polish prediction support file locally;
- capture screenshots opportunistically during ordinary Polish gameplay;
- do not target-hunt, prescribe a planet, set a rigid quota, or require the
  Creation Kit;
- prioritize naturally encountered examples across all three shapes, especially
  different apparent species genders, abbreviated prefixes, diet components,
  and surprising punctuation;
- record exact observed/predicted text, stable fauna ID, component order,
  separator, punctuation, grammar notes, and screenshot reference;
- accept provisionally only with non-contradictory first-party observations;
- let any later contradiction reopen only the Polish composition rule, never
  silently add per-fauna exceptions or regenerate canonical provenance.

## 15. Search normalization

The current official overlay contains all expected Polish letters. Ordinary NFD
combining-mark removal provides lower-ranked search equivalence for:

```text
ą -> a
ć -> c
ę -> e
ń -> n
ó -> o
ś -> s
ź -> z
ż -> z
```

`ł` does not decompose to `l` under NFD or NFKD. Add one narrow search-only
equivalence after normalization:

```text
ł -> l
```

This is desirable because users commonly type without Polish diacritics and
otherwise cannot find names containing `ł`. It must affect only the lower-ranked
folded alias; display text, stable identity, exact matching, and collation stay
unchanged.

Audit results for the 108 searchable resource/product names:

- zero new distinct-name collisions under NFD mark removal;
- zero new distinct-name collisions after adding `ł -> l`;
- the full 3,561-name overlay also produced no new distinct-name collision in
  either diagnostic.

Correct Polish spelling must retain the current exact/prefix/substring tiers
ahead of folded matching. `ź` and `ż` may both fall back to `z`; this is a
convenience path, not a claim that they are the same Polish letter. Keep the
stable-ID/category tie-break behavior for future collisions.

No apostrophe equivalence is evidenced: the current corpus has three straight
apostrophes and no curly apostrophes. ASCII hyphens dominate and no non-ASCII
hyphen appears. Do not strip punctuation, invent spelling variants, add fuzzy
matching, or introduce a broad transliteration framework.

## 16. Collation

The shared collator is sufficient:

```ts
new Intl.Collator('pl-PL', { sensitivity: 'base', numeric: true })
```

The local Node/ICU diagnostic resolved locale `pl` and sorted the representative
sequence as:

```text
a, ą, c, ć, l, ł, n, ń, o, ó, s, ś, z, z2, z10, ź, ż
```

This preserves the Polish distinctions and numeric ordering (`z2` before
`z10`). No manual table is needed. Continue using locale collation only for
genuinely alphabetical presentation lists and preserve stable-ID final
tie-breaks. Do not change orbital, biome occurrence, resource topology,
persisted outpost/cargo, validation, source-class, or history order.

## 17. Browser mapping

Use the conservative regional policy:

| Browser preference | Result |
|---|---|
| `pl` | `pl-PL` |
| `pl-PL` | `pl-PL` |
| descendants beginning `pl-PL-` | `pl-PL` |
| explicit other regional tags such as `pl-UA` or `pl-LT` | Continue to the next browser preference; then normal fallback. |

This matches the product philosophy used for regional Spanish, Italian, and
Brazilian Portuguese catalogues. It offers a sensible bare-language default
without claiming that `pl-PL` is a separately supported `pl-UA` or `pl-LT`
catalogue. Users can always choose Polish explicitly.

## 18. Locale selector label

Use:

```text
Polski (Polska)
```

This is self-identifying and matches the established language-plus-region
selector style. `Intl.DisplayNames` for `pl-PL` returns the same convention with
lowercase initial (`polski (Polska)`); capitalizing the option label is
consistent with the current selector. Use compact `PL-PL` in the automatic
closed-state convention. Do not use a flag and do not settle final global
selector ordering until Simplified Chinese is complete.

## 19. Accessible shortcut speech

Recommended initial Polish speech forms:

| Token | Spoken form |
|---|---|
| Control | `Control` |
| Alt | `Alt` |
| Shift | `Shift` |
| plus | `plus` |
| Arrow Up | `Strzałka w górę` |
| Arrow Down | `Strzałka w dół` |
| Arrow Left | `Strzałka w lewo` |
| Arrow Right | `Strzałka w prawo` |

These are screen-reader phrases only. Visible chord tokens and bindings remain
unchanged. Verify pronunciation, pauses between tokens, and whether Narrator
benefits from “klawisz” before modifiers during the release pass; do not add
that word without actual listening evidence.

## 20. Typography

The required Polish glyph set is:

```text
Ą Ć Ę Ł Ń Ó Ś Ź Ż
ą ć ę ł ń ó ś ź ż
```

The existing Latin UI stack (`Barlow Semi Condensed`, `Arial Narrow`, then the
system sans stack) and the `Segoe UI`-based baseline are suitable for Polish
Latin Extended text. The corpus diagnostic confirms these glyphs are genuinely
needed, with `ł`, `ó`, `ś`, and `ż` especially common. The technical mono stack
is used for stable IDs and tokens rather than ordinary translated sentences.

No Polish-specific font, font binary, web-font dependency, size rule, tracking
rule, or CSS is justified. Manual QA must still inspect lowercase and uppercase
diacritics in normal UI, condensed headings, uppercase labels, and technical
contexts, both with the web font loaded and under fallback. Any missing-glyph or
metric defect is a stop condition; do not solve it by transliterating display
text. Preserve the geometry freeze.

## 21. Layout and accessibility risks

Polish inflection and multi-word official terms can lengthen labels and
sentences. Highest-risk surfaces are:

- header, locale selector, network controls, and character/skill controls;
- Navigation labels, action buttons, and reorder mode;
- Outpost Details system/body/biome controls and Solar/Wind quality controls;
- Resource Matrix headings, compact flags, buttons, and tooltips;
- Planned Supply headings, groups, and accessible item controls;
- Cargo Link full/inter-system terms, destinations, summaries, and export rows;
- Search placeholder, flags, result descriptions, and drag instructions;
- Validation filters, counts, contexts, long diagnostics, and remediation;
- Help/Keyboard Shortcuts and accessible chord descriptions;
- About and attribution copy;
- import/export/status and fatal-reference messages.

Use the established manual matrix:

```text
1366 px desktop
1600 px desktop
200% browser zoom/reflow
keyboard-only
Windows Narrator
typography/font fallback
import/export
repeated locale switching
```

Language-specific accessibility concerns are correct `document.lang`, Narrator
pronunciation, diacritics/punctuation, and accessible names whose Polish syntax
must remain clear without visual context. Avoid accessible descriptions that
depend on declining an opaque inserted name.

Do not change geometry or CSS during onboarding. Record clipping, wrapping,
occlusion, excessive header growth, or inaccessible focus as separate UI work.
Do not reopen the global Narrator shortcut-interception and chord-announcement
items already recorded in the backlog unless Polish reveals a distinct defect.

## 22. Bundle impact

Expected static source growth is approximately:

| Artifact | Estimated UTF-8 source size |
|---|---:|
| Complete 414-key Polish semantic catalogue | about 31-35 KB, based on current full Latin catalogues |
| Serialized 3,561-name Polish overlay | 122,766 bytes measured in memory |
| Registry, speech, constraints, tests, and sidecar code/data | small relative increment |
| **Runtime-bearing source subtotal** | about 154-158 KB before minification/compression |

The current local built JavaScript asset is about 1.22 MB before Polish, but it
was inspected rather than rebuilt for this audit. Production delta must be
measured during implementation. Static map lookup remains simple, and no
startup or runtime problem is evidenced.

Do not add lazy loading. Preserve the planned dedicated bundle/startup review
after Simplified Chinese completes. Pull that work forward only if the Polish
production build or runtime profiling demonstrates a concrete regression.

## 23. Automated test plan

Prefer shared locale tables and parameterized assertions. Minimum durable
Polish expansion:

- metadata resolves `pl-PL` / `pl`, strict UTF-8, full role, staged/runtime
  availability, and deterministic artifact names;
- strict UTF-8 fixture decoding succeeds and malformed UTF-8/unknown locale
  fails without encoding guesses;
- official terminology has all 37 rows, 33 textual values, four intended
  absences, deterministic evidence order, and approved recommended defaults;
- glossary constraints cover the intended keys/contexts and stale constraints
  fail closed;
- the full semantic catalogue has exact 414-key, placeholder, plural,
  protected-token, non-empty, and accidental-English parity;
- the four plural keys render acceptable output for representative `1`, `2`,
  `5`, `12`, `22`, and `25` counts;
- review CSV and XLIFF round-trip deterministically by stable key and reject
  wrong locale, stale source/hash, missing/duplicate/unknown keys, invalid
  placeholders, protected tokens, and plural structure;
- adjudication requires a non-default decision and substantive rationale;
- final catalogue generation exactly matches approved review rows;
- overlay closure is 3,561 entities and 4,818 qualified rows with sidecar hash,
  kind, terminology, and resource reconciliation checks;
- fauna predictions close at 922 entities/2,179 components, cover all three
  shapes, reject stale evidence, and forbid acceptance with contradictions;
- browser mapping covers positive `pl`, `pl-PL`, descendant cases and negative
  `pl-UA`/`pl-LT` cases, including later-preference continuation;
- preference persistence, invalid override fallback, runtime switching, and
  `document.lang` include Polish without touching gameplay data/history;
- search tests cover every Polish letter, exact-before-folded ranking,
  `ł -> l`, `ź`/`ż -> z`, canonical English aliases, collision behavior, and
  one stable result per entity;
- collation tests cover `a/ą`, `c/ć`, `l/ł`, `n/ń`, `o/ó`, `s/ś`,
  `z/ź/ż`, numeric sorting, and stable-ID fallback on actual consumers;
- shortcut tests cover Polish modifiers, connector, and all four arrows;
- number, decimal, percent, and list formatters exercise `pl-PL`;
- production build explicitly verifies the Polish overlay;
- locale closure reports terminology, unchanged provenance, and overlay
  success for Polish.

Runtime-switch tests should confirm that collection JSON, stable IDs,
selected-outpost behavior, browser persistence, and Undo/Redo snapshots do not
change when the presentation locale changes.

## 24. Recommended implementation sequence

1. **Locale contracts and tooling extension.** Add staged metadata with
   `runtimeAvailable: false`, extend artifact/test routing, create a Polish
   accidental-English policy, and add plural-rendering contract tests. Do not
   expose the locale.
2. **Official terminology and Polish glossary.** Resolve the 37-row values
   artifact, approve recommended defaults and contextual variants, then add
   locale-keyed review constraints.
3. **Semantic draft and one XLIFF handoff.** Produce the independent complete
   draft, review CSV, and one Polish XLIFF after sources/constraints are frozen.
4. **DeepL import, neutral adjudication, and final catalogue.** Validate the
   handoff, adjudicate every row with particular attention to placeholders and
   the four plural messages, then generate the complete catalogue.
5. **Official reference overlay and fauna evidence.** Generate/verify the
   3,561-name module and sidecar from unchanged provenance, create prediction
   support, and record opportunistic evidence without target hunting.
6. **Runtime integration.** Add typed runtime registration, reference overlay,
   browser policy, Polish search fold, shared collation coverage, selector
   label, and shortcut speech; set `runtimeAvailable: true` only here.
7. **Layout, accessibility, and release closure.** Run automated closure and
   build checks, the manual matrix, bundle measurement, and documentation
   updates. Record geometry defects separately.

Stages 1 and the reusable test extension can be one bounded implementation
batch. Terminology approval should remain separate from bulk translation, and
runtime activation must remain separate from artifact generation. Do not
collapse stages merely to reduce the number of briefs.

## 25. Complexity estimate

These are planning ranges, not deadlines:

| Work area | Engineering | Editorial/translation | Other |
|---|---:|---:|---|
| Locale contracts/tooling/tests | 1-2 person-days | 0.5 day terminology consultation | Targeted checks |
| Terminology values and glossary | 1-2 days | 1-2 days | Evidence/default review |
| Draft, DeepL comparison, adjudication | 1-2 days | 3-5 days | One user-mediated DeepL document turnaround |
| Overlay and fauna support | 1-2 days | 0.5-1 day evidence review | Screenshot elapsed time indeterminate |
| Runtime/search/collation/speech | 1-2 days | 0.5-1 day language review | Focused functional checks |
| Manual/release closure | 1-3 days | 0.5-1 day corrections | 2-4 manual-QA person-days |

Overall planning range: approximately 6-10 engineering person-days, 5-9
editorial/translation person-days, one DeepL handoff/return cycle, and 2-4
manual-QA person-days. Opportunistic fauna screenshot collection is not a
deadline and must not become a target hunt.

The largest quality uncertainty is whether all placeholder-heavy and plural
messages can be made both natural and compact without inflecting opaque values.
The largest elapsed-time uncertainty is opportunistic fauna evidence.

## 26. Stop conditions

Pause before runtime activation if any of the following is evidenced:

- a current Polish plural key cannot be rendered naturally with the narrow
  `one / other` contract and count-neutral wording;
- placeholder-safe wording cannot avoid materially incorrect case, gender, or
  agreement for a required high-risk message;
- glossary variants become too broad for the current constraint model to give
  meaningful review guidance;
- official terminology rows or overlay rows no longer close exactly;
- `ł -> l` plus decomposition folding produces an unresolved real collision or
  requires broader transliteration behavior;
- Polish collation is inadequate in an actual consumer despite the successful
  ICU diagnostic;
- first-party fauna evidence contradicts prefix/species/diet order, component
  immutability, or U+0020 assembly;
- required Polish glyphs fall back incorrectly or fail in supported UI roles;
- layout/accessibility QA finds a release blocker that cannot be resolved
  without a separately approved geometry task;
- a hidden locale enumeration causes cross-locale build/review behavior that
  cannot be fixed by ordinary table/registry extension.

None of these conditions was found in this audit. They are gates, not current
blockers.

## 27. Transferable lessons for Simplified Chinese

Transfer these Polish findings:

- reuse stable IDs, unchanged qualified provenance, deterministic overlays,
  sidecars, terminology separation, evidence records, neutral adjudication,
  stale-source/constraint checks, and parameterized locale closure;
- inspect actual catalogue placeholders and formatter needs before expanding
  architecture;
- keep exact localized matches ahead of convenience aliases;
- treat runtime activation as a final step after artifact and QA closure;
- use opportunistic first-party fauna evidence and reopen only the affected
  locale rule when contradicted.

Do not transfer:

- Latin NFD folding or `ł -> l`;
- the Latin/Polish font-stack conclusion;
- Polish case, gender, number, aspect, or count-neutral wording strategies;
- Polish word-boundary, apostrophe, or hyphen observations;
- the conservative `pl` regional browser policy;
- Polish fauna component behavior or evidence results;
- Polish collation expectations.

Simplified Chinese still needs independent token/encoding confirmation,
script-specific typography and line breaking, punctuation/search/collation
evidence, shortcut speech, grammar review, and fauna composition proof.

## 28. Explicit user decisions and blockers before implementation

There is no blocker to beginning the locale-contract/tooling stage under a
separate implementation brief.

Decisions/acceptance gates before runtime release are:

1. approve the Polish glossary, official recommended defaults, and contextual
   variants—especially Planetary Body, Star System, Starfield branding,
   X-Tech inflection, and tracker-owned matrix terms;
2. approve count-neutral final wording for all four plural keys, or explicitly
   authorize a separate richer-plural design if natural Polish cannot be
   achieved;
3. complete one user-mediated DeepL XLIFF handoff and neutral row-by-row
   adjudication;
4. accept the conservative browser policy, or explicitly choose broader
   `pl-*` fallback;
5. obtain non-contradictory opportunistic first-party fauna evidence sufficient
   for provisional acceptance;
6. review any material layout/accessibility defect separately rather than
   silently changing frozen geometry.

No implementation, locale metadata, Polish catalogue, terminology values,
glossary, overlay, runtime registry, browser mapping, search code, shortcut
speech, CSS, persistence, or schema was changed by this audit.

## Audit diagnostics

Read-only diagnostics performed:

- inspected current localization policy, architecture, domain, UX, backlog,
  prior onboarding audits, completed locale artifacts, tooling, runtime files,
  and tests;
- inspected the installed-language inventory output and its extraction logic;
- materialized the Polish overlay in memory from unchanged provenance and
  installed official tables;
- resolved all terminology evidence values in memory;
- measured corpus characters, punctuation, search-fold collisions, and
  serialized overlay size;
- exercised `Intl` locale canonicalization, number/list/plural formatting, and
  Polish collation;
- verified current DeepL Polish/XLIFF readiness against official documentation.

The ignored diagnostic lives under:

```text
.local-work/localization/pl-PL-audit/inspect-polish.mjs
```

It writes no Bethesda corpus or committed output.

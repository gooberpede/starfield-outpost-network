# Official Bethesda Terminology for Semantic Localization Audit

## Executive outcome

**Outcome B — mixed evidence.** All **114 / 114** messages originally marked
`DEFER_BETHESDA` have been reconciled below against the current English source
and current Japanese catalogue. The recurring deferred population resolves to
**17 terminology clusters**:

- **15 reusable clusters** have official Bethesda evidence: **11** have a
  standalone qualified string identity and **4** rely on contextual or
  multiple-usage evidence.
- **2 clusters** remain tracker-owned/manual: `Cargo Pad` and
  `X-Tech Power Core`. Neither English phrase occurs in the English tables of
  the three authoritative plugins, so neither may be presented as an official
  Bethesda term.
- `Moon` and `Orbital` were also inspected as required, but occur in **zero** of
  the 114 deferred messages and are therefore supplementary rather than counted
  among the 17 reconciled clusters.

The current catalogue is substantially aligned: `拠点`, `貨物リンク`, `星系間`,
`惑星`, `星系`, and four of five skill fallbacks agree with official evidence.
Changes are nevertheless warranted in the later implementation pass:
`Starfield` should become `スターフィールド`; hard-coded `X-Tech` should resolve
as `X-テック`; the semantic fallback for `Outpost Engineering` should become
`拠点エンジニアリング`; the unsupported phrase `X-Tech Power Cores` should be
removed in favour of tracker-owned “X-Tech extraction capability” wording; and
the generic `Biomes` UI label should use the exact official `生態系`. The other
biome sentences need contextual editorial review rather than blind replacement.

No catalogue, generated reference-name artifact, runtime code, persistence,
history, schema, or UI file was changed by this audit.

## Scope and evidence

The exact deferred key set comes from the ignored diagnostic
`.local-work/translation/jp/ja-JP-adjudication.csv` (`Decision=DEFER_BETHESDA`).
Current English and Japanese text comes from the tracked
`docs/localization/ja-JP-review-source.csv`. The ignored file is not the durable
contract: the complete reconciliation is preserved in this report.

Official evidence was read only from paired English/Japanese localized string
tables for:

- `Starfield.esm`
- `ShatteredSpace.esm`
- `SFBGS00D.esm`

The tables were extracted from the explicitly manifested official archives
recorded in `.local-work/localization/inputs/manifest.json`. English was decoded
as Windows-1252 and Japanese as UTF-8 through the repository string-table
reader. No Creation, mod, wiki, unofficial translation, fuzzy match, or machine
translation was used as authority. Existing committed qualified provenance in
`reference-source/localized-name-provenance.csv` was reused for the five skills
and X-Tech.

The diagnostic scripts are ignored at
`.local-work/localization/terminology-audit/`. They read the paired
`strings`, `dlstrings`, and `ilstrings` inputs for the three supported plugins
and do not write or dump Bethesda tables.

## Terminology summary

`SourceIdentity` is `plugin/table/string ID` unless a record-qualified identity
is already committed. A single representative qualified identity is shown when
several identical standalone strings exist; the evidence ledger records
important variants.

| TermId | CanonicalEnglish | EvidenceKind | OfficialEnglish | OfficialJapanese | SourceIdentity | CurrentJapanese | Assessment | RecommendedAction |
|---|---|---|---|---|---|---|---|---|
| `term.outpost` | Outpost | standalone | Outpost | 拠点 | `Starfield.esm/strings/00006F11` | 拠点 | MATCH | Keep `拠点`; compounds retain locale-owned grammar. |
| `term.cargo-link` | Cargo Link | standalone | Cargo Link | 貨物リンク | `Starfield.esm/strings/00004B8C` | 貨物リンク | MATCH | Keep and register the official term. |
| `term.cargo-pad` | Cargo Pad | none/tracker-owned | — | — | no match in authoritative English tables | 貨物パッド | ACCEPTABLE_VARIANT | Keep provisionally as tracker terminology; obtain Japanese editorial review if desired. |
| `term.inter-system-cargo-link` | Inter-System Cargo Link | standalone | Inter-System Cargo Link | 星系間貨物リンク | `Starfield.esm/strings/00008124` | 星系間貨物リンク | MATCH | Use the official full label; align English tracker copy from “interstellar” where it denotes this object. |
| `term.inter-system` | Inter-System | contextual/multiple | Cargo Link - Inter-System | 貨物リンク - インターシステム | `Starfield.esm/strings/00002994` | 星系間 | CONTEXT_DEPENDENT | Preserve both variants; prefer `星系間` for the tracker modifier because the full official label uses it. |
| `term.biome` | Biome | standalone/multiple | Biomes: | 生態系： | `Starfield.esm/strings/00008493` | バイオーム | CONTEXT_DEPENDENT | Change the generic UI label to `生態系`; editorially adjudicate sentences among `生態系`, `環境`, and rare `バイオーム`. |
| `term.planet` | Planet | contextual | Start an Outpost on a Planet | 任意の惑星で拠点を作る | `Starfield.esm/strings/0002DF4B` | 惑星 | MATCH | Keep `惑星`. |
| `term.planetary-body` | Planetary Body | contextual/multiple | planetary bodies | 惑星体 | `Starfield.esm/ilstrings/0001B852` | 天体 | ACCEPTABLE_VARIANT | Keep tracker `天体` for the inclusive planet/moon/orbital abstraction; store official variants as context evidence, not a forced default. |
| `term.star-system` | Star System | contextual | Target System | ターゲット星系 | `Starfield.esm/strings/0002DB8D` | 星系 | MATCH | Keep `星系`; do not reuse unrelated standalone `System` → `システム`. |
| `skill.outpost-management` | Outpost Management | standalone | Outpost Management | 拠点管理 | `Starfield.esm/PERK:0023826F/topLevel.FULL/strings:00009ECC` | 拠点管理 | MATCH | Continue resolving through `official-term`. |
| `skill.outpost-engineering` | Outpost Engineering | standalone | Outpost Engineering | 拠点エンジニアリング | `Starfield.esm/PERK:002C59E0/topLevel.FULL/strings:00009B6B` | 拠点工学 | SHOULD_CHANGE | Correct the semantic fallback to `拠点エンジニアリング`; runtime official lookup is already correct. |
| `skill.planetary-habitation` | Planetary Habitation | standalone | Planetary Habitation | 惑星居住 | `Starfield.esm/PERK:0027CBC2/topLevel.FULL/strings:00009DD9` | 惑星居住 | MATCH | Continue resolving through `official-term`. |
| `skill.research-methods` | Research Methods | standalone | Research Methods | 研究手法 | `Starfield.esm/PERK:002C555C/topLevel.FULL/strings:00009C96` | 研究手法 | MATCH | Continue resolving through `official-term`. |
| `skill.special-projects` | Special Projects | standalone | Special Projects | 特別プロジェクト | `Starfield.esm/PERK:0004CE2D/topLevel.FULL/strings:00030F39` | 特別プロジェクト | MATCH | Continue resolving through `official-term`. |
| `term.x-tech` | X-Tech | standalone | X-Tech | X-テック | `SFBGS00D.esm/IRES:01033E3F/topLevel.FULL/strings:00000FC7` | X-Tech | SHOULD_CHANGE | Parameterize fixed semantic uses with the existing `resource:x-tech` display name. |
| `term.x-tech-power-core` | X-Tech Power Core | none/tracker-owned | — | — | no singular/plural match in authoritative English tables | X-Tech Power Cores | SHOULD_CHANGE | Remove this unsupported phrase; describe the tracker capability as “X-Tech extraction capability.” |
| `term.starfield` | Starfield | standalone | Starfield | スターフィールド | `Starfield.esm/strings/00033D2B` | Starfield | SHOULD_CHANGE | Use `スターフィールド` in Japanese semantic copy. |

## Qualified evidence ledger

Record fields are populated only where the repository already has verified
record provenance. String-table-only UI/context evidence deliberately leaves
record fields null rather than guessing a record owner.

| TermId | EvidenceKind | SourcePlugin | RecordSignature | RecordFormID | FieldPath | NameSourcePlugin | StringTable | StringID | OfficialEnglish | OfficialJapanese | Context | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `term.outpost` | standalone | Starfield.esm | — | — | — | Starfield.esm | strings | `00006F11` | Outpost | 拠点 | Exact standalone label; several additional standalone IDs agree. | HIGH |
| `term.cargo-link` | standalone | Starfield.esm | — | — | — | Starfield.esm | strings | `00004B8C` | Cargo Link | 貨物リンク | Exact standalone label; IDs `00004B8D`, `00005A7C`, and `0000A1D2` also agree. | HIGH |
| `term.cargo-pad` | none | — | — | — | — | — | — | — | — | — | No English “Cargo Pad(s)” occurrence in any paired authoritative table. Tracker abstraction for one endpoint of a cargo link. | HIGH absence result |
| `term.inter-system-cargo-link` | standalone | Starfield.esm | — | — | — | Starfield.esm | strings | `00008124` | Inter-System Cargo Link | 星系間貨物リンク | Exact full build/menu label. | HIGH |
| `term.inter-system` | contextual | Starfield.esm | — | — | — | Starfield.esm | strings | `00002994` | Cargo Link - Inter-System | 貨物リンク - インターシステム | Extracted modifier is context-bound; another identical source is `00004B8B`. | HIGH context |
| `term.biome` | standalone | Starfield.esm | — | — | — | Starfield.esm | strings | `00008493` | Biomes: | 生態系： | Exact plural UI label with punctuation. | HIGH |
| `term.biome` | contextual | Starfield.esm | — | — | — | Starfield.esm | ilstrings | `00018D4D` | What a fascinating biome... | 興味深い生態系だね… | Narrative evidence for `生態系`. | HIGH context |
| `term.biome` | contextual | Starfield.esm | — | — | — | Starfield.esm | ilstrings | `000143A6` | ...from many biomes. | ...さまざまなバイオームから... | Official loanword variant. | MEDIUM context |
| `term.biome` | contextual | ShatteredSpace.esm | — | — | — | ShatteredSpace.esm | ilstrings | `000003DC` | Organic materials will be abundant in a biome like this. | こういう環境は有機物が豊富に存在するの | Official omission/`環境` variant. | HIGH context |
| `term.planet` | contextual | Starfield.esm | — | — | — | Starfield.esm | strings | `0002DF4B` | Start an Outpost on a Planet | 任意の惑星で拠点を作る | Exact outpost-domain usage. | HIGH |
| `term.planetary-body` | contextual | Starfield.esm | — | — | — | Starfield.esm | ilstrings | `0001B852` | ...asteroids and planetary bodies... | ...小惑星と惑星体... | Exact phrase, but `惑星体` may not cover tracker orbitals naturally. | HIGH context |
| `term.planetary-body` | contextual | Starfield.esm | — | — | — | Starfield.esm | ilstrings | `00018BAB` | celestial bodies | 天体 | Broader astronomical context supporting the tracker’s inclusive abstraction. | HIGH context |
| `term.star-system` | contextual | Starfield.esm | — | — | — | Starfield.esm | strings | `0002DB8D` | Target System | ターゲット星系 | Mission/location context unambiguously denotes a star system. | HIGH |
| `term.star-system` | contextual | Starfield.esm | — | — | — | Starfield.esm | ilstrings | `00005284` | ...the name of the star system. | ...星系の名前だ | Full phrase corroboration. | HIGH |
| `skill.outpost-management` | standalone | Starfield.esm | PERK | `0023826F` | `topLevel.FULL` | Starfield.esm | strings | `00009ECC` | Outpost Management | 拠点管理 | Committed qualified skill provenance. | HIGH |
| `skill.outpost-engineering` | standalone | Starfield.esm | PERK | `002C59E0` | `topLevel.FULL` | Starfield.esm | strings | `00009B6B` | Outpost Engineering | 拠点エンジニアリング | Committed qualified skill provenance. | HIGH |
| `skill.planetary-habitation` | standalone | Starfield.esm | PERK | `0027CBC2` | `topLevel.FULL` | Starfield.esm | strings | `00009DD9` | Planetary Habitation | 惑星居住 | Committed qualified skill provenance. | HIGH |
| `skill.research-methods` | standalone | Starfield.esm | PERK | `002C555C` | `topLevel.FULL` | Starfield.esm | strings | `00009C96` | Research Methods | 研究手法 | Committed qualified skill provenance. | HIGH |
| `skill.special-projects` | standalone | Starfield.esm | PERK | `0004CE2D` | `topLevel.FULL` | Starfield.esm | strings | `00030F39` | Special Projects | 特別プロジェクト | Committed qualified skill provenance. | HIGH |
| `term.x-tech` | standalone | SFBGS00D.esm | IRES | `01033E3F` | `topLevel.FULL` | SFBGS00D.esm | strings | `00000FC7` | X-Tech | X-テック | Canonical resource identity; standalone table IDs `00000FC7` and `00001456` agree. | HIGH |
| `term.x-tech-power-core` | none | — | — | — | — | — | — | — | — | — | No singular/plural phrase in authoritative tables; not a canonical resource or identified gameplay label. | HIGH absence result |
| `term.starfield` | standalone | Starfield.esm | — | — | — | Starfield.esm | strings | `00033D2B` | Starfield | スターフィールド | Exact standalone product title. | HIGH |
| `term.moon` | contextual | Starfield.esm | — | — | — | Starfield.esm | ilstrings | `0001EB68` | this ... moon | この衛星 | Generic astronomical satellite; `月` is used for Earth’s Moon. No deferred row uses the generic type. | HIGH context |
| `term.orbital` | contextual | Starfield.esm | — | — | — | Starfield.esm | ilstrings | `00000F76` | Entering orbital pattern. | 軌道パターンに進入する | Adjectival orbital usage only; no reliable standalone noun corresponding to the tracker body type was found. | MEDIUM context |

The decimal diagnostic IDs were normalized to the repository’s eight-digit
hexadecimal string-ID convention. For context excerpts, ellipses above are
report abbreviations, not claims of verbatim standalone source strings.

## Multiple official usages and adjudication

### Outpost family

Generic `Outpost` has multiple exact standalone labels and consistently resolves
to `拠点`. That agrees with the tracker. `Outpost Management` and
`Outpost Engineering` remain distinct PERK names with their own qualified
identities. Tracker compounds such as “outpost network,” “outpost navigation,”
and “outpost extraction” own their sentence grammar and should not be treated as
additional Bethesda identities.

### Cargo family

Bethesda’s label family is internally clear for the objects it actually names:

- `Cargo Link` → `貨物リンク`
- `Inter-System Cargo Link` → `星系間貨物リンク`
- `Cargo Link - Inter-System` → `貨物リンク - インターシステム`

This is genuine context variation: the modifier is transliterated in one
hyphenated UI string but translated semantically in the full build/menu label.
The tracker should store both evidence rows and use `星系間` for its compact
modifier because that aligns with the full official object name and reads
naturally in tracker compounds.

No official English string calls one endpoint a `Cargo Pad`. The tracker’s
persisted `CargoPad` concept is a useful application abstraction, but
`貨物パッド` is tracker-owned Japanese, not a Bethesda-attested term. The
internal `[INT]`/`interstellar` boolean corresponds functionally to choosing an
inter-system-capable link endpoint, but `[INT]` is tracker shorthand and
“Interstellar cargo link” should not be presented as Bethesda’s exact English
label. The later pass should prefer `Inter-System Cargo Link` where it means the
official construct, without changing the domain model.

### Biome and world structure

Bethesda uses at least `生態系`, `環境`, and `バイオーム` for English `biome`
depending on UI and sentence context. The exact `Biomes:` UI label is `生態系：`,
so `outpost.biomes.label` should become `生態系`. `生態系` is the strongest
default for generic tracker UI, but the remaining eight deferred biome
sentences require Japanese editorial review because particles, plurality,
omission, and whether the sentence means an ecosystem or the local environment
affect the natural choice.

`Planet` → `惑星` and astronomical `star system` → `星系` are well
corroborated. Standalone English `System` → `システム` also exists, but that
identity is unrelated to the tracker’s location selector; it must not override
the astronomical context.

`Planetary Body` has no single safe tracker substitution. Bethesda uses
`惑星体` for the exact phrase, while `天体` appears for “celestial bodies” and
is semantically better for the tracker’s union of planets, moons, and orbitals.
The current `天体` is therefore an acceptable tracker-owned abstraction
supported by context, not a claimed exact translation of one canonical label.

For `Moon`, official Japanese varies between `衛星` for a satellite and `月`
for Earth’s Moon or context-specific prose. `Orbital` evidence is adjectival
(`軌道...`); no authoritative standalone noun matching the tracker’s internal
body type was found. Neither term occurs in the deferred 114.

### X-Tech and Starfield

`X-Tech` is already a record-qualified resource and is officially `X-テック`.
A few official contexts omit the hyphen, but both standalone strings and the
committed resource overlay use the hyphenated form; that is the reusable
default.

`X-Tech Power Core(s)` occurs nowhere in the supported official English tables.
Repository domain documentation describes a boolean X-Tech extraction
capability, not a power-core inventory. The later implementation should replace
the tooltip concept rather than translate the unsupported phrase, for example:

- English: `Add {resource} as present. It can be extracted at any outpost once X-Tech extraction is available.`
- Japanese: `{resource}を存在する資源として追加します。X-テックを抽出できるようになると、どの拠点でも抽出できます。`

The exact Japanese can receive editorial polishing, and the resolved
`{resource}` should be reused if the sentence is restructured. No fake term ID
or Bethesda source should be created for “Power Core.”

The exact standalone product title is `スターフィールド`. Keeping `Starfield`
in Latin script is not aligned with the official Japanese asset, so both
deferred messages that contain it should change.

## Current Japanese change set for the later pass

The evidence supports these definite changes:

1. `about.description`: use `スターフィールド`.
2. `validation.outpostNameLength`: use `スターフィールド`.
3. `character.skill.outpostEngineering`: change the semantic fallback from
   `拠点工学` to `拠点エンジニアリング`.
4. `validation.xTechCapabilityPresent`,
   `validation.xTechCapabilityProduced`, and
   `validation.xTechRequiresPresence`: replace hard-coded `X-Tech` with a
   resolved `resource:x-tech` parameter so Japanese displays `X-テック`.
5. `matrix.tooltip.xTech.add`: remove `X-Tech Power Cores` and describe the
   tracker’s extraction capability.
6. `outpost.biomes.label`: change `バイオーム` to `生態系`.

The other eight deferred biome rows are `CONTEXT_DEPENDENT`; assess their full
sentence rather than performing a global substring replacement. `Cargo Pad`
rows remain acceptable tracker-owned wording but should be explicitly recorded
as such. No current `拠点`, `貨物リンク`, `星系間貨物リンク`, `惑星`, `星系`,
`天体`, or four matching skill forms need change solely for terminology.

Official lexical evidence guides word choice; it does not own tracker-authored
sentence grammar. Japanese may add particles, inflect, compound, omit, or
reorder a term. The registry is provenance, not a templating engine.

## Durable terminology registry design

Add `reference-source/official-terminology-provenance.csv` in the later
implementation pass. Use one row per evidence occurrence, allowing repeated
`TermId` values for one-to-many/context variants. Recommended columns are:

```text
EvidenceId
TermId
CanonicalEnglish
EvidenceKind
SourcePlugin
RecordSignature
RecordFormID
FieldPath
NameSourcePlugin
StringTable
StringID
OfficialEnglish
OfficialJapanese
Context
ContextNotes
Confidence
RecommendedDefaultForJaJP
Notes
```

`EvidenceId` should be a stable functional identifier such as
`term.biome.ui-label` or `term.biome.dialogue-loanword`, while `TermId` remains
the reusable concept (`term.biome`). Nullable record fields are correct for
string-table-only evidence. Absence decisions should also be tracked explicitly
with `EvidenceKind=none` and notes describing the searched authoritative
universe; this prevents later developers from silently inventing a source.

Do not place several source identities in one cell. Do not put the ignored game
tables or a Bethesda string dump in Git. A verifier should enforce unique
`EvidenceId`, allowed plugins/table types/evidence kinds, eight-digit uppercase
hex IDs, complete paired text where a source exists, and permitted null fields
for contextual/absence rows.

## Future-language reuse

| TermId | StableStringIdentity? | ContextRequired? | FutureLocaleCanResolveDirectly? | EditorialReviewStillNeeded? |
|---|---|---|---|---|
| `term.outpost` | Yes | No | Yes | Sentence grammar only |
| `term.cargo-link` | Yes | No | Yes | Sentence grammar only |
| `term.cargo-pad` | No | Yes, tracker context | No | Yes |
| `term.inter-system-cargo-link` | Yes | No | Yes | Sentence grammar only |
| `term.inter-system` | Yes, contextual identity | Yes | Yes, then inspect extraction | Yes |
| `term.biome` | Yes, multiple identities | Yes | Yes, then choose usage | Yes |
| `term.planet` | Yes, contextual identity | Yes | Yes, then inspect extraction | Yes |
| `term.planetary-body` | Yes, contextual identities | Yes | Yes, then choose abstraction | Yes |
| `term.star-system` | Yes, contextual identity | Yes | Yes, then inspect extraction | Low |
| five `skill.*` terms | Yes | No | Yes | Sentence grammar only |
| `term.x-tech` | Yes | No | Yes | Sentence grammar only |
| `term.x-tech-power-core` | No | Yes, tracker concept | No | Yes; preferably remove |
| `term.starfield` | Yes | No | Yes | Normally no |
| `term.moon` | Yes, contextual identity | Yes | Yes, then choose usage | Yes |
| `term.orbital` | Yes, contextual identity | Yes | Yes, but not as a standalone noun | Yes |

For stable standalone identities, onboarding another locale is the same
`TermId` plus the same qualified Bethesda string identity resolved from that
locale’s manifested table. Contextual evidence reuses the exact same context
and string ID, then requires a language editor to inspect whether the localized
substring is independently reusable. Tracker-owned terms remain language-owned
and cannot be upgraded to official merely because an editor chooses a good
translation.

## Semantic parameterization

Parameterize only where it prevents duplication of a canonical identity without
making Japanese grammar brittle:

- Continue routing the five skill names through the existing `official-term`
  lookup. The two validation sentences already accept `{skill}` and should stay
  that way.
- Change the three fixed X-Tech validation messages to accept a resolved
  resource-name parameter.
- Rewrite `matrix.tooltip.xTech.add` around the already resolved `{resource}`
  and remove the invented Power Core phrase. A second occurrence may reuse the
  parameter only if the final Japanese sentence remains natural.

Do not parameterize every occurrence of `Outpost`, `Cargo Link`, `Biome`,
`Planet`, or `Star System`. These are lexical decisions inside locale-owned
sentences; universal token substitution would complicate particles,
compounding, omission, and reordering. Catalogue edits plus provenance
verification are the smaller and safer design.

For future About, hints, help, and tooltips, the rule is:

```text
new tracker-authored text
  -> semantic localization key
  -> consult official terminology provenance where relevant
  -> locale-owned sentence grammar
```

No new user-facing text should hard-code English game terminology in a
component.

## Deferred-message reconciliation

The table uses the current tracked English/Japanese text, while membership is
the exact historical 114-key deferred set. A row may list multiple terms; its
`TerminologyCluster` is the primary adjudication cluster.


| MessageKey | English source text | Current Japanese text | Deferred terminology | Terminology cluster | Coverage status | Recommended disposition |
|---|---|---|---|---|---|---|
| about.description | A tracking tool for Starfield outpost networks. | Starfieldの拠点ネットワークを記録・管理するツールです。 | Starfield; Outpost | Starfield | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| cargo.add | Add cargo pad | 貨物パッドを追加 | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.addButton | + Add Cargo Pad | ＋ 貨物パッドを追加 | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.addWithLimit | Add cargo pad ({count} of {limit}) | 貨物パッドを追加（{count}/{limit}） | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.destination.noPads | {outpost} — no cargo pads | {outpost} — 貨物パッドなし | Cargo Pad; Outpost | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.destination.outpost | Destination outpost | 搬送先の拠点 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| cargo.destination.pad | Destination cargo pad | 搬送先の貨物パッド | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.destination.selectPad | Select cargo pad... | 貨物パッドを選択... | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.destination.unknownPad | Unknown cargo pad | 不明な貨物パッド | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.destination.unknownPadInline | unknown cargo pad | 不明な貨物パッド | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.finishReshuffle | Finish reshuffling cargo pads | 貨物パッドの並べ替えを完了 | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.heading | Cargo Pads | 貨物パッド | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.interSystem.button | Inter-System | 星系間 | Inter-System | Inter-System | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| cargo.interSystem.context | Inter-System cargo pads | 星系間貨物パッド | Inter-System; Cargo Pad | Inter-System | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| cargo.interstellar | Interstellar cargo link | 星系間貨物リンク | Inter-System Cargo Link; Cargo Link | Inter-System Cargo Link | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| cargo.reshuffle | Reshuffle cargo pads | 貨物パッドを並べ替え | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| character.skill.outpostEngineering | Outpost Engineering | 拠点工学 | Outpost Engineering | Outpost Engineering | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |
| character.skill.outpostManagement | Outpost Management | 拠点管理 | Outpost Management | Outpost Management | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |
| character.skill.planetaryHabitation | Planetary Habitation | 惑星居住 | Planetary Habitation | Planetary Habitation | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |
| character.skill.researchMethods | Research Methods | 研究手法 | Research Methods | Research Methods | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |
| character.skill.specialProjects | Special Projects | 特別プロジェクト | Special Projects | Special Projects | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |
| help.biomes | Selected biomes limit resource availability to resources that can occur in those biomes. | 選択したバイオームにより、利用可能な資源はそのバイオームに存在し得るものに限定されます。 | Biome | Biome | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| help.inorganicPresentPossible | {resource} may be present at this outpost. | {resource}はこの拠点に存在する可能性があります。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| help.inorganicPresentRecorded | {resource} is recorded as present at this outpost. | {resource}はこの拠点に存在すると記録されています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| help.interSystem | Inter-System cargo pads can link outposts in different star systems and require Helium-3. | 星系間貨物パッドは別の星系の拠点と接続でき、He-3を必要とします。 | Inter-System; Cargo Pad; Outpost; Star System | Inter-System | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| help.organic.availableBiomes | {resource} is available from a domesticable species in the selected biomes. | 選択したバイオームの飼育可能な生物種から{resource}を得られます。 | Biome | Biome | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| help.organic.availablePlanet | {resource} is available from a domesticable species on this planet. | この惑星の飼育可能な生物種から{resource}を得られます。 | Planet | Planet | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| help.organic.availableSelectedBiome | {resource} is available from a domesticable species in the selected biome. | 選択したバイオームの飼育可能な生物種から{resource}を得られます。 | Biome | Biome | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| help.organic.unavailableBiome | {resource} is not available from this domesticable species in the selected biome. | 選択したバイオームでは、この飼育可能な生物種から{resource}を得られません。 | Biome | Biome | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| help.organic.unavailableBiomes | {resource} is not available from this domesticable species in the selected biomes. | 選択したバイオームでは、この飼育可能な生物種から{resource}を得られません。 | Biome | Biome | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| help.organic.unavailablePlanet | {resource} is not available from this domesticable species on this planet. | この惑星では、この飼育可能な生物種から{resource}を得られません。 | Planet | Planet | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| help.present | Shows whether a resource can be present at this outpost. | この拠点に資源が存在し得るかを示します。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| help.producing | Shows whether this outpost is currently set to produce the resource or product. | この拠点が現在、その資源または製造品を生産する設定になっているかを示します。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| history.addBiome | Add biome selection for {outpost} | {outpost}にバイオーム選択を追加 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| history.addOutpost | Add outpost | 拠点を追加 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| history.changeBody | Change {outpost} body to {body} | {outpost}の天体を{body}に変更 | Outpost; Planetary Body | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| history.changeSystem | Change {outpost} system to {system} | {outpost}の星系を{system}に変更 | Outpost; Star System | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| history.clearBody | Clear body for {outpost} | {outpost}の天体を消去 | Outpost; Planetary Body | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| history.clearSystem | Clear system for {outpost} | {outpost}の星系を消去 | Outpost; Star System | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| history.deleteOutpost | Delete outpost {outpost} | 拠点{outpost}を削除 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| history.removeBiome | Remove biome selection for {outpost} | {outpost}のバイオーム選択を解除 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| history.renameOutpost | Rename outpost {previousName} to {name} | 拠点名を{previousName}から{name}に変更 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| matrix.tooltip.input.available | {item} is available at this outpost. | {item}はこの拠点で利用できます。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| matrix.tooltip.input.unavailable | {item} is not available at this outpost. | {item}はこの拠点で利用できません。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| matrix.tooltip.manufacturing.blocked | {item} is not being produced at this outpost due to missing inputs. | {item}は入力不足のため、この拠点で生産されていません。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| matrix.tooltip.producing.active | {item} is being produced at this outpost. | {item}はこの拠点で生産中です。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| matrix.tooltip.producing.inactive | {item} is not being produced at this outpost. | {item}はこの拠点で生産されていません。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| matrix.tooltip.xTech.add | Add {resource} as present. It can be extracted at any outpost if X-Tech Power Cores are available. | {resource}を存在する資源として追加します。X-Tech Power Coresが利用できれば、どの拠点でも抽出できます。 | X-Tech Power Core; Outpost | X-Tech Power Core | mixed: X-Tech official; Power Core phrase not found | TRACKER_OWNED_TRANSLATION |
| matrix.tooltip.xTech.present | {resource} has been explicitly recorded as present at this outpost. | {resource}はこの拠点に存在すると明示的に記録されています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.biomes.label | Biomes | バイオーム | Biome | Biome | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| outpost.body.label | Body | 天体 | Planetary Body | Planetary Body | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| outpost.body.select | Select body... | 天体を選択... | Planetary Body | Planetary Body | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| outpost.defaultName | New Outpost | 新しい拠点 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.delete | Delete Outpost | 拠点を削除 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.name.label | Outpost name | 拠点名 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.add | Add outpost | 拠点を追加 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.addButton | + Add Outpost | ＋ 拠点を追加 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.addWithLimit | Add outpost ({count} of {limit}) | 拠点を追加（{count}/{limit}） | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.finishReshuffle | Finish reshuffling outposts | 拠点の並べ替えを完了 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.heading | Outposts | 拠点 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.hide | Hide outpost navigation | 拠点ナビゲーションを非表示 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.reshuffle | Reshuffle outposts | 拠点を並べ替え | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.navigation.show | Show outpost navigation | 拠点ナビゲーションを表示 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| outpost.referenceData.empty | No resource reference data found for this body. | この天体の資源参照データがありません。 | Planetary Body | Planetary Body | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| outpost.system.label | System | 星系 | Star System | Star System | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| outpost.system.select | Select system... | 星系を選択... | Star System | Star System | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| search.input.label | Search for resources or products in your outposts. | 拠点の資源または製造品を検索します。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| search.results.found | {searchItem} was found at {count} {count, plural, one {outpost} other {outposts}}. | {searchItem}が{count}個の拠点で見つかりました。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| search.results.notFound | {searchItem} was not found at any outpost. | {searchItem}はどの拠点にも見つかりませんでした。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| status.import.invalidCargoPad | The selected file contains an invalid cargo pad. | 選択したファイルに無効な貨物パッドが含まれています。 | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| status.import.invalidNetwork | The selected file is not a valid outpost network. | 選択したファイルは有効な拠点ネットワークではありません。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| status.import.invalidOutpost | The selected file contains an invalid outpost. | 選択したファイルに無効な拠点が含まれています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| status.referenceData.loaded | Reference data loaded: {systems} systems, {bodies} bodies, {resources} resources, {products} products. | 参照データを読み込みました：星系{systems}件、天体{bodies}件、資源{resources}件、製造品{products}件。 | Planetary Body; Star System | Planetary Body | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.activeProductionInorganicInvalid | {resource} is marked as produced, but is not available for outpost extraction in {biomes}. | {resource}は生産中ですが、{biomes}では拠点で抽出できません。 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.activeProductionInorganicInvalidMany | {resource} is marked as produced, but is not available for outpost extraction in {biomes} biomes. | {resource}は生産中ですが、バイオーム{biomes}では拠点で抽出できません。 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.activeProductionInorganicInvalidOne | {resource} is marked as produced, but is not available for outpost extraction in {biomes} biome. | {resource}は生産中ですが、バイオーム{biomes}では拠点で抽出できません。 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.activeProductionOrganicInvalid | {resource} is marked as produced, but is not available for outpost harvesting in {biomes}. | {resource}は生産中ですが、{biomes}では拠点で採集できません。 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.activeProductionOrganicInvalidMany | {resource} is marked as produced, but is not available for outpost harvesting in {biomes} biomes. | {resource}は生産中ですが、バイオーム{biomes}では拠点で採集できません。 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.activeProductionOrganicInvalidOne | {resource} is marked as produced, but is not available for outpost harvesting in {biomes} biome. | {resource}は生産中ですが、バイオーム{biomes}では拠点で採集できません。 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.bodySystemMismatch | This outpost's selected planetary body does not belong to its selected star system. | この拠点で選択された天体は、選択された星系に属していません。 | Outpost; Planetary Body; Star System | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.cargoPadLinkedMultiple | This cargo pad is linked more than once. | この貨物パッドは複数回接続されています。 | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.cargoPadSkillLimit | This outpost has {count} cargo pads, but the current {skill} level allows a maximum of {limit}. | この拠点には貨物パッドが{count}個ありますが、現在の{skill}レベルでは最大{limit}個です。 | Cargo Pad; Outpost | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.duplicateActiveProduction | {item} appears more than once in this outpost's active production. | {item}がこの拠点の稼働中の生産に複数回含まれています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.duplicateBiome | {item} appears more than once in this outpost's biome selection. | {item}がこの拠点のバイオーム選択に複数回含まれています。 | Outpost; Biome | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.duplicateExplicitPresence | {item} appears more than once in this outpost's explicit resource presence. | {item}がこの拠点の明示的な資源存在記録に複数回含まれています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.duplicateLocalResource | {item} appears more than once in this outpost's local resources. | {item}がこの拠点の現地資源に複数回含まれています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.duplicateManufacturing | {item} appears more than once in this outpost's manufacturing list. | {item}がこの拠点の製造リストに複数回含まれています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.duplicateOutboundItem | {item} appears more than once in this cargo pad's outbound items. | {item}がこの貨物パッドの搬出項目に複数回含まれています。 | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.duplicateOutpostName | {count} outposts are named "{name}". Unique outpost names are recommended to avoid ambiguity. | {count}個の拠点が「{name}」という名前です。混乱を避けるため、拠点名は重複させないことを推奨します。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.duplicatePlannedSupply | {item} appears more than once in this outpost's Planned Supply. | {item}がこの拠点の供給予定に複数回含まれています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.interstellarHelium3 | This interstellar cargo pad is sending cargo, but its outpost has no available Helium-3 supply. | この星系間貨物パッドは貨物を発送していますが、拠点で利用できるHe-3の供給がありません。 | Cargo Pad; Outpost | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.manufacturingInputUnavailable | {product} requires {input}, but {input} is not available at this outpost. | {product}には{input}が必要ですが、この拠点では{input}を利用できません。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.missingCargoEndpoint | This cargo link refers to a missing outpost or cargo pad. | この貨物リンクが存在しない拠点または貨物パッドを参照しています。 | Cargo Link; Cargo Pad; Outpost | Cargo Link | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.organicInputUnavailable | {species} requires {input}, but {input} is not available at this outpost. | {species}には{input}が必要ですが、この拠点では{input}を利用できません。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.outpostBodyNotEligible | This outpost is located on a body that cannot host outposts. | この拠点は、拠点を建設できない天体にあります。 | Outpost; Planetary Body | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.outpostNameLength | Starfield normally limits outpost names to 25 characters; longer modded names remain supported. | Starfieldでは通常、拠点名は25文字までです。MODによる長い名前も引き続き使用できます。 | Starfield; Outpost | Starfield | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.outpostSkillLimit | This network has {count} outposts, but the current {skill} level allows a maximum of {limit}. | このネットワークには拠点が{count}個ありますが、現在の{skill}レベルでは最大{limit}個です。 | Planetary Habitation; Outpost | Planetary Habitation | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.planetaryHabitationRequirement | This outpost requires {skill} rank {required}, but the recorded character rank is {recorded}. | この拠点には{skill}ランク{required}が必要ですが、記録されたキャラクターのランクは{recorded}です。 | Planetary Habitation; Outpost | Planetary Habitation | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.regularPadCrossSystem | This regular cargo pad is linked to an outpost in another star system. | この通常の貨物パッドは別の星系の拠点に接続されています。 | Cargo Pad; Outpost; Star System | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.selectedBiomeInvalid | This selected biome belongs to a different planetary body. | 選択されたバイオームは別の天体に属しています。 | Biome; Planetary Body | Biome | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.selfLinkedCargoPad | This cargo link connects a cargo pad to itself. | この貨物リンクは同じ貨物パッドを両端に接続しています。 | Cargo Link; Cargo Pad | Cargo Link | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.unknownBiome | This outpost refers to unknown body-biome ID "{id}". | この拠点が不明な天体バイオームID「{id}」を参照しています。 | Outpost; Biome; Planetary Body | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.unknownBody | This outpost refers to unknown planetary body ID "{id}". | この拠点が不明な天体ID「{id}」を参照しています。 | Outpost; Planetary Body | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.unknownExplicitResource | This outpost refers to unknown resource ID "{id}" in its explicit resource presence. | この拠点の明示的な資源存在記録が不明な資源ID「{id}」を参照しています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.unknownLocalResource | This outpost refers to unknown resource ID "{id}" in its local resources. | この拠点の現地資源が不明な資源ID「{id}」を参照しています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.unknownManufacturingProduct | This outpost refers to unknown product ID "{id}" in its manufacturing list. | この拠点の製造リストが不明な製造品ID「{id}」を参照しています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.unknownOutboundItem | This cargo pad refers to unknown {kind} ID "{id}" in its outbound items. | この貨物パッドの搬出項目が不明な{kind} ID「{id}」を参照しています。 | Cargo Pad | Cargo Pad | mixed/no Cargo Pad identity; embedded official terms retained | TRACKER_OWNED_TRANSLATION |
| validation.unknownPlannedItem | This outpost refers to unknown {kind} ID "{id}" in Planned Supply. | この拠点の供給予定が不明な{kind} ID「{id}」を参照しています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.unknownProductionResource | This outpost refers to unknown resource ID "{id}" in its active production. | この拠点の稼働中の生産が不明な資源ID「{id}」を参照しています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.unknownProductionSpecies | This outpost refers to unknown species ID "{id}" in its active production. | この拠点の稼働中の生産が不明な種ID「{id}」を参照しています。 | Outpost | Outpost | standalone qualified official evidence | OFFICIAL_TERM_CONFIRMED |
| validation.unknownSystem | This outpost refers to unknown star system ID "{id}". | この拠点が不明な星系ID「{id}」を参照しています。 | Outpost; Star System | Outpost | official contextual/multiple-usage evidence | OFFICIAL_CONTEXT_CONFIRMED |
| validation.xTechCapabilityPresent | X-Tech is recorded as present, but the character lacks the required extraction capability. | X-Techは存在すると記録されていますが、キャラクターに必要な抽出能力がありません。 | X-Tech | X-Tech | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |
| validation.xTechCapabilityProduced | X-Tech is recorded as produced, but the character lacks the required extraction capability. | X-Techは生産中と記録されていますが、キャラクターに必要な抽出能力がありません。 | X-Tech | X-Tech | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |
| validation.xTechRequiresPresence | X-Tech is recorded as produced, but it is not explicitly recorded as present at this outpost. | X-Techは生産中と記録されていますが、この拠点に存在すると明示的に記録されていません。 | X-Tech; Outpost | X-Tech | standalone qualified identity | REFERENCE_NAME_PARAMETERIZED |

## Reconciliation totals

The table contains exactly **114** unique message keys. It reconciles exactly to
the historical primary dependency totals:

| Primary deferred dependency | Rows |
|---|---:|
| Outpost | 60 |
| Cargo Pad | 22 |
| Biome | 9 |
| Planetary Body | 5 |
| Star System | 5 |
| Displayed skill names | 5 |
| X-Tech / X-Tech Power Core | 4 |
| Inter-System cargo | 2 |
| Planet | 2 |
| **Total** | **114** |

Secondary terms shown in the table overlap these primary groups and therefore
must not be added to 114. In particular, `Starfield`, `Cargo Link`, embedded
skills, and world-structure terms are now visible where the old single
`BethesdaDependency` column hid them.

## Smallest implementation scope

A focused terminology pass should:

1. Add the one-row-per-evidence terminology provenance CSV and a repository-only
   validator/test.
2. Apply the definite Japanese catalogue corrections above, then editorially
   adjudicate the eight context-dependent biome sentences and explicitly retain
   or revise tracker-owned `貨物パッド`.
3. Preserve and test the current official skill-name lookup; correct only the
   stale semantic fallback for Outpost Engineering.
4. Parameterize the three hard-coded X-Tech validations and rewrite the one
   Power Core tooltip around the actual extraction-capability concept.
5. Update the tracked Japanese review evidence and add tests for exact keys,
   placeholders, protected tokens, terminology identities, and absence cases.
6. Re-run the normal localization review, tests, build, lint as warranted, and
   `git diff --check`.

Do not include fonts/layout, Japanese search hardening, collation, accessibility
audit, runtime reference-name architecture changes, persistence/history/import/
export/schema work, new UI copy, or button-label simplification.

There is **no architecture or source-evidence blocker** to beginning this mixed
implementation pass. Japanese-specific editorial judgment remains necessary
for contextual biome wording and optional refinement of tracker-owned Cargo Pad
wording; those decisions must not be falsely labelled Bethesda-authoritative.
The unsupported Power Core phrase is not a blocker because the application’s
documented extraction-capability concept provides the correct replacement
boundary.

## Final disposition

**Outcome B — mixed evidence.** Most recurring terminology can reuse qualified
official identities, but contextual biome/world terms and tracker-owned Cargo
Pad wording require locale-specific adjudication. The implementation can remain
small, semantic-catalogue focused, and independent of reference-name runtime
architecture.

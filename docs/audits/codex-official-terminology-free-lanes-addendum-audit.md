# Official Terminology Addendum: Free Lanes Evidence and Cargo-Link Presentation Alignment

## Executive outcome

**Outcome A — Free Lanes closes the terminology gap.**

Free Lanes contains an exact standalone, record-qualified official term:

```text
TermId:             term.x-tech-power-core
SourcePlugin:       SFBGS050.esm
RecordSignature:    MISC
RecordFormID:       02031E18
EditorID:           Y2_SFTER_PowerCore
FieldPath:          topLevel.FULL
NameSourcePlugin:   SFBGS050.esm
StringTable:        strings
StringID:           000011E5
OfficialEnglish:    X-Tech Power Core
OfficialJapanese:   X-テックパワーコア
```

This reverses the prior audit’s absence conclusion. `X-Tech` remains a separate
canonical resource (`SFBGS00D.esm:IRES:01033E3F`, `X-テック`); the two terms
must not be merged.

Free Lanes also changes one secondary conclusion: its repeated structured
`Biome:` fields use `バイオーム：`. Combined with the base game’s
`Biomes:` → `生態系：`, this makes the tracker’s current `バイオーム` an
officially attested context choice rather than wording that definitely must
change. Biome remains context-dependent and should be adjudicated sentence by
sentence.

The settled product decision removes the other former manual gap:
user-facing `Cargo Pad` becomes `Cargo Link`, and cargo-related `Interstellar`
becomes `Inter-System` / `Inter-System Cargo Link`. The internal `CargoPad`
model, stable IDs, `interstellar` discriminator, functions, CSS names, and
semantic message keys can remain unchanged.

No catalogue, runtime, UI, domain, persistence, schema, generated reference
artifact, or canonical provenance file was changed by this audit.

## Source-universe boundary

The two source roles are deliberately different:

| Plugin | CanonicalContentSource? | TerminologyEvidenceSource? | Notes |
|---|---:|---:|---|
| `Starfield.esm` | Yes | Yes | Base canonical content and terminology. |
| `ShatteredSpace.esm` | Yes | Yes | Current canonical DLC content and terminology. |
| `SFBGS00D.esm` | Yes | Yes | Current canonical X-Tech resource content and terminology. |
| `SFBGS050.esm` | **No** | **Yes** | Free Lanes is admitted only as official terminology evidence. No entity ingestion follows from this audit. |

Canonical tracker-content provenance therefore remains limited to systems,
bodies, biomes, flora/fauna, resources, products, and skills selected from the
existing three-plugin allowlist. A qualified terminology row sourced from Free
Lanes proves official wording; it does not add the corresponding MISC item or
any other Free Lanes record to runtime reference data.

## Inputs and method

The audit read the local intake manifest and the paired Free Lanes English and
Japanese tables extracted from `SFBGS050 - Main.ba2`:

| Table pair | English SHA-256 | Japanese SHA-256 |
|---|---|---|
| `sfbgs050_en/ja.strings` | `318A512E994FCC727686ACBA0D594469761AD04C2903682585488119A683ACE4` | `03C4567B4B47BEF08957599DB6A7DBF6707390B8494E603BD8881106FA26B924` |
| `sfbgs050_en/ja.dlstrings` | `8C6BA74544EAEBE10406BCA20F24A5FECA90B2569BF979F9F2D354290FDF2B60` | `F28D63FF6C4D0CA0495962BF3AB8E4082F5F494D690FF8BDA1C5FC30BD7D6379` |
| `sfbgs050_en/ja.ilstrings` | `21A4CADFF43B1FD025D6C00B36E6E4F31934659C8E94EBD1D2D7D04C1FAC67B9` | `E8F953D54E9B8CF0F00B3A246B7FB7E029ABBE4EA8C31D77ED15228097AEAD7A` |

The archive is BA2 v2 `GNRL`, size 1,983,308,860 bytes, SHA-256
`649CD7F7B5451F13574662F7781688D9938C09280C4C519C2953376A54DCFDCC`.
English was decoded as Windows-1252 and Japanese as UTF-8 through the repository
reader. The exact standalone string was then traced in the installed
`SFBGS050.esm` to one `MISC.FULL` record rather than inferred from text alone.

Diagnostics are ignored under:

```text
.local-work/localization/terminology-free-lanes-audit/
```

They inspected Free Lanes only as a terminology-evidence plugin and did not
write Bethesda table dumps or production artifacts.

## Free Lanes evidence summary

| TermId | Found? | EvidenceKind | SourceIdentity | OfficialEnglish | OfficialJapanese | Context | ChangesPriorConclusion? |
|---|---:|---|---|---|---|---|---:|
| `term.x-tech-power-core` | Yes | standalone, record-qualified | `SFBGS050.esm/MISC:02031E18/topLevel.FULL/strings:000011E5` | X-Tech Power Core | X-テックパワーコア | Inventory/build-enabling item `Y2_SFTER_PowerCore`. | **Yes** — replaces the prior absence result. |
| `term.x-tech-power-core` | Yes | contextual | `SFBGS050.esm/ilstrings:00000F2E` | an X-Tech power core | X-テックのパワーコア | Reward enables building the player’s own extractor. | Strengthens grammatical/context evidence. |
| `term.x-tech-power-core` | Yes | contextual | `SFBGS050.esm/ilstrings:00000F43` | X-Tech power core | X-テックパワーコア | Promised item handed to the player. | Confirms compound form. |
| `term.x-tech-power-core` | Yes | contextual | `SFBGS050.esm/ilstrings:00000F56` | one X-Tech power core | X-テックパワーコア | Singular reward context. | Confirms compound form. |
| `term.x-tech-power-core` | Yes | contextual | `SFBGS050.esm/ilstrings:00001BED` | One X-Tech power core | X-テックパワーコア | Reward context. | Corroborates exact Japanese. |
| `term.x-tech-power-core` | Yes | contextual | `SFBGS050.esm/ilstrings:00001BF4` | one X-Tech power core for your own personal outpost | 拠点用のX-テックパワーコアを1つ | Direct outpost-domain context. | Supports tracker tooltip semantics. |
| `term.x-tech` | Yes | contextual corroboration | `SFBGS050.esm/dlstrings:0000183A` | X-Tech | X-テック | Origin/research dialogue. | No — agrees with the existing SFBGS00D standalone identity. |
| `term.outpost` | Yes | contextual corroboration | `SFBGS050.esm/ilstrings:00000F5D` | outpost | 拠点 | Completion dialogue; 56 Free Lanes table rows contain outpost wording. | No — strengthens `拠点`. |
| `term.biome` | Yes | contextual, structured label | `SFBGS050.esm/strings:00000BE6` | Biome: Oceans | バイオーム：海洋 | One of nine experiment records whose structured `Biome:` field uses `バイオーム：`. | **Yes** — makes current tracker `バイオーム` officially defensible. |
| `term.planet` | Yes | contextual corroboration | `SFBGS050.esm/ilstrings:00001D44` | a planet | 惑星 | Resource-exhaustion dialogue. | No — agrees with `惑星`. |
| `term.star-system` | Yes | contextual corroboration | `SFBGS050.esm/strings:000027E2` | Travel to the Algorab system | アルゴラブ星系へ向かう | Location/quest objective. | No — agrees with astronomical `星系`. |
| `term.cargo-link` | No | absence | searched all three Free Lanes tables | — | — | No Cargo Link occurrence. Base-game evidence remains authoritative. | No. |
| `term.cargo-pad` | No | absence | searched all three Free Lanes tables | — | — | No Cargo Pad occurrence. Presentation term is retired by product decision. | No evidence change; disposition changes by product decision. |
| `term.inter-system-cargo-link` | No | absence | searched all three Free Lanes tables | — | — | No Inter-System occurrence. Base-game exact label remains authoritative. | No. |
| `term.planetary-body` | No | absence | searched all three Free Lanes tables | — | — | No exact phrase. | No. |
| `term.starfield` | No | absence | searched all three Free Lanes tables | — | — | No title occurrence. Base-game standalone identity remains authoritative. | No. |

Free Lanes returned 7 strings containing `X-Tech power core`, 17 containing
`power core`, 3 containing `X-Tech core`, and 114 containing `X-Tech`; all
matched rows had Japanese counterparts. The exact standalone MISC identity is
the canonical terminology row. Context rows are corroboration and grammar
evidence, not competing canonical items.

## X-Tech family consequence

`term.x-tech` and `term.x-tech-power-core` are separate official terms:

| TermId | Source | Official Japanese | Role |
|---|---|---|---|
| `term.x-tech` | `SFBGS00D.esm/IRES:01033E3F/.../strings:00000FC7` | `X-テック` | Resource/material. |
| `term.x-tech-power-core` | `SFBGS050.esm/MISC:02031E18/.../strings:000011E5` | `X-テックパワーコア` | Separate item enabling an X-Tech extractor. |

Japanese orthography is consistent at the canonical-name level: both use
hyphenated `X-テック`. Some long-form Free Lanes prose omits the hyphen, just as
the prior audit found in SFBGS00D contexts, but the standalone forms and most
short contexts support the hyphenated default. Contextual Japanese alternates
between the lexical compound `X-テックパワーコア` and grammatical
`X-テックのパワーコア`; the standalone item name is the registry default.

The prior recommendation to delete the phrase from
`matrix.tooltip.xTech.add` is superseded. Its concept is now officially
attested: Free Lanes explicitly says a power core permits the player to build an
X-Tech extractor for a personal outpost. The tracker may retain its existing
boolean capability abstraction and sentence semantics without modelling item
counts. The later Japanese catalogue change is simply:

```text
X-Tech Power Cores -> X-テックパワーコア
```

Natural Japanese does not need an explicit plural marker. This one-off lexical
term need not become a runtime reference-name entity; qualified provenance in
the terminology registry plus a verified semantic catalogue value is enough.

## Cargo terminology migration

The current catalogues contain:

- **22** semantic messages with literal `Cargo Pad`, `cargo pad`, or
  `cargo pads`;
- **2** semantic messages with literal cargo-related `Interstellar`, one of
  which overlaps the 22 above;
- **3** additional visible bare `Pad` labels that would otherwise preserve the
  retired presentation vocabulary.

The complete direct migration set is therefore **26 unique message keys**.

| MessageKey | CurrentEnglish | RecommendedEnglish | CurrentJapanese | RecommendedJapanese | MigrationClass |
|---|---|---|---|---|---|
| `cargo.heading` | Cargo Pads | Cargo Links | 貨物パッド | 貨物リンク | REPLACE_WITH_CARGO_LINK |
| `cargo.add` | Add cargo pad | Add cargo link | 貨物パッドを追加 | 貨物リンクを追加 | REPLACE_WITH_CARGO_LINK |
| `cargo.addButton` | + Add Cargo Pad | + Add Cargo Link | ＋ 貨物パッドを追加 | ＋ 貨物リンクを追加 | REPLACE_WITH_CARGO_LINK |
| `cargo.addWithLimit` | Add cargo pad ({count} of {limit}) | Add cargo link ({count} of {limit}) | 貨物パッドを追加（{count}/{limit}） | 貨物リンクを追加（{count}/{limit}） | REPLACE_WITH_CARGO_LINK |
| `cargo.reshuffle` | Reshuffle cargo pads | Reshuffle cargo links | 貨物パッドを並べ替え | 貨物リンクを並べ替え | REPLACE_WITH_CARGO_LINK |
| `cargo.finishReshuffle` | Finish reshuffling cargo pads | Finish reshuffling cargo links | 貨物パッドの並べ替えを完了 | 貨物リンクの並べ替えを完了 | REPLACE_WITH_CARGO_LINK |
| `cargo.destination.pad` | Destination cargo pad | Destination cargo link | 搬送先の貨物パッド | 搬送先の貨物リンク | REPLACE_WITH_CARGO_LINK |
| `cargo.destination.noPads` | {outpost} — no cargo pads | {outpost} — no cargo links | {outpost} — 貨物パッドなし | {outpost} — 貨物リンクなし | REPLACE_WITH_CARGO_LINK |
| `cargo.destination.selectPad` | Select cargo pad... | Select cargo link... | 貨物パッドを選択... | 貨物リンクを選択... | REPLACE_WITH_CARGO_LINK |
| `cargo.destination.unknownPad` | Unknown cargo pad | Unknown cargo link | 不明な貨物パッド | 不明な貨物リンク | REPLACE_WITH_CARGO_LINK |
| `cargo.destination.unknownPadInline` | unknown cargo pad | unknown cargo link | 不明な貨物パッド | 不明な貨物リンク | REPLACE_WITH_CARGO_LINK |
| `cargo.interSystem.context` | Inter-System cargo pads | Inter-System Cargo Links | 星系間貨物パッド | 星系間貨物リンク | REPLACE_WITH_INTER_SYSTEM_CARGO_LINK |
| `cargo.interstellar` | Interstellar cargo link | Inter-System Cargo Link | 星系間貨物リンク | 星系間貨物リンク | REPLACE_WITH_INTER_SYSTEM_CARGO_LINK |
| `cargo.pad.summary` | Pad {ordinal} | Cargo Link {ordinal} | パッド{ordinal} | 貨物リンク{ordinal} | REPLACE_WITH_CARGO_LINK |
| `cargo.pad.count` | {count} {count, plural, one {pad} other {pads}} | {count} {count, plural, one {cargo link} other {cargo links}} | {count}個のパッド | {count}件の貨物リンク | REPLACE_WITH_CARGO_LINK |
| `validation.context.pad` | Pad {ordinal} | Cargo Link {ordinal} | パッド{ordinal} | 貨物リンク{ordinal} | REPLACE_WITH_CARGO_LINK |
| `help.interSystem` | Inter-System cargo pads can link outposts in different star systems and require Helium-3. | Inter-System Cargo Links can connect outposts in different star systems and require Helium-3. | 星系間貨物パッドは別の星系の拠点と接続でき、He-3を必要とします。 | 星系間貨物リンクは異なる星系の拠点同士を接続でき、He-3を必要とします。 | REPLACE_WITH_INTER_SYSTEM_CARGO_LINK |
| `status.import.invalidCargoPad` | The selected file contains an invalid cargo pad. | The selected file contains an invalid cargo link. | 選択したファイルに無効な貨物パッドが含まれています。 | 選択したファイルに無効な貨物リンクが含まれています。 | REPLACE_WITH_CARGO_LINK |
| `validation.cargoPadLinkedMultiple` | This cargo pad is linked more than once. | This Cargo Link has more than one connection. | この貨物パッドは複数回接続されています。 | この貨物リンクには複数の接続が設定されています。 | REPHRASE_AROUND_LINK_ENDPOINT |
| `validation.cargoPadSkillLimit` | This outpost has {count} cargo pads, but the current {skill} level allows a maximum of {limit}. | This outpost has {count} cargo links, but the current {skill} level allows a maximum of {limit}. | この拠点には貨物パッドが{count}個ありますが、現在の{skill}レベルでは最大{limit}個です。 | この拠点の貨物リンク数は{count}ですが、現在の{skill}レベルでは最大{limit}です。 | REPLACE_WITH_CARGO_LINK |
| `validation.duplicateOutboundItem` | {item} appears more than once in this cargo pad's outbound items. | {item} appears more than once in this Cargo Link's outbound items. | {item}がこの貨物パッドの搬出項目に複数回含まれています。 | {item}がこの貨物リンクの搬出項目に複数回含まれています。 | REPLACE_WITH_CARGO_LINK |
| `validation.interstellarHelium3` | This interstellar cargo pad is sending cargo, but its outpost has no available Helium-3 supply. | This Inter-System Cargo Link is sending cargo, but its outpost has no available Helium-3 supply. | この星系間貨物パッドは貨物を発送していますが、拠点で利用できるHe-3の供給がありません。 | この星系間貨物リンクは貨物を発送していますが、拠点で利用できるHe-3の供給がありません。 | REPLACE_WITH_INTER_SYSTEM_CARGO_LINK |
| `validation.missingCargoEndpoint` | This cargo link refers to a missing outpost or cargo pad. | This cargo connection refers to a missing outpost or Cargo Link endpoint. | この貨物リンクが存在しない拠点または貨物パッドを参照しています。 | この貨物接続が、存在しない拠点または接続先の貨物リンクを参照しています。 | REPHRASE_AROUND_LINK_ENDPOINT |
| `validation.regularPadCrossSystem` | This regular cargo pad is linked to an outpost in another star system. | This Cargo Link is connected to an outpost in another star system; use an Inter-System Cargo Link instead. | この通常の貨物パッドは別の星系の拠点に接続されています。 | この貨物リンクは別の星系の拠点に接続されています。代わりに星系間貨物リンクを使用してください。 | REPLACE_WITH_CARGO_LINK |
| `validation.selfLinkedCargoPad` | This cargo link connects a cargo pad to itself. | This cargo connection uses the same Cargo Link at both endpoints. | この貨物リンクは同じ貨物パッドを両端に接続しています。 | この貨物接続では、両端に同じ貨物リンクが指定されています。 | REPHRASE_AROUND_LINK_ENDPOINT |
| `validation.unknownOutboundItem` | This cargo pad refers to unknown {kind} ID "{id}" in its outbound items. | This Cargo Link refers to unknown {kind} ID "{id}" in its outbound items. | この貨物パッドの搬出項目が不明な{kind} ID「{id}」を参照しています。 | この貨物リンクの搬出項目が不明な{kind} ID「{id}」を参照しています。 | REPLACE_WITH_CARGO_LINK |

The recommendations preserve every existing placeholder except the text-only
plural branches in `cargo.pad.count`. The implementation must rerun placeholder
and ICU validation after editing.

### Interstellar retirement set

The complete user-facing cargo-related `Interstellar` set is exactly two keys:

| MessageKey | MigrationClass | Result |
|---|---|---|
| `cargo.interstellar` | REPLACE_WITH_INTER_SYSTEM_CARGO_LINK | Exact official full label. |
| `validation.interstellarHelium3` | REPLACE_WITH_INTER_SYSTEM_CARGO_LINK | Exact official noun phrase inside tracker-owned grammar. |

There is no generic astronomical use of `interstellar` in the semantic
catalogue. No row is `GENERIC_ASTRONOMICAL_INTERSTELLAR_KEEP`.
`cargo.interSystem.button` already says `Inter-System` / `星系間` and needs no
change.

### Inspected semantic containers requiring no catalogue change

These messages contain a `{pad}` parameter or have a `cargo.pad.*` key but no
fixed visible Pad/Cargo Pad term. Their parameter will receive the newly
localized Cargo Link label, or their text remains terminology-neutral:

| MessageKey | MigrationClass | Reason |
|---|---|---|
| `cargo.destination.padContents` | INTERNAL_ONLY_NO_CHANGE | `{pad}` receives the migrated display label. |
| `cargo.destination.padContentsLinked` | INTERNAL_ONLY_NO_CHANGE | `{pad}` receives the migrated display label. |
| `cargo.destination.linkedLocator` | INTERNAL_ONLY_NO_CHANGE | `{pad}` receives the migrated display label. |
| `cargo.pad.remove` | INTERNAL_ONLY_NO_CHANGE | `{pad}` receives the migrated display label. |
| `cargo.pad.emptyExports` | INTERNAL_ONLY_NO_CHANGE | No pad/link noun. |
| `cargo.pad.noDestination` | INTERNAL_ONLY_NO_CHANGE | No pad/link noun. |
| `cargo.pad.linkedTo` | INTERNAL_ONLY_NO_CHANGE | No pad/link noun. |
| `validation.context.separator` | INTERNAL_ONLY_NO_CHANGE | `{pad}` receives the migrated context label. |

Semantic key names are internal stable identifiers and do not need renaming.

## Internal model and code boundary

The code search found internal references including:

- `CargoPad`, `CargoPadId`, `cargoPads`, and `cargoPadId`;
- the persisted discriminator value `'interstellar'`;
- `getInterstellarFuelState` and `InterstellarFuelState`;
- cargo-pad component, CSS class, function, test, and comment names;
- history/action implementation labels and import diagnostics.

All may remain unchanged. They are implementation vocabulary, not localized
presentation. Renaming them would create avoidable domain, migration, history,
test, and CSS churn without improving what the player sees. Only semantic
catalogue values and their literal expectations need change in the later pass.
The import error’s internal raw diagnostic can also remain stable while
`status.import.invalidCargoPad` changes its presentation.

The repository currently has no literal user-facing Cargo Pad JSX bypassing the
semantic catalogue; visible wording routes through localization keys.

## UI hardening opportunities

`+ Add Cargo Link` is longer than the already long `+ Add Cargo Pad`. A later UI
hardening pass may consider `+ Add` or `+` where the surrounding Cargo Links
heading makes the action unambiguous. This audit does not choose or implement
that simplification. The terminology pass should first make the full semantic
label correct and retain a complete accessible name even if a future visual
label is shortened.

## Terminology registry and durable policy

The planned
`reference-source/official-terminology-provenance.csv` should add:

```text
SourceUse
```

with at least:

```text
canonical-content
terminology-evidence-only
```

The `term.x-tech-power-core` row uses
`SourceUse=terminology-evidence-only`. Existing rows sourced from the three
canonical plugins use `canonical-content`; that value also permits terminology
evidence but does not imply that every record in those plugins is ingested.

The full recommended row is:

```text
EvidenceId:             term.x-tech-power-core.item-name
TermId:                 term.x-tech-power-core
CanonicalEnglish:       X-Tech Power Core
EvidenceKind:           standalone
SourceUse:               terminology-evidence-only
SourcePlugin:            SFBGS050.esm
RecordSignature:         MISC
RecordFormID:            02031E18
FieldPath:               topLevel.FULL
NameSourcePlugin:        SFBGS050.esm
StringTable:             strings
StringID:                000011E5
OfficialEnglish:         X-Tech Power Core
OfficialJapanese:        X-テックパワーコア
Context:                 Free Lanes inventory/build-enabling item
Confidence:              HIGH
```

Contextual evidence should be additional rows with the same `TermId`, not
multiple identities packed into one cell.

Do not broaden `reference-source/localization-provenance-policy.json`.
Its `authoritativePlugins` currently owns canonical reference-name generation,
and `SFBGS050.esm` is deliberately only an optional compatibility plugin there.
Overloading that allowlist would risk accidental canonical discovery/provider
selection.

Instead, add a small, terminology-owned policy in the later pass, for example:

```text
reference-source/official-terminology-policy.json
```

with functionally named arrays:

```json
{
  "schemaVersion": 1,
  "canonicalContentPlugins": [
    "Starfield.esm",
    "ShatteredSpace.esm",
    "SFBGS00D.esm"
  ],
  "terminologyEvidencePlugins": [
    "Starfield.esm",
    "ShatteredSpace.esm",
    "SFBGS00D.esm",
    "SFBGS050.esm"
  ]
}
```

A terminology verifier should require every provenance row’s `SourcePlugin` and
`SourceUse` to agree with this policy. It must not feed this second allowlist
into canonical reference-name builders.

## Japanese consequences

Free Lanes changes exactly these prior Japanese conclusions:

1. `term.x-tech-power-core` is official
   `X-テックパワーコア`, not tracker-owned/unresolved. Update
   `matrix.tooltip.xTech.add` accordingly; do not delete the concept.
2. `term.biome` now has repeated official structured-label evidence for
   `バイオーム`. The current tracker form may remain. `生態系`, `環境`, and
   `バイオーム` are still context-qualified variants, so no global replacement
   is justified.

Free Lanes otherwise corroborates `X-テック`, `拠点`, `惑星`, and astronomical
`星系`. It adds no Cargo Link or Inter-System evidence and does not contradict
the base-game official labels. The cargo migration’s Japanese values therefore
continue to come from the base-game `貨物リンク` / `星系間貨物リンク` family.

## Future-language reuse

For `term.x-tech-power-core`, future locale onboarding is deterministic:

```text
term.x-tech-power-core
  + SFBGS050.esm / MISC:02031E18 / topLevel.FULL
  + SFBGS050_<locale>.strings / 000011E5
  -> official localized item name
```

The same qualified Free Lanes identity can be resolved from manifested
French/German/etc. tables without English reverse matching. Contextual rows such
as `ilstrings:00001BF4` remain useful for checking grammar and outpost-domain
usage in each locale, but the extracted substring still requires editorial
inspection.

Locales for users who do not own Free Lanes are unaffected at runtime because
the term is build-time semantic-localization evidence, not a live game-data
lookup or entitlement check. The committed semantic catalogue carries the
reviewed text.

## Smallest implementation scope

A focused implementation pass should:

1. Add `official-terminology-policy.json` with separate canonical-content and
   terminology-evidence allowlists.
2. Add the one-row-per-evidence
   `official-terminology-provenance.csv`, including the Free Lanes
   record-qualified Power Core row and `SourceUse`.
3. Add repository-only schema/allowlist/qualified-identity tests; installed-game
   regeneration may verify manifested tables and ESM context separately.
4. Update the Japanese X-Tech tooltip to `X-テックパワーコア`, retaining the
   documented capability abstraction and placeholders.
5. Apply the 26-key Cargo Link / Inter-System presentation migration above.
6. Leave internal `CargoPad`, `cargoPadId`, `cargoPads`, `'interstellar'`,
   related function/CSS names, persisted values, and semantic keys unchanged.
7. Update localization tests, literal expectations, and the tracked Japanese
   review evidence; verify key, placeholder, ICU, and protected-token parity.
8. Reconcile the prior terminology audit in documentation so its superseded
   Power Core absence and categorical Biomes-label recommendation cannot be
   mistaken for current guidance.

Do not add Free Lanes canonical entities, alter reference-name runtime
architecture, touch persistence/history/schema/import/export, or include
font/layout/search/collation/accessibility/button-simplification work.

There is **no blocker** before this focused implementation pass. The Power Core
term now has high-confidence standalone provenance, the cargo presentation
decision is settled, and the internal/domain boundary is explicit.

## Final disposition

**Outcome A — Free Lanes closes the terminology gap.** The exact official
Power Core identity resolves the last falsely absent term, while the product’s
Cargo Link decision removes the former tracker-owned Cargo Pad presentation
lane. Implementation can proceed as a small semantic-localization and
terminology-provenance pass without canonical Free Lanes ingestion or domain
renaming.

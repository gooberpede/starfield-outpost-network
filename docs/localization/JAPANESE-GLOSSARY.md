# Japanese localization glossary and style guide

## Status and scope

This is the working terminology authority for tracker-authored Japanese copy.
Parcel B1 is a machine-assisted first draft, not a human-approved translation.
Independent English-source translation and comparative review remain required.

Tracker messages may contain Bethesda-owned names supplied as parameters. Those
names remain canonical English fallbacks until official Japanese overlays are
built from Bethesda data. Do not translate or embed those names in this
catalogue.

## Style

- Use concise, neutral Japanese software language for controls and headings.
- Use complete natural sentences for help, validation, confirmations, and
  accessible instructions. Do not preserve English word order mechanically.
- Prefer consistent product concepts over superficial variation. In particular,
  use `供給予定` for Planned Supply and distinguish `搬入`/`搬出` from
  file `インポート`/`エクスポート`.
- Japanese generally does not inflect UI nouns for number. Preserve the numeric
  placeholder and use a suitable counter instead of imitating English plurals.
- Preserve user-authored names and reference-name parameters exactly as supplied.

## Product terminology

| Semantic concept / representative key | English | Product meaning and exclusions | Provisional Japanese | Ownership and usage notes |
|---|---|---|---|---|
| `plannedSupply.heading` | Planned Supply | A virtual assertion that an item will eventually be supplied to the outpost, allowing downstream production/logistics to be designed before the real supply route exists. It is **not** stock currently held, reserved inventory, or actual incoming cargo. | 供給予定 | Tracker-authored; HIGH risk. Use consistently as a named feature. |
| `matrix.column.present` | Present | The resource can be, or has explicitly been recorded as, present at the outpost. It does not mean stored inventory. | 存在 | Tracker-authored; compact matrix state. Contextual help carries the qualification. |
| `matrix.column.producing` | Producing | The outpost is configured to produce/extract/harvest the item now. | 生産中 | Tracker-authored. Do not imply production quantity or throughput. |
| `matrix.column.inputs` | Inputs | Required recipe or organic-production inputs and their availability. | 入力 | Tracker-authored manufacturing term; not keyboard input. |
| `matrix.column.logistics` | Logistics | Items actually assigned to a routed cargo export. It does not merely mean available to export. | 物流 | Tracker-authored; HIGH conceptual risk despite the short label. |
| `transfer.import.button` | Import | Read a complete tracker collection from JSON. | インポート | Tracker-authored file operation. Use `搬入` for cargo coming into an outpost. |
| `transfer.export.button` | Export | Write all tracker networks to JSON. | エクスポート | Tracker-authored file operation. Use `搬出` for cargo leaving an outpost. |
| `cargo.heading` | Cargo Pads | Outpost cargo-link endpoints managed by the tracker. | 貨物パッド | Tracker-authored UI concept describing a Bethesda mechanic; verify official game term in Parcels C/D before final approval. |
| `outpost.navigation.heading` | Outpost | A player-built Starfield outpost recorded by the tracker. | 拠点 | Tracker UI term; Bethesda terminology status must be verified separately. |
| `network.label` | Network | A tracker document containing related outposts and cargo links. | ネットワーク | Tracker-authored; not a computer network. |
| `validation.severity.error` | Error | Invalid state requiring attention. | エラー | Tracker-authored severity. Do not silently strengthen warnings into errors. |
| `validation.severity.warning` | Warning | Incomplete or inconsistent state; not necessarily invalid. | 警告 | Tracker-authored severity. |
| `validation.severity.info` | Info | Useful follow-up information. | 情報 | Tracker-authored severity. |
| matrix/help availability | available / unavailable | Whether the item can be used at this outpost under the current model; not an inventory count. | 利用できる / 利用できない | Tracker-authored state wording. |
| `matrix.column.source` | Source | The local, organic, manufacturing, imported, or virtual origin of supply. | 供給源 | Tracker-authored. Use `搬送先` for a cargo destination. |
| cargo destination | Destination | The remote outpost/pad receiving a cargo link. | 搬送先 | Tracker-authored logistics wording. |
| `history.undo` / `history.redo` | Undo / Redo | Move backward/forward through the session edit timeline. | 元に戻す / やり直す | Tracker-authored standard UI commands. |
| reshuffle / reorder / move | Reshuffle / reorder / move | Enter ordering mode, change order, or move a specific object. | 並べ替え / 並べ替え / 移動 | Tracker-authored. Prefer the concrete object/action in accessible text. |
| manufacturing | Manufacturing | Configured production of manufactured products from recipe inputs. | 製造 | Tracker-authored model term; no throughput is implied. |
| production | Production | Active extraction, harvesting, or manufacturing recorded at an outpost. | 生産 | Tracker-authored umbrella term. |
| `cargo.interSystem.*` | Inter-System | Cargo transport between different star systems. | 星系間 | Tracker UI wording. Requires `He-3`; official mechanic terms remain subject to Bethesda review. |

## Bethesda-owned terminology boundary

Resource, product, system, body, biome, species, and canonical game skill names
are Bethesda-owned reference terminology. Their stable IDs and canonical names
are resolved outside the tracker message catalogue. Official Japanese terms,
where available, will be extracted and overlaid in later parcels. B1 must not
turn a machine translation into canonical reference data.

The provisional Japanese skill labels currently used by tracker-authored field
labels and validation sentences require explicit comparison with official
Bethesda Japanese terminology during Parcels C/D.

## Protected and invariant tokens

Preserve these categories exactly unless a later reviewed rule explicitly says
otherwise:

- interpolation syntax and identifiers, such as `{count}`, `{outpost}`, and
  `{resource}`; use ASCII braces and never rename a parameter;
- chemical and technical tokens such as `He-3`;
- FormIDs, EditorIDs, stable IDs, schema keys, raw diagnostic IDs, and version
  numbers;
- displayed abbreviations such as `VFR` and `SMS`;
- keyboard tokens such as `Ctrl`, `Shift`, `Z`, and `Esc`;
- file extensions, filenames, and serialization tokens such as `.json` and
  `JSON`;
- intentionally invariant proper names such as `Starfield`, `X-Tech`,
  `X-Tech Power Cores`, and `Starfield Outpost Network`;
- legal attribution text when changing it could alter the credited name or
  required wording.

An English-looking word is not automatically protected. Each invariant must
represent technical identity, a proper name, or a documented attribution need.
The generated review package lists protected tokens detected in each message.

## Review priorities

Independent review should focus first on Planned Supply semantics; Present,
Inputs, and Logistics distinctions; harvesting versus extraction; Cargo Pad and
Inter-System official terminology; validation/remediation nuance; destructive
confirmations; accessibility instructions; and official Japanese forms of the
five displayed Starfield skill names.

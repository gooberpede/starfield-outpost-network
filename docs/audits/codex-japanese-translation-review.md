# Japanese tracker catalogue comparative review (Parcel B3)

## 1. Executive summary

Parcel B3 adjudicated all 330 tracker-authored Japanese messages by comparing
the Codex B1 catalogue with an independent DeepL English-source pass. The
review retained the first-pass wording where it better preserved tracker
semantics, accepted three DeepL renderings, rewrote six tracker-owned decisions,
and recorded 114 messages as Bethesda-dependent. Sixteen of those deferred
messages still received tracker-grammar refinements while their game terms
remain provisional.

The runtime catalogue changed in 25 places. A focused evidence correction
explicitly re-reviewed all 151 non-exact, non-Bethesda rows that the initial
B3 helper had accepted through a default policy; 147 remained Codex choices,
two changed to DeepL, and two were rewritten. No human Japanese reviewer was
available, so this remains a machine-assisted translation review rather than
native-language approval.

## 2. Inputs used

- `src/localization/locales/en-US.ts` and `ja-JP.ts`
- `docs/localization/JAPANESE-GLOSSARY.md`
- `docs/THIRD-PARTY-REFERENCES.md`
- `docs/audits/codex-localization-coverage-and-japanese-audit.md`
- `.local-work/translation/jp/ja-JP-codex-vs-deepl-comparison.csv`
- `.local-work/translation/jp/ja-JP-deepl-intake-report.md`
- the returned DeepL XLIFF files in the same local working directory
- current localization/domain tests and the documented product semantics

The row-level result is preserved outside the repository in
`.local-work/translation/jp/ja-JP-adjudication.csv`.

## 3. Review method

Every row was evaluated for semantic fidelity, UI context, glossary
consistency, natural software Japanese, register, parameter/token integrity,
and terminology ownership. The correction explicitly compared the English,
Codex Japanese, DeepL Japanese, UI context, glossary, and syntax constraints
for each of the 151 affected rows. Low-risk comparisons used documented fast
paths such as punctuation-only, style-equivalent, compact-UI, and complete-
sentence review. Semantic, state, action-direction, accessibility, destructive-
action, and technical-terminology differences received specific rationales.

Thirteen difficult HIGH-risk rows received a genuinely separate second pass:
`help.logistics`, `help.plannedSupply`, `help.validation`,
`network.delete.explanation`, `network.delete.undoHint`,
`plannedSupply.heading`, `search.results.dragInstructions`,
`validation.plannedSupplyUnresolved`,
`validation.remediation.extraction`,
`validation.remediation.harvesting`,
`validation.remediation.organicSources`,
`validation.unresolvedCargoExport`, and
`validation.unspecifiedOrganicSource`. Each working-CSV result records the
best option, reason, residual risk, and Bethesda dependency. No second-pass
claim is made for other rows.

Rows whose final term depends on official Starfield
Japanese were classified `DEFER_BETHESDA`, even when both machine translations
agreed. The working CSV records the reason, confidence, dependency, syntax
issue, comparison type, optional second-pass result, and final provisional text
for every key. The helper now fails if any non-exact, non-Bethesda disagreement
lacks an explicit reviewed decision; it no longer defaults to `ACCEPT_CODEX`.

## 4. Decision counts

| Decision | Count |
|---|---:|
| `AUTO_ACCEPT_AGREEMENT` | 60 |
| `ACCEPT_CODEX` | 147 |
| `ACCEPT_DEEPL` | 3 |
| `REWRITE` | 6 |
| `DEFER_BETHESDA` | 114 |
| **Total** | **330** |

Confidence was HIGH for 217 rows and MEDIUM for 113 rows. No row was assigned
LOW confidence because unresolved official terminology was isolated explicitly
as a Bethesda dependency rather than hidden inside a linguistic decision.

## 5. Exact-agreement handling

Codex and DeepL agreed exactly on 67 rows. Sixty were auto-accepted. Six exact
agreements were deferred because they contained provisional Inter-System,
Cargo Pad, biome, or skill terminology. The remaining exact agreement,
`matrix.column.inputs`, was rewritten because `入力` can read as keyboard or
data entry rather than a production requirement.

## 6. High-risk adjudications

Among the 87 HIGH-risk rows, decisions were: 21 `ACCEPT_CODEX`, one
`ACCEPT_DEEPL`, 11 `AUTO_ACCEPT_AGREEMENT`, one `REWRITE`, and 53
`DEFER_BETHESDA`. The high deferred count reflects ownership boundaries rather
than unresolved tracker meaning: many validation and help sentences embed the
provisional Japanese for Outpost, Cargo Pad, biome, body, or system.

Organic-source help was refined to `飼育可能な生物種`. Unavailable-source
messages now preserve the English distinction that the statement concerns
*this* species. Producing help was rewritten into natural Japanese while still
describing configured production, not throughput. Extraction (`抽出`) and
organic harvesting (`採集`) remain deliberately distinct.

The correction retained Codex for all 21 HIGH-risk rows in its 151-row target
after explicit comparison. The separate second pass covered 13 of the
difficult rows listed in the method section; the remaining HIGH-risk target
rows had specific first-pass semantic or syntax rationales and do not claim a
second pass.

## 7. Planned Supply

`供給予定` remains the feature name. It best supports the product meaning: a
virtual assertion of future supply that lets downstream production and
logistics be designed before a real source exists. DeepL's `計画供給` and
`計画供給量` were rejected because they can suggest a generic supply plan or a
quantity. The help text continues to call selected entries `仮の供給` until
local or inbound supply exists.

## 8. Present, Producing, Inputs, and Logistics

- Present remains `存在`; DeepL's `現在` incorrectly means “current/now.”
- Producing remains `生産中`; bare `生産` loses the configured/active state.
- Inputs changed from `入力` to `必要素材` to convey recipe and organic
  production requirements rather than keyboard input.
- Logistics remains `物流`; its help text defines the narrower tracker meaning
  of items actually assigned to routed cargo exports.

Cargo `搬入` / `搬出` remains distinct from JSON
`インポート` / `エクスポート`.

## 9. Validation and accessibility findings

Validation severity remains `エラー`, `警告`, and `情報`, preserving the
existing strength of each rule. Six active-production validation variants were
rewritten to remove the unnatural compounds `拠点抽出` and `拠点採集` while
retaining the extraction/harvesting distinction. The self-linked Cargo Pad
message now states that the same pad is connected at both endpoints.

The destructive reset prompt adopted DeepL's concise
`現在のネットワークを初期状態にリセットしますか？`. Existing delete and
Undo availability wording was retained. Accessibility instructions preserve
keyboard tokens and complete action descriptions.

The correction also accepted DeepL's `順序を固定` for the compact lock-order
control and its explicit empty-collection diagnostic. It rewrote Resource
Matrix to `資源マトリックス` and the malformed-entry diagnostic to state that
the network entry's format is invalid.

## 10. Placeholder, protected-token, and ICU repairs

The DeepL evidence contained 20 rows with renamed placeholders, two rows with
altered protected tokens, and four rows with damaged ICU plural syntax. These
26 rows were never imported mechanically. All original semantic keys and
placeholder identifiers were retained. `Cosmos icons created by gravisio -
Flaticon`, `X-Tech Power Cores`, `He-3`, `Shift`, `Esc`, `JSON`, and other
protected tokens remain unchanged where applicable. Japanese counter-based
messages retain the original runtime parameters without copying translated ICU
syntax.

## 11. Bethesda-dependent unresolved terminology

The 114 deferred messages break down by recorded dependency:

| Dependency | Rows |
|---|---:|
| Outpost | 60 |
| Cargo Pad | 22 |
| biome | 9 |
| planetary body | 5 |
| star system | 5 |
| displayed Starfield skill names | 5 |
| X-Tech / X-Tech Power Cores | 4 |
| Inter-System cargo | 2 |
| planet | 2 |

The retained runtime forms—including `拠点`, `貨物パッド`, `星系間`, and the
five skill labels—are provisional. This review does not promote them to
official Japanese terminology. Messages with embedded X-Tech or game-mechanic
terms are explicitly flagged for Parcels C/D.

## 12. Glossary changes

The glossary now records `必要素材`, `飼育可能な生物種`, compact power labels
`低` / `極低`, and the B3 decisions for the four matrix concepts, Planned
Supply, cargo/file transfer distinctions, and extraction versus harvesting.
It also records `資源マトリックス` and states that the catalogue is machine-
reviewed but not human-approved.

## 13. Catalogue changes made

Twenty-five strings changed across B3: three DeepL acceptances, six tracker-
owned rewrites, and sixteen tracker-grammar refinements on messages whose
embedded Bethesda terms remain deferred. The correction added four catalogue
changes: `outpost.navigation.lockOrder` and
`status.import.emptyCollection` adopted DeepL, while `matrix.heading` and
`status.import.malformedEntry` were rewritten. The full change set also covers
the About description, reset prompt, power labels, Inputs heading, active-
production validations, self-link validation, biome-removal history, organic-
source help, and Producing help.
No English source, semantic key, application architecture, schema, reference
data, history behavior, or domain rule changed.

## 14. Remaining uncertainties

Official Japanese terminology is still required for all dependencies listed
above. A future native-speaker review would still be valuable if one becomes
available. In its absence, retain the machine-assisted audit trail and
prioritize further review of MEDIUM-confidence and Bethesda-dependent strings.
The MEDIUM confidence rows in the working CSV identify the precise review
surface; there are no hidden LOW-confidence tracker-owned decisions.

## 15. Recommendation for Parcel B4

Treat this B3 catalogue as the reviewed tracker-owned baseline. A native-
speaker review can focus on MEDIUM-confidence rows and dense UI context if one
becomes available, but B4 is not blocked on it. Keep Bethesda terms provisional
until Parcels C/D derive official localized names from supported game data.
Re-run key/placeholder/token/ICU checks after any later edits. Do not begin
layout/font work until the terminology inputs needed for that work are stable.

## 16. Verification

The following checks passed after the catalogue and documentation updates:

- `npm run localization:review` (regenerated the deterministic committed review
  source from the adjudicated catalogue)
- `npm test` (130 passed)
- `npm run reference:test` (47 passed)
- `npm run reference:build`
- `npm run build`
- `npm run lint`
- `git diff --check`

A targeted local browser smoke test switched the running application to
Japanese and confirmed `document.documentElement.lang === "ja-JP"`, the visible
`存在` / `生産中` / `必要素材` / `物流` matrix headings, `供給予定`, and the
rewritten Producing help sentence. The tested page had no document-level
horizontal overflow and emitted no browser console errors. Reference names
remained English fallbacks as expected because no Japanese overlay was added.

## 17. Scope confirmation

No reference-name overlay, Bethesda BA2/string extraction, persistence or
schema work, layout/font work, dependency change, commit, or push was performed
for this parcel.

## 18. Parcel B4 closure

Parcel B4 re-ran the deterministic catalogue review and all repository gates,
then completed a targeted Japanese browser smoke test. The tracker-authored
catalogue remains complete at 330/330 keys with placeholder, ICU, and protected-
token integrity intact; no unintended tracker-owned English fallback or runtime
integration defect was found. Japanese remained selectable and self-labelled as
`日本語`, Automatic Japanese locale matching remained covered, and the runtime
document language was `ja-JP`.

Parcel B is therefore closed. The 114 Bethesda-dependent terminology decisions
remain intentionally provisional for Parcels C/D. Japanese font, wrapping,
layout, and search hardening remain deferred to Parcel E. No native-speaker
review was available, though one remains useful if it becomes available. B4 did
not perform BA2/string extraction, reference-name overlay work, Japanese layout
or search hardening, persistence/schema changes, or production-code changes.

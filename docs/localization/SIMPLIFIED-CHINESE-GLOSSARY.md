# Simplified Chinese terminology glossary

Locale contract: `zh-Hans` / Bethesda token `zhhans` / strict UTF-8 / full catalogue / runtime inactive.

This glossary is an editorial constraint for the later semantic review. It is not a runtime sentence-fragment dictionary. Official values below are keyed to `reference-source/official-terminology-values-zh-Hans.csv`; tracker-owned entries are project terminology proposals, not claims of Bethesda authorship.

## Evidence classification

The four classifications are:

- **A — direct official standalone default:** the official wording is safe as the tracker default when the concept matches.
- **B — official term requiring context-sensitive handling:** official evidence is authoritative, but surface or grammar selects the form.
- **C — tracker-owned concept informed by official evidence:** Bethesda evidence informs the boundary but does not supply a canonical tracker label.
- **D — evidence-only / not suitable as tracker UI default:** preserve the evidence without promoting it to a label.

| Term ID | Class | Decision and rationale |
|---|---:|---|
| `term.outpost` | A | Standalone and contextual evidence agree on `哨站`. |
| `term.cargo-link` | A | Exact standalone `货运链接` is the named Starfield construct. |
| `term.inter-system-cargo-link` | A | Exact standalone `跨星系货运链接` is safe and already compact. |
| `term.inter-system` | B | Official `货运链接 - 跨星系` proves the modifier `跨星系`; it is not a universal standalone noun. |
| `term.biome` | B | `生物群系` is the tracker default, while official prose also uses `生物群落`, `植物群落`, and `生态群落`. |
| `term.planet` | B | Official evidence uses both technical `行星` and ordinary-prose `星球`. |
| `term.planetary-body` | A | Exact official `行星体` supports the tracker selector/default; broader `天体` remains contextual. |
| `term.star-system` | A | Multiple official contexts consistently use `星系`. |
| `skill.outpost-management` | A | Qualified official skill name `哨站管理`. |
| `skill.outpost-engineering` | A | Qualified official skill name `哨站工程`. |
| `skill.planetary-habitation` | A | Qualified official skill name `行星居住`. |
| `skill.research-methods` | A | Qualified official skill name `研究方法`. |
| `skill.special-projects` | A | Qualified official skill name `特殊项目`. |
| `term.x-tech` | A | Qualified official resource name `X技术`; the Latin `X` is part of the name. |
| `term.x-tech-power-core` | A | Standalone and contextual evidence agree on `X技术能量核心`. |
| `term.starfield` | B | `星空` is the localized game title, but intentional tracker/product/technical brand tokens remain `Starfield`. |
| `term.moon` | B | Official evidence uses `卫星` for a generic natural satellite; `月球` is Earth-specific and `月亮` is colloquial. |
| `term.orbital` | D | `正在进入轨道模式。` is adjectival/contextual evidence and supplies no safe standalone body-type label. |
| `term.cargo-pad` | C | Four intended absences prove there is no official label to promote; the internal endpoint abstraction remains tracker-owned and has no current UI default. |

## Class 1 — Official Bethesda terminology

| English concept | Official Simplified Chinese evidence | Recommended standalone tracker form | Context, exclusions, and compact guidance | Evidence notes |
|---|---|---|---|---|
| Outpost | `哨站`; contextual `你把那个哨站搞定了吗？` | `哨站` | No synonym is approved. Already compact. | Base-game standalone plus Free Lanes corroboration. |
| Cargo Link | `货运链接` | `货运链接` | Use for the named construct, including compact headings. Do not reduce it to generic `货运` or `链接`. | Exact base-game standalone label. |
| Inter-System Cargo Link | `跨星系货运链接` | `跨星系货运链接` | Use the full form where the construct is named. `跨星系` is allowed when the cargo-link context is already explicit. No abbreviation is approved. | Exact base-game build/menu label. |
| Biome | `生物群系：`; prose also contains `生物群落`, `植物群落`, `生态群落` | `生物群系` | Default for selectors and technical labels. Contextual prose may use an evidenced `…群落` form when its meaning fits. Do not mechanically promote a whole prose fragment. | Five evidence identities across canonical content and terminology-only Free Lanes evidence. |
| Planetary Body | `…小行星和行星体`; broader prose `天体` | `行星体` | Use `行星体` for the tracker's body selector/abstraction. `天体` is allowed only in genuinely broader astronomical prose. Do not use `星球` here. Full form is compact enough. | Exact phrase and inclusive celestial-context evidence. |
| Star System | `目标星系`; `…这就是星系的名字`; `前往…星系` | `星系` | Use for the astronomical system. Do not expand to `恒星系统` or use it for a generic software system. Already compact. | Base-game and Free Lanes contexts agree. |
| X-Tech | `X技术`; contextual `…我称其为X技术…` | `X技术` | Preserve Latin `X`, official capitalization, and no inserted space. Do not substitute `X科技`, `X-Tech`, or `X 技术`. | Qualified resource name plus Free Lanes prose. |
| X-Tech Power Core | `X技术能量核心` in the item name and all five prose contexts | `X技术能量核心` | Preserve as one official name with no inserted space. Do not shorten to `能量核心` where the specific item is meant. | Free Lanes terminology evidence only; it does not create a runtime reference entity. |
| Outpost Management | `哨站管理` | `哨站管理` | Exact skill display name; no shortening. | Qualified `PERK` name. |
| Outpost Engineering | `哨站工程` | `哨站工程` | Exact skill display name; no shortening. | Qualified `PERK` name. |
| Planetary Habitation | `行星居住` | `行星居住` | Exact skill display name; do not editorially replace with a more idiomatic synonym. | Qualified `PERK` name. |
| Research Methods | `研究方法` | `研究方法` | Exact skill display name. | Qualified `PERK` name. |
| Special Projects | `特殊项目` | `特殊项目` | Exact skill display name. | Qualified `PERK` name. |
| Starfield game title | `星空` | `星空` for ordinary localized references to Bethesda's game | Preserve `Starfield` for the tracker's fixed product title, attribution, URLs, identifiers, filenames, and other explicitly invariant brand/technical contexts. | Exact official product-title value. |

Official reference names and evidence strings are literal data. Do not normalize their punctuation, ASCII spaces, hyphens, brackets, Roman numerals, abbreviations, or mixed Han/Latin spelling.

## Class 2 — Tracker-owned preferred terminology

| Concept | Preferred term | Intended tracker meaning and excluded senses | Surface and variant guidance |
|---|---|---|---|
| Planned Supply | `计划供应` | Unresolved intended future supply. It is not delivered stock, a procurement order, or current inventory. | Use as the feature heading. In explanatory prose, make the unresolved/future status explicit rather than implying completion. |
| Present | `存在` | The resource/product exists or can exist at the relevant outpost/body. Not “presenting”, attendance, or merely “current”. | Compact matrix heading: `存在`. `可用` is allowed where the sentence specifically describes availability. |
| Producing | `生产中` | Configured active production state; not throughput and not the broader manufacturing domain. | State: `生产中`; actions may use `开始生产` / `停止生产`. |
| Inputs | `所需材料` | Recipe/material requirements for manufacturing or organic production. Not form, text, or keyboard input. | `所需资源` is allowed where resources rather than materials are explicit. Avoid bare `输入`. |
| Logistics | `物流` | The item is actually configured on routed cargo/export logistics. Not transport generally or mere eligibility. | Compact heading: `物流`; prose should say `已接入物流` or equivalent when a state reading is needed. |
| Manufacturing | `制造` | Product fabrication/configuration area or domain, distinct from `生产中`. | Use for `matrix.manufacturing.*` and configuration surfaces. `生产` is not the default section term. |
| Validation | `检查` | Application checking and the resulting issue set. Not legal validation, approval, authorization, or permission. | Feature heading may be `检查`; issue-oriented prose may use `问题`. Avoid `批准` / `授权`. |
| Resource Matrix | `资源状态表` | The dense tracker table of resource states. | Prefer the full phrase. Avoid mathematical `资源矩阵`; no abbreviation is approved. |
| Reshuffle | `调整顺序` | Enter deliberate manual reordering mode. Never random shuffle. | Entry action: `调整顺序`; completion may be `完成排序`. |
| Lock | `锁定顺序` | Finish/prevent further ordering edits. Not account/security locking or permanent immutability. | Always scope `锁定` to the order. |
| Network | `哨站网络` | The player's collection of connected outposts. Not a computer network. | Use full form when context is not already explicit; compact contextual `网络` is allowed. |
| Active Production | `当前生产` | Selected/configured current production. Not theoretical capability or measured throughput. | Keep distinct from the per-item state `生产中`. |
| Source | `来源` | Directional origin for cargo, supply, or production. Not a citation/source document on logistics surfaces. | `来源哨站` is allowed when the endpoint needs to be explicit. Pair with `目的地`. |
| Destination | `目的地` | Directional cargo endpoint. Not an abstract purpose or goal. | Compact and full form are both `目的地`. Pair with `来源`. |
| Undo | `撤销` | Reverse the last history action. | Established software command; do not use generic “cancel”. |
| Redo | `重做` | Reapply an undone history action. | Established software command; not arbitrary repetition. |
| Inorganic | `无机` | Inorganic-resource class. | Use `无机资源` when the noun is needed; compact heading may be `无机`. No food/value-judgment sense. |
| Organic | `有机` | Flora/fauna-derived resource class. | Use `有机资源` when the noun is needed; compact heading may be `有机`. No food-label or value-judgment sense. |

Related tracker UI uses `导入 / 导出`, `错误`, `警告`, and `信息`. These are project terminology, not Bethesda evidence.

No tracker-owned proposal is marked **USER REVIEW REQUIRED** in this parcel. Sentence-level semantic review may still choose a documented contextual variant when the exact key role requires it.

## Class 3 — Context-sensitive concepts

| Concept | Review rule |
|---|---|
| Planet | Prefer `行星` for standalone selectors, technical labels, and compact UI. Official outpost-domain evidence uses `行星`; official narrative prose also uses `星球`. Permit `星球` in ordinary user-facing prose where a natural, non-technical reading is intended. Do not use `星球` for the technical selector. |
| Starfield title/brand | Use `星空` in ordinary localized references to Bethesda's game, including `about.description` and `validation.outpostNameLength`. Preserve `Starfield` in the fixed tracker/product/technical brand context `referenceFatal.report.subject`, and in URLs, identifiers, filenames, or attribution where English is intentional. Never replace mechanically in either direction. |
| Inter-System | Use `跨星系` as the modifier. Prefer full `跨星系货运链接` when naming the construct; use the shorter modifier only where “货运链接” is already supplied by the surface. |
| Moon | Prefer `卫星` for a generic natural satellite/body classification. Reserve `月球` for Earth's Moon and use `月亮` only in deliberately colloquial prose. No evidence supports either as a universal tracker body label. |
| Orbital | The evidence `正在进入轨道模式。` supports orbital prose, not a standalone body type. Use a key-specific phrase such as `轨道…` only after the later semantic context establishes its noun. No canonical standalone label is approved. |
| Biome | Selector/default: `生物群系`. The evidenced `生物群落` / `生态群落` forms may fit natural prose; `植物群落` is narrower and is allowed only when vegetation is actually meant. |
| Present | Heading/state `存在`; availability prose may use `可用`. Do not translate as “current”. |
| Producing | State `生产中`; start/stop actions use verbs; manufacturing-domain headings use `制造`. |
| Inputs | Prefer `所需材料` or `所需资源` by recipe context. Avoid the data-entry sense `输入`. |
| Reshuffle | Use manual-order wording (`调整顺序` / `完成排序`), never randomization (`随机`, `洗牌`). |
| Lock | Use `锁定顺序`; do not leave the object implicit where security locking could be inferred. |
| Source / Destination | Treat as the paired logistics endpoints `来源` / `目的地`; only evidence-document surfaces may use `来源` in the citation sense. |
| Inorganic / Organic | Compact headings may be `无机` / `有机`; prose or ambiguous surfaces should use `无机资源` / `有机资源`. |

## Editorial policy

### Punctuation and spacing

Tracker-authored prose uses normal Simplified Chinese punctuation such as `，` `。` `：` `；` and Chinese quotation/bracket conventions where natural. Do not insert spaces between ordinary Chinese lexical items. Normally do not insert spaces between Chinese and short Latin technical tokens. Add one only when a product convention, readability, or literal syntax requires it.

Preserve technical tokens exactly where required, including `JSON`, `FormID`, `X-Tech`, `HTTP`, `HTTPS`, file extensions, message keys, placeholders, IDs, shortcut key names, and code-like punctuation. This prose policy does not rewrite official Bethesda names or evidence strings.

### Mixed Han/Latin and capitalization

Preserve official mixed forms such as `X技术`, Roman numerals, ASCII hyphens, source brackets, abbreviations, and internal-looking values such as `_RL082Orbital` literally. Chinese has no case transformation. Preserve the official or technical capitalization of embedded Latin tokens and do not imitate English title case by changing them.

### Compact labels

`哨站`, `货运链接`, `跨星系货运链接`, `生物群系`, `行星体`, `星系`, `X技术`, and the skill names are already compact enough. `跨星系` is the only approved shortened construct label, and only when cargo-link context is explicit. Tracker headings may use `存在`, `物流`, `无机`, and `有机` as documented above. Do not invent abbreviations to fit geometry; clipping is a later runtime QA concern.

### Plural and count guidance

`Intl.PluralRules('zh-Hans')` exposes only `other`. The four structural plural keys must retain shared `one / other` syntax, with natural Chinese wording that will normally be identical in both visible branches:

- `cargo.pad.count`: normally count cargo links with `条`;
- `validation.issueCount`: normally count issues with `项`;
- `validation.plannedSupplyUnresolved`: normally count unresolved entries with `项`;
- `search.results.found`: normally count outposts/results with `个` or another noun-specific classifier.

This glossary does not finalize those complete semantic messages.

### Accidental-English and whole-fallback policy

There are no Simplified-Chinese-specific ordinary-English allowlist words. Shared invariant handling remains limited to reviewed technical/product tokens such as `JSON`, `FormID`, `Starfield`, `X-Tech`, `HTTP`, `HTTPS`, file extensions, shortcut key names, IDs, and placeholders. Ordinary source English remains a review failure even when adjacent to Han text. Ordinary prose must contain Han content after invariants are removed; intentionally technical-only keys remain context-sensitive exceptions.

## Evidence closure

The official artifact contains 37 rows in unchanged evidence order: 33 textual values, four intended absences, and zero unresolved identities. Values were decoded strictly as UTF-8 from the installed official tables for `Starfield.esm`, `ShatteredSpace.esm`, `SFBGS00D.esm`, and terminology-only `SFBGS050.esm`. The latter remains evidence-only and contributes no runtime reference entities.

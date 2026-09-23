# Resource Matrix Heading Editorial Review

## Audit record and recommendation

- Date: 23 September 2026.
- Branch: `staging`; no branch creation, commit, or push.
- Scope: all six Resource Matrix headings in all ten runtime locales.
- Deliverable: this report only. Runtime catalogues, CSS, components, tests,
  backlog, UX, and architecture documents are unchanged.
- Recommendation: **shared geometry first; no compact replacements approved**.
  Six Producing nouns remain editorial candidates. Spanish `Insumos` deserves
  targeted editorial review, but is not approved merely because it fits.

This conclusion does not classify the accepted translations as incorrect.
External evidence establishes professional vocabulary more readily than it
establishes the meaning of a particular on/off column. The distinction matters
because production configuration, production feasibility, and current material
availability are different facts in this application.

## Semantic contract and repository evidence

Item identifies any resource/product/item row, not just a raw material or a
manufactured product. Source identifies the origin or production route, not
just a vendor, planet, or ingredient. Present records existence/presence at the
body/outpost; it is neither a command nor purchasable availability. Producing
records configured production here, including extraction, harvesting, and
fabrication; it does not assert measured throughput or sufficient inputs.
Inputs lists materials required by production/farming, with availability
represented separately. Logistics represents actual configured routed
import/export state, not mere eligibility for transport.

Inspected the ten `src/localization/locales/` catalogues, all eight non-English
glossaries under `docs/localization/`, the locale-onboarding guidance,
`docs/UX-DESIGN.md`, the localization and Matrix architecture sections in
`docs/ARCHITECTURE.md`, `OutpostStatusMatrix.tsx` and its CSS, `ContextHelp.css`,
`src/index.css`, and `src/localization/compactDisplay.ts`.

The two preceding audits provide historical comparison:
[compact copy review](CROSS-LOCALE-COMPACT-COPY-AND-VISUAL-STATE-REVIEW.md) and
[layout capacity review](CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md).
Their suggested future compact resolver now exists; a later brief must reuse
the current resolver rather than recreate that historical proposal.
The Matrix still renders full catalogue keys directly.

The UI uses semantic column headers. Present, Producing, and Logistics include
help buttons. Production cells include both editable and derived states; this
is not uniformly a column of simple binary switches. Inputs has no header help
button. These facts limit how much omitted grammar surrounding controls can
reliably supply. Official reference names are outside this heading audit.

## Method and source quality

External research was conducted on the audit date using public national
statistics, government, industry-association, and enterprise documentation.
Queries covered production status, material requirements, components/BOM,
input-output tables, and logistics rather than just literal translations.
Every locale received an Inputs research pass; US/UK English share the English
concept review. Every proposed replacement has a source assessment below,
including explicitly insufficient evidence.

Evidence preference is: native professional table/UI usage; government or
industry definitions and reports; official software field documentation;
recognized dictionaries. A noun in a report title proves a vocabulary sense,
not an on/off heading convention. Search excerpts are distinguished from opened
documents. Publication dates are not inferred from search crawl dates. Older
documents available today are identified as older evidence, not new studies.

No DeepL or other translation-engine output was used. Microsoft Learn/SAP
localized results were discovered, but excluded as editorial authority because
translation provenance was not established; one SAP result explicitly described
machine translation. No candidate is approved from such material. Infor's
Italian field documentation is provisional contextual evidence only, because
the direct retrieval failed and editorial provenance was not independently
verified. No Wikipedia, forum, SEO translation site, or vocabulary aggregator
is used as authority.

### External evidence register

Each source's relevance is deliberately bounded; none independently certifies
the complete Matrix semantics.

| ID | Locale / source and type | Observed usage and relevance | Access / limit |
| --- | --- | --- | --- |
| EN | [ONS Supply and use tables](https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables), national statistics | Industry inputs and outputs in a production table family support contextual `Inputs`; they do not mean recipe requirements by themselves | Opened; English conceptual support for both regions |
| FR | [INSEE Enquête annuelle de production 2023](https://www.insee.fr/fr/metadonnees/source/fichier/2023_EAP1.pdf), government questionnaire, printed p. 4 | Defines intrants as material constituents needed to manufacture a product, with raw materials and components among the examples. Strong support for keeping `Intrants`; production is also an activity noun | Opened PDF; 2023 questionnaire, not a live on/off UI |
| DE | [Destatis production table 42131-0004](https://genesis.destatis.de/datenbank/online/statistic/42131/table/42131-0004), national data portal | `Produktion` describes production measures. Evidence for the noun, not for active configuration | Indexed table excerpt; direct page exposed only its app shell |
| DE-input | [Destatis material and energy flows](https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Umwelt/Materialfluesse-Energiefluesse/_inhalt.html), national statistics | Separates materials, raw materials, water and economic use; does not establish bare `Bedarf` as a required-materials heading | Search excerpt; insufficient replacement evidence |
| IT | [Infor Componente - Utilizzo](https://docs.infor.com/ln/2025.x/it-it/lnolh/tiolh/help/ti/mfc/timfc0530m000.html), industrial software field documentation | `Componente` is part of an assembly/product; production-model status is a separate field. BOM context supplies specificity absent from a generic heading | Detailed indexed excerpt; direct open failed; provisional, not approval authority |
| IT-input | [Italian-language statistical definitions, EUR-Lex](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A02006R1503-20090101), official statistical terminology | Production and raw-material inputs occur in industrial measurement context; does not establish a terse required-materials UI label | Search excerpt; historical statistical text, not legal guidance or state UI evidence |
| PL | [Comarch ERP XL production-plan examples](https://pomoc.comarch.pl/xl/index.php/dokumentacja/xl121-przyklady-wykorzystania-planu-produkcji-w-systemie-comarch-erp-xl/), Polish enterprise software | Production plan distinguishes material requirements and a materials section; production is a module/category as well as an activity. Supports contextual interpretation, not automatic state equivalence | Opened; section headings and explanatory workflow |
| PL-input | [Statistics Poland material-use definitions](https://raport.stat.gov.pl/forms.g01_3_3/help/G01definicje.htm), statistical reporting definitions | Material consumption is an observed quantity, illustrating why generic materials/consumption must not replace requirements | Search excerpt; no exact `Składniki` heading approval |
| PT | [Brazilian Ministry of Ports: product routes](https://www.gov.br/portos-e-aeroportos/pt-br/assuntos/noticias/2026/08/os-caminhos-que-os-produtos-percorrem-ate-chegar-ao-destino), government explanation | Connects production-enabling inputs, ports, destinations and logistics. Supports `Insumos` and `Logística`, while `Produção` remains an activity noun | Opened; August 2026 prose, not a binary dashboard |
| ES | [INE survey of intermediate consumption and investment](https://www.ine.es/dyngs/IOE/operacion.htm?id=1259944556487), Spanish national statistics | Uses `insumos` for inputs used by Spanish businesses in productive processes: evidence is Spain-specific, not assumed Latin-American usage | Indexed excerpt; direct open failed |
| ES-input | [INE costs by input type](https://www.ine.es/jaxi/Tabla.htm?file=03003.px&path=%2Ft35%2Fp011%2F2011%2Fl0%2F), statistical table | `tipo de insumo` is a professional table dimension; broader than required recipe materials | Search excerpt; supports a plausible candidate, not final UI approval |
| JA | [METI production-dynamics results](https://www.meti.go.jp/statistics/tyo/seidou/result-4.html), national statistics | Distinguishes production, shipments, and raw materials, supporting retention of an explicit requirement qualifier rather than generic materials | Search excerpt; direct open failed; no exact `必要素材` attestation claimed |
| ZH | [National Bureau of Statistics indicator definitions](https://www.stats.gov.cn/sj/pcsj/jjpc/1jp/html/indicator2.htm), government definitions | Inventories include raw materials, work in progress and finished goods; materials/inventory terms alone are broader than required recipe materials | Opened; historical definitions; no exact `所需材料` UI attestation claimed |
| EN-log | [CSCMP definitions](https://cscmp.org/CSCMP/Educate/SCM_Definitions_and_Glossary_of_Terms.aspx), professional association | Logistics includes planning, implementation and control of flows, including inbound/outbound movement. More comprehensive than shipping | Detailed indexed definition |
| FR-log | [Académie française: logistique](https://www.dictionnaire-academie.fr/article/A9L1144), recognized dictionary / terminology references | Established economic logistics term; supports retention, not a replacement | Search excerpt; secondary lexical support |
| DE-log | [BVL logistics definitions](https://www.bvl.de/service/zahlen-daten-fakten/logistikdefinitionen), professional association | Established logistics concept, broader than a transport operation | Search excerpt |
| IT-log | [Assologistica](https://www.assologistica.it/), Italian industry association | Established industry noun `Logistica`; organizational usage, not proof of configured-state wording | Search excerpt; limited lexical evidence |
| PL-log | [Statistics Poland transport tables](https://plwliczbach.stat.gov.pl/2025/PL/transport.html), national statistics | Transport and warehousing are sector/measurement headings; no evidence they improve the accepted logistics heading | Search excerpt; negative comparison, not direct `Logistyka` attestation |
| JA-log | [MLIT logistics policy](https://www.mlit.go.jp/seisakutokatsu/freight/butsuryu03100.html), government policy | Current professional use of `物流`; no reason to shorten the two-character term | Search excerpt |
| ZH-log | [Social logistics statistical survey](https://www.gov.cn/zhengce/zhengceku/2023-02/21/5742495/files/010eb1ca171e4eef952b4da790a01668.pdf), government statistical framework | Logistics includes transport, storage and distribution services; replacing it with transport narrows scope | Indexed PDF excerpt |

## Current labels and per-locale decisions

Current visible text is rendered uppercase in Latin locales by CSS. These are
catalogue strings, not newly authored replacements. `en-GB` inherits all six.

| Locale | Item | Source | Present | Producing | Inputs | Logistics |
| --- | --- | --- | --- | --- | --- | --- |
| en-US | Item | Source | Present | Producing | Inputs | Logistics |
| en-GB | Item | Source | Present | Producing | Inputs | Logistics |
| fr-FR | Élément | Source | Présence | En production | Intrants | Logistique |
| de-DE | Artikel | Quelle | Vorhanden | In Produktion | Einsatzstoffe | Logistik |
| it-IT | Oggetto | Origine | Presenza | In produzione | Materiali richiesti | Logistica |
| ja-JP | 項目 | 供給源 | 存在 | 生産中 | 必要素材 | 物流 |
| pl-PL | Pozycja | Źródło | Obecność | W produkcji | Wymagane materiały | Logistyka |
| pt-BR | Item | Origem | Presença | Em produção | Insumos | Logística |
| zh-Hans | 物品 | 来源 | 存在 | 生产中 | 所需材料 | 物流 |
| es-ES | Artículo | Origen | Presencia | En producción | Materiales de entrada | Logística |

A = keep; B = approved compact copy; C = geometry preferred; D = plausible
compact candidate needs editorial confirmation; E = more language evidence.
Cells classify the recommended immediate treatment. Candidate-specific D/E
dispositions remain in the register; C does not erase that research.

| Locale | Item | Source | Present | Producing | Inputs | Logistics |
| --- | --- | --- | --- | --- | --- | --- |
| en-US | A: broad item | A: origin | A: state | A: active form | A: recipe context, EN | A: EN-log + help |
| en-GB | A: inherited | A: inherited | A: inherited | A: inherited | A: EN | A: EN-log + help |
| fr-FR | A: broad element | A: origin | A: presence noun | C: full state; FR candidate D | A: FR required constituents | A: FR-log + glossary |
| de-DE | A: generic article | A: broad source | A: existence state | C: full state; DE candidate D | C: preserve substance meaning | A: DE-log + glossary |
| it-IT | A: generic object | A: origin | A: presence noun | C: full state; candidate D | C: retain required qualifier | A: IT-log + glossary |
| ja-JP | A: row item | A: supply origin | A: existence | A: explicit 中 state | A: explicit 必要 | A: JA-log + help |
| pl-PL | A: row entry | A: broad origin | A: presence noun | C: threshold; PL candidate D | C: explicit requirements | A: glossary; no narrower transport |
| pt-BR | A: generic item | A: origin | A: presence noun | C: threshold; PT candidate D | A: PT production inputs | A: PT + help |
| zh-Hans | A: broad item | A: origin | A: existence | A: explicit 中 state | A: explicit 所需 | A: ZH-log + help |
| es-ES | A: generic article | A: origin | A: presence noun | C: full state; candidate D | C: ES candidate D pending | A: glossary; no narrower shipping |

### Per-locale editorial reasoning

**English (US).** Item and Source cover all row classes; Present is a state in
this table. Producing already supplies the participial state meaning. Inputs is
terse but interpreted through recipe/farming row requirements, not arbitrary
data entry (EN). Logistics is conventional (EN-log), with configured routing
provided by the cells/help. All fit. No new English candidate is warranted.

**English (UK).** The same reasoning applies to the inherited six strings.
ONS provides region-specific Inputs evidence. There is no spelling or usage
reason here to introduce overrides just to distinguish the regional catalogue.

**French.** Élément remains broader than product/material, Source covers all
origins, and Présence naturally names the presence state without agreement
problems. INSEE is particularly strong evidence for keeping Intrants: the
required-material sense is explicit in its table explanation. Production is
natural as an activity heading, but removing En discards overt state grammar.
The controls help recover it, yet derived states make that recovery incomplete.
Keep En production with geometry until context-specific editorial confirmation.
Logistique is already compact and accepted; transport would narrow it.

**German.** Artikel is a generic item in this technical context, Quelle is not
restricted to a vendor, and Vorhanden explicitly marks existence. Produktion
is professional vocabulary, but the Destatis measure/category usage does not
prove it means configured here. It needs an editorial decision in the actual
table. Einsatzstoffe covers substances used in production; Bedarf instead means
need/demand and can suggest missing quantity or planning. Retain Einsatzstoffe
and provide sufficient width. Logistik is concise and broader than Transport.

**Italian.** Oggetto identifies the row object, Origine identifies provenance,
and Presenza works as a state noun. Produzione is a plausible activity heading,
but does not independently say production is configured. Infor separates
production-model status from its production terminology; this does not approve
the noun here. Materiali richiesti retains the crucial required qualifier.
Componenti suggests constituents of an assembled product and is less clearly
appropriate for farming consumables; it also exceeds narrow content capacity.
Logistica is already an ordinary compact professional term.

**Japanese.** 項目 is a table-entry label, not a restriction to raw resources.
供給源 denotes the supply origin and can include the local/organic/manufactured
route; it is not inherently a vendor label. 存在 is existential, not a display
command. 生産中 includes the state marker; dropping 中 for a bare activity noun
would remove useful information without solving any fit problem. 必要素材
explicitly marks required materials; METI's broader raw-material categories
give no reason to remove 必要. 物流 is concise but still relies on the Matrix
help/cells for the narrower configured-routing meaning. No hidden contradiction
was found; this is contextual review, not fresh native-speaker certification.

**Polish.** Pozycja is an entry, Źródło an origin, and Obecność a presence state;
the noun styles are coherent without forcing all headings into nouns. Comarch
uses production as a domain/category and materials in a production-plan section.
That stronger surrounding context is not interchangeable with this Matrix.
Produkcja needs confirmation that it means configured production rather than a
category. Wymagane materiały explicitly preserves requirements; Składniki could
mean ingredients/components and lacks enough exact mixed-row evidence. Keep
Logistyka; transport statistics offer no replacement for configured logistics.

**Portuguese (Brazil).** Item, Origem, and Presença remain broad and coherent.
Government usage supports Insumos as production-enabling inputs and Logística
as linked movements/operations. Neither needs shorter copy. Produção is a
natural activity noun, but Em supplies the explicit state relation. Retain it
until an editor confirms that both toggle and derived cells preserve the state
reading; its layout threshold is not an editorial reason to delete the word.

**Simplified Chinese.** 物品 is broad enough for row items; 来源 is origin rather
than supplier-only; 存在 conveys existence. 生产中 preserves ongoing/configured
state in context. 所需材料 explicitly retains required materials, unlike bare
materials, inventory or data input. NBS definitions demonstrate that generic
inventory encompasses many other categories. 物流 is established, but actual
configured routing must remain in help/cell semantics. All six fit; no compact
variant or forced grammatical symmetry is useful.

**Spanish (Spain).** Artículo, Origen, and Presencia are suitable generic
item/origin/presence headings. Producción is established in industrial/statistical
usage but denotes activity/output without En. Controls make a state inference
plausible, not certain. INE demonstrates that Insumos is used professionally in
Spain; it is not automatically an inappropriate regional borrowing. However,
input-type statistics are broader than required recipe materials. An editor
should assess ordinary users' interpretation in farming/manufacturing rows.
Until then retain Materiales de entrada and correct its three-line geometry.
Keep Logística with the existing routing explanation, not transport or shipping.

## Candidate register

Confidence describes suitability for implementation, not familiarity of the
word. D candidates require a focused product-language decision; E candidates
need stronger exact professional evidence before such a decision. None is B.
Literal meanings below are explanatory glosses, not translation-engine output.

| Locale / concept | Full current label | Candidate / literal meaning | External context | Context and semantic risk | Outcome / confidence / review |
| --- | --- | --- | --- | --- | --- |
| fr-FR Producing | En production | Production / production | FR production activity | Noun is natural, but not independently “currently producing here”; toggle helps, derived state less explicit | D, medium; editor must confirm state reading |
| de-DE Producing | In Produktion | Produktion / production | DE quantitative table | Category/output reading remains possible; toggle inference does not establish a German convention | D, medium; editor required |
| it-IT Producing | In produzione | Produzione / production | IT field context; IT-input industrial concepts | Noun names activity; missing In is not fully recovered by all cells | D, low; native/editor review required, stronger usage desirable |
| pl-PL Producing | W produkcji | Produkcja / production | PL module/plan context | Activity/category sense is documented; row controls may imply configuration but not on every row | D, medium; editor required |
| pt-BR Producing | Em produção | Produção / production | PT production-enabling input prose | Noun loses explicit Em state; plausible in a switch column but broader than this mixed state column | D, medium; editor required |
| es-ES Producing | En producción | Producción / production | ES productive-process context | Activity/output rather than independently configured here; derived controls do not settle omission | D, medium; editor required |
| de-DE Inputs | Einsatzstoffe | Bedarf / need, demand | DE-input does not attest the exact proposed label | Can suggest shortages, quantity or planning demand; item row does not supply material specificity | E, low; no implementation without stronger evidence and editor |
| it-IT Inputs | Materiali richiesti | Componenti / components | IT BOM field context | Assembly constituents narrower than farming inputs; “required” is only inferred from a BOM context absent on some rows | E, low; stronger mixed-domain evidence and editor required |
| pl-PL Inputs | Wymagane materiały | Składniki / ingredients, components | PL materials section; exact candidate evidence insufficient | Recipe reading plausible; required versus present constituents unresolved; no input-header help button | E, low; stronger exact heading evidence and native review |
| es-ES Inputs | Materiales de entrada | Insumos / production inputs | ES and ES-input, Spain-specific statistics | Strong vocabulary evidence; need to confirm required-material interpretation, not actual consumption or general factors | D, medium; Spain editorial confirmation required |

Bare Materiali, Materiały, Materiales, generic data-entry equivalents, and
transport/shipping substitutes are excluded from the candidate set because they
discard required distinctions. They are not suggested implementations awaiting
fit testing. Existing French Intrants and Brazilian Insumos are A, not new B
approvals. Their established glossary context does not automatically approve
the Spanish candidate.

## Layout measurements

### Runtime method

Fresh current-source Vite runtime, isolated localhost origin, one newly created
empty outpost, normal navigation/Cargo columns. Locale selected through the UI.
Measured at explicit CSS viewports 1366×768 and 1600×900 in the Codex in-app
Chromium browser on Windows. These are current-source development measurements,
not a newly rebuilt production bundle. No player data was imported or changed.
DOM Range line rectangles exclude the help wrapper/button rectangles. Values
are CSS pixels, rounded to 0.1; line-width lists also give the line count.

The runtime root is 18 px at these desktop widths; headings use 0.78 rem,
weight 600, uppercase, and 0.065 em tracking. Latin uses the configured Barlow
Semi Condensed stack, Japanese/Chinese their configured Windows CJK stacks.
Font portability remains a limitation; no claim is made about every fallback.

| Viewport | Item | Source | Present | Producing | Inputs | Logistics |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1366×768 column box | 135.0 | 108.0 | 108.0 | 126.0 | 85.0 | 130.5 |
| 1600×900 column box | 185.2 | 123.5 | 108.0 | 126.0 | 185.2 | 137.2 |

At 1366 cell padding totals 10.8 px; at 1600 it totals 18 px. Inputs therefore
has only **74.2 / 167.2 px text capacity**. Producing reserves a further 16.2 px
help control and 5.0 px gap, giving about **94.0 / 86.8 px text capacity**.
This container-query padding change explains the apparently reversed Polish
and Portuguese pressure at the wider viewport; it is not merely mysterious
subpixel instability. Portuguese full text is 89.3 px and Polish 87.3 px.

### Current rendered text and header height

Item, Source, Present and Logistics stay on one line at both sizes. Their text
widths are listed alongside Producing/Inputs, whose slash-separated values are
individual line widths. The paired values mean 1366 result → 1600 result.

| Locale | Item / Source / Present / Logistics widths | Producing lines | Inputs lines | Header height 1366 → 1600 |
| --- | --- | --- | --- | --- |
| en-US | 30.3 / 50.4 / 58.4 / 66.0 | 72.8 → 72.8 | 46.7 → 46.7 | 31.6 → 31.6 |
| en-GB | 30.3 / 50.4 / 58.4 / 66.0 | 72.8 → 72.8 | 46.7 → 46.7 | 31.6 → 31.6 |
| fr-FR | 59.2 / 50.4 / 66.8 / 74.6 | 17.3 / 81.0 → same | 64.4 → 64.4 | 56.8 → 56.8 |
| de-DE | 54.2 / 48.8 / 77.6 / 58.2 | 13.5 / 81.4 → same | 101.2 → 101.2 | 56.8 → 56.8 |
| it-IT | 58.0 / 51.3 / 66.6 / 66.5 | 13.5 / 80.4 → same | 67.3 / 62.8 → 133.8 | 56.8 → 56.8 |
| ja-JP | 29.9 / 44.9 / 29.9 / 29.9 | 44.9 → 44.9 | 59.8 → 59.8 | 31.6 → 31.6 |
| pl-PL | 57.6 / 50.4 / 67.8 / 71.0 | 87.3 → 11.8 / 71.9 | 72.4 / 72.1 → 148.2 | 56.8 → 56.8 |
| pt-BR | 30.3 / 47.6 / 67.2 / 66.5 | 89.3 → 17.8 / 67.8 | 56.7 → 56.7 | 31.6 → 56.8 |
| zh-Hans | 29.9 / 29.9 / 29.9 / 29.9 | 44.9 → 44.9 | 59.8 → 59.8 | 31.6 → 31.6 |
| es-ES | 63.0 / 47.1 / 71.6 / 66.5 | 17.3 / 81.3 → same | 79.2 / 16.7 / 59.6 → 162.9 | 82.9 → 56.8 |

All visible help-button boxes stayed inside their header cells. The flex gap
keeps visible text and button boxes separate; no claim is made that this proves
pointer-target or keyboard-focus non-overlap. `ContextHelp.css` expands the hit
area beyond the visible circle by 0.3 rem plus 1 px; future geometry must also
reserve that interaction envelope. German Inputs exceeds even its whole 85 px
column by 16.2 px and its content capacity by 27.0 px. Spanish Materiales alone
exceeds the 74.2 px content capacity, besides the three-line wrapping.

### Candidate fit probes

Separate ignored HTML fixture copied the actual heading/container/help markup
and imported current CSS. It reproduced the runtime table widths of 692.5 and
865 px at the two desktop viewports. Each candidate replaced only its own cell
in an otherwise English header. This is an **isolated geometry simulation**,
not a catalogue change or an end-to-end localized candidate implementation.
The normal runtime measurements above are separate. Candidate row height is
not a prediction that other full localized headings will also become one line.

| Candidate | Rendered width | Lines at 1366 / 1600 | Column width at 1366 / 1600 | Probe row height | Result |
| --- | ---: | --- | --- | ---: | --- |
| Production | 81.0 | 1 / 1 | 126 / 126 | 31.6 | Visible help gap 5.0 px at both |
| Produktion | 81.4 | 1 / 1 | 126 / 126 | 31.6 | Visible help gap 5.0 px at both |
| Produzione | 80.4 | 1 / 1 | 126 / 126 | 31.6 | Visible help gap 5.0 px at both |
| Produkcja | 76.0 | 1 / 1 | 126 / 126 | 31.6 | Visible help gap 5.0 px at both |
| Produção | 67.8 | 1 / 1 | 126 / 126 | 31.6 | Visible help gap 5.0 px at both |
| Producción | 81.3 | 1 / 1 | 126 / 126 | 31.6 | Visible help gap 5.0 px at both |
| Bedarf | 49.7 | 1 / 1 | 85 / 185.2 | 31.6 | Fits; semantics unresolved; no header help |
| Componenti | 82.4 | 1 / 1 | 85 / 185.2 | 31.6 | Exceeds 74.2 px narrow content area by 8.2 px despite one line |
| Składniki | 69.0 | 1 / 1 | 85 / 185.2 | 31.6 | Fits narrowly; semantics unresolved; no header help |
| Insumos | 56.7 | 1 / 1 | 85 / 185.2 | 31.6 | Fits; semantics/editorial choice unresolved; no header help |

### Zoom evidence boundary

Browser zoom shortcuts did not change the reported 1600×900 viewport or DPR 1;
no new true-200% result is claimed. Preserve the existing documented manual
Chinese true-200% evidence and previous cross-locale 683×384 reflow simulation.
That historical simulation reported 119 px page overflow and focus visibility
debt. It is not true browser zoom and is not a candidate fit approval. A new
683×384 override attempt did not establish a valid runtime measurement because
the active measurement fixture and runtime tab differed; its values are excluded.
True zoom and populated-row interaction remain later acceptance checks.

## Accessibility and full-label contract

No labels are approved for shortening now. If later approved, preserve these
exact current full column phrases rather than substituting the noun everywhere:

| Candidate | Full localized column name to retain |
| --- | --- |
| fr-FR Production | En production |
| de-DE Produktion | In Produktion |
| it-IT Produzione | In produzione |
| pl-PL Produkcja | W produkcji |
| pt-BR Produção | Em produção |
| es-ES Producción | En producción |
| de-DE Bedarf | Einsatzstoffe |
| it-IT Componenti | Materiali richiesti |
| pl-PL Składniki | Wymagane materiały |
| es-ES Insumos | Materiales de entrada |

The full localized explanatory help must continue to specify configuration at
this outpost, requirements rather than consumption, and actual routed logistics.
A short accepted full header is not itself the entire semantic explanation.
Preserve existing cell names/descriptions, state semantics, help contexts,
keyboard access and non-color cues. Keep the full catalogue key for accessible
column naming and help/tooltip contexts; use a compact resolver only for the
visible heading. Do not hide the help button from assistive technology or let
compact keys enter validation, history, prose, or reference data. Verify the
resulting column name without losing the separately accessible help action.
Inputs currently lacks a header help affordance; a later brief must explicitly
design equivalent full-meaning access if its compact wording needs explanation.
A native title alone is not sufficient for essential meaning.

## Geometry contract and later implementation sequence

1. Correct shared header geometry while keeping all full labels. Target a stable
   maximum of two text lines, ordinary wrapping, and independently reserved help
   and focus/hit-area space. Preserve semantic column order, sticky Item,
   row alignment, and existing horizontal-scroll behavior.
2. Give Inputs enough content width for its longest unbroken accepted token:
   at least the observed 101.2 px German token, plus font-metric tolerance and
   padding. At current padding this implies at least 112.0 px narrow / 119.2 px
   wide outer width before tolerance; these are measured lower bounds, not
   universal CSS constants. This also exceeds the Spanish 79.2 px first word
   and permits a two-line treatment for its full phrase. Validate column
   rebalance against Item/Source and state controls rather than stealing width
   without checking them.
3. Remove the dependence on a padding breakpoint that reduces usable Producing
   space as the viewport grows. Either deliberately allow two lines with stable
   help placement or budget for the full phrase plus the entire help envelope.
   Avoid arbitrary font shrinking, per-language widths, and one-off transforms.
4. Obtain targeted editorial judgments for the six Producing nouns and Spanish
   Insumos using populated extraction, farming, manufacturing, blocked-input,
   and derived-state examples. Do not make geometry wait for these judgments.
   Bedarf, Componenti and Składniki require stronger evidence first.
5. Only if a candidate is approved, extend the existing compact-display registry
   narrowly and preserve full names/help as above. Recheck all ten locales at
   both desktop widths, breakpoint boundaries, true 200% zoom, keyboard/help
   interactions, and supported font fallbacks. Add relevant regression checks
   in that implementation batch, not in this audit.

Immediate geometry pairs: Producing in fr-FR, de-DE, it-IT, pl-PL, pt-BR and
es-ES; Inputs in de-DE, it-IT, pl-PL and es-ES. All other pairs retain current
copy. There are **zero approved compact pairs**, so no compact-copy
implementation is authorized by this report alone.

## Limitations and verification

- Professional activity nouns do not establish native interpretation of this
  exact mixed-control table. D is a specific unresolved state-reading decision,
  not a blanket requirement for native sign-off on all retained vocabulary.
- Some external evidence is available only through indexed excerpts; failed
  direct retrieval and weaker provenance are recorded. No exact heading usage
  is inferred where the source only offers prose or a different table context.
- The live fixture contained an empty outpost: it establishes content-independent
  header geometry, not comprehension across populated rows or full assistive-
  technology interaction. No new Narrator, forced-colors, WebKit or true-zoom
  certification is claimed.
- Candidate probes establish fit only. They do not modify or validate a complete
  localized candidate Matrix. Stop adoption if state/requirements/routing meaning
  is lost, evidence conflicts, or wording becomes cryptic.
- Initial status contained the user's untracked implementation brief. It is
  preserved. This report is the only added deliverable; the measurement fixture
  is ignored local scratch, not a tracked runtime change.
- `git diff --check` was run at handoff; the added report was also checked with
  `git diff --no-index --check` because ordinary diff omits untracked files.
  No build/test suite was run: the brief explicitly exempts this report-only
  audit. No localization/runtime source, test, or other durable document changed.

Suggested commit message: `docs: audit Resource Matrix headings`.

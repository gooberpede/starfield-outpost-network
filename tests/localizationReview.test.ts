import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { enUSMessages } from '../src/localization/locales/en-US.ts'
import { deDEMessages } from '../src/localization/locales/de-DE.ts'
import { esESMessages } from '../src/localization/locales/es-ES.ts'
import { frFRMessages } from '../src/localization/locales/fr-FR.ts'
import { itITMessages } from '../src/localization/locales/it-IT.ts'
import { jaJPMessages } from '../src/localization/locales/ja-JP.ts'
import { plPLMessages } from '../src/localization/locales/pl-PL.ts'
import { ptBRMessages } from '../src/localization/locales/pt-BR.ts'
import {
  accidentalEnglishResidueOf, comparisonStatus, createReviewCsv, createReviewRows, englishSourceSha256, hasValidPluralSyntax,
  createReviewXliff, finalCatalogueFromReview, importReviewXliff,
  parametersOf, parseAndValidateReviewCsv, protectedTokensOf, serializeReviewRows,
} from '../src/localization/reviewPackage.ts'
import { deDEReviewDraft } from '../src/localization/reviewDrafts/de-DE.ts'
import { esESReviewDraft } from '../src/localization/reviewDrafts/es-ES.ts'
import { frFRReviewDraft } from '../src/localization/reviewDrafts/fr-FR.ts'
import { itITReviewDraft } from '../src/localization/reviewDrafts/it-IT.ts'
import { plPLReviewDraft } from '../src/localization/reviewDrafts/pl-PL.ts'
import { ptBRReviewDraft } from '../src/localization/reviewDrafts/pt-BR.ts'
import { adjudicateReviewRows } from '../src/localization/reviewAdjudication.ts'
import { supportedLocaleIds } from '../src/localization/types.ts'
import { reviewRouteForLocale } from '../scripts/localization/review-routing.ts'

function validateCodexTranslation(key: keyof typeof enUSMessages, translation: string): void {
  const rows = createReviewRows('de-DE').map((row) => row.Key === key
    ? { ...row, CodexTranslation: translation }
    : row)
  parseAndValidateReviewCsv(serializeReviewRows(rows), 'de-DE')
}

function validateSimplifiedChineseTranslation(key: keyof typeof enUSMessages, translation: string): void {
  const rows = createReviewRows('zh-Hans').map((row) => row.Key === key
    ? { ...row, CodexTranslation: translation }
    : row)
  parseAndValidateReviewCsv(serializeReviewRows(rows), 'zh-Hans')
}

test('review rows are deterministic, locale-specific, and hash exact English sources', () => {
  const first = createReviewCsv('fr-FR')
  assert.equal(first, createReviewCsv('fr-FR'))
  const rows = parseAndValidateReviewCsv(first, 'fr-FR')
  assert.deepEqual(rows.map(({ Key }) => Key), rows.map(({ Key }) => Key).sort())
  for (const row of rows) {
    assert.equal(row.Locale, 'fr-FR')
    assert.equal(row.EnglishSourceSha256, englishSourceSha256(enUSMessages[row.Key]))
  }
})

test('new runtime locales retain independent review-draft routes', () => {
  for (const locale of ['es-ES', 'it-IT', 'pt-BR']) {
    const route = reviewRouteForLocale(locale)
    assert.equal(route.locale, locale)
    assert.equal(route.source.createXliff, true)
    assert.equal(Object.keys(route.source.translations).length, Object.keys(enUSMessages).length)
    assert.ok(supportedLocaleIds.includes(locale as typeof supportedLocaleIds[number]))
    const rows = createReviewRows(locale)
    assert.equal(rows.length, Object.keys(enUSMessages).length)
    assert.ok(rows.filter((row) => row.OfficialTermConstraints).length > 100)
  }
  assert.throws(() => reviewRouteForLocale('xx-XX'), /UNSUPPORTED_LOCALE/)
  const polishRoute = reviewRouteForLocale('pl-PL')
  assert.equal(polishRoute.locale, 'pl-PL')
  assert.equal(polishRoute.source.createXliff, true)
  assert.equal(polishRoute.source.translations, plPLReviewDraft)
  assert.equal(supportedLocaleIds.includes('pl-PL'), true)
})

test('French and German Codex drafts are complete and token-safe', () => {
  for (const [locale, draft] of [['fr-FR', frFRReviewDraft], ['de-DE', deDEReviewDraft]] as const) {
    const rows = parseAndValidateReviewCsv(createReviewCsv(locale, draft), locale)
    assert.equal(rows.length, Object.keys(enUSMessages).length)
    assert.ok(rows.every((row) => row.CodexTranslation))
    assert.ok(rows.filter((row) => row.Risk === 'HIGH').length > 100)
    assert.ok(rows.filter((row) => row.OfficialTermConstraints).length > 100)
  }
})

test('Spanish, Italian, and Brazilian Portuguese Codex drafts are complete and token-safe', () => {
  const invariantKeys = new Set([
    'about.attribution', 'cargo.destination.linkedLocator', 'cargo.destination.padContents',
    'history.benchmark', 'matrix.action.toggle', 'matrix.column.item', 'outpost.solar.label',
    'power.label.normal', 'power.label.unknown', 'power.quality.normal', 'power.tooltip.unknown',
    'validation.context.separator', 'validation.severity.error',
  ])
  for (const [locale, draft] of [
    ['es-ES', esESReviewDraft], ['it-IT', itITReviewDraft], ['pt-BR', ptBRReviewDraft],
  ] as const) {
    const rows = parseAndValidateReviewCsv(createReviewCsv(locale, draft), locale)
    assert.equal(rows.length, Object.keys(enUSMessages).length)
    assert.ok(rows.every((row) => row.CodexTranslation.trim()), locale)
    assert.ok(rows.every((row) => !row.DeepLTranslation && row.ComparisonStatus === 'MISSING'), locale)
    assert.ok(rows.every((row) => !row.AdjudicationDecision && !row.FinalTranslation && !row.ReviewerNote), locale)
    assert.ok(rows.filter((row) => row.Risk === 'HIGH').length > 100)
    assert.ok(rows.filter((row) => row.OfficialTermConstraints).length > 100)
    assert.ok(rows.filter((row) => row.CodexTranslation === row.EnglishSource)
      .every((row) => invariantKeys.has(row.Key)), locale)
  }
  assert.match(ptBRReviewDraft['matrix.tooltip.xTech.add'], /Tec-X/)
  assert.doesNotMatch(ptBRReviewDraft['matrix.tooltip.xTech.add'], /X-Tech/)
})

test('staged draft English-residue detection reports ordinary source words and exempts invariants', () => {
  assert.deepEqual(
    accidentalEnglishResidueOf('Finish reshuffling cargo links', 'Finish reordenación de enlaces de cargamento', 'es-ES'),
    ['finish'],
  )
  assert.deepEqual(
    accidentalEnglishResidueOf('Export all networks to JSON', 'Exportar all networks a JSON', 'es-ES'),
    ['all', 'networks'],
  )
  assert.deepEqual(accidentalEnglishResidueOf('Add cargo link ({count} of {limit})',
    'Añadir enlace de cargamento ({count} of {limit})', 'es-ES'), ['of'])
  assert.deepEqual(
    accidentalEnglishResidueOf('Starfield JSON FormID He-3 Ctrl Esc Shift ID X-Tech',
      'Starfield JSON FormID He-3 Ctrl Esc Shift ID X-Tech', 'it-IT'),
    [],
  )
  assert.deepEqual(accidentalEnglishResidueOf('{item}: normal', '{item}: normal', 'pt-BR'), [])
  assert.deepEqual(accidentalEnglishResidueOf('HTTP status and flora source', 'Status HTTP e origem da flora', 'pt-BR'), [])
  assert.deepEqual(accidentalEnglishResidueOf('Manifest schema version', 'Versione dello schema del manifesto', 'it-IT'), [])
  assert.deepEqual(
    accidentalEnglishResidueOf('Finish reshuffling cargo links', 'Finish zmianę kolejności połączeń', 'pl-PL'),
    ['finish'],
  )
  assert.deepEqual(
    accidentalEnglishResidueOf('Network status in the Starfield system', 'Status sieci w systemie Starfield', 'pl-PL'),
    [],
  )
  assert.deepEqual(
    accidentalEnglishResidueOf('Export all networks to JSON', 'Eksportuj all networks do JSON', 'pl-PL'),
    ['all', 'networks'],
  )
})

test('Simplified Chinese residue checks catch copied English across Han boundaries and preserve invariants', () => {
  for (const translation of [
    'Validation status',
    '验证 Validation status',
    '资源Validation状态',
    '资源Validation状态检查',
  ]) {
    assert.ok(accidentalEnglishResidueOf('Validation status', translation, 'zh-Hans').includes('validation'))
  }
  assert.deepEqual(
    accidentalEnglishResidueOf(
      'Starfield JSON FormID X-Tech HTTP HTTPS Ctrl Alt Shift config.json',
      '合法中文Starfield JSON FormID X-Tech HTTP HTTPS Ctrl Alt Shift config.json文本',
      'zh-Hans',
    ),
    [],
  )
  assert.throws(
    () => createReviewRows('zh-Hans', { 'about.closeDialog': 'Close About dialog' }),
    /REVIEW_ACCIDENTAL_ENGLISH: zh-Hans:about\.closeDialog: about, close, dialog/,
  )
  assert.throws(
    () => createReviewRows('zh-Hans', { 'about.closeDialog': 'Texto' }),
    /REVIEW_CHINESE_PROSE_MISSING: zh-Hans:about\.closeDialog/,
  )
  assert.doesNotThrow(() => createReviewRows('zh-Hans', { 'about.closeDialog': '关闭“关于”对话框' }))
})

test('Simplified Chinese staging keeps review routing explicit before glossary values exist', () => {
  assert.throws(
    () => reviewRouteForLocale('zh-Hans'),
    /REVIEW_DRAFT_MISSING: zh-Hans requires an independent draft at src\/localization\/reviewDrafts\/zh-Hans\.ts\. Staged locale onboarding is incomplete\./,
  )
  assert.ok(createReviewRows('zh-Hans').every(({ OfficialTermConstraints }) => !OfficialTermConstraints))
})

test('Simplified Chinese plural and placeholder contracts preserve shared structure', () => {
  assert.deepEqual([0, 1, 2, 10].map((count) => new Intl.PluralRules('zh-Hans').select(count)), [
    'other', 'other', 'other', 'other',
  ])
  const neutral = '{count}: {count, plural, one {货运链接} other {货运链接}}'
  assert.equal(hasValidPluralSyntax(neutral), true)
  assert.equal(parametersOf(neutral).includes('count'), true)
  assert.equal(hasValidPluralSyntax('{count, plural, one {一个} other {多个} few {少量}}'), false)

  for (const placeholder of [
    'item', 'resource', 'product', 'outpost', 'system', 'body', 'skill', 'name', 'previousName',
    'count', 'itemList', 'contents', 'destination',
  ]) {
    assert.deepEqual(parametersOf(`中文{${placeholder}}文本`), [placeholder])
  }

  for (const [key, translation] of [
    ['common.removeItem', '移除 {item}'],
    ['history.addLocalResource', '将本地资源 {resource} 添加到 {outpost}'],
    ['validation.manufacturingInputUnavailable', '{product} 需要 {input}'],
    ['history.changeSystem', '将 {outpost} 的星系更改为 {system}'],
    ['history.changeBody', '将 {outpost} 的天体更改为 {body}'],
    ['history.clearSkill', '清除 {skill}'],
    ['history.renameOutpost', '将哨站 {previousName} 重命名为 {name}'],
    ['cargo.destination.padContentsLinked', '{pad}：({contents}) — 已链接至 {destination}'],
    ['validation.plannedSupplyUnresolved',
      '{count} {count, plural, one {计划供应中的项目} other {计划供应中的项目}}：{itemList}。'],
  ] as const) assert.doesNotThrow(() => validateSimplifiedChineseTranslation(key, translation), key)

  assert.throws(() => validateSimplifiedChineseTranslation('common.removeItem', '移除项目'), /REVIEW_INVALID_PLACEHOLDERS/)
  assert.throws(() => validateSimplifiedChineseTranslation('common.removeItem', '移除 {物品}'), /REVIEW_INVALID_PLACEHOLDERS/)
  assert.throws(() => validateSimplifiedChineseTranslation('common.removeItem', '移除 {item} {unknown}'), /REVIEW_INVALID_PLACEHOLDERS/)
  assert.throws(() => validateSimplifiedChineseTranslation(
    'cargo.pad.count',
    '{count} {count, plural, one {货运链接} few {货运链接} other {货运链接}}',
  ), /REVIEW_INVALID_PLURAL_SYNTAX/)
  assert.throws(() => validateSimplifiedChineseTranslation('transfer.export.tooltip', '导出所有网络到 Json'),
    /REVIEW_INVALID_PROTECTED_TOKEN/)
})

test('Simplified Chinese DeepL quality failures remain evidence but cannot become final text', () => {
  const review = createReviewCsv('zh-Hans')
  const xliff = createReviewXliff(createReviewRows('zh-Hans'), 'zh-Hans')
  const sourceAsTarget = xliff.replace(/<target state="new"><\/target>/g, (_target, offset: number) => {
    const unitStart = xliff.lastIndexOf('<trans-unit', offset)
    const unitEnd = xliff.indexOf('</trans-unit>', offset)
    const source = xliff.slice(unitStart, unitEnd).match(/<source>([\s\S]*?)<\/source>/)?.[1] ?? ''
    return `<target state="translated">${source}</target>`
  })
  const withMissingChineseProse = sourceAsTarget.replace(
    /(<trans-unit id="about\.closeDialog"[\s\S]*?<target[^>]*>)[\s\S]*?(<\/target>)/,
    '$1Texto$2',
  )
  const importedSource = importReviewXliff(review, withMissingChineseProse, 'zh-Hans')
  const imported = parseAndValidateReviewCsv(importedSource, 'zh-Hans')
  assert.equal(imported.find(({ Key }) => Key === 'validation.heading')?.DeepLTranslation, 'Validation')
  assert.equal(imported.find(({ Key }) => Key === 'about.closeDialog')?.DeepLTranslation, 'Texto')

  const approveDeepL = (key: keyof typeof enUSMessages) => serializeReviewRows(imported.map((row) => row.Key === key
    ? {
        ...row,
        AdjudicationDecision: 'DEEPL' as const,
        FinalTranslation: row.DeepLTranslation,
        ReviewerNote: 'The machine candidate is retained as evidence but must satisfy final Chinese quality validation.',
      }
    : row))
  assert.throws(() => parseAndValidateReviewCsv(approveDeepL('validation.heading'), 'zh-Hans'),
    /REVIEW_ACCIDENTAL_ENGLISH/)
  assert.throws(() => parseAndValidateReviewCsv(approveDeepL('about.closeDialog'), 'zh-Hans'),
    /REVIEW_CHINESE_PROSE_MISSING/)
})

test('Polish constraints can be generated independently of a supplied semantic draft', () => {
  const rows = createReviewRows('pl-PL')
  assert.ok(rows.some(({ OfficialTermConstraints }) => OfficialTermConstraints))
  assert.ok(rows.every(({ CodexTranslation }) => CodexTranslation === ''))
})

test('Polish plural contract documents native categories while preserving one/other syntax', () => {
  const counts = [1, 2, 5, 12, 22, 25]
  assert.deepEqual(counts.map((count) => new Intl.PluralRules('pl-PL').select(count)), [
    'one', 'few', 'many', 'many', 'few', 'many',
  ])
  const neutral = '{count}: {count, plural, one {liczba połączeń} other {liczba połączeń}}'
  assert.equal(hasValidPluralSyntax(neutral), true)
  assert.doesNotThrow(() => validateCodexTranslation('cargo.pad.count', neutral))
  assert.throws(() => validateCodexTranslation(
    'cargo.pad.count',
    '{count, plural, one {Liczba połączeń: {count}} other {Liczba połączeń: {count}}}',
  ), /REVIEW_INVALID_PLURAL_SYNTAX/)
  assert.equal(hasValidPluralSyntax('{count, plural, one {jeden} few {kilka} many {wiele} other {inne}}'), false)
  assert.throws(() => validateCodexTranslation(
    'cargo.pad.count',
    '{count} {count, plural, one {jedno} few {kilka} many {wiele} other {inne}}',
  ), /REVIEW_INVALID_PLURAL_SYNTAX/)
})

test('Polish onboarding placeholder-risk families preserve required structural tokens', () => {
  for (const [key, translation] of [
    ['common.removeItem', '{item}'],
    ['history.addLocalResource', '{resource} — {outpost}'],
    ['validation.manufacturingInputUnavailable', '{product} — {input}'],
    ['history.changeSystem', '{outpost} — {system}'],
    ['history.changeBody', '{outpost} — {body}'],
    ['history.clearSkill', '{skill}'],
    ['history.renameOutpost', '{previousName} — {name}'],
  ] as const) assert.doesNotThrow(() => validateCodexTranslation(key, translation), key)

  assert.throws(
    () => validateCodexTranslation('history.addLocalResource', '{outpost}'),
    /REVIEW_INVALID_PLACEHOLDERS/,
  )
  assert.throws(
    () => validateCodexTranslation('validation.manufacturingInputUnavailable', '{produkt} — {input}'),
    /REVIEW_INVALID_PLACEHOLDERS/,
  )
  assert.doesNotThrow(() => validateCodexTranslation(
    'history.addLocalResource', '{resource} — {outpost} — {outpost}',
  ))
  assert.throws(
    () => validateCodexTranslation('transfer.export.tooltip', 'Eksportuj wszystkie sieci do Json'),
    /REVIEW_INVALID_PROTECTED_TOKEN/,
  )
  assert.throws(() => validateCodexTranslation(
    'cargo.pad.count', '{count} {count, plural, one {pozycja} other {pozycje}',
  ), /REVIEW_INVALID_PLURAL_SYNTAX/)
})

test('French and German review constraints cover every applicable approved glossary concept', () => {
  const expectedConstraintIds = [
    'glossary.active-production', 'glossary.destination', 'glossary.file-import-export',
    'glossary.inorganic', 'glossary.inputs', 'glossary.lock-order', 'glossary.logistics',
    'glossary.manufacturing', 'glossary.network', 'glossary.organic', 'glossary.planned-supply',
    'glossary.present', 'glossary.producing', 'glossary.reshuffle', 'glossary.resource-matrix',
    'glossary.source', 'glossary.undo-redo', 'glossary.validation',
    'glossary.validation-error', 'glossary.validation-info', 'glossary.validation-warning',
    'product.starfield', 'skill.outpost-engineering', 'skill.outpost-management',
    'skill.planetary-habitation', 'skill.research-methods', 'skill.special-projects',
    'term.biome', 'term.cargo-link', 'term.inter-system-cargo-link', 'term.outpost',
    'term.planet', 'term.planetary-body', 'term.star-system', 'term.x-tech',
    'term.x-tech-power-core',
  ]
  for (const [locale, draft] of [['fr-FR', frFRReviewDraft], ['de-DE', deDEReviewDraft]] as const) {
    const rows = createReviewRows(locale, draft)
    const byKey = new Map(rows.map((row) => [row.Key, row]))
    const constraintIds = new Set(rows.flatMap(({ OfficialTermConstraints }) =>
      OfficialTermConstraints.split('; ').filter(Boolean).map((constraint) => constraint.split('=')[0])))
    assert.deepEqual([...constraintIds].sort(), expectedConstraintIds)

    assert.match(byKey.get('outpost.body.select')!.OfficialTermConstraints, /term\.planetary-body=/)
    assert.match(byKey.get('validation.selectedBiomeInvalid')!.OfficialTermConstraints, /term\.planetary-body=/)
    assert.match(byKey.get('validation.filter.info')!.OfficialTermConstraints, /glossary\.validation-info=/)
    assert.match(byKey.get('matrix.column.source')!.OfficialTermConstraints, /glossary\.source=/)
    assert.match(byKey.get('outpost.navigation.lockOrder')!.OfficialTermConstraints, /glossary\.lock-order=/)

    assert.doesNotMatch(byKey.get('referenceFatal.report.body')!.OfficialTermConstraints, /planetary-body/)
    assert.doesNotMatch(byKey.get('power.tooltip.unknown')!.OfficialTermConstraints, /glossary\.source/)
    assert.doesNotMatch(byKey.get('cargo.exports.heading')!.OfficialTermConstraints, /file-import-export/)
    assert.doesNotMatch(byKey.get('matrix.state.active')!.OfficialTermConstraints, /active-production/)
    assert.match(byKey.get('help.organic.availablePlanet')!.OfficialTermConstraints, /term\.planet=/)
    assert.doesNotMatch(byKey.get('help.organic.availablePlanet')!.OfficialTermConstraints, /term\.planetary-body=/)
  }
})

test('Spanish, Italian, and Brazilian Portuguese constraints cover every concept and express contextual strategies', () => {
  const expectedConstraintIds = [
    'glossary.active-production', 'glossary.destination', 'glossary.file-import-export',
    'glossary.inorganic', 'glossary.inputs', 'glossary.lock-order', 'glossary.logistics',
    'glossary.manufacturing', 'glossary.network', 'glossary.organic', 'glossary.planned-supply',
    'glossary.present', 'glossary.producing', 'glossary.reshuffle', 'glossary.resource-matrix',
    'glossary.source', 'glossary.undo-redo', 'glossary.validation',
    'glossary.validation-error', 'glossary.validation-info', 'glossary.validation-warning',
    'product.starfield', 'skill.outpost-engineering', 'skill.outpost-management',
    'skill.planetary-habitation', 'skill.research-methods', 'skill.special-projects',
    'term.biome', 'term.cargo-link', 'term.inter-system-cargo-link', 'term.outpost',
    'term.planet', 'term.planetary-body', 'term.star-system', 'term.x-tech',
    'term.x-tech-power-core',
  ]
  for (const locale of ['es-ES', 'it-IT', 'pt-BR']) {
    const rows = createReviewRows(locale)
    const byKey = new Map(rows.map((row) => [row.Key, row]))
    const constraintIds = new Set(rows.flatMap(({ OfficialTermConstraints }) =>
      OfficialTermConstraints.split('; ').filter(Boolean).map((constraint) => constraint.split('=')[0])))
    assert.deepEqual([...constraintIds].sort(), expectedConstraintIds, locale)
    assert.match(byKey.get('matrix.column.present')!.OfficialTermConstraints, /strategy=key-scoped.*variants=/)
    assert.match(byKey.get('matrix.column.inputs')!.OfficialTermConstraints, /strategy=semantic-concept.*variants=/)
    assert.match(byKey.get('outpost.body.select')!.OfficialTermConstraints, /term\.planetary-body=.*strategy=semantic-concept/)
    assert.match(byKey.get('outpost.navigation.reshuffleButton')!.OfficialTermConstraints, /strategy=key-scoped/)
    assert.match(byKey.get('matrix.heading')!.OfficialTermConstraints, /strategy=phrase/)
  }
  assert.throws(() => createReviewRows('xx-XX'), /REVIEW_CONSTRAINTS_MISSING/)
})

test('Polish review constraints are complete, contextual, deterministic, and fail closed', async () => {
  const rows = createReviewRows('pl-PL')
  assert.deepEqual(rows, createReviewRows('pl-PL'))
  assert.ok(rows.some(({ OfficialTermConstraints }) => OfficialTermConstraints))
  assert.throws(() => createReviewRows('pl'), /REVIEW_CONSTRAINTS_MISSING/)

  const byKey = new Map(rows.map((row) => [row.Key, row]))
  assert.match(byKey.get('character.skill.outpostManagement')!.OfficialTermConstraints, /Zarządzanie placówką \[strategy=phrase\]/)
  assert.match(byKey.get('cargo.heading')!.OfficialTermConstraints, /Połączenie towarowe \[strategy=semantic-concept\]/)
  assert.match(byKey.get('matrix.heading')!.OfficialTermConstraints, /Macierz zasobów \[strategy=phrase\]/)
  assert.match(byKey.get('matrix.column.present')!.OfficialTermConstraints, /Obecność \[strategy=key-scoped, variants=/)
  assert.match(byKey.get('matrix.column.inputs')!.OfficialTermConstraints, /Wymagane materiały \[strategy=semantic-concept, variants=/)
  assert.match(byKey.get('outpost.navigation.reshuffleButton')!.OfficialTermConstraints, /Zmień kolejność \[strategy=key-scoped, variants=/)
  assert.match(byKey.get('outpost.body.select')!.OfficialTermConstraints, /Ciało planetarne \[strategy=semantic-concept\]/)
  assert.match(byKey.get('outpost.system.label')!.OfficialTermConstraints, /Układ gwiezdny.*variants=układ gwiezdny \| układ/)
  assert.match(byKey.get('about.description')!.OfficialTermConstraints, /product\.starfield=Starfield \[strategy=phrase\]/)
  assert.doesNotMatch(byKey.get('about.description')!.OfficialTermConstraints, /W gwiazdy/)

  const xTechRows = rows.filter(({ OfficialTermConstraints }) => OfficialTermConstraints.includes('term.x-tech='))
  assert.ok(xTechRows.length > 0)
  assert.ok(xTechRows.every(({ OfficialTermConstraints }) =>
    /strategy=semantic-concept, variants=X-Tech \| X-Techem \| X-Techu/.test(OfficialTermConstraints)))

  const glossary = await readFile(new URL('../docs/localization/POLISH-GLOSSARY.md', import.meta.url), 'utf8')
  const classifiedIds = [...glossary.matchAll(/^\| `((?:term|skill)\.[^`]+)` \| ([ABCD]) \|/gm)]
  assert.equal(classifiedIds.length, 19)
  assert.equal(new Set(classifiedIds.map((match) => match[1])).size, 19)
  assert.match(glossary, /\*\*`ciało planetarne`\*\*/)
  assert.match(glossary, /`Starfield` is invariant/)
})

test('Polish draft and frozen DeepL handoff source remain complete, safe, and deterministic', async () => {
  const englishKeys = Object.keys(enUSMessages).sort()
  assert.deepEqual(Object.keys(plPLReviewDraft).sort(), englishKeys)

  const rows = createReviewRows('pl-PL', plPLReviewDraft)
  assert.equal(rows.length, englishKeys.length)
  for (const row of rows) {
    assert.match(row.CodexTranslation, /\S/, row.Key)
    assert.deepEqual(parametersOf(row.CodexTranslation), parametersOf(row.EnglishSource), `${row.Key}:parameters`)
    assert.equal(hasValidPluralSyntax(row.CodexTranslation), true, `${row.Key}:plural`)
    assert.deepEqual(accidentalEnglishResidueOf(row.EnglishSource, row.CodexTranslation, 'pl-PL'), [], `${row.Key}:English residue`)
    for (const token of protectedTokensOf(row.EnglishSource)) {
      assert.ok(row.CodexTranslation.includes(token), `${row.Key}:${token}`)
    }
  }
  assert.ok(rows.filter(({ OfficialTermConstraints }) => OfficialTermConstraints).length > 100)
  assert.deepEqual([
    plPLReviewDraft['character.skill.outpostManagement'],
    plPLReviewDraft['character.skill.outpostEngineering'],
    plPLReviewDraft['character.skill.planetaryHabitation'],
    plPLReviewDraft['character.skill.researchMethods'],
    plPLReviewDraft['character.skill.specialProjects'],
  ], ['Zarządzanie placówką', 'Inżynieria placówek', 'Zasiedlanie planet', 'Metody badawcze', 'Projekty specjalne'])
  assert.equal(plPLReviewDraft['cargo.interstellar'], 'Międzyukładowe połączenie towarowe')
  assert.equal(plPLReviewDraft['cargo.pad.linkType.standard'], 'Standardowe połączenie towarowe')
  assert.equal(plPLReviewDraft['outpost.body.label'], 'Ciało planetarne')
  assert.match(plPLReviewDraft['matrix.tooltip.xTech.add'], /rdzenie mocy X-Techu/)
  assert.ok(Object.values(plPLReviewDraft).every((value) => !value.includes('W gwiazdy')))

  assert.equal(plPLReviewDraft['plannedSupply.heading'], 'Planowane zaopatrzenie')
  assert.equal(plPLReviewDraft['matrix.column.present'], 'Obecność')
  assert.equal(plPLReviewDraft['matrix.column.producing'], 'W produkcji')
  assert.equal(plPLReviewDraft['matrix.column.inputs'], 'Wymagane materiały')
  assert.equal(plPLReviewDraft['matrix.column.logistics'], 'Logistyka')
  assert.equal(plPLReviewDraft['matrix.state.active'], '{item}: stan aktywny')
  assert.equal(plPLReviewDraft['matrix.state.inactive'], '{item}: stan nieaktywny')
  assert.equal(plPLReviewDraft['matrix.section.manufacturing'], 'Wytwarzanie')
  assert.equal(plPLReviewDraft['matrix.heading'], 'Macierz zasobów')
  assert.equal(plPLReviewDraft['outpost.navigation.reshuffleButton'], 'Zmień kolejność')
  assert.equal(plPLReviewDraft['outpost.navigation.lockOrder'], 'Zakończ zmianę kolejności')
  assert.equal(
    plPLReviewDraft['validation.counts'],
    'Błędy: {errors} · Ostrzeżenia: {warnings} · Informacje: {info}',
  )

  for (const key of ['cargo.pad.count', 'validation.issueCount', 'validation.plannedSupplyUnresolved', 'search.results.found'] as const) {
    assert.match(plPLReviewDraft[key], /Liczba|liczba/)
    const branches = [...plPLReviewDraft[key].matchAll(/one \{([^{}]*)\} other \{([^{}]*)\}/g)]
    assert.equal(branches.length, 1, key)
    assert.equal(branches[0][1], branches[0][2], key)
  }

  const [committedCsv, committedXliff] = await Promise.all([
    readFile(new URL('../docs/localization/pl-PL-review.csv', import.meta.url), 'utf8'),
    readFile(new URL('../docs/localization/pl-PL-deepl.xliff', import.meta.url), 'utf8'),
  ])
  const committedRows = parseAndValidateReviewCsv(committedCsv, 'pl-PL')
  for (const [index, row] of committedRows.entries()) {
    const frozen = rows[index]
    assert.deepEqual(
      [row.Key, row.Locale, row.EnglishSource, row.EnglishSourceSha256, row.Context, row.Risk,
        row.Parameters, row.ProtectedTokens, row.OfficialTermConstraints, row.CodexTranslation],
      [frozen.Key, frozen.Locale, frozen.EnglishSource, frozen.EnglishSourceSha256, frozen.Context,
        frozen.Risk, frozen.Parameters, frozen.ProtectedTokens, frozen.OfficialTermConstraints,
        frozen.CodexTranslation],
    )
  }
  assert.equal(committedXliff, createReviewXliff(rows, 'pl-PL'))
  assert.match(committedXliff, /xliff version="1\.2"/)
  assert.match(committedXliff, /target-language="pl-PL"/)
  assert.equal((committedXliff.match(/<trans-unit /g) ?? []).length, englishKeys.length)
  assert.equal((committedXliff.match(/x-english-source-sha256/g) ?? []).length, englishKeys.length)

  assert.match(
    await readFile(new URL('../src/localization/generated/pl-PL-reference-names.ts', import.meta.url), 'utf8'),
    /export const plPLReferenceNames/,
  )
})

test('Polish DeepL evidence is fully imported and invalid candidates remain explicit', async () => {
  const review = await readFile(new URL('../docs/localization/pl-PL-review.csv', import.meta.url), 'utf8')
  const rows = parseAndValidateReviewCsv(review, 'pl-PL')
  assert.equal(rows.length, 414)
  assert.ok(rows.every(({ DeepLTranslation }) => DeepLTranslation.trim()))
  assert.deepEqual(
    Object.fromEntries(['IDENTICAL', 'TYPOGRAPHIC_ONLY', 'SUBSTANTIVE', 'INVALID_TOKENS']
      .map((status) => [status, rows.filter(({ ComparisonStatus }) => ComparisonStatus === status).length])),
    { IDENTICAL: 112, TYPOGRAPHIC_ONLY: 0, SUBSTANTIVE: 220, INVALID_TOKENS: 82 },
  )
  assert.deepEqual(
    Object.fromEntries(['PLACEHOLDERS', 'PROTECTED_TOKEN', 'PLURAL_SYNTAX']
      .map((issue) => [issue, rows.filter(({ ReviewerNote }) =>
        ReviewerNote.includes(`failed ${issue} validation`)).length])),
    { PLACEHOLDERS: 64, PROTECTED_TOKEN: 14, PLURAL_SYNTAX: 4 },
  )
  assert.ok(rows.filter(({ ComparisonStatus }) => ComparisonStatus === 'INVALID_TOKENS')
    .every(({ AdjudicationDecision, ReviewerNote }) =>
      AdjudicationDecision === 'INVALID_DEEPL_REPAIRED' && /failed .* validation/.test(ReviewerNote)))
})

test('final Polish catalogue is review-derived, complete, safe, and runtime-active', async () => {
  const review = await readFile(new URL('../docs/localization/pl-PL-review.csv', import.meta.url), 'utf8')
  const rows = parseAndValidateReviewCsv(review, 'pl-PL')
  const englishKeys = Object.keys(enUSMessages).sort()
  assert.deepEqual(Object.keys(plPLMessages).sort(), englishKeys)
  assert.deepEqual(finalCatalogueFromReview(review, 'pl-PL'), plPLMessages)
  assert.deepEqual(adjudicateReviewRows(rows), rows)
  assert.ok(rows.every(({ AdjudicationDecision, FinalTranslation, ReviewerNote }) =>
    AdjudicationDecision && FinalTranslation && ReviewerNote.length >= 40))

  for (const key of englishKeys as (keyof typeof enUSMessages)[]) {
    const value = plPLMessages[key]
    assert.match(value, /\S/, key)
    assert.deepEqual(parametersOf(value), parametersOf(enUSMessages[key]), `${key}:parameters`)
    assert.equal(hasValidPluralSyntax(value), true, `${key}:plural`)
    assert.deepEqual(accidentalEnglishResidueOf(enUSMessages[key], value, 'pl-PL'), [], `${key}:English residue`)
    for (const token of protectedTokensOf(enUSMessages[key])) assert.ok(value.includes(token), `${key}:${token}`)
  }

  const renderCount = (key: 'cargo.pad.count' | 'validation.issueCount' | 'validation.plannedSupplyUnresolved' | 'search.results.found', count: number) =>
    plPLMessages[key]
      .replace(/\{count, plural, one \{([^{}]*)\} other \{([^{}]*)\}\}/g,
        (_match, one: string, other: string) => new Intl.PluralRules('pl-PL').select(count) === 'one' ? one : other)
      .replaceAll('{count}', String(count))
      .replace('{itemList}', 'A, B')
      .replace('{searchItem}', 'Żelazo')
  for (const key of ['cargo.pad.count', 'validation.issueCount', 'validation.plannedSupplyUnresolved', 'search.results.found'] as const) {
    for (const count of [1, 2, 5, 12, 22, 25]) assert.doesNotMatch(renderCount(key, count), /\{(?:count|itemList|searchItem)/, `${key}:${count}`)
  }

  assert.equal(plPLMessages['validation.counts'], 'Błędy: {errors} · Ostrzeżenia: {warnings} · Informacje: {info}')
  assert.equal(plPLMessages['matrix.state.active'], '{item}: stan aktywny')
  assert.equal(plPLMessages['matrix.state.inactive'], '{item}: stan nieaktywny')
  assert.equal(plPLMessages['cargo.interstellar'], 'Międzyukładowe połączenie towarowe')
  assert.equal(plPLMessages['outpost.body.label'], 'Ciało planetarne')
  assert.ok(Object.values(plPLMessages).every((value) => !value.includes('W gwiazdy')))
  assert.equal(supportedLocaleIds.includes('pl-PL'), true)
})

test('committed French and German XLIFF files match their current deterministic handoff representations', async () => {
  for (const [locale, draft] of [['fr-FR', frFRReviewDraft], ['de-DE', deDEReviewDraft]] as const) {
    const frozenRows = createReviewRows(locale, draft)
    const [csv, xliff] = await Promise.all([
      readFile(new URL(`../docs/localization/${locale}-review.csv`, import.meta.url), 'utf8'),
      readFile(new URL(`../docs/localization/${locale}-deepl.xliff`, import.meta.url), 'utf8'),
    ])
    const committedRows = parseAndValidateReviewCsv(csv, locale)
    for (const [index, row] of committedRows.entries()) {
      const frozen = frozenRows[index]
      assert.deepEqual(
        [row.Key, row.Locale, row.EnglishSource, row.EnglishSourceSha256, row.Context, row.Risk,
          row.Parameters, row.ProtectedTokens, row.OfficialTermConstraints, row.CodexTranslation],
        [frozen.Key, frozen.Locale, frozen.EnglishSource, frozen.EnglishSourceSha256, frozen.Context,
          frozen.Risk, frozen.Parameters, frozen.ProtectedTokens, frozen.OfficialTermConstraints,
          frozen.CodexTranslation],
      )
    }
    assert.equal(xliff, createReviewXliff(frozenRows, locale))
  }
})

test('Spanish, Italian, and Brazilian Portuguese review evidence preserves deterministic handoffs', async () => {
  for (const [locale, draft] of [
    ['es-ES', esESReviewDraft], ['it-IT', itITReviewDraft], ['pt-BR', ptBRReviewDraft],
  ] as const) {
    const rows = createReviewRows(locale, draft)
    const [csv, xliff] = await Promise.all([
      readFile(new URL(`../docs/localization/${locale}-review.csv`, import.meta.url), 'utf8'),
      readFile(new URL(`../docs/localization/${locale}-deepl.xliff`, import.meta.url), 'utf8'),
    ])
    const frozenRows = createReviewRows(locale, draft)
    const committedRows = parseAndValidateReviewCsv(csv, locale)
    for (const [index, row] of committedRows.entries()) {
      const frozen = frozenRows[index]
      assert.deepEqual(
        [row.Key, row.Locale, row.EnglishSource, row.EnglishSourceSha256, row.Context, row.Risk,
          row.Parameters, row.ProtectedTokens, row.OfficialTermConstraints, row.CodexTranslation],
        [frozen.Key, frozen.Locale, frozen.EnglishSource, frozen.EnglishSourceSha256, frozen.Context,
          frozen.Risk, frozen.Parameters, frozen.ProtectedTokens, frozen.OfficialTermConstraints,
          frozen.CodexTranslation],
      )
      assert.ok(row.DeepLTranslation, `${locale}:${row.Key}:DeepLTranslation`)
      assert.notEqual(row.ComparisonStatus, 'MISSING', `${locale}:${row.Key}:ComparisonStatus`)
      assert.ok(row.AdjudicationDecision, `${locale}:${row.Key}:AdjudicationDecision`)
      assert.ok(row.FinalTranslation, `${locale}:${row.Key}:FinalTranslation`)
      assert.ok(row.ReviewerNote, `${locale}:${row.Key}:ReviewerNote`)
    }
    assert.equal(xliff, createReviewXliff(rows, locale), locale)
  }
})

test('Spanish, Italian, and Brazilian Portuguese final catalogues are complete, safe, and review-derived', async () => {
  const englishKeys = Object.keys(enUSMessages).sort()
  for (const [locale, catalogue] of [
    ['es-ES', esESMessages], ['it-IT', itITMessages], ['pt-BR', ptBRMessages],
  ] as const) {
    assert.deepEqual(Object.keys(catalogue).sort(), englishKeys, locale)
    const review = await readFile(new URL(`../docs/localization/${locale}-review.csv`, import.meta.url), 'utf8')
    const rows = parseAndValidateReviewCsv(review, locale)
    assert.deepEqual(finalCatalogueFromReview(review, locale), catalogue)
    assert.deepEqual(
      adjudicateReviewRows(rows).map(({ AdjudicationDecision, FinalTranslation, ReviewerNote }) => ({ AdjudicationDecision, FinalTranslation, ReviewerNote })),
      rows.map(({ AdjudicationDecision, FinalTranslation, ReviewerNote }) => ({ AdjudicationDecision, FinalTranslation, ReviewerNote })),
    )
    for (const key of englishKeys as (keyof typeof enUSMessages)[]) {
      const value = catalogue[key]
      assert.match(value, /\S/, `${locale}:${key}`)
      assert.deepEqual(parametersOf(value), parametersOf(enUSMessages[key]), `${locale}:${key}:parameters`)
      assert.equal(hasValidPluralSyntax(value), true, `${locale}:${key}:plural`)
      for (const token of protectedTokensOf(enUSMessages[key])) assert.ok(value.includes(token), `${locale}:${key}:${token}`)
      assert.deepEqual(accidentalEnglishResidueOf(enUSMessages[key], value, locale), [], `${locale}:${key}:English residue`)
    }
    assert.ok(rows.filter(({ ComparisonStatus }) => ComparisonStatus === 'INVALID_TOKENS')
      .every(({ AdjudicationDecision }) => AdjudicationDecision === 'INVALID_DEEPL_REPAIRED'))
  }
  assert.deepEqual(supportedLocaleIds, [
    'en-US', 'en-GB', 'ja-JP', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'pl-PL',
  ])
})

test('Spanish outpost-constrained rows honor the approved Puesto terminology', async () => {
  const review = await readFile(new URL('../docs/localization/es-ES-review.csv', import.meta.url), 'utf8')
  const rows = parseAndValidateReviewCsv(review, 'es-ES')
  const constrained = rows.filter(({ OfficialTermConstraints }) =>
    OfficialTermConstraints.includes('term.outpost='))

  assert.ok(constrained.length > 0)
  for (const row of constrained) {
    assert.doesNotMatch(row.FinalTranslation, /puestos? avanzados?/iu, row.Key)
    assert.equal(esESMessages[row.Key], row.FinalTranslation, row.Key)
    if (/\boutposts?\b/iu.test(row.EnglishSource) && !row.EnglishSource.includes('{outpost}')) {
      assert.match(row.FinalTranslation, /\bpuestos?\b/iu, row.Key)
    }
  }
})

test('new runtime locales use adjectival compact Good power ratings', () => {
  for (const [locale, catalogue, expected] of [
    ['es-ES', esESMessages, 'Bueno'],
    ['it-IT', itITMessages, 'Buono'],
    ['pt-BR', ptBRMessages, 'Bom'],
  ] as const) {
    assert.equal(catalogue['power.label.good'], expected, locale)
    assert.equal(catalogue['power.label.good'], catalogue['power.quality.good'], locale)
  }
})

test('Spanish and Brazilian Portuguese skill labels preserve verified official names', async () => {
  const expectations = [
    ['es-ES', 'character.skill.outpostEngineering', 'Ingeniería de puestos'],
    ['es-ES', 'character.skill.outpostManagement', 'Gestión de puestos'],
    ['pt-BR', 'character.skill.researchMethods', 'Métodos de Pesquisa'],
  ] as const
  const catalogues = { 'es-ES': esESMessages, 'pt-BR': ptBRMessages }
  for (const [locale, key, expected] of expectations) {
    assert.equal(catalogues[locale][key], expected)
    const review = await readFile(new URL(`../docs/localization/${locale}-review.csv`, import.meta.url), 'utf8')
    const row = parseAndValidateReviewCsv(review, locale).find(({ Key }) => Key === key)
    assert.equal(row?.AdjudicationDecision, 'CODEX')
    assert.equal(row?.FinalTranslation, expected)
  }
})

test('complete Japanese, French, and German catalogues satisfy the full-locale contract', async () => {
  const invariantKeys = new Set([
    'about.attribution', 'cargo.destination.linkedLocator', 'cargo.destination.padContents',
    'history.benchmark', 'matrix.action.toggle', 'matrix.column.source', 'outpost.biomes.label',
    'outpost.solar.label', 'outpost.system.label', 'outpost.wind.label', 'power.label.normal',
    'power.label.unknown', 'power.quality.normal', 'power.tooltip.unknown', 'shortcuts.action.import',
    'shortcuts.group.validation', 'transfer.import.button', 'validation.context.separator',
    'validation.filter.info', 'validation.heading', 'validation.severity.info',
  ])
  const englishKeys = Object.keys(enUSMessages).sort()
  for (const [locale, catalogue] of [
    ['ja-JP', jaJPMessages], ['fr-FR', frFRMessages], ['de-DE', deDEMessages],
  ] as const) {
    assert.deepEqual(Object.keys(catalogue).sort(), englishKeys, locale)
    for (const key of englishKeys as (keyof typeof enUSMessages)[]) {
      const value = catalogue[key]
      assert.match(value, /\S/, `${locale}:${key}`)
      assert.deepEqual(parametersOf(value), parametersOf(enUSMessages[key]), `${locale}:${key}`)
      assert.equal(hasValidPluralSyntax(value), true, `${locale}:${key}:plural`)
      for (const token of protectedTokensOf(enUSMessages[key])) assert.ok(value.includes(token), `${locale}:${key}:${token}`)
      if (value === enUSMessages[key]) assert.ok(invariantKeys.has(key), `${locale}:${key}`)
    }
  }

  for (const [locale, catalogue] of [['fr-FR', frFRMessages], ['de-DE', deDEMessages]] as const) {
    const review = await readFile(new URL(`../docs/localization/${locale}-review.csv`, import.meta.url), 'utf8')
    const rows = parseAndValidateReviewCsv(review, locale)
    assert.deepEqual(finalCatalogueFromReview(review, locale), catalogue)
    assert.deepEqual(
      adjudicateReviewRows(rows).map(({ AdjudicationDecision, FinalTranslation, ReviewerNote }) => ({ AdjudicationDecision, FinalTranslation, ReviewerNote })),
      rows.map(({ AdjudicationDecision, FinalTranslation, ReviewerNote }) => ({ AdjudicationDecision, FinalTranslation, ReviewerNote })),
    )
    assert.ok(rows.filter(({ ComparisonStatus }) => ComparisonStatus === 'SUBSTANTIVE')
      .every(({ AdjudicationDecision, ReviewerNote }) => AdjudicationDecision && ReviewerNote))
    assert.ok(rows.filter(({ Risk }) => Risk === 'HIGH').every(({ ReviewerNote }) => ReviewerNote))
    assert.ok(rows.filter(({ OfficialTermConstraints }) => OfficialTermConstraints).every(({ ReviewerNote }) => ReviewerNote))
    assert.ok(rows.filter(({ ComparisonStatus }) => ComparisonStatus === 'INVALID_TOKENS').every(({ ReviewerNote }) => ReviewerNote))
  }
  assert.deepEqual(supportedLocaleIds, [
    'en-US', 'en-GB', 'ja-JP', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'pl-PL',
  ])
})

test('French and German catalogues apply inclusive body and validation severity terminology', () => {
  for (const key of [
    'outpost.body.label', 'outpost.body.select', 'outpost.referenceData.empty',
    'history.changeBody', 'history.clearBody', 'validation.bodySystemMismatch',
    'validation.outpostBodyNotEligible', 'validation.selectedBiomeInvalid',
    'validation.unknownBody', 'validation.unknownBiome', 'status.referenceData.loaded',
  ] as const) {
    assert.match(frFRMessages[key], /corps céleste/i, `fr-FR:${key}`)
    assert.match(deDEMessages[key], /Himmelskörper/i, `de-DE:${key}`)
    assert.doesNotMatch(deDEMessages[key], /\bPlanet(?:en|enkörper)?\b/i, `de-DE:${key}`)
  }
  for (const key of ['validation.filter.info', 'validation.severity.info'] as const) {
    assert.equal(frFRMessages[key], 'Information')
    assert.equal(deDEMessages[key], 'Information')
  }
  assert.match(frFRMessages['validation.counts'], /\{info\} informations/)
  assert.match(deDEMessages['validation.counts'], /\{info\} Informationen/)
  assert.match(frFRMessages['help.organic.availablePlanet'], /planète/i)
  assert.match(deDEMessages['help.organic.availablePlanet'], /Planet/i)
})

test('XLIFF 1.2 export is deterministic, contextual, and re-imports by stable key', () => {
  const rows = createReviewRows('fr-FR', frFRReviewDraft)
  const xliff = createReviewXliff(rows, 'fr-FR')
  assert.equal(xliff, createReviewXliff(rows, 'fr-FR'))
  assert.match(xliff, /xliff version="1\.2"/)
  assert.match(xliff, /resname="matrix\.column\.present"/)
  assert.match(xliff, /not temporal/)
  assert.match(xliff, /x-english-source-sha256/)
  assert.match(xliff, /<ph id="p\d+-open"/)

  const translated = xliff.replace(/<target state="new"><\/target>/g, (_target, offset: number) => {
    const unitStart = xliff.lastIndexOf('<trans-unit', offset)
    const unitEnd = xliff.indexOf('</trans-unit>', offset)
    const source = xliff.slice(unitStart, unitEnd).match(/<source>([\s\S]*?)<\/source>/)?.[1] ?? ''
    return `<target state="translated">${source}</target>`
  })
  const imported = parseAndValidateReviewCsv(
    importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated, 'fr-FR'),
    'fr-FR',
  )
  assert.ok(imported.every((row) => row.DeepLTranslation === row.EnglishSource))
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated.replace('target-language="fr-FR"', 'target-language="de-DE"'), 'fr-FR'),
    /XLIFF_LOCALE_MISMATCH/,
  )
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated.replace('xliff version="1.2"', 'xliff version="2.0"'), 'fr-FR'),
    /XLIFF_VERSION_MISMATCH/,
  )
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated.replace('source-language="en-US"', 'source-language="de-DE"'), 'fr-FR'),
    /XLIFF_SOURCE_LOCALE_MISMATCH/,
  )
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated.replace('Close About dialog</source>', 'Close the About dialog</source>'), 'fr-FR'),
    /XLIFF_STALE_SOURCE/,
  )

  const firstUnit = translated.match(/ {6}<trans-unit[\s\S]*? {6}<\/trans-unit>\n/)?.[0] ?? ''
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated.replace(firstUnit, `${firstUnit}${firstUnit}`), 'fr-FR'),
    /XLIFF_DUPLICATE_KEY/,
  )
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated.replace(/<trans-unit id="about\.attribution" resname="about\.attribution">/, '<trans-unit id="unknown.key" resname="unknown.key">'), 'fr-FR'),
    /XLIFF_UNKNOWN_KEY/,
  )
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), translated.replace(firstUnit, ''), 'fr-FR'),
    /XLIFF_MISSING_KEY/,
  )
  const withoutPlaceholder = translated.replace(
    /(<trans-unit id="common\.removeItem"[\s\S]*?<target[^>]*>)[\s\S]*?(<\/target>)/,
    '$1Supprimer cet élément$2',
  )
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), withoutPlaceholder, 'fr-FR'),
    /XLIFF_INVALID_PLACEHOLDERS/,
  )
  const withoutProtectedToken = translated.replace(
    /(<trans-unit id="about\.attribution"[\s\S]*?<target[^>]*>)[\s\S]*?(<\/target>)/,
    '$1Crédit des icônes$2',
  )
  assert.throws(
    () => importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), withoutProtectedToken, 'fr-FR'),
    /XLIFF_INVALID_PROTECTED_TOKEN/,
  )
  const recorded = parseAndValidateReviewCsv(
    importReviewXliff(createReviewCsv('fr-FR', frFRReviewDraft), withoutProtectedToken, 'fr-FR', { recordInvalidTokens: true }),
    'fr-FR',
  )
  assert.equal(recorded.find(({ Key }) => Key === 'about.attribution')?.ComparisonStatus, 'INVALID_TOKENS')
})

test('review validation rejects duplicate, missing, stale, placeholder, and protected-token rows', () => {
  const rows = createReviewRows('de-DE')
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows([...rows, rows[0]]), 'de-DE'), /REVIEW_DUPLICATE_KEY/)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(rows.slice(1)), 'de-DE'), /REVIEW_MISSING_KEY/)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(rows.map((row, index) => index ? row : { ...row, EnglishSource: `${row.EnglishSource}!` })), 'de-DE'), /REVIEW_STALE_SOURCE/)

  const placeholderIndex = rows.findIndex(({ Parameters }) => Parameters)
  const invalidPlaceholder = rows.map((row, index) => index === placeholderIndex ? { ...row, CodexTranslation: row.EnglishSource.replace(/\{\w+\}/, '{renamed}') } : row)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(invalidPlaceholder), 'de-DE'), /REVIEW_INVALID_PLACEHOLDERS/)

  const protectedIndex = rows.findIndex(({ ProtectedTokens }) => ProtectedTokens)
  const invalidToken = rows.map((row, index) => index === protectedIndex ? { ...row, CodexTranslation: 'translated without required token' } : row)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(invalidToken), 'de-DE'), /REVIEW_INVALID_PROTECTED_TOKEN/)

  const constrainedIndex = rows.findIndex(({ OfficialTermConstraints }) => OfficialTermConstraints)
  const staleConstraints = rows.map((row, index) => index === constrainedIndex
    ? { ...row, OfficialTermConstraints: '' }
    : row)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(staleConstraints), 'de-DE'), /REVIEW_CONSTRAINTS_STALE/)
})

test('review validation requires source plural parameters and supported plural structure', () => {
  const rows = createReviewRows('de-DE')
  const target = rows.findIndex(({ Key }) => Key === 'cargo.pad.count')
  const withPlural = (translation: string) => serializeReviewRows(rows.map((row, index) =>
    index === target ? { ...row, CodexTranslation: translation } : row))

  assert.doesNotThrow(() => parseAndValidateReviewCsv(
    withPlural('{count} {count, plural, one {Frachtlink} other {Frachtlinks}}'), 'de-DE'))
  assert.throws(() => parseAndValidateReviewCsv(
    withPlural('{count} {count, plurale, one {Frachtlink} other {Frachtlinks}}'), 'de-DE'),
  /REVIEW_INVALID_PLURAL_SYNTAX/)
  assert.throws(() => parseAndValidateReviewCsv(
    withPlural('{count} {count, plural, eins {Frachtlink} other {Frachtlinks}}'), 'de-DE'),
  /REVIEW_INVALID_PLURAL_SYNTAX/)
  assert.throws(() => parseAndValidateReviewCsv(
    withPlural('{count} {count, plural, one {Frachtlink}}'), 'de-DE'),
  /REVIEW_INVALID_PLURAL_SYNTAX/)
  assert.throws(() => parseAndValidateReviewCsv(
    withPlural('{total} {total, plural, one {Frachtlink} other {Frachtlinks}}'), 'de-DE'),
  /REVIEW_INVALID_PLURAL_SYNTAX/)

  const ordinary = rows.findIndex(({ Key }) => Key === 'common.removeItem')
  assert.doesNotThrow(() => parseAndValidateReviewCsv(serializeReviewRows(rows.map((row, index) =>
    index === ordinary ? { ...row, CodexTranslation: 'Entferne {item}' } : row)), 'de-DE'))
})

test('comparison state is explicit and final catalogues require approved current rows', () => {
  assert.equal(hasValidPluralSyntax('{count, plural, one {problema} other {problemi}}'), true)
  assert.equal(hasValidPluralSyntax('{count, plurale, un {problema} altri {problemi}}'), false)
  assert.equal(hasValidPluralSyntax('{count, plural, uno {problema} other {problemi}}'), false)
  assert.equal(hasValidPluralSyntax('{count, plural, one {problema}}'), false)
  assert.equal(hasValidPluralSyntax('Valore: {count}'), true)
  assert.equal(comparisonStatus('same', 'same'), 'IDENTICAL')
  assert.equal(comparisonStatus('', 'value'), 'MISSING')
  assert.equal(comparisonStatus('one', 'two'), 'SUBSTANTIVE')
  const rows = createReviewRows('fr-FR', enUSMessages).map((row) => ({
    ...row, DeepLTranslation: row.CodexTranslation, ComparisonStatus: 'IDENTICAL' as const,
    AdjudicationDecision: 'AGREED' as const, FinalTranslation: row.CodexTranslation,
    ReviewerNote: `Shared wording independently approved for ${row.Key}.`,
  }))
  assert.deepEqual(finalCatalogueFromReview(serializeReviewRows(rows), 'fr-FR'), enUSMessages)
  assert.throws(() => finalCatalogueFromReview(createReviewCsv('fr-FR'), 'fr-FR'), /REVIEW_ROW_NOT_APPROVED/)
})

test('adjudication requires explicit provenance and supports either candidate or custom wording', () => {
  const base = createReviewRows('fr-FR', enUSMessages).map((row) => ({
    ...row,
    DeepLTranslation: row.CodexTranslation,
    ComparisonStatus: 'IDENTICAL' as const,
    AdjudicationDecision: 'AGREED' as const,
    FinalTranslation: row.CodexTranslation,
    ReviewerNote: `Shared wording independently approved for ${row.Key}.`,
  }))
  const target = base.findIndex(({ Key }) => Key === 'common.add')
  const withDecision = (decision: 'CODEX' | 'DEEPL' | 'CUSTOM') => base.map((row, index) => index === target ? {
    ...row,
    DeepLTranslation: 'Ajouter (DeepL)',
    ComparisonStatus: 'SUBSTANTIVE' as const,
    AdjudicationDecision: decision,
    FinalTranslation: decision === 'CODEX' ? row.CodexTranslation : decision === 'DEEPL' ? 'Ajouter (DeepL)' : 'Ajouter',
    ReviewerNote: `${decision} chosen because this compact action label best preserves the add-action sense.`,
  } : row)

  for (const decision of ['CODEX', 'DEEPL', 'CUSTOM'] as const) {
    const csv = serializeReviewRows(withDecision(decision))
    const parsed = parseAndValidateReviewCsv(csv, 'fr-FR')
    assert.equal(adjudicateReviewRows(parsed)[target].AdjudicationDecision, decision)
    assert.equal(finalCatalogueFromReview(csv, 'fr-FR')['common.add'], parsed[target].FinalTranslation)
  }

  const missingDecision = withDecision('DEEPL').map((row, index) => index === target
    ? { ...row, AdjudicationDecision: '' as const }
    : row)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(missingDecision), 'fr-FR'), /REVIEW_DECISION_REQUIRED/)

  const genericNote = withDecision('DEEPL').map((row, index) => index === target ? {
    ...row,
    ReviewerNote: 'Reviewed against the English source, UI context, risk metadata, and approved terminology.',
  } : row)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(genericNote), 'fr-FR'), /REVIEW_RATIONALE_REQUIRED/)

  const emptyRationale = withDecision('CODEX').map((row, index) => index === target
    ? { ...row, ReviewerNote: 'Codex chosen.' }
    : row)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(emptyRationale), 'fr-FR'), /REVIEW_RATIONALE_REQUIRED/)
})

test('invalid DeepL evidence requires explicit repair or replacement provenance', () => {
  const rows = createReviewRows('fr-FR', enUSMessages).map((row) => ({
    ...row,
    DeepLTranslation: row.CodexTranslation,
    ComparisonStatus: 'IDENTICAL' as const,
    AdjudicationDecision: 'AGREED' as const,
    FinalTranslation: row.CodexTranslation,
    ReviewerNote: `Shared wording independently approved for ${row.Key}.`,
  }))
  const target = rows.findIndex(({ Key }) => Key === 'about.attribution')
  const invalid = rows.map((row, index) => index === target ? {
    ...row,
    DeepLTranslation: 'Icônes créées par gravisio',
    ComparisonStatus: 'INVALID_TOKENS' as const,
    AdjudicationDecision: 'INVALID_DEEPL_REPAIRED' as const,
    FinalTranslation: row.CodexTranslation,
    ReviewerNote: 'DeepL removed the protected attribution text; the independently token-safe Codex wording was selected.',
  } : row)
  assert.doesNotThrow(() => finalCatalogueFromReview(serializeReviewRows(invalid), 'fr-FR'))

  const invalidAsDeepL = invalid.map((row, index) => index === target
    ? { ...row, AdjudicationDecision: 'DEEPL' as const }
    : row)
  assert.throws(() => parseAndValidateReviewCsv(serializeReviewRows(invalidAsDeepL), 'fr-FR'), /REVIEW_DECISION_CONTRADICTS_EVIDENCE/)
})

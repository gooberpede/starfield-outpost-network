import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { enUSMessages } from '../src/localization/locales/en-US.ts'
import { deDEMessages } from '../src/localization/locales/de-DE.ts'
import { frFRMessages } from '../src/localization/locales/fr-FR.ts'
import { jaJPMessages } from '../src/localization/locales/ja-JP.ts'
import {
  comparisonStatus, createReviewCsv, createReviewRows, englishSourceSha256, hasValidPluralSyntax,
  createReviewXliff, finalCatalogueFromReview, importReviewXliff,
  parametersOf, parseAndValidateReviewCsv, protectedTokensOf, serializeReviewRows,
} from '../src/localization/reviewPackage.ts'
import { deDEReviewDraft } from '../src/localization/reviewDrafts/de-DE.ts'
import { frFRReviewDraft } from '../src/localization/reviewDrafts/fr-FR.ts'
import { adjudicateReviewRows } from '../src/localization/reviewAdjudication.ts'
import { supportedLocaleIds } from '../src/localization/types.ts'

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

test('French and German Codex drafts are complete and token-safe', () => {
  for (const [locale, draft] of [['fr-FR', frFRReviewDraft], ['de-DE', deDEReviewDraft]] as const) {
    const rows = parseAndValidateReviewCsv(createReviewCsv(locale, draft), locale)
    assert.equal(rows.length, Object.keys(enUSMessages).length)
    assert.ok(rows.every((row) => row.CodexTranslation))
    assert.ok(rows.filter((row) => row.Risk === 'HIGH').length > 100)
    assert.ok(rows.filter((row) => row.OfficialTermConstraints).length > 100)
  }
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
  assert.deepEqual(supportedLocaleIds, ['en-US', 'en-GB', 'ja-JP'])
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

test('comparison state is explicit and final catalogues require approved current rows', () => {
  assert.equal(hasValidPluralSyntax('{count, Plural, ein {Problem} weitere {Probleme}}'), false)
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

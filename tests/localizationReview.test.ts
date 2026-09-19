import assert from 'node:assert/strict'
import test from 'node:test'

import { enUSMessages } from '../src/localization/locales/en-US.ts'
import {
  comparisonStatus, createReviewCsv, createReviewRows, englishSourceSha256,
  finalCatalogueFromReview, parseAndValidateReviewCsv, serializeReviewRows,
} from '../src/localization/reviewPackage.ts'

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
})

test('comparison state is explicit and final catalogues require approved current rows', () => {
  assert.equal(comparisonStatus('same', 'same'), 'IDENTICAL')
  assert.equal(comparisonStatus('', 'value'), 'MISSING')
  assert.equal(comparisonStatus('one', 'two'), 'SUBSTANTIVE')
  const rows = createReviewRows('fr-FR', enUSMessages).map((row) => ({
    ...row, DeepLTranslation: row.CodexTranslation, ComparisonStatus: 'IDENTICAL' as const,
    FinalTranslation: row.CodexTranslation,
  }))
  assert.deepEqual(finalCatalogueFromReview(serializeReviewRows(rows), 'fr-FR'), enUSMessages)
  assert.throws(() => finalCatalogueFromReview(createReviewCsv('fr-FR'), 'fr-FR'), /REVIEW_ROW_NOT_APPROVED/)
})

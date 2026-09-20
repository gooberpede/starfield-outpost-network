import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { adjudicateReviewRows } from '../src/localization/reviewAdjudication.ts'
import {
  finalCatalogueFromReview,
  parseAndValidateReviewCsv,
  serializeReviewRows,
} from '../src/localization/reviewPackage.ts'
import { reviewRouteForLocale } from './localization/review-routing.ts'

const args = process.argv.slice(2)
const localeIndex = args.indexOf('--locale')
const localeValue = localeIndex >= 0 ? args[localeIndex + 1] : undefined
if (!localeValue) throw new Error('Missing value for --locale.')
const { locale, artifacts, source: reviewSource } = reviewRouteForLocale(localeValue)
if (!reviewSource.createXliff) throw new Error(`REVIEW_ADJUDICATION_UNAVAILABLE: ${locale} does not use semantic draft adjudication.`)

const reviewPath = path.resolve(artifacts.review)
const source = await readFile(reviewPath, 'utf8')
const adjudicated = adjudicateReviewRows(parseAndValidateReviewCsv(source, locale))
const review = serializeReviewRows(adjudicated)
const catalogue = finalCatalogueFromReview(review, locale)
const exportName = artifacts.catalogueExport
const cataloguePath = path.resolve(artifacts.catalogue)
const entries = Object.entries(catalogue)
  .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
  .join('\n')
const moduleSource = [
  "import type { MessageCatalogue } from '../types.ts'",
  '',
  `export const ${exportName} = {`,
  entries,
  '} as const satisfies MessageCatalogue',
  '',
].join('\n')

await Promise.all([
  writeFile(reviewPath, review, 'utf8'),
  writeFile(cataloguePath, moduleSource, 'utf8'),
])
console.log(`Adjudicated ${adjudicated.length} ${locale} rows and generated ${cataloguePath}`)

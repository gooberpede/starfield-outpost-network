import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { adjudicateReviewRows } from '../src/localization/reviewAdjudication.ts'
import {
  finalCatalogueFromReview,
  parseAndValidateReviewCsv,
  serializeReviewRows,
} from '../src/localization/reviewPackage.ts'

const args = process.argv.slice(2)
const localeIndex = args.indexOf('--locale')
const locale = args[localeIndex + 1]
if (locale !== 'fr-FR' && locale !== 'de-DE') throw new Error('Expected --locale fr-FR or --locale de-DE.')

const reviewPath = path.resolve(`docs/localization/${locale}-review.csv`)
const source = await readFile(reviewPath, 'utf8')
const adjudicated = adjudicateReviewRows(parseAndValidateReviewCsv(source, locale))
const review = serializeReviewRows(adjudicated)
const catalogue = finalCatalogueFromReview(review, locale)
const exportName = locale === 'fr-FR' ? 'frFRMessages' : 'deDEMessages'
const cataloguePath = path.resolve(`src/localization/locales/${locale}.ts`)
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
